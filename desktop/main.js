// Vibe Leverage desktop shell.
// Adapted from beeper.chat/desktop's proven Windows pattern: spawn the local
// server, wait for it to answer, open a window to it. Here the "server" is
// Next.js dev itself, run as a child process, not a bundled server.mjs, so
// this is a dev-mode shell for now. Real packaging (next build + next start,
// or an actual production bundle) is future work, not claimed here.
//
// Lands on /vibe/code by default: that's the actual work surface. The
// public diagnosis page is still one click away via the nav.

const { app, BrowserWindow } = require('electron');
const path = require('node:path');
const http = require('node:http');
const { spawn } = require('node:child_process');

const PORT = process.env.PORT || 3000;
const APP_ROOT = path.join(__dirname, '..');
let nextProcess = null;

function startNext() {
  // shell: true because Windows needs PATH resolution for the npm shim,
  // same fix as the Vibe agent job engines.
  nextProcess = spawn('npm', ['run', 'dev'], {
    cwd: APP_ROOT,
    shell: true,
    env: { ...process.env, PORT: String(PORT) },
  });
  nextProcess.stdout.on('data', (d) => process.stdout.write(`[next] ${d}`));
  nextProcess.stderr.on('data', (d) => process.stderr.write(`[next] ${d}`));
}

function waitForServer(cb, tries = 0) {
  http
    .get(`http://localhost:${PORT}/`, (r) => {
      r.destroy();
      cb();
    })
    .on('error', () => {
      if (tries > 150) return cb(); // ~60s, first Next.js compile can be slow
      setTimeout(() => waitForServer(cb, tries + 1), 400);
    });
}

function createWindow() {
  const win = new BrowserWindow({
    width: 1100,
    height: 820,
    title: 'Vibe Leverage',
    autoHideMenuBar: true,
    backgroundColor: '#0b0a08',
    show: false,
  });
  win.maximize();
  win.show();
  win.loadURL(`http://localhost:${PORT}/vibe/code`);
}

app.whenReady().then(() => {
  startNext();
  waitForServer(createWindow);
  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', () => {
  if (nextProcess) nextProcess.kill();
  if (process.platform !== 'darwin') app.quit();
});

app.on('before-quit', () => {
  if (nextProcess) nextProcess.kill();
});
