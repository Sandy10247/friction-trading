import React from 'react';
import { selectPositionData } from '../store/userSlice';
import type { PositionsData, Holding } from './../store/types'
import { useSelector } from 'react-redux';



const PositionsComponent: React.FC = () => {

    const data = useSelector(selectPositionData) as PositionsData;

    const formatNumber = (num: number) => {
        return new Intl.NumberFormat('en-IN', {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
        }).format(num);
    };

    const getPnlColor = (pnl: number) => {
        if (pnl > 0) return 'text-emerald-400';
        if (pnl < 0) return 'text-red-400';
        return 'text-gray-400';
    };

    const renderHoldingsTable = (holdings: Holding[], title: string) => {
        if (holdings.length === 0) {
            return (
                <div className="text-center py-8 text-gray-500">
                    No {title.toLowerCase()} positions
                </div>
            );
        }

        return (
            <div className="overflow-x-auto">
                <table className="w-full text-sm">
                    <thead>
                        <tr className="border-b border-gray-800">
                            <th className="text-left py-3 px-4 font-medium text-gray-400">Symbol</th>
                            <th className="text-center py-3 px-4 font-medium text-gray-400">Qty</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">Avg Price</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">LTP</th>
                            <th className="text-right py-3 px-4 font-medium text-gray-400">P&L</th>
                        </tr>
                    </thead>
                    <tbody>
                        {holdings.map((holding, index) => (
                            <tr key={index} className="border-b border-gray-800 hover:bg-gray-900/50">
                                <td className="py-4 px-4">
                                    <div>
                                        <div className="font-medium text-white">{holding.tradingsymbol}</div>
                                        <div className="text-xs text-gray-500">
                                            {holding.exchange} • {holding.product}
                                        </div>
                                    </div>
                                </td>
                                <td className="text-center py-4 px-4 text-gray-300">
                                    {holding.quantity}
                                </td>
                                <td className="text-right py-4 px-4 text-gray-300">
                                    ₹{formatNumber(holding.average_price)}
                                </td>
                                <td className="text-right py-4 px-4 text-gray-300">
                                    ₹{formatNumber(holding.last_price)}
                                </td>
                                <td className={`text-right py-4 px-4 font-medium ${getPnlColor(holding.pnl)}`}>
                                    {holding.pnl >= 0 ? '+' : ''}₹{formatNumber(holding.pnl)}
                                    <div className="text-xs text-gray-500 mt-1">
                                        Unreal: ₹{formatNumber(holding.unrealised)} | Real: ₹{formatNumber(holding.realised)}
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
        <div className="max-w-6xl mx-auto p-6">
            <h2 className="text-2xl font-bold text-white mb-8">Positions</h2>

            <div className="space-y-12">
                {/* Net Positions */}
                <div className="bg-gray-900 rounded-xl border border-gray-800">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Net Positions</h3>
                    </div>
                    <div className="p-6">
                        {renderHoldingsTable(data.net, 'Net')}
                    </div>
                </div>

                {/* Day Positions */}
                <div className="bg-gray-900 rounded-xl border border-gray-800">
                    <div className="px-6 py-4 border-b border-gray-800">
                        <h3 className="text-lg font-semibold text-white">Day Positions</h3>
                    </div>
                    <div className="p-6">
                        {renderHoldingsTable(data.day, 'Day')}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PositionsComponent;