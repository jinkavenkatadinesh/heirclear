import { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);

const API_URL = import.meta.env.PROD ? '/api' : 'http://localhost:5000/api';

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [token, setToken] = useState(localStorage.getItem('heirclear_token'));
    const [loading, setLoading] = useState(true);

    // Set up axios defaults
    useEffect(() => {
        if (token) {
            axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        } else {
            delete axios.defaults.headers.common['Authorization'];
        }
    }, [token]);

    // Load user on mount
    useEffect(() => {
        async function loadUser() {
            if (!token) {
                setLoading(false);
                return;
            }
            try {
                const res = await axios.get(`${API_URL}/auth/me`);
                setUser(res.data.user);
            } catch {
                localStorage.removeItem('heirclear_token');
                setToken(null);
                setUser(null);
            }
            setLoading(false);
        }
        loadUser();
    }, [token]);

    const login = async (email, password) => {
        const res = await axios.post(`${API_URL}/auth/login`, { email, password });
        localStorage.setItem('heirclear_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const register = async (name, email, password) => {
        const res = await axios.post(`${API_URL}/auth/register`, { name, email, password });
        localStorage.setItem('heirclear_token', res.data.token);
        setToken(res.data.token);
        setUser(res.data.user);
        return res.data.user;
    };

    const logout = () => {
        localStorage.removeItem('heirclear_token');
        setToken(null);
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
}

export { API_URL };
