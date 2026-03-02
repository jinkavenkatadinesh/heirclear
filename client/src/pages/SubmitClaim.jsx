import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../context/AuthContext';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['application/pdf', 'image/jpeg', 'image/png', 'image/jpg'];

export default function SubmitClaim() {
    const [accountNumber, setAccountNumber] = useState('');
    const [files, setFiles] = useState({
        deathCertificate: null,
        idProof: null,
        relationshipProof: null
    });
    const [errors, setErrors] = useState({});
    const [submitError, setSubmitError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const validateFile = (file, fieldName) => {
        if (!file) return null;
        if (!ALLOWED_TYPES.includes(file.type)) {
            return `${fieldName} must be a PDF, JPG, or PNG file.`;
        }
        if (file.size > MAX_FILE_SIZE) {
            return `${fieldName} must be under 5MB. Current size: ${(file.size / 1024 / 1024).toFixed(1)}MB.`;
        }
        return null;
    };

    const handleFileChange = (e, field) => {
        const file = e.target.files[0];
        if (!file) return;

        const fieldLabels = {
            deathCertificate: 'Death Certificate',
            idProof: 'ID Proof',
            relationshipProof: 'Relationship Proof'
        };

        const error = validateFile(file, fieldLabels[field]);
        setErrors(prev => ({ ...prev, [field]: error }));
        setFiles(prev => ({ ...prev, [field]: error ? null : file }));

        if (error) {
            e.target.value = '';
        }
    };

    const allFilesUploaded = files.deathCertificate && files.idProof && files.relationshipProof;
    const hasErrors = Object.values(errors).some(e => e);
    const canSubmit = accountNumber.trim() && allFilesUploaded && !hasErrors && !loading;

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitError('');
        setLoading(true);

        const formData = new FormData();
        formData.append('accountNumber', accountNumber.trim());
        formData.append('deathCertificate', files.deathCertificate);
        formData.append('idProof', files.idProof);
        formData.append('relationshipProof', files.relationshipProof);

        try {
            const res = await axios.post(`${API_URL}/claims`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            navigate(`/claims/${res.data.claim._id}`);
        } catch (err) {
            const data = err.response?.data;
            setSubmitError(data ? `${data.message} ${data.action || ''}` : 'Failed to submit claim. Please try again.');
        }
        setLoading(false);
    };

    const renderFileInput = (field, label, description) => (
        <div className="upload-group" key={field}>
            <label>{label}</label>
            <p className="upload-desc">{description}</p>
            <div className={`upload-area ${files[field] ? 'upload-success' : ''} ${errors[field] ? 'upload-error-state' : ''}`}>
                <input
                    type="file"
                    id={field}
                    accept=".pdf,.jpg,.jpeg,.png"
                    onChange={(e) => handleFileChange(e, field)}
                />
                <label htmlFor={field} className="upload-label">
                    {files[field] ? (
                        <div className="upload-file-info">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="24" height="24">
                                <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                            </svg>
                            <span>{files[field].name}</span>
                            <small>{(files[field].size / 1024 / 1024).toFixed(2)} MB</small>
                        </div>
                    ) : (
                        <div className="upload-placeholder">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="32" height="32">
                                <path d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                            </svg>
                            <span>Click to upload or drag & drop</span>
                            <small>PDF, JPG, PNG — Max 5MB</small>
                        </div>
                    )}
                </label>
            </div>
            {errors[field] && <p className="field-error">{errors[field]}</p>}
        </div>
    );

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

            <main className="form-page">
                <div className="form-container">
                    <h1>Submit Inheritance Claim</h1>
                    <p className="form-desc">Please provide the bank account details and upload the required documents.</p>

                    {submitError && <div className="error-message">{submitError}</div>}

                    <form onSubmit={handleSubmit}>
                        <div className="form-group">
                            <label htmlFor="accountNumber">Bank Account Number</label>
                            <input
                                id="accountNumber"
                                type="text"
                                value={accountNumber}
                                onChange={(e) => setAccountNumber(e.target.value)}
                                placeholder="Enter the account number"
                                required
                            />
                        </div>

                        <div className="upload-section">
                            <h3>Required Documents</h3>
                            {renderFileInput('deathCertificate', 'Death Certificate', 'Official death certificate of the account holder')}
                            {renderFileInput('idProof', 'ID Proof', 'Your government-issued photo identification')}
                            {renderFileInput('relationshipProof', 'Relationship Proof', 'Document proving your relationship to the deceased')}
                        </div>

                        <div className="form-actions">
                            <Link to="/dashboard" className="btn btn-secondary">Cancel</Link>
                            <button type="submit" className="btn btn-primary" disabled={!canSubmit}>
                                {loading ? 'Submitting...' : 'Submit Claim'}
                            </button>
                        </div>
                    </form>
                </div>
            </main>
        </div>
    );
}
