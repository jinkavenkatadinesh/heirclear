const express = require('express');
const Claim = require('../models/Claim');
const { auth } = require('../middleware/auth');
const upload = require('../middleware/upload');

const router = express.Router();

// POST /api/claims — Submit a new claim
router.post('/', auth, (req, res, next) => {
    upload.fields([
        { name: 'deathCertificate', maxCount: 1 },
        { name: 'idProof', maxCount: 1 },
        { name: 'relationshipProof', maxCount: 1 }
    ])(req, res, function (err) {
        if (err) {
            if (err.message && err.message.includes('Invalid file type')) {
                return res.status(400).json({
                    message: 'Invalid file type uploaded.',
                    action: 'Please upload only PDF, JPG, or PNG files.'
                });
            }
            return next(err);
        }
        handleClaimSubmission(req, res);
    });
});

async function handleClaimSubmission(req, res) {
    try {
        const { accountNumber } = req.body;

        if (!accountNumber) {
            return res.status(400).json({
                message: 'Account number is required.',
                action: 'Please enter the bank account number associated with the claim.'
            });
        }

        if (!req.files || !req.files.deathCertificate || !req.files.idProof || !req.files.relationshipProof) {
            return res.status(400).json({
                message: 'All three documents are required.',
                action: 'Please upload the death certificate, ID proof, and relationship proof.'
            });
        }

        const claim = new Claim({
            userId: req.user._id,
            accountNumber,
            documents: {
                deathCertificate: req.files.deathCertificate[0].filename,
                idProof: req.files.idProof[0].filename,
                relationshipProof: req.files.relationshipProof[0].filename
            }
        });

        await claim.save();

        res.status(201).json({
            message: 'Claim submitted successfully.',
            claim
        });
    } catch (error) {
        console.error('Claim submission error:', error);
        res.status(500).json({
            message: 'Failed to submit your claim.',
            action: 'Please try again. If the problem persists, contact support.'
        });
    }
}

// GET /api/claims — Get user's own claims
router.get('/', auth, async (req, res) => {
    try {
        const claims = await Claim.find({ userId: req.user._id }).sort({ createdAt: -1 });
        res.json({ claims });
    } catch (error) {
        console.error('Fetch claims error:', error);
        res.status(500).json({
            message: 'Failed to load your claims.',
            action: 'Please refresh the page and try again.'
        });
    }
});

// GET /api/claims/:id — Get single claim details
router.get('/:id', auth, async (req, res) => {
    try {
        const claim = await Claim.findOne({ _id: req.params.id, userId: req.user._id });
        if (!claim) {
            return res.status(404).json({
                message: 'Claim not found.',
                action: 'This claim may have been removed. Please go back to your dashboard.'
            });
        }
        res.json({ claim });
    } catch (error) {
        console.error('Fetch claim error:', error);
        res.status(500).json({
            message: 'Failed to load claim details.',
            action: 'Please refresh the page and try again.'
        });
    }
});

module.exports = router;
