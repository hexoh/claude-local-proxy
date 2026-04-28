import fs from 'fs';
import path from 'path';
import os from 'os';

export const APP_DIR = path.join(os.homedir(), '.claude-local-proxy');
export const PID_FILE = path.join(APP_DIR, 'proxy.pid');
export const LOG_DIR = path.join(APP_DIR, 'logs');

export const CLAUDE_DIR = path.join(os.homedir(), '.claude');
export const CLAUDE_SETTINGS_FILE = path.join(CLAUDE_DIR, 'settings.json');
export const CLAUDE_BACKUP_FILE = path.join(CLAUDE_DIR, 'settings.json.claude-local-proxy.bak');

export function getPid() {
  if (!fs.existsSync(PID_FILE)) return null;
  const pid = parseInt(fs.readFileSync(PID_FILE, 'utf-8'));
  return isNaN(pid) ? null : pid;
}

export function isServiceRunning() {
  const pid = getPid();
  if (!pid) return false;
  try {
    process.kill(pid, 0);
    return true;
  } catch (e) {
    return false;
  }
}

export function ensureAppDir() {
  if (!fs.existsSync(APP_DIR)) {
    fs.mkdirSync(APP_DIR, { recursive: true });
  }
}

export function deletePidFile() {
  if (fs.existsSync(PID_FILE)) {
    fs.unlinkSync(PID_FILE);
  }
}

export function waitForProcessToStop(pid, maxAttempts = 10, intervalMs = 500) {
  return new Promise((resolve) => {
    const checkStopped = () => {
      try {
        process.kill(pid, 0);
        return false;
      } catch (e) {
        return true;
      }
    };

    let attempts = 0;
    const check = setInterval(() => {
      attempts++;
      if (checkStopped() || attempts >= maxAttempts) {
        clearInterval(check);
        resolve(checkStopped());
      }
    }, intervalMs);
  });
}