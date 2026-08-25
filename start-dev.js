const { spawn } = require('child_process');
const http = require('http');
const path = require('path');

console.log('===================================================');
console.log('🚀 Starting IndiaDits Full-Stack Platform Service...');
console.log('  ➜ Backend API Server:  http://localhost:5000');
console.log('  ➜ Swagger API Docs:    http://localhost:5000/api-docs');
console.log('  ➜ Frontend Next.js UI: http://localhost:3000');
console.log('===================================================\n');

const isWin = process.platform === 'win32';
const npmCmd = isWin ? 'npm.cmd' : 'npm';

function checkService(port, pathStr, callback) {
  const req = http.get(`http://localhost:${port}${pathStr}`, () => callback(true));
  req.on('error', () => callback(false));
  req.setTimeout(1200, () => {
    req.destroy();
    callback(false);
  });
}

checkService(5000, '/api/v1/properties?limit=1', (backendAlive) => {
  checkService(3000, '/', (frontendAlive) => {
    let backendProc = null;
    let frontendProc = null;

    if (backendAlive) {
      console.log('✅ Backend API server is ALREADY running on http://localhost:5000');
    } else {
      console.log('📡 Starting Backend API Server on http://localhost:5000...');
      backendProc = spawn(npmCmd, ['run', 'dev'], {
        cwd: path.join(__dirname, 'backend'),
        stdio: 'inherit',
        shell: true
      });
    }

    if (frontendAlive) {
      console.log('✅ Frontend Next.js server is ALREADY running on http://localhost:3000');
    } else {
      console.log('💻 Starting Frontend Next.js Server on http://localhost:3000...');
      frontendProc = spawn(npmCmd, ['run', 'next-dev'], {
        cwd: path.join(__dirname, 'frontend'),
        stdio: 'inherit',
        shell: true
      });
    }

    const cleanup = () => {
      console.log('\nStopping IndiaDits services...');
      if (backendProc) backendProc.kill();
      if (frontendProc) frontendProc.kill();
      process.exit();
    };

    process.on('SIGINT', cleanup);
    process.on('SIGTERM', cleanup);
  });
});
