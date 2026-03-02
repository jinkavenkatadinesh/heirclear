const express = require('express');
const Claim = require('../models/Claim');
const { auth, adminOnly } = require('../middleware/auth');
const fs = require('fs');
const path = require('path');

const router = express.Router();

// All admin routes require auth + admin role
router.use(auth, adminOnly);

// GET /api/admin/claims — Get all claims
router.get('/claims', async (req, res) => {
    try {
        const claims = await Claim.find()
            .populate('userId', 'name email')
            .sort({ createdAt: -1 });
        res.json({ claims });
    } catch (error) {
        console.error('Admin fetch claims error:', error);
        res.status(500).json({
            message: 'Failed to load claims.',
            action: 'Please refresh the page and try again.'
        });
    }
});

// GET /api/admin/claims/:id — Get single claim with user details
router.get('/claims/:id', async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id)
            .populate('userId', 'name email');
        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found.',
                action: 'This claim may have been deleted. Please go back to the dashboard.'
            });
        }
        res.json({ claim });
    } catch (error) {
        console.error('Admin fetch claim error:', error);
        res.status(500).json({
            message: 'Failed to load claim details.',
            action: 'Please refresh the page and try again.'
        });
    }
});

// PUT /api/admin/claims/:id — Update claim status and remarks
router.put('/claims/:id', async (req, res) => {
    try {
        const { status, remarks } = req.body;
        const claim = await Claim.findById(req.params.id);

        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found.',
                action: 'This claim may have been deleted. Please go back to the dashboard.'
            });
        }

        if (status && status !== claim.status) {
            const isValid = Claim.isValidTransition(claim.status, status);
            if (!isValid) {
                return res.status(400).json({
                    message: `Cannot change status from "${claim.status}" to "${status}".`,
                    action: `Valid next status options from "${claim.status}" are: ${getValidNextStatuses(claim.status)}.`
                });
            }
            claim.status = status;
        }

        if (remarks !== undefined) {
            claim.remarks = remarks;
        }

        claim.actionTimestamp = new Date();
        await claim.save();

        // Re-populate for response
        await claim.populate('userId', 'name email');

        res.json({
            message: 'Claim updated successfully.',
            claim
        });
    } catch (error) {
        console.error('Admin update claim error:', error);
        res.status(500).json({
            message: 'Failed to update the claim.',
            action: 'Please try again. If the problem persists, contact support.'
        });
    }
});

// DELETE /api/admin/claims/:id — Delete a claim
router.delete('/claims/:id', async (req, res) => {
    try {
        const claim = await Claim.findById(req.params.id);
        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found.',
                action: 'This claim may have already been deleted.'
            });
        }

        // Delete associated files
        const uploadsDir = path.join(__dirname, '..', 'uploads');
        const docs = claim.documents;
        for (const key of Object.keys(docs.toObject ? docs.toObject() : docs)) {
            const filePath = path.join(uploadsDir, docs[key]);
            if (fs.existsSync(filePath)) {
                fs.unlinkSync(filePath);
            }
        }

        await Claim.findByIdAndDelete(req.params.id);

        res.json({ message: 'Claim deleted successfully.' });
    } catch (error) {
        console.error('Admin delete claim error:', error);
        res.status(500).json({
            message: 'Failed to delete the claim.',
            action: 'Please try again. If the problem persists, contact support.'
        });
    }
});

function getValidNextStatuses(currentStatus) {
    const transitions = {
        'Submitted': ['Under Review'],
        'Under Review': ['Approved', 'Rejected'],
        'Approved': [],
        'Rejected': ['Under Review']
    };
    const valid = transitions[currentStatus] || [];
    return valid.length > 0 ? valid.join(', ') : 'None (this is a final state)';
}

module.exports = router;
