import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

export default function AdminDashboard() {
    const { user, logout } = useAuth();
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [showMenu, setShowMenu] = useState(false);
    const [filter, setFilter] = useState('All');
    const navigate = useNavigate();

    useEffect(() => {
        fetchClaims();
    }, []);

    const fetchClaims = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/claims`);
            setClaims(res.data.claims);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to load claims.');
        }
        setLoading(false);
    };

    const handleLogout = () => {
        logout();
        navigate('/login');
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

    const filteredClaims = filter === 'All'
        ? claims
        : claims.filter(c => c.status === filter);

    const statusCounts = {
        All: claims.length,
        Submitted: claims.filter(c => c.status === 'Submitted').length,
        'Under Review': claims.filter(c => c.status === 'Under Review').length,
        Approved: claims.filter(c => c.status === 'Approved').length,
        Rejected: claims.filter(c => c.status === 'Rejected').length,
    };

    return (
        <div className="dashboard-page">
            <header className="dashboard-header admin-header">
                <div className="header-left">
                    <div className="logo-small">
                        <div className="logo-icon-small">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                            </svg>
                        </div>
                        <span>HeirClear</span>
                        <span className="admin-badge">Admin</span>
                    </div>
                </div>
                <div className="header-right">
                    <div className="profile-menu">
                        <button className="profile-btn" onClick={() => setShowMenu(!showMenu)}>
                            <div className="avatar admin-avatar">{user?.name?.charAt(0)?.toUpperCase()}</div>
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
                        <h1>Claims Management</h1>
                        <p className="subtitle">Review and manage all inheritance claims</p>
                    </div>
                </div>

                <div className="stats-row">
                    {Object.entries(statusCounts).map(([status, count]) => (
                        <button
                            key={status}
                            className={`stat-card ${filter === status ? 'stat-active' : ''}`}
                            onClick={() => setFilter(status)}
                        >
                            <span className="stat-count">{count}</span>
                            <span className="stat-label">{status}</span>
                        </button>
                    ))}
                </div>

                {error && <div className="error-message">{error}</div>}

                {loading ? (
                    <div className="loading-container">
                        <div className="loading-spinner"></div>
                        <p>Loading claims...</p>
                    </div>
                ) : filteredClaims.length === 0 ? (
                    <div className="empty-state">
                        <h3>No {filter !== 'All' ? filter : ''} Claims</h3>
                        <p>{filter !== 'All' ? `No claims with status "${filter}" found.` : 'No claims have been submitted yet.'}</p>
                    </div>
                ) : (
                    <div className="table-container">
                        <table className="claims-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Account Number</th>
                                    <th>Submitted</th>
                                    <th>Status</th>
                                    <th>Action</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredClaims.map(claim => (
                                    <tr key={claim._id}>
                                        <td>
                                            <div className="user-cell">
                                                <strong>{claim.userId?.name || 'Unknown'}</strong>
                                                <small>{claim.userId?.email || ''}</small>
                                            </div>
                                        </td>
                                        <td className="monospace">{claim.accountNumber}</td>
                                        <td>{formatDate(claim.createdAt)}</td>
                                        <td>
                                            <span className={`status-badge ${getStatusClass(claim.status)}`}>
                                                {claim.status}
                                            </span>
                                        </td>
                                        <td>
                                            <Link to={`/admin/claims/${claim._id}`} className="btn btn-outline btn-small">
                                                Review →
                                            </Link>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </main>
        </div>
    );
}
