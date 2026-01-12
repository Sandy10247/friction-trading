import { useSelector, useDispatch } from 'react-redux';
import {
    loginUser,
    selectIsLoggedIn,
    fetchProfile,
    watchNifty50Option,
    selectUserProfile,
    fetchPositions,
    fetchHoldings,
    checkLoginUrl
} from './../store/userSlice';

import { useNavigate } from "react-router";
import { useEffect } from 'react';

const Navbar = () => {
    const dispatch = useDispatch();
    const navigate = useNavigate();

    const isLoggedIn = useSelector(selectIsLoggedIn);
    const profile = useSelector(selectUserProfile);

    const avatarUrl = profile?.avatar_url || 'https://via.placeholder.com/48?text=U';

    useEffect(() => {
        if (isLoggedIn) {
            // Only fetch if we don't already have profile data
            if (!profile) {
                dispatch(fetchProfile() as any);
            }
            dispatch(fetchPositions() as any);
            dispatch(fetchHoldings() as any);
        }
    }, [isLoggedIn, profile, dispatch]);

    useEffect(() => {
        if (!isLoggedIn) {
            const intervalId = setInterval(() => {
                dispatch(checkLoginUrl() as any);
            }, 1_000)

            return () => {
                clearInterval(intervalId)
            }
        }

    }, [isLoggedIn])

    const handleLogin = () => {
        dispatch(loginUser() as any);
    };

    const handleLogoClick = () => {
        navigate('/');
    };

    const handleProfileClick = () => {
        navigate('/profile');
    };

    const handleWatchNifty50 = () => {
        dispatch(watchNifty50Option() as any);
    };

    return (
        <nav className="bg-black fixed top-0 left-0 w-full z-50 shadow-2xl border-b border-gray-900/80">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Left: Logo + Title */}
                    <div className="flex items-center space-x-5">
                        <div
                            onClick={handleLogoClick}
                            className="cursor-pointer"
                        >
                            <svg
                                width="48"
                                height="48"
                                viewBox="0 0 48 48"
                                fill="none"
                                xmlns="http://www.w3.org/2000/svg"
                            >
                                <rect width="48" height="48" rx="12" className="fill-blue-500" />
                                <rect x="12" y="12" width="24" height="24" rx="8" className="fill-cyan-400" />
                                <path
                                    d="M24 8 L40 24 L24 40 L8 24 Z"
                                    className="fill-emerald-500 opacity-80"
                                />
                            </svg>
                        </div>

                        <h1 className="text-4xl font-black tracking-tight">
                            <span className="text-blue-400 drop-shadow-lg">Friction</span>
                            <span className="ml-3 text-3xl text-cyan-300 font-bold">Trading</span>
                        </h1>
                    </div>

                    {/* Right side: Auth / User actions */}
                    <div className="flex items-center space-x-6">
                        {isLoggedIn ? (
                            <div className="flex items-center gap-5">
                                {/* Watch Nifty 50 Option */}
                                <button
                                    onClick={handleWatchNifty50}
                                    className="
                    px-6 py-2.5 text-base font-semibold text-gray-200
                    bg-gray-900 border border-gray-700 rounded-full
                    hover:bg-gray-800 hover:border-cyan-500 hover:text-cyan-300
                    hover:shadow-cyan-500/20 hover:shadow-lg
                    transform hover:-translate-y-0.5 transition-all duration-300
                  "
                                >
                                    Watch Nifty 50
                                </button>

                                {/* Profile Avatar - clickable */}
                                <button
                                    onClick={handleProfileClick}
                                    className="relative group focus:outline-none"
                                    title="View Profile"
                                >
                                    <img
                                        src={avatarUrl}
                                        alt="User avatar"
                                        className="
                      w-11 h-11 rounded-full object-cover border-2 border-gray-700
                      group-hover:border-cyan-400 group-hover:shadow-lg
                      group-hover:shadow-cyan-500/30 transition-all duration-300
                    "
                                    />
                                    <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                            </div>
                        ) : (
                            <button
                                onClick={handleLogin}
                                className="
                  px-8 py-3 text-base font-semibold text-white
                  bg-gradient-to-r from-blue-600 to-emerald-600 rounded-full
                  hover:from-blue-500 hover:to-emerald-500
                  hover:shadow-2xl hover:shadow-emerald-500/40
                  transform hover:-translate-y-1 transition-all duration-300
                "
                            >
                                Login
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
};

export default Navbar;