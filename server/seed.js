const mongoose = require('mongoose');
const User = require('./models/User');
require('dotenv').config();

async function seed() {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('Connected to MongoDB');

        const existingAdmin = await User.findOne({ email: 'admin@heirclear.com' });
        if (existingAdmin) {
            console.log('Admin account already exists.');
            process.exit(0);
        }

        const admin = new User({
            name: 'Admin',
            email: 'admin@heirclear.com',
            password: 'admin123',
            role: 'admin'
        });

        await admin.save();
        console.log('Admin account created successfully!');
        console.log('Email: admin@heirclear.com');
        console.log('Password: admin123');
        process.exit(0);
    } catch (error) {
        console.error('Seed error:', error.message);
        process.exit(1);
    }
}

seed();
