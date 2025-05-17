import React, { createContext, useContext } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const isAuthenticated = () => {
        return !!localStorage.getItem('token');
    };

    const getUserType = () => {
        return localStorage.getItem('role');
    };

    return (
        <AuthContext.Provider value={{ isAuthenticated, getUserType }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);