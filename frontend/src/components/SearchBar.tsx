import React, { useState, useCallback, type ChangeEvent } from 'react';

import { SEARCH_SYMBOL } from '../constants';
import { apiClient } from '../utils/api';

interface Instrument {
    id: number;
    instrument_token: number;
    exchange_token: number;
    tradingsymbol: string;
    name: string;
    last_price: number;
    expiry: string;
    strike: number;
    tick_size: number;
    lot_size: number;
    instrument_type: string;
    segment: string;
    exchange: string;
}

interface SearchBarProps {
    onSelect?: (instrument: Instrument) => void;
    placeholder?: string;
    debounceMs?: number;
}

const SearchBar: React.FC<SearchBarProps> = ({
    onSelect,
    placeholder = "Search stocks, futures, options (e.g. INFY, NIFTY, RELIANCE)",
    debounceMs = 350,
}) => {
    const [query, setQuery] = useState<string>('');
    const [results, setResults] = useState<Instrument[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<string | null>(null);

    // Debounce helper
    const debounce = <T extends (...args: any[]) => void>(fn: T, delay: number) => {
        let timer: NodeJS.Timeout;
        return (...args: Parameters<T>) => {
            clearTimeout(timer);
            timer = setTimeout(() => fn(...args), delay);
        };
    };

    const fetchResults = useCallback(async (searchTerm: string) => {
        if (searchTerm.length < 2) {
            setResults([]);
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);

        try {
            const searchUrl = `${SEARCH_SYMBOL}?text=${encodeURIComponent(searchTerm)}`;
            const response = await apiClient.get(searchUrl);
            const data = response.data;
            setResults(data?.results || []);
        } catch (err) {
            console.error('Search failed:', err);
            setError('Failed to fetch results');
            setResults([]);
        } finally {
            setLoading(false);
        }
    }, []);

    // Debounced version
    const debouncedFetch = useCallback(
        debounce((term: string) => fetchResults(term), debounceMs),
        [fetchResults, debounceMs]
    );

    const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.trim();
        setQuery(value);
        debouncedFetch(value);
    };

    const formatExpiry = (expiry: string): string => {
        if (expiry === '0001-01-01T00:00:00') return '';
        try {
            const date = new Date(expiry);
            if (isNaN(date.getTime())) return '';
            return date.toLocaleDateString('en-GB', {
                day: '2-digit',
                month: 'short',
                year: 'numeric',
            });
        } catch {
            return expiry.split('T')[0] || '';
        }
    };

    const handleSelect = (item: Instrument) => {
        if (onSelect) {
            onSelect(item);
        }
        // Optional: clear input after selection
        // setQuery(item.tradingsymbol);
        // setResults([]);
    };

    return (
        <div className="relative w-full max-w-2xl mx-auto">
            <input
                type="text"
                value={query}
                onChange={handleInputChange}
                placeholder={placeholder}
                aria-label="Search for stocks, futures, options"
                className="
          w-full px-4 py-3.5
          bg-gray-900 text-gray-100 text-base
          border border-gray-700 rounded-lg
          placeholder-gray-500
          focus:outline-none focus:border-gray-500 focus:ring-1 focus:ring-gray-600
          disabled:opacity-60
        "
                disabled={loading}
            />

            {loading && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 text-sm">
                    Loading...
                </div>
            )}

            {results.length > 0 && (
                <div
                    className="
            absolute z-10 w-full mt-1
            bg-gray-900 border border-gray-700
            rounded-lg shadow-2xl
            max-h-[420px] overflow-y-auto
            scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-900
          "
                    role="listbox"
                >
                    <ul className="divide-y divide-gray-800">
                        {results.map((item, index) => {
                            const isOption = item.instrument_type === 'CE' || item.instrument_type === 'PE';
                            const expiryText = formatExpiry(item.expiry);

                            return (
                                <li
                                    key={`${item.instrument_token}-${index}`}
                                    className="
                    px-4 py-3
                    hover:bg-gray-800
                    cursor-pointer
                    flex flex-col sm:flex-row sm:items-center sm:justify-between
                    gap-1 sm:gap-4
                    text-sm
                  "
                                    onClick={() => handleSelect(item)}
                                    role="option"
                                    tabIndex={0}
                                >
                                    {/* Left */}
                                    <div className="flex items-baseline gap-2.5 flex-wrap">
                                        <span className="font-semibold text-gray-100">
                                            {item.tradingsymbol}
                                        </span>
                                        <div className="flex items-center gap-2 text-gray-400">
                                            <span className="truncate max-w-[180px]">{item.name}</span>
                                            <span
                                                className="
                          px-1.5 py-0.5 text-xs font-medium rounded
                          bg-gray-700 text-gray-300 border border-gray-600
                        "
                                            >
                                                {item.instrument_type}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Right */}
                                    <div className="flex items-center gap-3 text-xs text-gray-400 sm:text-right whitespace-nowrap">
                                        {isOption && item.strike > 0 && (
                                            <span className="font-medium">{item.strike.toFixed(0)}</span>
                                        )}
                                        {expiryText && <span>{expiryText}</span>}
                                        <span className="font-medium">{item.exchange}</span>
                                    </div>
                                </li>
                            );
                        })}
                    </ul>
                </div>
            )}

            {query.length >= 2 && results.length === 0 && !loading && (
                <div
                    className="
            absolute z-10 w-full mt-1
            bg-gray-900 border border-gray-700
            rounded-lg shadow-xl p-5 text-center
            text-sm text-gray-400
          "
                >
                    {error ? error : `No matching instruments found for "${query}"`}
                </div>
            )}
        </div>
    );
};

export default SearchBar;

// Grok Build
// https://grok.com/share/bGVnYWN5LWNvcHk_bd7e4918-6dc0-4865-8b67-ef6f8f912d2a


