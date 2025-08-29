#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);

// Separate pass-through args after "--"
const ddIndex = argv.indexOf('--');
const cliArgs = ddIndex === -1 ? argv : argv.slice(0, ddIndex);
const passthroughArgs = ddIndex === -1 ? [] : argv.slice(ddIndex + 1);

// Determine package.json locations: CLI's own and the current working directory
const cliPkgJsonPath = path.resolve(__dirname, '..', 'package.json');
const cwdPkgJsonPath = path.resolve(process.cwd(), 'package.json');

function readPackageJson(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(content);
  } catch (_err) {
    return {};
  }
}

const cliPkg = readPackageJson(cliPkgJsonPath);
const targetPkg = readPackageJson(cwdPkgJsonPath);
const packageScripts = (targetPkg && targetPkg.scripts) || {};
const version = (cliPkg && cliPkg.version) || (targetPkg && targetPkg.version) || '0.0.0';

const commands = {
  start: () => runNpmScript('start'),
  dev: () => runNpmScript('dev'),
  build: () => runNpmScript('build'),
  'build:win': () => runNpmScript('build-win'),
  'build:mac': () => runNpmScript('build-mac'),
  'build:linux': () => runNpmScript('build-linux'),
  list: () => listScripts(),
  init: () => initProject(),
  run: () => {
    const scriptName = cliArgs[1];
    if (!scriptName) {
      console.error('Missing script name. Usage: zide run <script-name> [-- <args>]');
      process.exit(1);
    }
    runNpmScript(scriptName);
  },
};

function runNpmScript(scriptName) {
  const isWindows = process.platform === 'win32';
  const command = isWindows ? 'cmd.exe' : 'npm';
  const baseArgs = isWindows ? ['/c', 'npm', 'run', scriptName] : ['run', scriptName];
  const hasPassArgs = passthroughArgs.length > 0;
  const finalArgs = hasPassArgs ? baseArgs.concat(['--', ...passthroughArgs]) : baseArgs;

  const child = spawn(command, finalArgs, {
    stdio: 'inherit',
    cwd: process.cwd(),
    shell: false,
  });

  child.on('error', (err) => {
    console.error('Failed to start process:', err);
    process.exit(1);
  });

  child.on('exit', (code) => process.exit(code));
}

function printHelp() {
  console.log(`
zide - Zide Store CLI v${version}

Usage:
  zide start              Run the app
  zide dev                Run in dev mode
  zide build              Build distributables
  zide build:win          Build Windows distributable
  zide build:mac          Build macOS distributable
  zide build:linux        Build Linux distributable
  zide list               List available npm scripts
  zide init               Initialize/augment package.json with Electron scripts
  zide run <script>       Run any npm script

Options:
  -h, --help              Show help
  -v, --version           Show version

You can pass arguments to underlying npm scripts using "--". Example:
  zide build -- --win portable
`);
}

function listScripts() {
  const names = Object.keys(packageScripts);
  if (names.length === 0) {
    console.log('No npm scripts found in package.json');
    return;
  }
  console.log('Available npm scripts:');
  for (const name of names) {
    console.log(`  ${name}`);
  }
}

function suggestClosest(input, candidates, maxSuggestions = 3) {
  const scored = candidates
    .map((c) => ({ name: c, score: levenshteinDistance(input, c) }))
    .sort((a, b) => a.score - b.score)
    .slice(0, maxSuggestions)
    .filter((s) => s.score <= Math.max(2, Math.floor(input.length / 2)));
  return scored.map((s) => s.name);
}

function levenshteinDistance(a, b) {
  const m = a.length;
  const n = b.length;
  if (m === 0) return n;
  if (n === 0) return m;
  const dp = new Array(n + 1);
  for (let j = 0; j <= n; j++) dp[j] = j;
  for (let i = 1; i <= m; i++) {
    let prev = i - 1;
    dp[0] = i;
    for (let j = 1; j <= n; j++) {
      const temp = dp[j];
      if (a[i - 1] === b[j - 1]) {
        dp[j] = prev;
      } else {
        dp[j] = Math.min(prev + 1, dp[j] + 1, dp[j - 1] + 1);
      }
      prev = temp;
    }
  }
  return dp[n];
}

function initProject() {
  const pkgPath = cwdPkgJsonPath;
  const exists = fs.existsSync(pkgPath);
  const cwdName = path.basename(process.cwd()) || 'zide-app';
  const wantInstall = cliArgs.includes('--install') || cliArgs.includes('-i');

  let pkg = exists ? readPackageJson(pkgPath) : {};
  if (!exists) {
    pkg.name = pkg.name || cwdName.toLowerCase().replace(/\s+/g, '-');
    pkg.private = pkg.private !== undefined ? pkg.private : true;
    pkg.version = pkg.version || '0.1.0';
  }

  pkg.scripts = pkg.scripts || {};
  if (!pkg.scripts.start) pkg.scripts.start = 'electron .';
  if (!pkg.scripts.dev) pkg.scripts.dev = 'electron . --dev';
  if (!pkg.scripts.build) pkg.scripts.build = 'electron-builder';
  if (!pkg.scripts['build-win']) pkg.scripts['build-win'] = 'electron-builder --win';
  if (!pkg.scripts['build-mac']) pkg.scripts['build-mac'] = 'electron-builder --mac';
  if (!pkg.scripts['build-linux']) pkg.scripts['build-linux'] = 'electron-builder --linux';

  // Ensure devDependencies object exists
  pkg.devDependencies = pkg.devDependencies || {};

  fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log(`${exists ? 'Updated' : 'Created'} ${pkgPath}`);

  if (wantInstall) {
    const toInstall = [];
    if (!pkg.devDependencies.electron) toInstall.push('electron');
    if (!pkg.devDependencies['electron-builder']) toInstall.push('electron-builder');
    if (toInstall.length > 0) {
      const isWindows = process.platform === 'win32';
      const command = isWindows ? 'cmd.exe' : 'npm';
      const args = isWindows
        ? ['/c', 'npm', 'install', '-D', ...toInstall]
        : ['install', '-D', ...toInstall];
      console.log(`Installing devDependencies: ${toInstall.join(', ')}`);
      const child = spawn(command, args, { stdio: 'inherit', cwd: process.cwd(), shell: false });
      child.on('error', (err) => {
        console.error('Failed to install devDependencies:', err);
        process.exit(1);
      });
      child.on('exit', (code) => process.exit(code));
    } else {
      console.log('All required devDependencies already present.');
    }
  }
}

const cmd = cliArgs[0];

if (!cmd || cmd === '-h' || cmd === '--help') {
  printHelp();
  process.exit(0);
}

if (cmd === '-v' || cmd === '--version') {
  console.log(version);
  process.exit(0);
}

if (commands[cmd]) {
  commands[cmd]();
} else if (packageScripts[cmd]) {
  // Fallback: if command matches an npm script, run it
  runNpmScript(cmd);
} else {
  console.error(`Unknown command: ${cmd}`);
  const known = [
    'start',
    'dev',
    'build',
    'build:win',
    'build:mac',
    'build:linux',
    'list',
    'run',
    ...Object.keys(packageScripts),
  ];
  const suggestions = suggestClosest(cmd, known);
  if (suggestions.length > 0) {
    console.error(`Did you mean: ${suggestions.join(', ')}?`);
  }
  console.error('Use "zide --help" to see available commands.');
  process.exit(1);
}


