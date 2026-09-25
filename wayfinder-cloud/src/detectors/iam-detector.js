import {
  IAMClient,
  ListUsersCommand,
  ListMFADevicesCommand,
  ListAccessKeysCommand,
  ListAttachedUserPoliciesCommand,
  GetUserPolicyCommand
} from '@aws-sdk/client-iam';
import Logger from '../utils/logger.js';
import Validators from '../utils/validators.js';

const logger = new Logger('IAMDetector');

class IAMDetector {
  constructor() {
    this.client = new IAMClient({
      region: process.env.AWS_REGION || 'us-east-1'
    });
    this.maxAccessKeyAgeDays = parseInt(process.env.IAM_MAX_ACCESS_KEY_AGE || '90');
  }

  /**
   * List all IAM users
   */
  async listUsers() {
    try {
      const command = new ListUsersCommand({});
      const response = await this.client.send(command);
      logger.debug('Listed IAM users', { count: response.Users?.length || 0 });
      return response.Users || [];
    } catch (error) {
      logger.error('Failed to list IAM users', { error: error.message });
      throw error;
    }
  }

  /**
   * Check if user has MFA enabled
   */
  async checkMFAEnabled(userName) {
    try {
      const command = new ListMFADevicesCommand({ UserName: userName });
      const response = await this.client.send(command);

      const validation = Validators.validateIAMUserMFA(
        userName,
        response.MFADevices
      );

      logger.debug(`MFA check for user ${userName}`, validation);
      return validation;
    } catch (error) {
      logger.error(`Failed to check MFA for ${userName}`, {
        error: error.message
      });
      throw error;
    }
  }

  /**
   * Check access key age
   */
  async checkAccessKeyAge(userName) {
    try {
      const command = new ListAccessKeysCommand({ UserName: userName });
      const response = await this.client.send(command);
      const violations = [];

      for (const accessKey of response.AccessKeyMetadata || []) {
        const validation = Validators.validateAccessKeyAge(
          userName,
          accessKey.CreateDate,
          this.maxAccessKeyAgeDays
        );

        if (!validation.compliant) {
          violations.push({
            type: 'IAM_ACCESS_KEY_AGED',
            resource: `${userName}:${accessKey.AccessKeyId}`,
            severity: 'MEDIUM',
            ...validation
          });
        }
      }

      logger.debug(`Access key age check for ${userName}`, {
        keysChecked: response.AccessKeyMetadata?.length || 0,
        violationsFound: violations.length
      });

      return violations;
    } catch (error) {
      logger.warn(`Failed to check access keys for ${userName}`, {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Check for admin policies attached to user
   */
  async checkAdminPolicies(userName) {
    try {
      const command = new ListAttachedUserPoliciesCommand({
        UserName: userName
      });
      const response = await this.client.send(command);

      const violations = [];

      // Check managed policies
      for (const policy of response.AttachedPolicies || []) {
        if (policy.PolicyName === 'AdministratorAccess') {
          violations.push({
            type: 'IAM_ADMIN_POLICY',
            resource: `${userName}:${policy.PolicyName}`,
            severity: 'CRITICAL',
            reason: 'User has AdministratorAccess policy attached',
            compliant: false
          });
        }
      }

      logger.debug(`Admin policy check for ${userName}`, {
        policiesChecked: response.AttachedPolicies?.length || 0,
        violationsFound: violations.length
      });

      return violations;
    } catch (error) {
      logger.warn(`Failed to check policies for ${userName}`, {
        error: error.message
      });
      return [];
    }
  }

  /**
   * Scan all IAM users for compliance violations
   */
  async scanAllUsers() {
    try {
      const users = await this.listUsers();
      const violations = [];

      for (const user of users) {
        const userName = user.UserName;
        logger.info(`Scanning IAM user: ${userName}`);

        // Skip AWS root account and service accounts
        if (userName.includes('root') || userName.includes('service')) {
          logger.debug(`Skipping system user: ${userName}`);
          continue;
        }

        try {
          // Check MFA
          const mfaCheck = await this.checkMFAEnabled(userName);
          if (!mfaCheck.compliant && process.env.IAM_ENFORCE_MFA === 'true') {
            violations.push({
              type: 'IAM_MFA_NOT_ENABLED',
              resource: userName,
              severity: 'HIGH',
              ...mfaCheck
            });
          }

          // Check access key age
          const keyViolations = await this.checkAccessKeyAge(userName);
          violations.push(...keyViolations);

          // Check admin policies
          const policyViolations = await this.checkAdminPolicies(userName);
          violations.push(...policyViolations);
        } catch (error) {
          logger.warn(`Skipped user ${userName} due to error`, {
            error: error.message
          });
        }
      }

      logger.info('IAM scan complete', { violationsFound: violations.length });
      return violations;
    } catch (error) {
      logger.error('IAM scan failed', { error: error.message });
      throw error;
    }
  }
}

export default IAMDetector;
