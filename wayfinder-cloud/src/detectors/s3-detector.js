import {
  S3Client,
  GetBucketEncryptionCommand,
  GetPublicAccessBlockCommand,
  GetBucketVersioningCommand,
  ListBucketsCommand
} from '@aws-sdk/client-s3';
import Logger from '../utils/logger.js';
import Validators from '../utils/validators.js';

const logger = new Logger('S3Detector');

class S3Detector {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
  }

  /**
   * List all S3 buckets
   */
  async listBuckets() {
    try {
      const command = new ListBucketsCommand({});
      const response = await this.client.send(command);
      logger.debug('Listed S3 buckets', { count: response.Buckets?.length || 0 });
      return response.Buckets || [];
    } catch (error) {
      logger.error('Failed to list S3 buckets', { error: error.message });
      throw error;
    }
  }

  /**
   * Check S3 bucket encryption compliance
   */
  async checkEncryption(bucketName) {
    try {
      const command = new GetBucketEncryptionCommand({ Bucket: bucketName });
      const response = await this.client.send(command);
      
      const validation = Validators.validateS3Encryption(
        bucketName,
        response.ServerSideEncryptionConfiguration
      );

      logger.debug(`Encryption check for bucket: ${bucketName}`, validation);
      return validation;
    } catch (error) {
      if (error.name === 'ServerSideEncryptionConfigurationNotFoundError') {
        return {
          compliant: false,
          reason: 'No encryption configuration found',
          resource: bucketName
        };
      }
      logger.error(`Failed to check encryption for ${bucketName}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check S3 bucket public access settings
   */
  async checkPublicAccess(bucketName) {
    try {
      const command = new GetPublicAccessBlockCommand({ Bucket: bucketName });
      const response = await this.client.send(command);

      const validation = Validators.validateS3PublicAccess(
        bucketName,
        response.PublicAccessBlockConfiguration
      );

      logger.debug(`Public access check for bucket: ${bucketName}`, validation);
      return validation;
    } catch (error) {
      if (error.name === 'NoSuchPublicAccessBlockConfiguration') {
        return {
          compliant: false,
          reason: 'No public access block configuration found',
          resource: bucketName
        };
      }
      logger.error(`Failed to check public access for ${bucketName}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check S3 bucket versioning
   */
  async checkVersioning(bucketName) {
    try {
      const command = new GetBucketVersioningCommand({ Bucket: bucketName });
      const response = await this.client.send(command);

      const validation = Validators.validateS3Versioning(
        bucketName,
        response
      );

      logger.debug(`Versioning check for bucket: ${bucketName}`, validation);
      return validation;
    } catch (error) {
      logger.error(`Failed to check versioning for ${bucketName}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Scan all S3 buckets for compliance violations
   */
  async scanAllBuckets() {
    try {
      const buckets = await this.listBuckets();
      const violations = [];

      for (const bucket of buckets) {
        const bucketName = bucket.Name;
        logger.info(`Scanning S3 bucket: ${bucketName}`);

        try {
          // Check encryption
          const encryptionCheck = await this.checkEncryption(bucketName);
          if (!encryptionCheck.compliant) {
            violations.push({
              type: 'S3_ENCRYPTION_DISABLED',
              resource: bucketName,
              severity: 'HIGH',
              ...encryptionCheck
            });
          }

          // Check public access
          const publicAccessCheck = await this.checkPublicAccess(bucketName);
          if (!publicAccessCheck.compliant) {
            violations.push({
              type: 'S3_PUBLIC_ACCESS_ALLOWED',
              resource: bucketName,
              severity: 'CRITICAL',
              ...publicAccessCheck
            });
          }

          // Check versioning
          const versioningCheck = await this.checkVersioning(bucketName);
          if (!versioningCheck.compliant) {
            violations.push({
              type: 'S3_VERSIONING_DISABLED',
              resource: bucketName,
              severity: 'MEDIUM',
              ...versioningCheck
            });
          }
        } catch (error) {
          logger.warn(`Skipped bucket ${bucketName} due to error`, {
            error: error.message
          });
        }
      }

      logger.info('S3 scan complete', { violationsFound: violations.length });
      return violations;
    } catch (error) {
      logger.error('S3 scan failed', { error: error.message });
      throw error;
    }
  }
}

export default S3Detector;
