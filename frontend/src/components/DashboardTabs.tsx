import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserProfile, selectPositionData } from '../store/userSlice';
import type { PositionsData, Holding, UserProfile } from '../store/types';

type TabId = 'profile' | 'positions';

interface TabConfig {
    id: TabId;
    label: string;
}

const TABS: TabConfig[] = [
    { id: 'profile', label: 'Profile' },
    { id: 'positions', label: 'Positions' },
];

const Dashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<TabId>('profile');

    const profile = useSelector(selectUserProfile) as UserProfile | null;
    const positions = useSelector(selectPositionData) as PositionsData | null;

    // ────────────────────────────────────────────────
    //  Shared formatters
    // ────────────────────────────────────────────────
    const formatINR = (value: number) =>
        new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(value);

    const getPnlColor = (pnl: number) =>
        pnl > 0 ? 'text-emerald-400' : pnl < 0 ? 'text-red-400' : 'text-gray-400';

    // ────────────────────────────────────────────────
    //  No data states
    // ────────────────────────────────────────────────
    const hasNoProfile = !profile;
    const hasNoPositions =
        !positions || (!positions.net?.length && !positions.day?.length);

    const hasNoDataAtAll = hasNoProfile && hasNoPositions;

    if (hasNoDataAtAll) {
        return (
            <div className="min-h-screen bg-black flex items-center justify-center">
                <div className="text-center px-4">
                    <div className="text-6xl md:text-8xl font-black text-red-600/80 tracking-tight">
                        NO DATA IDIOT
                    </div>
                    <p className="mt-6 text-xl md:text-2xl text-gray-500">
                        Fix your API or go touch some grass
                    </p>
                </div>
            </div>
        );
    }

    // ────────────────────────────────────────────────
    //  Profile Tab Content
    // ────────────────────────────────────────────────
    const ProfileTab = () => {
        if (hasNoProfile) {
            return (
                <div className="min-h-[50vh] flex items-center justify-center">
                    <div className="text-4xl font-bold text-red-500/70">
                        No profile data available
                    </div>
                </div>
            );
        }

        const dematStatus =
            profile.meta.demat_consent === 'consent' ||
                profile.meta.demat_consent === 'yes'
                ? { text: 'Granted', color: 'text-emerald-400' }
                : { text: 'Pending', color: 'text-red-400' };

        return (
            <div className="max-w-5xl mx-auto">
                <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-indigo-700 via-purple-700 to-pink-800 px-8 py-14 md:py-16">
                        <div className="flex flex-col sm:flex-row items-center gap-8">
                            <div className="relative">
                                <img
                                    src={profile.avatar_url || 'https://via.placeholder.com/160'}
                                    alt={profile.user_name}
                                    className="w-40 h-40 rounded-full border-4 border-white/90 shadow-2xl object-cover"
                                />
                                <div className="absolute -bottom-2 -right-2 w-10 h-10 bg-emerald-500 rounded-full border-4 border-gray-900" />
                            </div>

                            <div className="text-center sm:text-left">
                                <h1 className="text-4xl md:text-5xl font-black text-white">
                                    {profile.user_name}
                                </h1>
                                <p className="text-2xl text-indigo-200 mt-2">
                                    @{profile.user_shortname}
                                </p>
                                <div className="mt-5 flex flex-wrap gap-3 justify-center sm:justify-start">
                                    <span className="px-5 py-2 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold text-white border border-white/30 uppercase tracking-wide">
                                        {profile.user_type.replace(/_/g, ' ')}
                                    </span>
                                    <span className="px-4 py-2 bg-gray-800/80 rounded-full text-sm text-gray-300">
                                        ID: {profile.user_id}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-8 md:p-10 space-y-10">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div>
                                <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">
                                    Email
                                </div>
                                <div className="text-white text-lg font-medium break-all">
                                    {profile.email}
                                </div>
                            </div>

                            <div>
                                <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">
                                    Broker
                                </div>
                                <div className="text-cyan-400 text-xl font-bold">
                                    {profile.broker || '—'}
                                </div>
                            </div>

                            <div>
                                <div className="text-gray-400 text-sm uppercase tracking-wider mb-1">
                                    Demat Consent
                                </div>
                                <div className={`text-xl font-bold ${dematStatus.color}`}>
                                    {dematStatus.text}
                                </div>
                            </div>
                        </div>

                        {['products', 'order_types', 'exchanges'].map((section) => {
                            const items = profile[section as keyof UserProfile] as string[];
                            const title = section
                                .split('_')
                                .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
                                .join(' ');

                            const colorMap: Record<string, string> = {
                                products: 'indigo',
                                order_types: 'cyan',
                                exchanges: 'emerald',
                            };

                            const color = colorMap[section] || 'gray';

                            return (
                                <div key={section}>
                                    <h3 className="text-xl font-semibold text-white mb-5 border-b border-gray-800 pb-3">
                                        {title}
                                    </h3>
                                    <div className="flex flex-wrap gap-3">
                                        {items?.length ? (
                                            items.map((item) => (
                                                <span
                                                    key={item}
                                                    className={`px-5 py-2 bg-${color}-950/60 border border-${color}-700/50 rounded-full text-${color}-300 text-sm font-medium`}
                                                >
                                                    {section === 'exchanges' ? item.toUpperCase() : item}
                                                </span>
                                            ))
                                        ) : (
                                            <span className="text-gray-500">None</span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        );
    };

    // ────────────────────────────────────────────────
    //  Positions Tab Content
    // ────────────────────────────────────────────────
    const PositionsTab = () => {
        if (hasNoPositions) {
            return (
                <div className="min-h-[60vh] flex items-center justify-center">
                    <div className="text-4xl md:text-5xl font-bold text-red-500/70">
                        No positions data
                    </div>
                </div>
            );
        }

        const renderTable = (holdings: Holding[], title: string) => {
            if (!holdings?.length) {
                return (
                    <div className="text-center py-16 text-gray-500 text-xl">
                        No {title.toLowerCase()} positions
                    </div>
                );
            }

            return (
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead>
                            <tr className="border-b border-gray-800">
                                <th className="text-left py-4 px-6 font-medium text-gray-400">
                                    Symbol
                                </th>
                                <th className="text-center py-4 px-6 font-medium text-gray-400">
                                    Qty
                                </th>
                                <th className="text-right py-4 px-6 font-medium text-gray-400">
                                    Avg Price
                                </th>
                                <th className="text-right py-4 px-6 font-medium text-gray-400">
                                    LTP
                                </th>
                                <th className="text-right py-4 px-6 font-medium text-gray-400">
                                    P&L
                                </th>
                            </tr>
                        </thead>
                        <tbody>
                            {holdings.map((h, i) => (
                                <tr
                                    key={i}
                                    className="border-b border-gray-800 hover:bg-gray-900/70 transition-colors"
                                >
                                    <td className="py-5 px-6">
                                        <div className="font-medium text-white">{h.tradingsymbol}</div>
                                        <div className="text-xs text-gray-500 mt-1">
                                            {h.exchange} • {h.product}
                                        </div>
                                    </td>
                                    <td className="text-center py-5 px-6 text-gray-300">
                                        {h.quantity}
                                    </td>
                                    <td className="text-right py-5 px-6 text-gray-300">
                                        ₹{formatINR(h.average_price)}
                                    </td>
                                    <td className="text-right py-5 px-6 text-gray-300">
                                        ₹{formatINR(h.last_price)}
                                    </td>
                                    <td className={`text-right py-5 px-6 font-semibold ${getPnlColor(h.pnl)}`}>
                                        {h.pnl >= 0 ? '+' : ''}₹{formatINR(h.pnl)}
                                        <div className="text-xs text-gray-600 mt-1">
                                            U: ₹{formatINR(h.unrealised)} | R: ₹{formatINR(h.realised)}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            );
        };

        return (
            <div className="space-y-12 max-w-6xl mx-auto">
                {[
                    { key: 'net', title: 'Net Positions' },
                    { key: 'day', title: 'Day Positions' },
                ].map(({ key, title }) => (
                    <div
                        key={key}
                        className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden"
                    >
                        <div className="px-7 py-5 border-b border-gray-800 bg-gray-950/60">
                            <h3 className="text-xl font-semibold text-white">{title}</h3>
                        </div>
                        <div className="p-6">
                            {renderTable(positions?.[key as 'net' | 'day'] || [], title)}
                        </div>
                    </div>
                ))}
            </div>
        );
    };

    // ────────────────────────────────────────────────
    //  Main Render
    // ────────────────────────────────────────────────
    return (
        <div className="min-h-screen bg-black text-gray-100 pb-16">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 lg:px-8 pt-10">
                {/* Tabs */}
                <div className="mb-12 flex justify-center">
                    <nav className="inline-flex border-b border-gray-800">
                        {TABS.map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id)}
                                className={`
                  px-8 py-5 text-lg font-medium border-b-2 transition-colors
                  ${activeTab === tab.id
                                        ? 'border-indigo-500 text-indigo-400'
                                        : 'border-transparent text-gray-400 hover:text-gray-300 hover:border-gray-600'
                                    }
                `}
                            >
                                {tab.label}
                            </button>
                        ))}
                    </nav>
                </div>

                {/* Content */}
                {activeTab === 'profile' && <ProfileTab />}
                {activeTab === 'positions' && <PositionsTab />}
            </div>
        </div>
    );
};

export default Dashboard;