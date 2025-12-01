import React from "react";
import { useAuth } from "../../context/AuthContext";

const PassengerDashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Passenger Dashboard</h1>

            <p>Welcome, <strong>{user?.name}</strong></p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">Search Trips</h2>
                    <p className="text-gray-600">Find trips by source/destination</p>
                </div>

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">My Bookings</h2>
                    <p className="text-gray-600">View or cancel booked tickets</p>
                </div>

            </div>
        </div>
    );
};

export default PassengerDashboard;