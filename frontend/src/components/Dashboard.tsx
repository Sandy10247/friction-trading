import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { selectUserProfile } from '../store/userSlice';

// ==================== TYPE DEFINITIONS ====================

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

interface PortfolioHolding {
  tradingsymbol: string;
  exchange: string;
  instrument_token: number;
  isin: string;
  product: string;
  quantity: number;
  realised_quantity: number;
  average_price: number;
  last_price: number;
  close_price: number;
  pnl: number;
  day_change: number;
  day_change_percentage: number;
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
  portfolio: PortfolioHolding[];
  positions: Positions;
}

// ==================== MAIN COMPONENT ====================

const TradingDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'margins' | 'portfolio' | 'positions'>('margins');
  const [positionTab, setPositionTab] = useState<'net' | 'day'>('net');

  const data: Data = useSelector(selectUserProfile);

  const formatNumber = (num: number): string => {
    return num.toLocaleString('en-IN', { maximumFractionDigits: 2 });
  };

  const renderMarginTable = (obj: Record<string, number>, title: string) => (
    <div className="mt-6">
      <h4 className="text-lg font-semibold text-gray-300 mb-3">{title}</h4>
      <div className="overflow-x-auto rounded-lg border border-gray-700">
        <table className="min-w-full divide-y divide-gray-700">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase">Item</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-400 uppercase">Amount (₹)</th>
            </tr>
          </thead>
          <tbody className="bg-gray-900 divide-y divide-gray-700">
            {Object.entries(obj).map(([key, value]) => (
              <tr key={key} className="hover:bg-gray-800/70">
                <td className="px-6 py-4 text-sm text-gray-300 capitalize">{key.replace(/_/g, ' ')}</td>
                <td className="px-6 py-4 text-sm text-right text-gray-200">{formatNumber(value)}</td>
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
        <h1 className="text-3xl font-bold text-white mb-10 text-center">Trading Dashboard</h1>

        {/* Centered Main Tabs */}
        <div className="flex justify-center mb-8">
          <div className="inline-flex bg-gray-900 rounded-lg p-1 border border-gray-700">
            {(['margins', 'portfolio', 'positions'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-7 py-3 text-sm font-medium rounded-md transition-all ${
                  activeTab === tab
                    ? 'bg-gray-700 text-white shadow-lg'
                    : 'text-gray-400 hover:text-gray-200 hover:bg-gray-800'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="bg-gray-900 rounded-2xl border border-gray-800 shadow-2xl overflow-hidden">
          <div className="p-6 md:p-8">
            {/* ==================== MARGINS TAB ==================== */}
            {activeTab === 'margins' && Object.keys(data.margins).length !== 0 && (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {(['equity', 'commodity'] as const).map((segment) => {
                  const margin = data.margins[segment];
                  return (
                    <div
                      key={segment}
                      className={`rounded-xl border p-6 ${
                        margin.enabled
                          ? 'border-emerald-700/50 bg-gradient-to-b from-emerald-950/30 to-gray-900'
                          : 'border-gray-700 bg-gray-950'
                      }`}
                    >
                      <div className="flex justify-between items-center mb-5">
                        <h3 className="text-2xl font-bold capitalize">{segment}</h3>
                        <span
                          className={`px-4 py-1 rounded-full text-xs font-medium ${
                            margin.enabled ? 'bg-emerald-900 text-emerald-300' : 'bg-gray-800 text-gray-400'
                          }`}
                        >
                          {margin.enabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <p className="text-4xl font-bold text-white mb-8">₹{formatNumber(margin.net)}</p>

                      {renderMarginTable(margin.available, 'Available Margin')}
                      {renderMarginTable(margin.utilised, 'Utilised Margin')}
                    </div>
                  );
                })}
              </div>
            )}

            {/* ==================== PORTFOLIO TAB ==================== */}
            {activeTab === 'portfolio' && (
              <div>
                <h2 className="text-2xl font-semibold mb-6">Holdings</h2>
                <div className="overflow-x-auto rounded-lg border border-gray-700">
                  <table className="min-w-full divide-y divide-gray-700">
                    <thead className="bg-gray-800">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Symbol</th>
                        <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Qty</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Avg Price</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">LTP</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">P&L</th>
                        <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Day %</th>
                      </tr>
                    </thead>
                    <tbody className="bg-gray-900 divide-y divide-gray-700">
                      {data.portfolio.map((holding, i) => (
                        <tr key={i} className="hover:bg-gray-800/60 transition-colors">
                          <td className="px-6 py-4 font-medium text-gray-200">
                            {holding.tradingsymbol}
                            <span className="text-xs text-gray-500 ml-2">({holding.exchange})</span>
                          </td>
                          <td className="px-6 py-4 text-center text-gray-300">{holding.quantity}</td>
                          <td className="px-6 py-4 text-right text-gray-300">₹{holding.average_price}</td>
                          <td className="px-6 py-4 text-right text-gray-300">₹{holding.last_price}</td>
                          <td
                            className={`px-6 py-4 text-right font-semibold ${
                              holding.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            ₹{formatNumber(holding.pnl)}
                          </td>
                          <td
                            className={`px-6 py-4 text-right font-medium ${
                              holding.day_change_percentage >= 0 ? 'text-emerald-400' : 'text-red-400'
                            }`}
                          >
                            {holding.day_change_percentage.toFixed(2)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* ==================== POSITIONS TAB ==================== */}
            {activeTab === 'positions' && (
              <div>
                <div className="flex justify-center space-x-4 mb-8">
                  {(['net', 'day'] as const).map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setPositionTab(tab)}
                      className={`px-8 py-3 rounded-lg font-medium transition-all ${
                        positionTab === tab ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-300 hover:bg-gray-700'
                      }`}
                    >
                      {tab.toUpperCase()} Positions
                      <span className="ml-2 opacity-75">({data.positions[tab].length})</span>
                    </button>
                  ))}
                </div>

                {data.positions && data.positions[positionTab].length === 0 ? (
                  <div className="text-center py-16 text-gray-400">No {positionTab} positions open</div>
                ) : (
                  <div className="overflow-x-auto rounded-lg border border-gray-700">
                    <table className="min-w-full divide-y divide-gray-700">
                      <thead className="bg-gray-800">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-medium text-gray-400 uppercase">Symbol</th>
                          <th className="px-6 py-4 text-center text-xs font-medium text-gray-400 uppercase">Qty</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">Avg</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">LTP</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">P&L</th>
                          <th className="px-6 py-4 text-right text-xs font-medium text-gray-400 uppercase">
                            Unrealised
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-gray-900 divide-y divide-gray-700">
                        {data.positions[positionTab].map((pos, i) => (
                          <tr key={i} className="hover:bg-gray-800/60">
                            <td className="px-6 py-4 font-medium text-gray-200">{pos.tradingsymbol}</td>
                            <td className="px-6 py-4 text-center text-gray-300">{pos.quantity}</td>
                            <td className="px-6 py-4 text-right text-gray-300">₹{pos.average_price}</td>
                            <td className="px-6 py-4 text-right text-gray-300">₹{pos.last_price}</td>
                            <td
                              className={`px-6 py-4 text-right font-semibold ${pos.pnl >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
                            >
                              ₹{formatNumber(pos.pnl)}
                            </td>
                            <td
                              className={`px-6 py-4 text-right font-semibold ${pos.unrealised >= 0 ? 'text-emerald-400' : 'text-red-400'}`}
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

// https://grok.com/share/bGVnYWN5LWNvcHk_c9c3c1f2-58f3-498b-8cd2-80d5cc731839
