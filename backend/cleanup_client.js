import Link from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import Client from './models/client.model.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const connectDB = async () => {
    try {
        const conn = await Link.connect(process.env.MONGO_URI);
        console.log(`MongoDB Connected: ${conn.connection.host}`);
    } catch (error) {
        console.error(`Error: ${error.message}`);
        process.exit(1);
    }
};

const deleteCorruptedClient = async () => {
    await connectDB();

    console.log('\n🔍 Searching for corrupted clients (missing password)...');

    try {
        // Find clients without password field or empty password
        const corruptedClients = await Client.find({
            $or: [
                { password: { $exists: false } },
                { password: null },
                { password: '' }
            ]
        }).select('+password'); // Explicitly select password field to check

        if (corruptedClients.length === 0) {
            console.log('✅ No corrupted clients found.');
        } else {
            console.log(`⚠️ Found ${corruptedClients.length} corrupted client(s):`);

            for (const client of corruptedClients) {
                console.log(`   - ${client.email} (${client.firstName} ${client.lastName})`);
                await Client.deleteOne({ _id: client._id });
                console.log(`   ❌ Deleted corrupted client: ${client.email}`);
            }
        }

    } catch (error) {
        console.error('Error during cleanup:', error);
    } finally {
        console.log('\nCleanup complete. You can now recreate the client account.');
        process.exit();
    }
};

deleteCorruptedClient();
