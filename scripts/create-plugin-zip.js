const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const pluginDir = path.join(__dirname, '..', 'wordpress-plugin', 'miracole-backend-connector');
const outputZip = path.join(__dirname, '..', 'wordpress-plugin', 'miracole-backend-connector.zip');

console.log('📦 Creating WordPress plugin ZIP...\n');

// Check if plugin directory exists
if (!fs.existsSync(pluginDir)) {
  console.error('❌ Plugin directory not found:', pluginDir);
  process.exit(1);
}

// Check if zip command exists (Windows PowerShell or Unix)
const isWindows = process.platform === 'win32';

try {
  if (isWindows) {
    // Use PowerShell Compress-Archive on Windows
    const command = `powershell -Command "Compress-Archive -Path '${pluginDir}\\*' -DestinationPath '${outputZip}' -Force"`;
    execSync(command, { stdio: 'inherit' });
  } else {
    // Use zip command on Unix/Mac
    const command = `cd '${path.dirname(pluginDir)}' && zip -r '${path.basename(outputZip)}' '${path.basename(pluginDir)}' -x '*.git*' -x '*.DS_Store'`;
    execSync(command, { stdio: 'inherit' });
  }
  
  if (fs.existsSync(outputZip)) {
    const stats = fs.statSync(outputZip);
    console.log('\n✅ Plugin ZIP created successfully!');
    console.log(`   Location: ${outputZip}`);
    console.log(`   Size: ${(stats.size / 1024).toFixed(2)} KB\n`);
    console.log('📋 Next steps:');
    console.log('   1. Upload this ZIP file to WordPress');
    console.log('   2. Go to Plugins → Add New → Upload Plugin');
    console.log('   3. Select this ZIP file and install\n');
  } else {
    console.error('❌ ZIP file was not created');
    process.exit(1);
  }
} catch (error) {
  console.error('❌ Error creating ZIP:', error.message);
  console.log('\n💡 Manual alternative:');
  console.log('   1. Navigate to:', path.dirname(pluginDir));
  console.log('   2. Create a ZIP of the folder:', path.basename(pluginDir));
  console.log('   3. Upload to WordPress\n');
  process.exit(1);
}

