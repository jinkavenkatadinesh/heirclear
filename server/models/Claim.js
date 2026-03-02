const mongoose = require('mongoose');

const VALID_STATUSES = ['Submitted', 'Under Review', 'Approved', 'Rejected'];

const VALID_TRANSITIONS = {
    'Submitted': ['Under Review'],
    'Under Review': ['Approved', 'Rejected'],
    'Approved': [],
    'Rejected': ['Under Review']
};

const claimSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    accountNumber: {
        type: String,
        required: [true, 'Account number is required'],
        trim: true,
        minlength: [4, 'Account number must be at least 4 characters']
    },
    status: {
        type: String,
        enum: VALID_STATUSES,
        default: 'Submitted'
    },
    documents: {
        deathCertificate: {
            type: String,
            required: [true, 'Death certificate is required']
        },
        idProof: {
            type: String,
            required: [true, 'ID proof is required']
        },
        relationshipProof: {
            type: String,
            required: [true, 'Relationship proof is required']
        }
    },
    remarks: {
        type: String,
        default: ''
    },
    actionTimestamp: {
        type: Date,
        default: null
    }
}, {
    timestamps: true
});

// Static method to validate state transitions
claimSchema.statics.isValidTransition = function (currentStatus, newStatus) {
    const allowed = VALID_TRANSITIONS[currentStatus];
    if (!allowed) return false;
    return allowed.includes(newStatus);
};

// Virtual for masked account number
claimSchema.virtual('maskedAccountNumber').get(function () {
    if (!this.accountNumber) return '';
    const len = this.accountNumber.length;
    if (len <= 4) return this.accountNumber;
    return 'X'.repeat(len - 4) + this.accountNumber.slice(-4);
});

claimSchema.set('toJSON', { virtuals: true });
claimSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Claim', claimSchema);
