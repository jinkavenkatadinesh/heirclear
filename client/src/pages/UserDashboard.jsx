import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

export default function UserDashboard() {
    const { user, logout } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await axios.get(`${API_URL}/claims`);
            setClaims(res.data.claims);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to load claims.');
        }
        setLoading(false);
    };

    const maskAccount = (acc) => {
        if (!acc) return '';
        if (acc.length <= 4) return acc;
        return 'X'.repeat(acc.length - 4) + acc.slice(-4);
    };

    const getStatusClass = (status) => {
        const map = {
            'Submitted': 'status-submitted',
            'Under Review': 'status-review',
            'Approved': 'status-approved',
            'Rejected': 'status-rejected'
        };
        return map[status] || '';
    };

    const formatDate = (dateStr) => {
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric'
        });
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header">
                <div className="header-left">
                    <div className="logo-small">
                        <div className="logo-icon-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span>HeirClear</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="profile-menu">
                        <button className="profile-btn" onClick={() => setShowMenu(!showMenu)}>
                            <div className="avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
                            <span className="user-name">{user?.name}</span>
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                <path d="M6 9l6 6 6-6" />
                            </svg>
                        </button>
                        {showMenu && (
                            <div className="dropdown-menu">
                                <div className="dropdown-header">
                                    <strong>{user?.name}</strong>
                                    <small>{user?.email}</small>
                                </div>
                                <hr />
                                <button onClick={handleLogout} className="dropdown-item logout-item">
                                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                                        <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4M16 17l5-5-5-5M21 12H9" />
                                    </svg>
                                    Logout
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </header>

            <main className="dashboard-main">
                <div className="dashboard-title-row">
                    <div>
                        <h1>My Claims</h1>
                        <p className="subtitle">Track and manage your inheritance claims</p>
                    </div>
                    <Link to="/submit-claim" className="btn btn-primary">
                        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                            <path d="M12 5v14M5 12h14" />
                        </svg>
                        Submit New Claim
                    </Link>
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading your claims...</p>
                    </div>
                ) : claims.length === 0 ? (
                    <div className="empty-state">
                        <div className="empty-icon">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="64" height="64">
                                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                        </div>
                        <h3>No Claims Yet</h3>
                        <p>Submit your first inheritance claim to get started.</p>
                        <Link to="/submit-claim" className="btn btn-primary">Submit Your First Claim</Link>
                    </div>
                ) : (
                    <div className="claims-grid">
                        {claims.map(claim => (
                            <div key={claim._id} className="claim-card">
                                <div className="claim-card-header">
                                    <span className={`status-badge ${getStatusClass(claim.status)}`}>
                                        {claim.status}
                                    </span>
                                    <span className="claim-date">{formatDate(claim.createdAt)}</span>
                                </div>
                                <div className="claim-card-body">
                                    <div className="claim-info">
                                        <label>Account Number</label>
                                        <span className="account-number">{maskAccount(claim.accountNumber)}</span>
                                    </div>
                                    <div className="claim-info">
                                        <label>Claim ID</label>
                                        <span className="claim-id">{claim._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>
                                <div className="claim-card-footer">
                                    <Link to={`/claims/${claim._id}`} className="btn btn-outline btn-small">
                                        View Details →
                                    </Link>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </main>
        </div>
    );
}
