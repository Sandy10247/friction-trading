import React, { useState } from 'react';

// === Complete Type Definitions ===
interface AvailableMargin {
    adhoc_margin: number;
    cash: number;
    collateral: number;
    intraday_payin: number;
    live_balance: number;
    opening_balance: number;
}

interface UtilisedMargin {
    debits: number;
    exposure: number;
    m2m_realised: number;
    m2m_unrealised: number;
    option_premium: number;
    payout: number;
    span: number;
    holding_sales: number;
    turnover: number;
    liquid_collateral: number;
    stock_collateral: number;
    delivery: number;
}

interface MarginSegment {
    enabled: boolean;
    net: number;
    available: AvailableMargin;
    utilised: UtilisedMargin;
}

interface Position {
    tradingsymbol: string;
    exchange: string;
    instrument_token: number;
    product: string;
    quantity: number;
    overnight_quantity: number;
    multiplier: number;
    average_price: number;
    close_price: number;
    last_price: number;
    value: number;
    pnl: number;
    m2m: number;
    unrealised: number;
    realised: number;
    buy_quantity: number;
    buy_price: number;
    buy_value: number;
    buy_m2m: number;
    sell_quantity: number;
    sell_price: number;
    sell_value: number;
    sell_m2m: number;
    day_buy_quantity: number;
    day_buy_price: number;
    day_buy_value: number;
    day_sell_quantity: number;
    day_sell_price: number;
    day_sell_value: number;
}

interface Positions {
    net: Position[];
    day: Position[];
}

interface Data {
    margins: {
        equity: MarginSegment;
        commodity: MarginSegment;
    };
    portfolio: any[]; // extend later if needed
    positions: Positions;
}

