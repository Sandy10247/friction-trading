import React from 'react';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../store/userSlice';

interface UserProfile {
    user_id: string;
    user_name: string;
    user_shortname: string;
    avatar_url: string;
    user_type: string;
    email: string;
    broker: string;
    meta: {
        demat_consent: string;
    };
    products: string[];
    order_types: string[];
    exchanges: string[];
}



const ProfileComponent: React.FC = () => {

    const profile = useSelector(selectUserProfile) as UserProfile;

    if (!profile) {
        return <div className="p-6 text-center text-gray-400">No profile data available</div>;
    }

    return (
        <div className="max-w-4xl mx-auto p-6" >
            <div className="bg-gray-900 rounded-2xl shadow-2xl overflow-hidden">
                {/* Header Section with Avatar and Name */}
                <div className="bg-gradient-to-r from-blue-600 to-emerald-600 px-8 py-12">
                    <div className="flex flex-col sm:flex-row items-center gap-6">
                        <div className="relative">
                            <img
                                src={profile.avatar_url || 'https://via.placeholder.com/150'}
                                alt={profile.user_name}
                                className="w-32 h-32 rounded-full border-4 border-white shadow-xl object-cover"
                            />
                            <div className="absolute bottom-0 right-0 w-8 h-8 bg-cyan-400 rounded-full border-4 border-gray-900"></div>
                        </div>
                        <div className="text-center sm:text-left">
                            <h1 className="text-4xl font-black text-white">{profile.user_name}</h1>
                            <p className="text-cyan-300 text-lg mt-1">@{profile.user_shortname}</p>
                            <span className="inline-block mt-3 px-4 py-1 bg-white/20 backdrop-blur-sm rounded-full text-sm font-medium text-white">
                                {profile.user_type}
                            </span>
                        </div>
                    </div>
                </div>

                {/* Body Content */}
                <div className="p-8 space-y-8">
                    {/* Basic Info Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Email</p>
                            <p className="text-white text-lg font-medium mt-1">{profile.email}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Broker</p>
                            <p className="text-cyan-300 text-lg font-medium mt-1">{profile.broker || 'Not Connected'}</p>
                        </div>
                        <div>
                            <p className="text-gray-400 text-sm uppercase tracking-wider">Demat Consent</p>
                            <p className="text-white text-lg font-medium mt-1">
                                {profile.meta.demat_consent === 'yes' ? (
                                    <span className="text-emerald-400">Granted</span>
                                ) : (
                                    <span className="text-red-400">Pending</span>
                                )}
                            </p>
                        </div>
                    </div>

                    {/* Products */}
                    <div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Enabled Products</h3>
                        <div className="flex flex-wrap gap-3">
                            {profile.products.length > 0 ? (
                                profile.products.map((product) => (
                                    <span
                                        key={product}
                                        className="px-4 py-2 bg-blue-600/20 border border-blue-500/50 rounded-full text-blue-300 text-sm font-medium"
                                    >
                                        {product}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">No products enabled</p>
                            )}
                        </div>
                    </div>

                    {/* Order Types */}
                    <div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Supported Order Types</h3>
                        <div className="flex flex-wrap gap-3">
                            {profile.order_types.length > 0 ? (
                                profile.order_types.map((type) => (
                                    <span
                                        key={type}
                                        className="px-4 py-2 bg-cyan-600/20 border border-cyan-500/50 rounded-full text-cyan-300 text-sm font-medium"
                                    >
                                        {type}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">None specified</p>
                            )}
                        </div>
                    </div>

                    {/* Exchanges */}
                    <div>
                        <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-3">Connected Exchanges</h3>
                        <div className="flex flex-wrap gap-3">
                            {profile.exchanges.length > 0 ? (
                                profile.exchanges.map((exchange) => (
                                    <span
                                        key={exchange}
                                        className="px-4 py-2 bg-emerald-600/20 border border-emerald-500/50 rounded-full text-emerald-300 text-sm font-medium"
                                    >
                                        {exchange.toUpperCase()}
                                    </span>
                                ))
                            ) : (
                                <p className="text-gray-500">No exchanges connected</p>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div >
    );
};

export default ProfileComponent;