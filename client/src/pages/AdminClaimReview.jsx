import { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const UPLOADS_URL = import.meta.env.PROD ? '/uploads' : 'http://localhost:5000/uploads';

const VALID_TRANSITIONS = {
    'Submitted': ['Under Review'],
    'Under Review': ['Approved', 'Rejected'],
    'Approved': [],
    'Rejected': ['Under Review']
};

export default function AdminClaimReview() {
    const { id } = useParams();
    const navigate = useNavigate();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [newStatus, setNewStatus] = useState('');
    const [remarks, setRemarks] = useState('');
    const [saving, setSaving] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [successMsg, setSuccessMsg] = useState('');

    useEffect(() => {
        fetchClaim();
    }, [id]);

    const fetchClaim = async () => {
        try {
            const res = await axios.get(`${API_URL}/admin/claims/${id}`);
            setClaim(res.data.claim);
            setRemarks(res.data.claim.remarks || '');
            setNewStatus(res.data.claim.status);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to load claim details.');
        }
        setLoading(false);
    };

    const handleSave = () => {
        setShowConfirm(true);
    };

    const confirmSave = async () => {
        setShowConfirm(false);
        setSaving(true);
        setSuccessMsg('');
        setError('');

        try {
            const res = await axios.put(`${API_URL}/admin/claims/${id}`, {
                status: newStatus,
                remarks
            });
            setClaim(res.data.claim);
            setSuccessMsg('Claim updated successfully!');
        } catch (err) {
            const data = err.response?.data;
            setError(data ? `${data.message} ${data.action || ''}` : 'Failed to update claim.');
        }
        setSaving(false);
    };

    const handleDelete = async () => {
        setShowDeleteConfirm(false);
        try {
            await axios.delete(`${API_URL}/admin/claims/${id}`);
            navigate('/admin');
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to delete claim.');
        }
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
        if (!dateStr) return '—';
        return new Date(dateStr).toLocaleDateString('en-IN', {
            day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit'
        });
    };

    const renderDocument = (filename, label) => {
        if (!filename) return null;
        const url = `${UPLOADS_URL}/${filename}`;
        const isPdf = filename.toLowerCase().endsWith('.pdf');

        return (
            <div className="doc-preview-card">
                <h4>{label}</h4>
                <div className="doc-preview-content">
                    {isPdf ? (
                        <div className="pdf-preview">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" width="40" height="40">
                                <path d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z" />
                            </svg>
                            <span>PDF Document</span>
                        </div>
                    ) : (
                        <img src={url} alt={label} className="doc-thumbnail" />
                    )}
                </div>
                <a href={url} target="_blank" rel="noreferrer" className="btn btn-outline btn-small">
                    Open Full Document
                </a>
            </div>
        );
    };

    const allowedStatuses = claim ? VALID_TRANSITIONS[claim.status] || [] : [];
    const statusOptions = claim ? [claim.status, ...allowedStatuses] : [];

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading claim...</p>
                </div>
            </div>
        );
    }

    if (error && !claim) {
        return (
            <div className="page-container">
                <div className="error-page">
                    <div className="error-message">{error}</div>
                    <Link to="/admin" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <Link to="/admin" className="back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Admin Dashboard
                </Link>
            </header>

            <main className="detail-page">
                <div className="detail-container">
                    <div className="detail-header">
                        <div>
                            <h1>Review Claim</h1>
                            <p className="claim-id-label">ID: {claim._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`status-badge status-badge-lg ${getStatusClass(claim.status)}`}>
                            {claim.status}
                        </span>
                    </div>

                    {successMsg && <div className="success-message">{successMsg}</div>}
                    {error && <div className="error-message">{error}</div>}

                    <div className="detail-grid">
                        <div className="detail-card">
                            <h3>Claim Information</h3>
                            <div className="info-row">
                                <label>Submitted By</label>
                                <span>{claim.userId?.name || 'Unknown'}</span>
                            </div>
                            <div className="info-row">
                                <label>User Email</label>
                                <span>{claim.userId?.email || 'N/A'}</span>
                            </div>
                            <div className="info-row">
                                <label>Account Number</label>
                                <span className="monospace">{claim.accountNumber}</span>
                            </div>
                            <div className="info-row">
                                <label>Submitted On</label>
                                <span>{formatDate(claim.createdAt)}</span>
                            </div>
                            <div className="info-row">
                                <label>Last Updated</label>
                                <span>{formatDate(claim.updatedAt)}</span>
                            </div>
                            {claim.actionTimestamp && (
                                <div className="info-row">
                                    <label>Last Action</label>
                                    <span>{formatDate(claim.actionTimestamp)}</span>
                                </div>
                            )}
                        </div>

                        <div className="detail-card action-card">
                            <h3>Update Claim</h3>

                            <div className="form-group">
                                <label htmlFor="status">Status</label>
                                <select
                                    id="status"
                                    value={newStatus}
                                    onChange={(e) => setNewStatus(e.target.value)}
                                    className="status-select"
                                >
                                    {statusOptions.map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                                {allowedStatuses.length === 0 && (
                                    <small className="help-text">This claim is in a final state and cannot be transitioned further.</small>
                                )}
                            </div>

                            <div className="form-group">
                                <label htmlFor="remarks">Remarks</label>
                                <textarea
                                    id="remarks"
                                    value={remarks}
                                    onChange={(e) => setRemarks(e.target.value)}
                                    placeholder="Add your remarks or explanation..."
                                    rows={4}
                                ></textarea>
                            </div>

                            <div className="action-buttons">
                                <button
                                    onClick={handleSave}
                                    className="btn btn-primary"
                                    disabled={saving}
                                >
                                    {saving ? 'Saving...' : 'Save Changes'}
                                </button>
                                <button
                                    onClick={() => setShowDeleteConfirm(true)}
                                    className="btn btn-danger"
                                >
                                    Delete Claim
                                </button>
                            </div>
                        </div>
                    </div>

                    <div className="documents-section">
                        <h3>Uploaded Documents</h3>
                        <div className="documents-grid">
                            {renderDocument(claim.documents?.deathCertificate, 'Death Certificate')}
                            {renderDocument(claim.documents?.idProof, 'ID Proof')}
                            {renderDocument(claim.documents?.relationshipProof, 'Relationship Proof')}
                        </div>
                    </div>
                </div>
            </main>

            {/* Confirmation Modal - Status Update */}
            {showConfirm && (
                <div className="modal-overlay" onClick={() => setShowConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Confirm Update</h3>
                        <p>Are you sure you want to update this claim?</p>
                        {newStatus !== claim.status && (
                            <p className="modal-detail">
                                Status will change from <strong>{claim.status}</strong> to <strong>{newStatus}</strong>
                            </p>
                        )}
                        <div className="modal-actions">
                            <button onClick={() => setShowConfirm(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={confirmSave} className="btn btn-primary">Confirm Update</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Confirmation Modal - Delete */}
            {showDeleteConfirm && (
                <div className="modal-overlay" onClick={() => setShowDeleteConfirm(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <h3>Delete Claim</h3>
                        <p>Are you sure you want to permanently delete this claim? This action cannot be undone.</p>
                        <div className="modal-actions">
                            <button onClick={() => setShowDeleteConfirm(false)} className="btn btn-secondary">Cancel</button>
                            <button onClick={handleDelete} className="btn btn-danger">Delete Permanently</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
