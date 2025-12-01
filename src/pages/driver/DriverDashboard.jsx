import React from "react";
import { useAuth } from "../../context/AuthContext";

const DriverDashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Driver Dashboard</h1>

            <p>Welcome, <strong>{user?.name}</strong></p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">My Upcoming Trips</h2>
                    <p className="text-gray-600">View all assigned trips</p>
                </div>

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">Start / End Trip</h2>
                    <p className="text-gray-600">Update trip status in real-time</p>
                </div>

            </div>
        </div>
    );
};

export default DriverDashboard;