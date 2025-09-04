#!/usr/bin/env node

const { execSync } = require('child_process');
const path = require('path');

console.log('🚀 Building Admin Dashboard...');

try {
  // Change to public directory
  process.chdir(path.join(__dirname, 'public'));
  
  // Run the build command
  execSync('npm run build:admin', { stdio: 'inherit' });
  
  console.log('✅ Admin Dashboard built successfully!');
  console.log('📁 Built files are in: dist/admin/');
  console.log('🌐 Access the admin dashboard at: http://localhost:8080/admin');
  
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}
