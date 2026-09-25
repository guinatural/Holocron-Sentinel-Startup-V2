import 'dotenv/config';
import Logger from './utils/logger.js';
import S3Detector from './detectors/s3-detector.js';
import RDSDetector from './detectors/rds-detector.js';
import IAMDetector from './detectors/iam-detector.js';
import S3Remediator from './remediators/s3-remediator.js';
import RDSRemediator from './remediators/rds-remediator.js';
import IAMRemediator from './remediators/iam-remediator.js';
import EventBridgePublisher from './utils/eventBridge.js';

const logger = new Logger('WayfinderGovernance');

class WayfinderGovernance {
  constructor() {
    this.s3Detector = new S3Detector();
    this.rdsDetector = new RDSDetector();
    this.iamDetector = new IAMDetector();
    this.s3Remediator = new S3Remediator();
    this.rdsRemediator = new RDSRemediator();
    this.iamRemediator = new IAMRemediator();
    this.eventPublisher = new EventBridgePublisher();
    this.autoRemediate = process.env.AUTO_REMEDIATE === 'true';
  }

  /**
   * Scan all AWS resources and detect violations
   */
  async detectViolations() {
    logger.info('Starting AWS resource compliance scan');
    const allViolations = [];

    try {
      // Scan S3
      logger.info('Scanning S3 buckets...');
      const s3Violations = await this.s3Detector.scanAllBuckets();
      allViolations.push(...s3Violations);

      // Scan RDS
      logger.info('Scanning RDS instances...');
      const rdsViolations = await this.rdsDetector.scanAllInstances();
      allViolations.push(...rdsViolations);

      // Scan IAM
      logger.info('Scanning IAM users...');
      const iamViolations = await this.iamDetector.scanAllUsers();
      allViolations.push(...iamViolations);

      logger.info(`Compliance scan complete. Found ${allViolations.length} violations`);
      return allViolations;
    } catch (error) {
      logger.error('Compliance scan failed', { error: error.message });
      throw error;
    }
  }

  /**
   * Publish violations to EventBridge
   */
  async publishViolations(violations) {
    try {
      for (const violation of violations) {
        await this.eventPublisher.publishEvent(
          'ComplianceViolationDetected',
          violation
        );
      }
      logger.info(`Published ${violations.length} violation events`);
    } catch (error) {
      logger.error('Failed to publish violations', { error: error.message });
      throw error;
    }
  }

  /**
   * Remediate violations
   */
  async remediateViolations(violations) {
    if (!this.autoRemediate) {
      logger.info('Auto-remediation disabled. Skipping remediation.');
      return [];
    }

    logger.info('Starting auto-remediation');
    const remediationResults = [];

    // Group violations by resource type and resource ID
    const violationsByResource = violations.reduce((acc, violation) => {
      const key = `${violation.type.split('_')[0]}_${violation.resource}`;
      if (!acc[key]) {
        acc[key] = [];
      }
      acc[key].push(violation);
      return acc;
    }, {});

    for (const [resourceKey, resourceViolations] of Object.entries(
      violationsByResource
    )) {
      const [type, resource] = resourceKey.split('_');

      try {
        if (type === 'S3') {
          const results = await this.s3Remediator.remediateBucket(
            resource,
            resourceViolations
          );
          remediationResults.push(...results);
        } else if (type === 'RDS') {
          const results = await this.rdsRemediator.remediateInstance(
            resource,
            resourceViolations
          );
          remediationResults.push(...results);
        } else if (type === 'IAM') {
          const results = await this.iamRemediator.remediateUser(
            resource,
            resourceViolations
          );
          remediationResults.push(...results);
        }
      } catch (error) {
        logger.error(`Remediation failed for ${resourceKey}`, {
          error: error.message
        });
      }
    }

    logger.info('Remediation complete');
    return remediationResults;
  }

  /**
   * Run complete governance cycle: detect -> publish -> remediate
   */
  async run() {
    try {
      logger.info('Wayfinder Cloud Governance cycle started');

      // Detect violations
      const violations = await this.detectViolations();

      // Publish to EventBridge
      if (violations.length > 0) {
        await this.publishViolations(violations);
      }

      // Remediate if enabled
      const remediationResults = await this.remediateViolations(violations);

      // Publish remediation results
      if (remediationResults.length > 0) {
        for (const result of remediationResults) {
          await this.eventPublisher.publishEvent(
            'RemediationCompleted',
            result
          );
        }
      }

      logger.info('Governance cycle completed successfully', {
        violationsFound: violations.length,
        remediationResults: remediationResults.length
      });

      return {
        success: true,
        violationsFound: violations.length,
        remediationResults: remediationResults.length,
        violations,
        remediationResults
      };
    } catch (error) {
      logger.fatal('Governance cycle failed', { error: error.message });
      throw error;
    }
  }
}

// Lambda handler
export const handler = async (event) => {
  try {
    const governance = new WayfinderGovernance();
    const result = await governance.run();
    return {
      statusCode: 200,
      body: JSON.stringify(result)
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: JSON.stringify({
        error: error.message,
        success: false
      })
    };
  }
};

// Local execution
if (process.env.NODE_ENV !== 'test') {
  const governance = new WayfinderGovernance();
  governance
    .run()
    .then(result => {
      console.log(JSON.stringify(result, null, 2));
      process.exit(0);
    })
    .catch(error => {
      console.error('Fatal error:', error.message);
      process.exit(1);
    });
}

export default WayfinderGovernance;
