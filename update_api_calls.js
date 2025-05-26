#!/usr/bin/env node

// Utility script to help identify fetch calls that need to be updated
// to use the new API utility with credentials

const fs = require('fs');
const path = require('path');

const criticalFiles = [
  'src/ServerProvider.jsx',
  'src/login/LoginPage.jsx',
  'src/login/RegisterPage.jsx',
  'src/settings/UsersPage.jsx',
  'src/settings/PreferencesPage.jsx',
  'src/common/components/BottomMenu.jsx',
];

console.log('Critical files that need API call updates:');
console.log('==============================================');

criticalFiles.forEach((file) => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    const content = fs.readFileSync(fullPath, 'utf8');
    const lines = content.split('\n');

    console.log(`\n${file}:`);
    lines.forEach((line, index) => {
      if (line.includes('fetch(buildApiUrl') || (line.includes('fetch(') && line.includes('/api/'))) {
        console.log(`  Line ${index + 1}: ${line.trim()}`);
      }
    });
  }
});

console.log('\n==============================================');
console.log('Next steps:');
console.log('1. Update these files to use apiGet, apiPost, apiPut, apiDelete from src/common/util/api.js');
console.log('2. These utilities automatically include credentials: "include"');
console.log('3. Test the login flow after updating');
