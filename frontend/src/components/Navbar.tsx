import { useSelector, useDispatch } from 'react-redux'
import { loginUser, selectIsLoggedIn, fetchProfile, watchNifty50Option, selectUserProfile } from './../store/userSlice'


import { useNavigate } from "react-router";
import { useEffect } from 'react';


const Navbar = () => {

    const dispatch = useDispatch()
    const navigate = useNavigate();
    const isLoggedIn: boolean = useSelector(selectIsLoggedIn)
    const profileData = useSelector(selectUserProfile)

    const handleLogin = () => {
        dispatch(loginUser() as any)
    }

    useEffect(() => {
        if (isLoggedIn && !profileData) {
            // fetch user Profile 
            dispatch(fetchProfile() as any)
        }
    }, [isLoggedIn])

    const handleProfile = () => {
        // Profile handler logic can be added here
        // Navigate to profile page or open profile modal
        console.log("Profile button clicked")
        // You can use React Router or any other method to navigate to the profile page
        navigate("/profile");
    }

    const handleLogoClick = () => {
        navigate("/");
    }

    const handleWatchNifty50Option = () => {
        // Logic to watch Nifty 50 Option can be added here
        dispatch(watchNifty50Option() as any)
    }


    return (
        <nav className="bg-black fixed top-0 left-0 w-full z-50 shadow-2xl">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between items-center h-20">
                    {/* Left: Logo + "Friction Trading" Title */}
                    <div className="flex items-center space-x-5">
                        {/* Minimalist Logo - using only the 3 colors */}
                        <div className="relative"
                            onClick={handleLogoClick}
                            style={{ cursor: 'pointer' }}
                        >
                            <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <rect width="48" height="48" rx="12" className="fill-blue-500" />
                                <rect x="12" y="12" width="24" height="24" rx="8" className="fill-cyan-400" />
                                <path d="M24 8 L40 24 L24 40 L8 24 Z" className="fill-emerald-500 opacity-80" />
                            </svg>
                        </div>

                        {/* Title - strictly 3 colors only */}
                        <h1 className="text-4xl font-black tracking-tight">
                            <span className="text-blue-400 drop-shadow-lg">Friction</span>
                            <span className="ml-3 text-3xl text-cyan-300 font-bold">Trading</span>
                        </h1>
                    </div>

                    {/* Right: Profile and Login buttons - using only the 3 colors */}
                    {isLoggedIn && <div className="flex items-center space-x-6">
                        <button className="px-8 py-3 text-base font-semibold text-gray-300 bg-gray-900 border-2 border-gray-800 rounded-full 
              hover:bg-gray-800 hover:border-cyan-500 hover:text-cyan-300 hover:shadow-xl hover:shadow-cyan-500/20
              transform hover:-translate-y-1 transition-all duration-300"
                            onClick={handleProfile}
                        >
                            Profile
                        </button>
                    </div>}
                    {/* Watch Nifty 50 Option only after Login */}
                    {isLoggedIn && <div className="flex items-center space-x-6">
                        <button className="px-8 py-3 text-base font-semibold text-gray-300 bg-gray-900 border-2 border-gray-800 rounded-full 
              hover:bg-gray-800 hover:border-cyan-500 hover:text-cyan-300 hover:shadow-xl hover:shadow-cyan-500/20
              transform hover:-translate-y-1 transition-all duration-300"
                            onClick={handleWatchNifty50Option}
                        >
                            Watch Nifty 50 Option
                        </button>
                    </div>}
                    {!isLoggedIn && <button className="px-8 py-3 text-base font-semibold text-white bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full 
              hover:from-blue-600 hover:to-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/30
              transform hover:-translate-y-1 transition-all duration-300"
                        onClick={handleLogin}
                    >
                        Login
                    </button>}
                </div>
            </div>
        </nav>
    );
};

export default Navbar;