import fs from 'fs';
import { getLogger } from '../../logger/index.js';
import { 
  isServiceRunning, 
  deletePidFile, 
  CLAUDE_SETTINGS_FILE, 
  CLAUDE_BACKUP_FILE,
  waitForProcessToStop,
  getPid
} from '../common.js';

export async function stopCommand() {
  const logger = getLogger();

  try {
    if (!isServiceRunning()) {
      logger.logError('Service is not running');
      process.exit(1);
    }

    const pid = getPid();
    if (!pid) {
      logger.logError('Service is not running');
      deletePidFile();
      process.exit(1);
    }

    process.kill(pid, 'SIGTERM');

    const stopped = await waitForProcessToStop(pid);

    if (stopped) {
      deletePidFile();
      
      if (fs.existsSync(CLAUDE_BACKUP_FILE)) {
        fs.copyFileSync(CLAUDE_BACKUP_FILE, CLAUDE_SETTINGS_FILE);
        fs.unlinkSync(CLAUDE_BACKUP_FILE);
        logger.logInfo('Original Claude settings restored');
      }
      
      logger.logInfo('Service stopped');
      process.exit(0);
    }

    logger.logError('Timeout stopping service, attempting force kill');
    process.kill(pid, 'SIGKILL');
    deletePidFile();
    
    if (fs.existsSync(CLAUDE_BACKUP_FILE)) {
      fs.copyFileSync(CLAUDE_BACKUP_FILE, CLAUDE_SETTINGS_FILE);
      fs.unlinkSync(CLAUDE_BACKUP_FILE);
      logger.logInfo('Original Claude settings restored');
    }
    
    logger.logInfo('Service force stopped');
    process.exit(0);

  } catch (err) {
    logger.logError(`Failed to stop service: ${err.message}`);
    process.exit(1);
  }
}