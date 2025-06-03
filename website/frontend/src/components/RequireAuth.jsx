import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';

// Function to decode JWT token
const decodeJWT = (token) => {
    try {
        const parts = token.split('.');
        if (parts.length !== 3) {
            throw new Error('Invalid token format');
        }
        
        const payload = parts[1];
        const paddedPayload = payload + '='.repeat((4 - payload.length % 4) % 4);
        const decodedPayload = atob(paddedPayload);
        const parsedPayload = JSON.parse(decodedPayload);
        
        if (parsedPayload.exp && parsedPayload.exp < Date.now() / 1000) {
            throw new Error('Token expired');
        }
        
        return parsedPayload;
    } catch (error) {
        console.error('Error decoding JWT:', error);
        return null;
    }
};

// Clear authentication data
const clearAuthData = () => {
    localStorage.removeItem("access_token");
    localStorage.removeItem("refresh_token");
    localStorage.removeItem("username");
    
    // Dispatch custom event to notify other components
    window.dispatchEvent(new CustomEvent("authStatusChange"));
};

// Main authentication status checker
export const checkAuthStatus = (redirectOnFail = false) => {
    const accessToken = localStorage.getItem("access_token");
    
    if (accessToken) {
        const decodedToken = decodeJWT(accessToken);
        
        if (decodedToken && decodedToken.sub) {
            return {
                isAuthenticated: true,
                username: decodedToken.sub,
                token: accessToken
            };
        } else {
            // Token is invalid or expired, clear it
            clearAuthData();
        }
    }
    
    // If not authenticated and redirect is requested
    if (redirectOnFail) {
        window.location.href = "/login";
        return null; // This won't be reached due to redirect
    }
    
    return {
        isAuthenticated: false,
        username: null,
        token: null
    };
};

// Simple boolean check for authentication
export const isAuthenticated = () => {
    return checkAuthStatus().isAuthenticated;
};

// Get current user info (returns null if not authenticated)
export const getCurrentUser = () => {
    const authStatus = checkAuthStatus();
    return authStatus.isAuthenticated ? {
        username: authStatus.username,
        token: authStatus.token
    } : null;
};

// Logout function
export const logout = () => {
    clearAuthData();
    window.location.href = "/";
};

// Require authentication (redirects if not authenticated)
export const requireAuth = () => {
    return checkAuthStatus(true);
};

// Custom React Hook for authentication
export const useAuth = () => {
    const [authState, setAuthState] = useState({
        isAuthenticated: false,
        username: null,
        loading: true
    });

    const updateAuthState = () => {
        const authStatus = checkAuthStatus();
        setAuthState({
            isAuthenticated: authStatus.isAuthenticated,
            username: authStatus.username,
            loading: false
        });
    };

    useEffect(() => {
        updateAuthState();

        // Listen for auth changes
        const handleAuthChange = () => {
            updateAuthState();
        };

        window.addEventListener("storage", handleAuthChange);
        window.addEventListener("authStatusChange", handleAuthChange);

        return () => {
            window.removeEventListener("storage", handleAuthChange);
            window.removeEventListener("authStatusChange", handleAuthChange);
        };
    }, []);

    return authState;
};

// Component wrapper for protecting routes
export const ProtectedRoute = ({ children }) => {
    const { isAuthenticated, loading } = useAuth();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }

    // If not authenticated, redirect to login
    if (!isAuthenticated) {
        window.location.href = "/login";
        return null;
    }

    // If authenticated, render the protected content
    return children;
};

// Higher-Order Component for protecting components
export const withAuth = (WrappedComponent) => {
    return function AuthenticatedComponent(props) {
        useEffect(() => {
            requireAuth(); // This will redirect if not authenticated
        }, []);

        if (!isAuthenticated()) {
            return (
                <div className="flex justify-center items-center min-h-screen">
                    <div>Redirecting to login...</div>
                </div>
            );
        }

        return <WrappedComponent {...props} />;
    };
};

// Component for React Router - protects nested routes
export const RequireAuth = () => {
    const { isAuthenticated, loading } = useAuth();
    const location = window.location.pathname;
    
    // Allow access to login and register pages without authentication
    const publicRoutes = ['/login', '/register'];
    const isPublicRoute = publicRoutes.includes(location);
    
    // Show loading state while checking authentication
    if (loading && !isPublicRoute) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
            </div>
        );
    }
    
    // If route is public, always allow access
    if (isPublicRoute) {
        return <Outlet />;
    }
    
    // If route is protected and user is not authenticated, redirect to login
    if (!isAuthenticated) {
        window.location.href = "/login";
        return null;
    }
    
    // If authenticated and accessing protected route, render outlet
    return <Outlet />;
};

// Hook for pages that need authentication (redirects automatically)
export const useRequireAuth = () => {
    const authState = useAuth();
    
    useEffect(() => {
        if (!authState.loading && !authState.isAuthenticated) {
            window.location.href = "/login";
        }
    }, [authState.loading, authState.isAuthenticated]);
    
    return authState;
};