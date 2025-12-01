import React from "react";
import { useAuth } from "../../context/AuthContext";

const AdminDashboard = () => {
    const { user } = useAuth();

    return (
        <div>
            <h1 className="text-2xl font-bold mb-4">Admin Dashboard</h1>
            <p>Welcome, <strong>{user?.name}</strong></p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">Manage Vehicles</h2>
                    <p className="text-gray-600">Add, edit, and view vehicle fleet</p>
                </div>

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">Manage Drivers</h2>
                    <p className="text-gray-600">Assign drivers to trips</p>
                </div>

                <div className="p-4 bg-white rounded shadow">
                    <h2 className="font-semibold text-lg">Manage Trips</h2>
                    <p className="text-gray-600">Create, edit and track trips</p>
                </div>

            </div>
        </div>
    );
};

export default AdminDashboard;