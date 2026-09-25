/**
 * Validators for AWS policy compliance checks
 */

class Validators {
  /**
   * Validate S3 bucket encryption
   */
  static validateS3Encryption(bucketName, encryptionRules) {
    if (!encryptionRules || Object.keys(encryptionRules).length === 0) {
      return {
        compliant: false,
        reason: 'No encryption rules found',
        resource: bucketName
      };
    }

    const hasDefaultEncryption = encryptionRules.Rules?.some(
      rule => rule.ApplyServerSideEncryptionByDefault
    );

    return {
      compliant: !!hasDefaultEncryption,
      reason: hasDefaultEncryption ? 'Encryption enabled' : 'Encryption disabled',
      resource: bucketName
    };
  }

  /**
   * Validate S3 public access settings
   */
  static validateS3PublicAccess(bucketName, publicAccessBlock) {
    const required = {
      BlockPublicAcls: true,
      BlockPublicPolicy: true,
      IgnorePublicAcls: true,
      RestrictPublicBuckets: true
    };

    const compliant = Object.keys(required).every(
      key => publicAccessBlock?.[key] === required[key]
    );

    return {
      compliant,
      reason: compliant ? 'Public access blocked' : 'Public access not blocked',
      resource: bucketName,
      details: publicAccessBlock
    };
  }

  /**
   * Validate S3 versioning
   */
  static validateS3Versioning(bucketName, versioningConfig) {
    const compliant = versioningConfig?.Status === 'Enabled';

    return {
      compliant,
      reason: compliant ? 'Versioning enabled' : 'Versioning disabled',
      resource: bucketName
    };
  }

  /**
   * Validate RDS encryption
   */
  static validateRDSEncryption(dbInstanceId, storageEncrypted) {
    return {
      compliant: !!storageEncrypted,
      reason: storageEncrypted ? 'Encryption enabled' : 'Encryption disabled',
      resource: dbInstanceId
    };
  }

  /**
   * Validate RDS backup retention
   */
  static validateRDSBackupRetention(dbInstanceId, retentionDays, minDays = 7) {
    const compliant = retentionDays >= minDays;

    return {
      compliant,
      reason: compliant 
        ? `Backup retention (${retentionDays} days) meets requirement (${minDays} days)`
        : `Backup retention (${retentionDays} days) below requirement (${minDays} days)`,
      resource: dbInstanceId
    };
  }

  /**
   * Validate IAM user MFA
   */
  static validateIAMUserMFA(userName, mfaDevices) {
    const hasMFA = mfaDevices && mfaDevices.length > 0;

    return {
      compliant: hasMFA,
      reason: hasMFA ? 'MFA enabled' : 'MFA not enabled',
      resource: userName
    };
  }

  /**
   * Validate IAM access key age
   */
  static validateAccessKeyAge(userName, accessKeyCreateDate, maxAgeInDays = 90) {
    const ageInDays = Math.floor(
      (Date.now() - accessKeyCreateDate.getTime()) / (1000 * 60 * 60 * 24)
    );
    const compliant = ageInDays <= maxAgeInDays;

    return {
      compliant,
      reason: compliant
        ? `Access key age (${ageInDays} days) within limit (${maxAgeInDays} days)`
        : `Access key age (${ageInDays} days) exceeds limit (${maxAgeInDays} days)`,
      resource: userName,
      details: { ageInDays, maxAgeInDays }
    };
  }

  /**
   * Validate IAM policy has no admin privileges
   */
  static validateIAMNoAdminPolicy(policyName, policyDocument) {
    const policy = typeof policyDocument === 'string' 
      ? JSON.parse(policyDocument) 
      : policyDocument;

    const hasAdminAccess = policy.Statement?.some(stmt => {
      const actions = Array.isArray(stmt.Action) ? stmt.Action : [stmt.Action];
      return (
        actions.includes('*') && 
        (stmt.Effect === 'Allow' || stmt.Effect !== 'Deny')
      );
    });

    return {
      compliant: !hasAdminAccess,
      reason: hasAdminAccess ? 'Admin privileges detected' : 'No admin privileges',
      resource: policyName
    };
  }
}

export default Validators;
