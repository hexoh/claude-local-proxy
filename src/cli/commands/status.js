import fs from 'fs';
import { getLogger } from '../../logger/index.js';
import { readConfigFile, getConfigPath } from '../../config/index.js';
import { isServiceRunning, getPid, APP_DIR, PID_FILE } from '../common.js';

export async function statusCommand() {
  const logger = getLogger();

  try {
    console.log('=== Claude Local Proxy Status ===');
    console.log('');

    if (isServiceRunning()) {
      const pid = getPid();
      console.log('Service Status: Running');
      console.log(`Process ID: ${pid}`);

      try {
        const stats = fs.statSync(PID_FILE);
        const uptime = Math.floor((Date.now() - stats.mtimeMs) / 1000);
        const hours = Math.floor(uptime / 3600);
        const minutes = Math.floor((uptime % 3600) / 60);
        const seconds = uptime % 60;
        console.log(`Uptime: ${hours}h ${minutes}m ${seconds}s`);
      } catch (e) {
      }
    } else {
      console.log('Service Status: Not running');
      if (fs.existsSync(PID_FILE)) {
        console.log('Note: PID file exists but process is not running');
      }
    }

    console.log('');

    if (fs.existsSync(getConfigPath())) {
      const config = readConfigFile();
      console.log('Configuration:');
      console.log(`  Config File: ${getConfigPath()}`);
      console.log(`  PROXY_URL: ${config.PROXY_URL}`);
      console.log(`  API_BASE_URL: ${config.API_BASE_URL}`);
      console.log(`  Auth Status: ${config.API_KEY ? 'Enabled' : 'Disabled'}`);
      console.log(`  TIMEOUT: ${config.TIMEOUT}ms`);
    } else {
      console.log('Configuration Status: Not configured');
      console.log('Please run: clp config');
    }

    console.log('');
    console.log(`Log Directory: ${APP_DIR}/logs`);

  } catch (err) {
    logger.logError(`Failed to get status: ${err.message}`);
    process.exit(1);
  }
}