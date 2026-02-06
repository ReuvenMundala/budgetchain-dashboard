import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

// Default admin credentials (for demo purposes)
const ADMIN_CREDENTIALS = {
    username: 'admin',
    password: 'admin123'
};

export function AuthProvider({ children }) {
    const [user, setUser] = useState(() => {
        const saved = localStorage.getItem('budgetchain_user');
        return saved ? JSON.parse(saved) : null;
    });

    const [isAuthenticated, setIsAuthenticated] = useState(() => {
        return localStorage.getItem('budgetchain_user') !== null;
    });

    // Persist user to localStorage
    useEffect(() => {
        if (user) {
            localStorage.setItem('budgetchain_user', JSON.stringify(user));
        } else {
            localStorage.removeItem('budgetchain_user');
        }
    }, [user]);

    const loginAsAdmin = (username, password) => {
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            const adminUser = {
                type: 'admin',
                name: 'Administrator',
                initials: 'AD',
                permissions: {
                    canAddProjects: true,
                    canEditProjects: true,
                    canDeleteProjects: true,
                    canViewReports: true,
                    canManageReports: true
                }
            };
            setUser(adminUser);
            setIsAuthenticated(true);
            return { success: true };
        }
        return { success: false, error: 'Invalid credentials' };
    };

    const loginAsGuest = () => {
        const guestUser = {
            type: 'guest',
            name: 'Guest User',
            initials: 'GU',
            permissions: {
                canAddProjects: false,
                canEditProjects: false,
                canDeleteProjects: false,
                canViewReports: true,
                canManageReports: false
            }
        };
        setUser(guestUser);
        setIsAuthenticated(true);
    };

    const logout = () => {
        setUser(null);
        setIsAuthenticated(false);
        localStorage.removeItem('budgetchain_user');
    };

    const isAdmin = () => user?.type === 'admin';
    const isGuest = () => user?.type === 'guest';
    const canAddProjects = () => user?.permissions?.canAddProjects ?? false;

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            loginAsAdmin,
            loginAsGuest,
            logout,
            isAdmin,
            isGuest,
            canAddProjects
        }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
}

export default AuthContext;
