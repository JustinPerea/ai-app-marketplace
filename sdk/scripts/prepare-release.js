#!/usr/bin/env node

/**
 * AI Marketplace SDK Release Preparation Script
 * 
 * This script prepares a new release by:
 * 1. Updating version numbers
 * 2. Generating/updating CHANGELOG.md
 * 3. Creating release notes
 * 4. Validating the build
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Color codes for console output
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function exec(command, description) {
  log(`🔄 ${description}...`, 'blue');
  try {
    const result = execSync(command, { encoding: 'utf-8', stdio: 'pipe' });
    log(`✅ ${description} completed`, 'green');
    return result.trim();
  } catch (error) {
    log(`❌ ${description} failed: ${error.message}`, 'red');
    process.exit(1);
  }
}

function getCurrentVersion() {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  return packageJson.version;
}

function updatePackageVersion(newVersion) {
  const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf-8'));
  packageJson.version = newVersion;
  fs.writeFileSync('package.json', JSON.stringify(packageJson, null, 2) + '\n');
}

function generateChangelog(version, releaseNotes) {
  const changelogPath = 'CHANGELOG.md';
  const date = new Date().toISOString().split('T')[0];
  
  let changelog = '';
  if (fs.existsSync(changelogPath)) {
    changelog = fs.readFileSync(changelogPath, 'utf-8');
  } else {
    changelog = '# Changelog\n\nAll notable changes to this project will be documented in this file.\n\n';
  }
  
  const newEntry = `## [${version}] - ${date}\n\n${releaseNotes}\n\n`;
  
  // Insert new entry after the header
  const lines = changelog.split('\n');
  const insertIndex = lines.findIndex(line => line.startsWith('## [')) || 3;
  lines.splice(insertIndex, 0, ...newEntry.split('\n'));
  
  fs.writeFileSync(changelogPath, lines.join('\n'));
}

function getGitCommitsSinceLastTag() {
  try {
    const lastTag = exec('git describe --tags --abbrev=0', 'Getting last tag');
    const commits = exec(`git log ${lastTag}..HEAD --oneline`, 'Getting commits since last tag');
    return commits.split('\n').filter(line => line.trim());
  } catch (error) {
    // No previous tags, get all commits
    const commits = exec('git log --oneline', 'Getting all commits');
    return commits.split('\n').filter(line => line.trim()).slice(0, 10); // Limit to last 10
  }
}

function generateReleaseNotes(commits) {
  if (commits.length === 0) {
    return '### Changes\n\n- Initial release\n';
  }
  
  const features = [];
  const fixes = [];
  const other = [];
  
  commits.forEach(commit => {
    const message = commit.replace(/^[a-f0-9]+\s+/, ''); // Remove commit hash
    if (message.toLowerCase().includes('feat') || message.toLowerCase().includes('add')) {
      features.push(message);
    } else if (message.toLowerCase().includes('fix') || message.toLowerCase().includes('bug')) {
      fixes.push(message);
    } else {
      other.push(message);
    }
  });
  
  let notes = '';
  
  if (features.length > 0) {
    notes += '### 🚀 Features\n\n';
    features.forEach(feat => notes += `- ${feat}\n`);
    notes += '\n';
  }
  
  if (fixes.length > 0) {
    notes += '### 🐛 Bug Fixes\n\n';
    fixes.forEach(fix => notes += `- ${fix}\n`);
    notes += '\n';
  }
  
  if (other.length > 0) {
    notes += '### 📝 Other Changes\n\n';
    other.forEach(change => notes += `- ${change}\n`);
    notes += '\n';
  }
  
  return notes;
}

function validateBuild() {
  exec('npm run clean', 'Cleaning previous build');
  exec('npm run build', 'Building package');
  exec('npm run validate', 'Validating build');
  
  // Check that essential files exist
  const requiredFiles = [
    'dist/cjs/index.js',
    'dist/esm/index.js',
    'dist/types/index.d.ts'
  ];
  
  requiredFiles.forEach(file => {
    if (!fs.existsSync(file)) {
      log(`❌ Required file missing: ${file}`, 'red');
      process.exit(1);
    }
  });
  
  log('✅ All required build files present', 'green');
}

function main() {
  const args = process.argv.slice(2);
  
  if (args.length === 0) {
    log('Usage: node prepare-release.js <version-type>', 'yellow');
    log('Version types: patch, minor, major, or specific version (e.g., 1.2.3)', 'yellow');
    process.exit(1);
  }
  
  const versionType = args[0];
  const currentVersion = getCurrentVersion();
  
  log('🚀 AI Marketplace SDK Release Preparation', 'cyan');
  log('==========================================', 'cyan');
  log(`📦 Current version: ${currentVersion}`, 'blue');
  
  // Calculate new version
  let newVersion;
  if (['patch', 'minor', 'major'].includes(versionType)) {
    const parts = currentVersion.split('.').map(Number);
    switch (versionType) {
      case 'patch':
        parts[2]++;
        break;
      case 'minor':
        parts[1]++;
        parts[2] = 0;
        break;
      case 'major':
        parts[0]++;
        parts[1] = 0;
        parts[2] = 0;
        break;
    }
    newVersion = parts.join('.');
  } else if (/^\d+\.\d+\.\d+/.test(versionType)) {
    newVersion = versionType;
  } else {
    log(`❌ Invalid version type: ${versionType}`, 'red');
    process.exit(1);
  }
  
  log(`📈 New version: ${newVersion}`, 'green');
  
  // Get commits for release notes
  const commits = getGitCommitsSinceLastTag();
  const releaseNotes = generateReleaseNotes(commits);
  
  log('📝 Generated release notes:', 'blue');
  console.log(releaseNotes);
  
  // Update version
  updatePackageVersion(newVersion);
  log(`✅ Updated package.json to version ${newVersion}`, 'green');
  
  // Generate changelog
  generateChangelog(newVersion, releaseNotes);
  log('✅ Updated CHANGELOG.md', 'green');
  
  // Validate build
  validateBuild();
  
  // Create release notes file
  const releaseNotesFile = `RELEASE_NOTES_${newVersion}.md`;
  const fullReleaseNotes = `# Release Notes - v${newVersion}\n\n${releaseNotes}\n## Installation\n\n\`\`\`bash\nnpm install @ai-marketplace/sdk@${newVersion}\n\`\`\`\n\n## Documentation\n\nSee [README.md](./README.md) for usage instructions and examples.\n`;
  
  fs.writeFileSync(releaseNotesFile, fullReleaseNotes);
  log(`✅ Created ${releaseNotesFile}`, 'green');
  
  log('\n🎉 Release preparation complete!', 'green');
  log('\n📋 Next steps:', 'blue');
  log('1. Review the changes and release notes', 'yellow');
  log('2. Commit the version changes: git add . && git commit -m "chore: prepare release v' + newVersion + '"', 'yellow');
  log('3. Run the publish script: ./scripts/publish.sh none', 'yellow');
  log('4. Or manually publish: npm publish', 'yellow');
  log(`5. Create GitHub release with ${releaseNotesFile}`, 'yellow');
}

main();