import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Client from './models/client.model.js';
import User from './models/user.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const runDiagnostics = async () => {
    console.log('--- Client Model Diagnostics ---');

    // 1. Connect to DB
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('✅ MongoDB Connected');
    } catch (err) {
        console.error('❌ DB Connection Failed:', err.message);
        process.exit(1);
    }

    // 2. Mock Data
    const mockEmail = `test_diag_${Date.now()}@example.com`;
    const mockPassword = 'TestPassword123!';
    let userId;

    try {
        // Find a user to associate with
        const user = await User.findOne();
        if (!user) {
            console.log('⚠️ No users found to associate mock client with. Creating dummy user...');
            // Create dummy user if needed, or just skip
            userId = new mongoose.Types.ObjectId();
        } else {
            userId = user._id;
        }

        // 3. Create Client
        console.log(`\nAttempting to create client: ${mockEmail}`);
        const newClient = await Client.create({
            userId: userId,
            firstName: 'Diag',
            lastName: 'Test',
            email: mockEmail,
            phone: '1234567890',
            password: mockPassword,
            companyName: 'Diag Corp'
        });
        console.log('✅ Client created successfully ID:', newClient._id);

        // 4. Verify Password Hashing
        if (newClient.password) {
            console.log('❌ Password field is visible in default selection (Expected: hidden)');
        } else {
            console.log('✅ Password field is hidden by default (select: false)');
        }

        // 5. Retrieve with Password
        const retrievedClient = await Client.findById(newClient._id).select('+password');
        if (retrievedClient.password) {
            console.log('✅ Password hash retrieved explicitly');
            console.log('   Hash:', retrievedClient.password.substring(0, 15) + '...');
        } else {
            console.error('❌ Password hash MISSING even when selected!');
        }

        // 6. Test Password Comparison
        const isMatch = await retrievedClient.comparePassword(mockPassword);
        if (isMatch) {
            console.log('✅ Password comparison PASSED');
        } else {
            console.error('❌ Password comparison FAILED');
        }

        // 7. Cleanup
        await Client.deleteOne({ _id: newClient._id });
        console.log('\n✅ Cleanup: Test client deleted');

    } catch (error) {
        console.error('❌ Diagnostics FAILED:', error);
    } finally {
        await mongoose.disconnect();
        process.exit();
    }
};

runDiagnostics();
