// Script to replace n8n variables with actual values
// Run with: node replace-variables.js

const fs = require('fs');
const path = require('path');

// Your actual values
const VARIABLES = {
  'SUPABASE_URL': 'https://gxieuybdhngkkkmaxpsj.supabase.co',
  'SUPABASE_KEY': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imd4aWV1eWJkaG5na2trbWF4cHNqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjYxNjU2NjMsImV4cCI6MjA4MTc0MTY2M30.Iz810S-OLictocvT_Hx3rZI7jhIkgPCTcJq9OEBVt5o',
  'GHL_API_KEY': 'YOUR_GHL_API_KEY_HERE', // Replace when you have it
  'GHL_LOCATION_ID': 'YOUR_GHL_LOCATION_ID_HERE', // Replace when you have it
  'ANTHROPIC_API_KEY': 'YOUR_ANTHROPIC_API_KEY_HERE', // Replace when you have it
  'SLACK_CHANNEL_ID': 'YOUR_SLACK_CHANNEL_ID_HERE' // Replace when you have it
};

const templatesDir = path.join(__dirname, 'templates');
const outputDir = path.join(__dirname, 'configured');

// Create output directory if it doesn't exist
if (!fs.existsSync(outputDir)) {
  fs.mkdirSync(outputDir);
}

// Get all JSON files
const files = fs.readdirSync(templatesDir).filter(f => f.endsWith('.json'));

console.log(`🔧 Processing ${files.length} workflow files...\n`);

files.forEach(file => {
  const filePath = path.join(templatesDir, file);
  let content = fs.readFileSync(filePath, 'utf8');

  // Track which variables were replaced
  const replacedVars = new Set();

  // Replace each variable
  Object.keys(VARIABLES).forEach(varName => {
    const placeholder = `{{ $vars.${varName} }}`;
    const value = VARIABLES[varName];

    if (content.includes(placeholder)) {
      // Count occurrences
      const count = (content.match(new RegExp(placeholder.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g')) || []).length;
      content = content.split(placeholder).join(value);
      replacedVars.add(`${varName} (${count}x)`);
    }
  });

  // Write modified file
  const outputPath = path.join(outputDir, file);
  fs.writeFileSync(outputPath, content, 'utf8');

  if (replacedVars.size > 0) {
    console.log(`✅ ${file}`);
    console.log(`   Replaced: ${Array.from(replacedVars).join(', ')}`);
  } else {
    console.log(`⚪ ${file} (no variables found)`);
  }
});

console.log(`\n🎉 Done! Modified workflows saved to: ${outputDir}`);
console.log(`\n⚠️  IMPORTANT: Before importing to n8n, update these placeholder values:`);
console.log(`   - GHL_API_KEY`);
console.log(`   - GHL_LOCATION_ID`);
console.log(`   - ANTHROPIC_API_KEY`);
console.log(`   - SLACK_CHANNEL_ID`);
console.log(`\nYou can edit the configured JSON files directly or update VARIABLES in this script and re-run.`);
