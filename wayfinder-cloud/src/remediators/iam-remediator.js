import {
  IAMClient,
  UpdateAccessKeyCommand,
  ListAccessKeysCommand
} from '@aws-sdk/client-iam';
import Logger from '../utils/logger.js';

const logger = new Logger('IAMRemediator');

class IAMRemediator {
  constructor() {
    this.client = new IAMClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.dryRun = process.env.DRY_RUN === 'true';
  }

  /**
   * Deactivate old access keys
   */
  async deactivateOldAccessKey(userName, accessKeyId) {
    try {
      if (this.dryRun) {
        logger.info(
          `[DRY RUN] Would deactivate access key ${accessKeyId} for user: ${userName}`
        );
        return { success: true, dryRun: true, userName, accessKeyId };
      }

      const command = new UpdateAccessKeyCommand({
        UserName: userName,
        AccessKeyId: accessKeyId,
        Status: 'Inactive'
      });

      await this.client.send(command);
      logger.info(`Access key ${accessKeyId} deactivated for user: ${userName}`);
      return {
        success: true,
        userName,
        accessKeyId,
        action: 'access_key_deactivated'
      };
    } catch (error) {
      logger.error(
        `Failed to deactivate access key for ${userName}:${accessKeyId}`,
        { error: error.message }
      );
      return {
        success: false,
        userName,
        accessKeyId,
        error: error.message
      };
    }
  }

  /**
   * Generate report about MFA requirements
   */
  async reportMFARequirement(userName) {
    logger.info(`MFA enablement required for user: ${userName}`);
    return {
      success: true,
      userName,
      action: 'mfa_enablement_required',
      note: 'User must enable MFA - cannot be automated',
      recommendation: `aws iam enable-mfa-device --user-name ${userName}`
    };
  }

  /**
   * Generate report about admin policy removal
   */
  async reportAdminPolicyRemoval(userName, policyName) {
    logger.info(
      `Admin policy removal required for user: ${userName} (${policyName})`
    );
    return {
      success: true,
      userName,
      action: 'admin_policy_removal_required',
      policyName,
      note: 'Manual review required before removing admin access',
      recommendation: `Review IAM policies for ${userName} and detach ${policyName} manually`
    };
  }

  /**
   * Remediate all violations for a user
   */
  async remediateUser(userName, violations) {
    logger.info(`Remediating IAM user: ${userName}`);
    const results = [];

    for (const violation of violations) {
      switch (violation.type) {
        case 'IAM_ACCESS_KEY_AGED':
          // Extract access key ID from resource
          const accessKeyId = violation.resource.split(':')[1];
          results.push(
            await this.deactivateOldAccessKey(userName, accessKeyId)
          );
          break;

        case 'IAM_MFA_NOT_ENABLED':
          results.push(await this.reportMFARequirement(userName));
          break;

        case 'IAM_ADMIN_POLICY':
          const policyName = violation.resource.split(':')[1];
          results.push(
            await this.reportAdminPolicyRemoval(userName, policyName)
          );
          break;

        default:
          logger.warn(`Unknown violation type: ${violation.type}`);
      }
    }

    return results;
  }

  /**
   * Get aged access keys for review
   */
  async getAgedAccessKeys(userName, maxAgeDays) {
    try {
      const command = new ListAccessKeysCommand({ UserName: userName });
      const response = await this.client.send(command);

      const agedKeys = [];
      for (const accessKey of response.AccessKeyMetadata || []) {
        const ageInDays = Math.floor(
          (Date.now() - accessKey.CreateDate.getTime()) / (1000 * 60 * 60 * 24)
        );
        if (ageInDays > maxAgeDays) {
          agedKeys.push({
            accessKeyId: accessKey.AccessKeyId,
            ageInDays,
            createDate: accessKey.CreateDate,
            status: accessKey.Status
          });
        }
      }

      logger.debug(`Found ${agedKeys.length} aged access keys for ${userName}`);
      return agedKeys;
    } catch (error) {
      logger.error(`Failed to get access keys for ${userName}`, {
        error: error.message
      });
      return [];
    }
  }
}

export default IAMRemediator;
