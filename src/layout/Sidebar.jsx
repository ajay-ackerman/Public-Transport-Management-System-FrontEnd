import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { FaBars, FaSignOutAlt } from "react-icons/fa";

const Sidebar = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const [isOpen, setIsOpen] = useState(true);

    // Role-based menu items
    const menus = {
        ADMIN: [
            { name: "Dashboard", path: "/admin" },
            { name: "Manage Vehicles", path: "/admin/vehicles" },
            { name: "Manage Drivers", path: "/admin/drivers" },
            { name: "Manage Routes", path: "/admin/routes" },
            { name: "Manage Trips", path: "/admin/trips" },
            { name: "Manage Schedules", path: "/admin/schedules" }
        ],
        DRIVER: [
            { name: "Dashboard", path: "/driver" },
            { name: "My Trips", path: "/driver/trips" },
            { name: "Start/End Trip", path: "/driver/trip-actions" },
        ],
        PASSENGER: [
            { name: "Dashboard", path: "/passenger" },
            { name: "Search Trips", path: "/passenger/search" },
            { name: "My Bookings", path: "/passenger/bookings" },
        ],
    };

    const menuItems = menus[user?.role] || [];

    return (
        <aside
            className={`h-screen bg-gray-900 text-gray-200 fixed top-0 left-0 shadow-lg flex flex-col transition-all duration-300
        ${isOpen ? "w-64" : "w-20"}
      `}
        >
            {/* Top Section with Toggle Button */}
            <div className="flex items-center justify-between px-4 py-4 border-b border-gray-700">
                <span className={`text - xl font-bold transition-all duration-300 ${isOpen ? "opacity-100" : "opacity-0 w-0 overflow-hidden"}`}>
                    Transport App
                </span>

                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="text-gray-300 hover:text-white"
                >
                    <FaBars size={22} />
                </button>
            </div>

            {/* MENU */}
            <nav className="flex-1 overflow-y-auto mt-4">
                <ul className="space-y-1 px-2">
                    {menuItems.map((item) => {
                        const active = location.pathname === item.path;

                        return (
                            <li key={item.path}>
                                <Link
                                    to={item.path}
                                    className={`flex items-center gap-3 px-4 py-2 rounded-lg text-sm font-medium transition-all
                    ${active ? "bg-blue-600 text-white" : "text-gray-300 hover:bg-gray-800 hover:text-white"}
                  `}
                                >
                                    {/* Fake icon just to keep alignment (you can add real icons later) */}
                                    <div className="w-6 h-6 rounded bg-gray-700"></div>

                                    {/* Hide text when collapsed */}
                                    {isOpen && <span>{item.name}</span>}
                                </Link>
                            </li>
                        );
                    })}
                </ul>
            </nav>

            {/* FOOTER USER INFO */}
            <div className="px-4 py-4 border-t border-gray-700">
                {/* User text ONLY when expanded */}
                {isOpen && (
                    <div className="text-xs text-gray-400 mb-3">
                        Logged in as: <span className="text-gray-200">{user?.name}</span>
                    </div>
                )}

                {/* LOGOUT BUTTON */}
                <button
                    onClick={logout}
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg 
            bg-red-600 text-white hover:bg-red-700 transition-all`}
                >
                    <FaSignOutAlt size={18} />

                    {isOpen && <span>Logout</span>}
                </button>
            </div>
        </aside >
    );
};

export default Sidebar;