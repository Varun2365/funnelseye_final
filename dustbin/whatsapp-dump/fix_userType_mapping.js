// misc/fix_userType_mapping.js
// Script to fix all userType mapping issues in WhatsApp controller

const fs = require('fs');
const path = require('path');

const controllerPath = path.join(__dirname, '../controllers/whatsappController.js');

// Read the file
let content = fs.readFileSync(controllerPath, 'utf8');

// Replace all occurrences of the problematic mapping
const oldPattern = /const userType = role === 'coach' \? 'coach' : 'staff';/g;
const newPattern = "const userType = role;";

content = content.replace(oldPattern, newPattern);

// Write back to file
fs.writeFileSync(controllerPath, content, 'utf8');

console.log('✅ Fixed all userType mapping issues in WhatsApp controller');
console.log('Changed from: role === "coach" ? "coach" : "staff"');
console.log('Changed to: role');
console.log('This means admin users will now have userType: "admin" instead of "staff"');