// === Main Component (Dark Mode + Centered Tabs) ===
const TradingDashboard: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'margins' | 'portfolio' | 'positions'>('positions');
    const [positionTab, setPositionTab] = useState<'net' | 'day'>('net');

    // Sample data
    const data: Data = {
        margins: {
            equity: {
                enabled: true,
                net: 18986.1,
                available: {
                    adhoc_margin: 0,
                    cash: 0,
                    collateral: 0,
                    intraday_payin: 0,
                    live_balance: 18986.1,
                    opening_balance: 18986.1,
                },
                utilised: {
                    debits: 0,
                    exposure: 0,
                    m2m_realised: 0,
                    m2m_unrealised: 0,
                    option_premium: 0,
                    payout: 0,
                    span: 0,
                    holding_sales: 0,
                    turnover: 0,
                    liquid_collateral: 0,
                    stock_collateral: 0,
                    delivery: 0,
                },
            },
            commodity: {
                enabled: false,
                net: 0,
                available: {
                    adhoc_margin: 0,
                    cash: 0,
                    collateral: 0,
                    intraday_payin: 0,
                    live_balance: 0,
                    opening_balance: 0,
                },
                utilised: {
                    debits: 0,
                    exposure: 0,
                    m2m_realised: 0,
                    m2m_unrealised: 0,
                    option_premium: 0,
                    payout: 0,
                    span: 0,
                    holding_sales: 0,
                    turnover: 0,
                    liquid_collateral: 0,
                    stock_collateral: 0,
                    delivery: 0,
                },
            },
        },
        portfolio: [],
        positions: {
            net: [
                {
                    tradingsymbol: "ITC26FEB350CE",
                    exchange: "NFO",
                    instrument_token: 27625218,
                    product: "NRML",
                    quantity: 1600,
                    overnight_quantity: 1600,
                    multiplier: 1,
                    average_price: 8.7,
                    close_price: 7.3,
                    last_price: 5.75,
                    value: 13920,
                    pnl: -4720,
                    m2m: -2480,
                    unrealised: -4720,
                    realised: 0,
                    buy_quantity: 1600,
                    buy_price: 8.7,
                    buy_value: 13920,
                    buy_m2m: 11680,
                    sell_quantity: 0,
                    sell_price: 0,
                    sell_value: 0,
                    sell_m2m: 0,
                    day_buy_quantity: 0,
                    day_buy_price: 0,
                    day_buy_value: 0,
                    day_sell_quantity: 0,
                    day_sell_price: 0,
                    day_sell_value: 0,
                },
            ],
            day: [],
        },
    };

    const formatNumber = (num: any): string => {
        return num.toLocaleString('en-IN', { maximumFractionDigits: 2, minimumFractionDigits: 2 });
    };

    const renderMarginTable = (obj: any, title: string) => (
        <div className="mt-6">
            <h4 className="text-lg font-semibold text-gray-300 mb-3">{title}</h4>
            <div className="overflow-x-auto rounded-lg border border-gray-700">
                <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                        <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Item
                            </th>
                            <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                Amount (₹)
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {Object.entries(obj).map(([key, value]) => (
                            <tr key={key} className="hover:bg-gray-800/70 transition-colors">
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300 capitalize">
                                    {key.replace(/_/g, ' ')}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-right font-medium text-gray-200">
                                    {formatNumber(value)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-gray-950 text-gray-100 py-10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Centered Tabs */}
                <div className="flex justify-center mb-8">
                    <div className="inline-flex bg-gray-900 rounded-lg p-1 border border-gray-700">
                        {(['margins', 'portfolio', 'positions'] as const).map((tab) => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={`px-6 py-2.5 text-sm font-medium rounded-md transition-all ${activeTab === tab
                                    ? 'bg-gray-700 text-white shadow-md'
                                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800/50'
                                    }`}
                            >
                                {tab.charAt(0).toUpperCase() + tab.slice(1)}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Content */}
                <div className="bg-gray-900 rounded-xl border border-gray-800 shadow-xl overflow-hidden">
                    <div className="p-6 md:p-8">
                        {/* Margins Tab */}
                        {activeTab === 'margins' && (
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                                {(['equity', 'commodity'] as const).map((segment) => {
                                    const margin = data.margins[segment];
                                    return (
                                        <div
                                            key={segment}
                                            className={`rounded-xl border p-6 ${margin.enabled
                                                ? 'border-emerald-700/50 bg-gradient-to-b from-emerald-950/30 to-gray-900'
                                                : 'border-gray-700 bg-gray-950'
                                                }`}
                                        >
                                            <div className="flex justify-between items-center mb-5">
                                                <h3 className="text-2xl font-bold text-white capitalize">
                                                    {segment}
                                                </h3>
                                                <span
                                                    className={`px-3 py-1 rounded-full text-xs font-medium ${margin.enabled
                                                        ? 'bg-emerald-900/60 text-emerald-300 border border-emerald-700/40'
                                                        : 'bg-gray-800 text-gray-400 border border-gray-700'
                                                        }`}
                                                >
                                                    {margin.enabled ? 'Enabled' : 'Disabled'}
                                                </span>
                                            </div>

                                            <p className="text-4xl font-bold text-white mb-8 tracking-tight">
                                                ₹{formatNumber(margin.net)}
                                            </p>

                                            {renderMarginTable(margin.available, 'Available Margin')}
                                            {renderMarginTable(margin.utilised, 'Utilised Margin')}
                                        </div>
                                    );
                                })}
                            </div>
                        )}

                        {/* Portfolio Tab */}
                        {activeTab === 'portfolio' && (
                            <div className="text-center py-16">
                                <p className="text-gray-400 text-lg">No holdings in portfolio yet.</p>
                            </div>
                        )}

                        {/* Positions Tab */}
                        {activeTab === 'positions' && (
                            <div>
                                <div className="flex justify-center space-x-4 mb-8">
                                    {(['net', 'day'] as const).map((tab) => (
                                        <button
                                            key={tab}
                                            onClick={() => setPositionTab(tab)}
                                            className={`px-8 py-2.5 rounded-lg font-medium transition-all ${positionTab === tab
                                                ? 'bg-indigo-700 text-white shadow-md'
                                                : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                                                }`}
                                        >
                                            {tab.charAt(0).toUpperCase() + tab.slice(1)} Positions
                                            <span className="ml-2 text-sm opacity-80">
                                                ({data.positions[tab].length})
                                            </span>
                                        </button>
                                    ))}
                                </div>

                                {data.positions[positionTab].length === 0 ? (
                                    <div className="text-center py-16 bg-gray-950 rounded-xl border border-gray-800">
                                        <p className="text-gray-400 text-lg">
                                            No {positionTab} positions currently open
                                        </p>
                                    </div>
                                ) : (
                                    <div className="overflow-x-auto rounded-lg border border-gray-700">
                                        <table className="min-w-full divide-y divide-gray-700">
                                            <thead className="bg-gray-800">
                                                <tr>
                                                    <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Symbol
                                                    </th>
                                                    <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Qty
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Avg Price
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        LTP
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        P&L
                                                    </th>
                                                    <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase tracking-wider">
                                                        Unrealised
                                                    </th>
                                                </tr>
                                            </thead>
                                            <tbody className="bg-gray-900 divide-y divide-gray-700">
                                                {data.positions[positionTab].map((pos, i) => (
                                                    <tr key={i} className="hover:bg-gray-800/60 transition-colors">
                                                        <td className="px-6 py-4 text-sm font-medium text-gray-200">
                                                            {pos.tradingsymbol}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-center text-gray-300">
                                                            {pos.quantity}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right text-gray-300">
                                                            ₹{pos.average_price.toFixed(2)}
                                                        </td>
                                                        <td className="px-6 py-4 text-sm text-right text-gray-300">
                                                            ₹{pos.last_price.toFixed(2)}
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 text-sm font-semibold text-right ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                                }`}
                                                        >
                                                            ₹{formatNumber(pos.pnl)}
                                                        </td>
                                                        <td
                                                            className={`px-6 py-4 text-sm font-semibold text-right ${pos.unrealised >= 0 ? 'text-emerald-400' : 'text-red-400'
                                                                }`}
                                                        >
                                                            ₹{formatNumber(pos.unrealised)}
                                                        </td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TradingDashboard;