import {
  RDSClient,
  DescribeDBInstancesCommand
} from '@aws-sdk/client-rds';
import Logger from '../utils/logger.js';
import Validators from '../utils/validators.js';

const logger = new Logger('RDSDetector');

class RDSDetector {
  constructor() {
    this.client = new RDSClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.minBackupRetention = parseInt(process.env.RDS_BACKUP_RETENTION || '7');
  }

  /**
   * List all RDS DB instances
   */
  async listDBInstances() {
    try {
      const command = new DescribeDBInstancesCommand({});
      const response = await this.client.send(command);
      logger.debug('Listed RDS instances', {
        count: response.DBInstances?.length || 0
      });
      return response.DBInstances || [];
    } catch (error) {
      logger.error('Failed to list RDS instances', { error: error.message });
      throw error;
    }
  }

  /**
   * Check RDS encryption compliance
   */
  checkEncryption(dbInstance) {
    const validation = Validators.validateRDSEncryption(
      dbInstance.DBInstanceIdentifier,
      dbInstance.StorageEncrypted
    );

    logger.debug(`Encryption check for ${dbInstance.DBInstanceIdentifier}`, validation);
    return validation;
  }

  /**
   * Check RDS backup retention compliance
   */
  checkBackupRetention(dbInstance) {
    const validation = Validators.validateRDSBackupRetention(
      dbInstance.DBInstanceIdentifier,
      dbInstance.BackupRetentionPeriod,
      this.minBackupRetention
    );

    logger.debug(`Backup retention check for ${dbInstance.DBInstanceIdentifier}`, validation);
    return validation;
  }

  /**
   * Check if RDS has automated backups enabled
   */
  checkAutomatedBackups(dbInstance) {
    const hasBackups = (dbInstance.BackupRetentionPeriod || 0) > 0;

    return {
      compliant: hasBackups,
      reason: hasBackups ? 'Automated backups enabled' : 'Automated backups disabled',
      resource: dbInstance.DBInstanceIdentifier
    };
  }

  /**
   * Scan all RDS instances for compliance violations
   */
  async scanAllInstances() {
    try {
      const instances = await this.listDBInstances();
      const violations = [];

      for (const dbInstance of instances) {
        const instanceId = dbInstance.DBInstanceIdentifier;
        logger.info(`Scanning RDS instance: ${instanceId}`);

        // Check encryption
        const encryptionCheck = this.checkEncryption(dbInstance);
        if (!encryptionCheck.compliant) {
          violations.push({
            type: 'RDS_ENCRYPTION_DISABLED',
            resource: instanceId,
            severity: 'HIGH',
            ...encryptionCheck
          });
        }

        // Check automated backups
        const backupCheck = this.checkAutomatedBackups(dbInstance);
        if (!backupCheck.compliant) {
          violations.push({
            type: 'RDS_BACKUPS_DISABLED',
            resource: instanceId,
            severity: 'CRITICAL',
            ...backupCheck
          });
        }

        // Check backup retention period
        const retentionCheck = this.checkBackupRetention(dbInstance);
        if (!retentionCheck.compliant) {
          violations.push({
            type: 'RDS_BACKUP_RETENTION_LOW',
            resource: instanceId,
            severity: 'MEDIUM',
            ...retentionCheck
          });
        }

        // Check if Multi-AZ is enabled (for availability)
        if (!dbInstance.MultiAZ) {
          violations.push({
            type: 'RDS_MULTI_AZ_DISABLED',
            resource: instanceId,
            severity: 'MEDIUM',
            reason: 'Multi-AZ deployment not enabled',
            compliant: false
          });
        }
      }

      logger.info('RDS scan complete', { violationsFound: violations.length });
      return violations;
    } catch (error) {
      logger.error('RDS scan failed', { error: error.message });
      throw error;
    }
  }
}

export default RDSDetector;
