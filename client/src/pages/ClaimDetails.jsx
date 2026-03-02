import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const UPLOADS_URL = import.meta.env.PROD ? '/uploads' : 'http://localhost:5000/uploads';

export default function ClaimDetails() {
    const { id } = useParams();
    const [claim, setClaim] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        fetchClaim();
    }, [id]);

    const fetchClaim = async () => {
        try {
            const res = await axios.get(`${API_URL}/claims/${id}`);
            setClaim(res.data.claim);
        } catch (err) {
            const data = err.response?.data;
            setError(data?.message || 'Failed to load claim details.');
        }
        setLoading(false);
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

    const getStatusDescription = (status) => {
        const desc = {
            'Submitted': 'Your claim has been received. An administrator will review it shortly.',
            'Under Review': 'Your claim is currently being reviewed by a bank officer.',
            'Approved': 'Your claim has been approved. Further instructions will follow.',
            'Rejected': 'Your claim has been rejected. Please check the remarks for details.'
        };
        return desc[status] || '';
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

    if (loading) {
        return (
            <div className="page-container">
                <div className="loading-container">
                    <div className="loading-spinner"></div>
                    <p>Loading claim details...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="page-container">
                <div className="error-page">
                    <div className="error-message">{error}</div>
                    <Link to="/dashboard" className="btn btn-primary">Back to Dashboard</Link>
                </div>
            </div>
        );
    }

    return (
        <div className="page-container">
            <header className="page-header">
                <Link to="/dashboard" className="back-link">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="20" height="20">
                        <path d="M19 12H5M12 19l-7-7 7-7" />
                    </svg>
                    Back to Dashboard
                </Link>
            </header>

            <main className="detail-page">
                <div className="detail-container">
                    <div className="detail-header">
                        <div>
                            <h1>Claim Details</h1>
                            <p className="claim-id-label">ID: {claim._id.slice(-8).toUpperCase()}</p>
                        </div>
                        <span className={`status-badge status-badge-lg ${getStatusClass(claim.status)}`}>
                            {claim.status}
                        </span>
                    </div>

                    <div className="status-message-box">
                        <p>{getStatusDescription(claim.status)}</p>
                    </div>

                    <div className="detail-grid">
                        <div className="detail-card">
                            <h3>Claim Information</h3>
                            <div className="info-row">
                                <label>Account Number</label>
                                <span>{claim.maskedAccountNumber || claim.accountNumber}</span>
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
                                    <label>Last Admin Action</label>
                                    <span>{formatDate(claim.actionTimestamp)}</span>
                                </div>
                            )}
                        </div>

                        {claim.remarks && (
                            <div className="detail-card remarks-card">
                                <h3>Admin Remarks</h3>
                                <div className="remarks-content">
                                    <p>{claim.remarks}</p>
                                </div>
                            </div>
                        )}
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
        </div>
    );
}
