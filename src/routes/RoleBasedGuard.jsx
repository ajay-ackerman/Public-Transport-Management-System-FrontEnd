import React from 'react'
import { useAuth } from '../context/AuthContext'
import { Navigate } from 'react-router-dom';

export default RoleBasedGuard = ({ allowedRoles, children }) => {
    const { user } = useAuth();

    if (!user) return <Navigate to="/login" replace />
    if (!allowedRoles.includes(user.role)) {
        return <Navigate to="/unauthorized" replace />
    }

    return children;
}
