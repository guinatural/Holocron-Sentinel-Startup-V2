import {
  RDSClient,
  ModifyDBInstanceCommand
} from '@aws-sdk/client-rds';
import Logger from '../utils/logger.js';

const logger = new Logger('RDSRemediator');

class RDSRemediator {
  constructor() {
    this.client = new RDSClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.dryRun = process.env.DRY_RUN === 'true';
    this.minBackupRetention = parseInt(process.env.RDS_BACKUP_RETENTION || '7');
  }

  /**
   * Enable encryption for RDS instance
   */
  async enableEncryption(dbInstanceId) {
    try {
      if (this.dryRun) {
        logger.info(`[DRY RUN] Would enable encryption for DB: ${dbInstanceId}`);
        return { success: true, dryRun: true, dbInstanceId };
      }

      // Note: Cannot enable encryption on running instance, requires snapshot
      logger.warn(`Encryption requires RDS instance recreation or snapshot restore: ${dbInstanceId}`);
      return {
        success: false,
        dbInstanceId,
        error: 'Encryption requires manual intervention or snapshot restore'
      };
    } catch (error) {
      logger.error(`Failed to enable encryption for ${dbInstanceId}`, {
        error: error.message
      });
      return { success: false, dbInstanceId, error: error.message };
    }
  }

  /**
   * Enable automated backups for RDS instance
   */
  async enableBackups(dbInstanceId) {
    try {
      if (this.dryRun) {
        logger.info(
          `[DRY RUN] Would enable backups for DB: ${dbInstanceId} with ${this.minBackupRetention} day retention`
        );
        return { success: true, dryRun: true, dbInstanceId };
      }

      const command = new ModifyDBInstanceCommand({
        DBInstanceIdentifier: dbInstanceId,
        BackupRetentionPeriod: this.minBackupRetention,
        ApplyImmediately: true
      });

      await this.client.send(command);
      logger.info(
        `Backups enabled for DB: ${dbInstanceId} with ${this.minBackupRetention} day retention`
      );
      return {
        success: true,
        dbInstanceId,
        action: 'backups_enabled',
        retentionDays: this.minBackupRetention
      };
    } catch (error) {
      logger.error(`Failed to enable backups for ${dbInstanceId}`, {
        error: error.message
      });
      return { success: false, dbInstanceId, error: error.message };
    }
  }

  /**
   * Enable Multi-AZ deployment
   */
  async enableMultiAZ(dbInstanceId) {
    try {
      if (this.dryRun) {
        logger.info(`[DRY RUN] Would enable Multi-AZ for DB: ${dbInstanceId}`);
        return { success: true, dryRun: true, dbInstanceId };
      }

      const command = new ModifyDBInstanceCommand({
        DBInstanceIdentifier: dbInstanceId,
        MultiAZ: true,
        ApplyImmediately: false // Failover takes time, schedule for maintenance window
      });

      await this.client.send(command);
      logger.info(`Multi-AZ enabled for DB: ${dbInstanceId}`);
      return {
        success: true,
        dbInstanceId,
        action: 'multi_az_enabled',
        note: 'Change will be applied during next maintenance window'
      };
    } catch (error) {
      logger.error(`Failed to enable Multi-AZ for ${dbInstanceId}`, {
        error: error.message
      });
      return { success: false, dbInstanceId, error: error.message };
    }
  }

  /**
   * Remediate all violations for a DB instance
   */
  async remediateInstance(dbInstanceId, violations) {
    logger.info(`Remediating RDS instance: ${dbInstanceId}`);
    const results = [];

    for (const violation of violations) {
      switch (violation.type) {
        case 'RDS_ENCRYPTION_DISABLED':
          results.push(await this.enableEncryption(dbInstanceId));
          break;
        case 'RDS_BACKUPS_DISABLED':
        case 'RDS_BACKUP_RETENTION_LOW':
          results.push(await this.enableBackups(dbInstanceId));
          break;
        case 'RDS_MULTI_AZ_DISABLED':
          results.push(await this.enableMultiAZ(dbInstanceId));
          break;
        default:
          logger.warn(`Unknown violation type: ${violation.type}`);
      }
    }

    return results;
  }
}

export default RDSRemediator;
