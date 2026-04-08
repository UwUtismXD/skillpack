#!/usr/bin/env node

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const MANIFEST = path.join(__dirname, '..', 'skills.json');
const DEFAULT_DIR = path.join(process.cwd(), 'skills');

function usage() {
  console.log(`Usage: node install.js [options] [skill names...]

Install skills from the skillpack registry.

Options:
  --all          Install all skills
  --dir <path>   Install directory (default: ./skills)
  --list         List available skills
  --update       Pull latest for already-installed skills
  -h, --help     Show this help

Examples:
  node install.js --all
  node install.js --all --dir /opt/agent/skills
  node install.js canvas shuffle redline
  node install.js --update
  node install.js --list`);
}

function loadManifest() {
  return JSON.parse(fs.readFileSync(MANIFEST, 'utf8'));
}

function list(manifest) {
  console.log('\nAvailable skills:\n');
  for (const skill of manifest.skills) {
    const env = skill.env.length ? ` [env: ${skill.env.join(', ')}]` : '';
    const req = skill.requires.length ? ` (requires: ${skill.requires.join(', ')})` : '';
    console.log(`  ${skill.name.padEnd(12)} ${skill.description}${req}${env}`);
  }
  console.log('');
}

function install(skill, targetDir) {
  const dest = path.join(targetDir, skill.name);

  if (fs.existsSync(dest)) {
    console.log(`  [skip] ${skill.name} — already installed`);
    return;
  }

  console.log(`  [clone] ${skill.name} ...`);
  execSync(`git clone --depth 1 ${skill.repo} "${dest}"`, { stdio: 'pipe' });

  // install npm deps if package.json exists
  const pkg = path.join(dest, 'package.json');
  if (fs.existsSync(pkg)) {
    console.log(`  [npm] ${skill.name} — installing dependencies ...`);
    execSync('npm install --production', { cwd: dest, stdio: 'pipe' });
  }

  console.log(`  [done] ${skill.name}`);
}

function update(targetDir) {
  if (!fs.existsSync(targetDir)) {
    console.log('Nothing installed yet.');
    return;
  }

  const dirs = fs.readdirSync(targetDir, { withFileTypes: true })
    .filter(d => d.isDirectory() && fs.existsSync(path.join(targetDir, d.name, '.git')));

  if (dirs.length === 0) {
    console.log('No installed skills found.');
    return;
  }

  for (const dir of dirs) {
    const dest = path.join(targetDir, dir.name);
    console.log(`  [pull] ${dir.name} ...`);
    try {
      execSync('git pull --ff-only', { cwd: dest, stdio: 'pipe' });
      console.log(`  [done] ${dir.name}`);
    } catch {
      console.log(`  [warn] ${dir.name} — pull failed, may have local changes`);
    }
  }
}

// --- main ---
const args = process.argv.slice(2);

if (args.length === 0 || args.includes('-h') || args.includes('--help')) {
  usage();
  process.exit(0);
}

const manifest = loadManifest();

if (args.includes('--list')) {
  list(manifest);
  process.exit(0);
}

let targetDir = DEFAULT_DIR;
const dirIdx = args.indexOf('--dir');
if (dirIdx !== -1 && args[dirIdx + 1]) {
  targetDir = path.resolve(args[dirIdx + 1]);
}

if (args.includes('--update')) {
  console.log(`\nUpdating skills in ${targetDir} ...\n`);
  update(targetDir);
  console.log('\nDone.\n');
  process.exit(0);
}

if (!fs.existsSync(targetDir)) {
  fs.mkdirSync(targetDir, { recursive: true });
}

const installAll = args.includes('--all');
const named = args.filter(a => !a.startsWith('--') && (dirIdx === -1 || args.indexOf(a) !== dirIdx + 1));

const toInstall = installAll
  ? manifest.skills
  : manifest.skills.filter(s => named.includes(s.name));

if (toInstall.length === 0) {
  console.log('No matching skills found. Use --list to see available skills.');
  process.exit(1);
}

console.log(`\nInstalling ${toInstall.length} skill(s) to ${targetDir} ...\n`);

for (const skill of toInstall) {
  install(skill, targetDir);
}

console.log('\nDone.\n');

// Print env var reminders
const envVars = toInstall.flatMap(s => s.env);
if (envVars.length > 0) {
  console.log('Some skills need environment variables configured:');
  for (const skill of toInstall) {
    if (skill.env.length > 0) {
      console.log(`  ${skill.name}: ${skill.env.join(', ')}`);
    }
  }
  console.log('');
}
