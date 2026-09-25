import {
  S3Client,
  PutBucketEncryptionCommand,
  PutPublicAccessBlockCommand,
  PutBucketVersioningCommand
} from '@aws-sdk/client-s3';
import Logger from '../utils/logger.js';

const logger = new Logger('S3Remediator');

class S3Remediator {
  constructor() {
    this.client = new S3Client({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.dryRun = process.env.DRY_RUN === 'true';
  }

  /**
   * Enable encryption on S3 bucket
   */
  async enableEncryption(bucketName) {
    try {
      if (this.dryRun) {
        logger.info(`[DRY RUN] Would enable encryption on bucket: ${bucketName}`);
        return { success: true, dryRun: true, bucketName };
      }

      const command = new PutBucketEncryptionCommand({
        Bucket: bucketName,
        ServerSideEncryptionConfiguration: {
          Rules: [
            {
              ApplyServerSideEncryptionByDefault: {
                SSEAlgorithm: 'AES256'
              }
            }
          ]
        }
      });

      await this.client.send(command);
      logger.info(`Encryption enabled for bucket: ${bucketName}`);
      return { success: true, bucketName, action: 'encryption_enabled' };
    } catch (error) {
      logger.error(`Failed to enable encryption for ${bucketName}`, {
        error: error.message
      });
      return { success: false, bucketName, error: error.message };
    }
  }

  /**
   * Block all public access to S3 bucket
   */
  async blockPublicAccess(bucketName) {
    try {
      if (this.dryRun) {
        logger.info(`[DRY RUN] Would block public access for bucket: ${bucketName}`);
        return { success: true, dryRun: true, bucketName };
      }

      const command = new PutPublicAccessBlockCommand({
        Bucket: bucketName,
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true
        }
      });

      await this.client.send(command);
      logger.info(`Public access blocked for bucket: ${bucketName}`);
      return { success: true, bucketName, action: 'public_access_blocked' };
    } catch (error) {
      logger.error(`Failed to block public access for ${bucketName}`, {
        error: error.message
      });
      return { success: false, bucketName, error: error.message };
    }
  }

  /**
   * Enable versioning on S3 bucket
   */
  async enableVersioning(bucketName) {
    try {
      if (this.dryRun) {
        logger.info(`[DRY RUN] Would enable versioning for bucket: ${bucketName}`);
        return { success: true, dryRun: true, bucketName };
      }

      const command = new PutBucketVersioningCommand({
        Bucket: bucketName,
        VersioningConfiguration: {
          Status: 'Enabled'
        }
      });

      await this.client.send(command);
      logger.info(`Versioning enabled for bucket: ${bucketName}`);
      return { success: true, bucketName, action: 'versioning_enabled' };
    } catch (error) {
      logger.error(`Failed to enable versioning for ${bucketName}`, {
        error: error.message
      });
      return { success: false, bucketName, error: error.message };
    }
  }

  /**
   * Remediate all violations for a bucket
   */
  async remediateBucket(bucketName, violations) {
    logger.info(`Remediating bucket: ${bucketName}`);
    const results = [];

    for (const violation of violations) {
      switch (violation.type) {
        case 'S3_ENCRYPTION_DISABLED':
          results.push(await this.enableEncryption(bucketName));
          break;
        case 'S3_PUBLIC_ACCESS_ALLOWED':
          results.push(await this.blockPublicAccess(bucketName));
          break;
        case 'S3_VERSIONING_DISABLED':
          results.push(await this.enableVersioning(bucketName));
          break;
        default:
          logger.warn(`Unknown violation type: ${violation.type}`);
      }
    }

    return results;
  }
}

export default S3Remediator;
