import React from "react";

const LoadingSpinner = ({ text = "Logging in..." }) => {
    return (
        <div className="flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-gray-300 border-t-blue-600 rounded-full animate-spin" />
            <p className="text-sm text-gray-600">{text}</p>
        </div>
    );
};

export default LoadingSpinner;