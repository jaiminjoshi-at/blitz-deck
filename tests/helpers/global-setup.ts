import { execSync } from 'child_process';
import path from 'path';

async function globalSetup() {
    console.log('🤖 Running E2E test database setup (migrations & seed)...');
    try {
        const rootDir = path.resolve(__dirname, '../../');
        
        // Build the seed script
        console.log('⚡ Building seed script...');
        execSync('npm run build:seed', { cwd: rootDir, stdio: 'inherit' });
        
        // Run seed/migrations
        console.log('🌱 Seeding database...');
        execSync('npm run seed', { cwd: rootDir, stdio: 'inherit' });
        
        console.log('✅ E2E test database setup complete.');
    } catch (error) {
        console.error('❌ E2E test database setup failed:', error);
        throw error;
    }
}

export default globalSetup;
