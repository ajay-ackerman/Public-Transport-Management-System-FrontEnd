import { createContext, useContext, useState, useEffect } from "react";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(() => JSON.parse(localStorage.getItem("user")) || null);
    const [token, setToken] = useState(() => localStorage.getItem("token") || null);
    const [refreshToken, setRefreshToken] = useState(() => localStorage.getItem("refreshToken") || null);

    const login = (userData, authToken, authRefreshToken) => {
        setUser(userData);
        setToken(authToken);
        setRefreshToken(authRefreshToken);

        localStorage.setItem("user", JSON.stringify(userData));
        localStorage.setItem("token", authToken);
        localStorage.setItem("refreshToken", authRefreshToken);
    };

    const logout = () => {
        setUser(null);
        setToken(null);
        setRefreshToken(null);

        localStorage.removeItem("user");
        localStorage.removeItem("token");
        localStorage.removeItem("refreshToken")
    };

    return (
        <AuthContext.Provider value={{ user, token, login, logout, isAuthenticated: !!token }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);