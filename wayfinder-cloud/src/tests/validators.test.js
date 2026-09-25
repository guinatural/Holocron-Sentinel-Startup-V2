import Validators from '../utils/validators.js';

describe('Validators - S3 Tests', () => {
  describe('validateS3Encryption', () => {
    it('should return compliant when encryption is enabled', () => {
      const encryptionRules = {
        Rules: [
          {
            ApplyServerSideEncryptionByDefault: {
              SSEAlgorithm: 'AES256'
            }
          }
        ]
      };

      const result = Validators.validateS3Encryption('test-bucket', encryptionRules);

      expect(result.compliant).toBe(true);
      expect(result.reason).toBe('Encryption enabled');
      expect(result.resource).toBe('test-bucket');
    });

    it('should return non-compliant when encryption is disabled', () => {
      const result = Validators.validateS3Encryption('test-bucket', {});

      expect(result.compliant).toBe(false);
      expect(result.reason).toBe('No encryption rules found');
    });
  });

  describe('validateS3PublicAccess', () => {
    it('should return compliant when all public access is blocked', () => {
      const publicAccessBlock = {
        BlockPublicAcls: true,
        BlockPublicPolicy: true,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      };

      const result = Validators.validateS3PublicAccess('test-bucket', publicAccessBlock);

      expect(result.compliant).toBe(true);
      expect(result.reason).toBe('Public access blocked');
    });

    it('should return non-compliant when public access block is incomplete', () => {
      const publicAccessBlock = {
        BlockPublicAcls: true,
        BlockPublicPolicy: false,
        IgnorePublicAcls: true,
        RestrictPublicBuckets: true
      };

      const result = Validators.validateS3PublicAccess('test-bucket', publicAccessBlock);

      expect(result.compliant).toBe(false);
    });
  });

  describe('validateS3Versioning', () => {
    it('should return compliant when versioning is enabled', () => {
      const versioningConfig = { Status: 'Enabled' };
      const result = Validators.validateS3Versioning('test-bucket', versioningConfig);

      expect(result.compliant).toBe(true);
      expect(result.reason).toBe('Versioning enabled');
    });

    it('should return non-compliant when versioning is disabled', () => {
      const versioningConfig = { Status: 'Suspended' };
      const result = Validators.validateS3Versioning('test-bucket', versioningConfig);

      expect(result.compliant).toBe(false);
    });
  });
});

describe('Validators - RDS Tests', () => {
  describe('validateRDSEncryption', () => {
    it('should return compliant when encryption is enabled', () => {
      const result = Validators.validateRDSEncryption('db-instance-1', true);

      expect(result.compliant).toBe(true);
      expect(result.reason).toBe('Encryption enabled');
    });

    it('should return non-compliant when encryption is disabled', () => {
      const result = Validators.validateRDSEncryption('db-instance-1', false);

      expect(result.compliant).toBe(false);
      expect(result.reason).toBe('Encryption disabled');
    });
  });

  describe('validateRDSBackupRetention', () => {
    it('should return compliant when retention meets minimum', () => {
      const result = Validators.validateRDSBackupRetention('db-1', 7, 7);

      expect(result.compliant).toBe(true);
      expect(result.reason).toContain('meets requirement');
    });

    it('should return non-compliant when retention is below minimum', () => {
      const result = Validators.validateRDSBackupRetention('db-1', 3, 7);

      expect(result.compliant).toBe(false);
      expect(result.reason).toContain('below requirement');
    });
  });
});

describe('Validators - IAM Tests', () => {
  describe('validateIAMUserMFA', () => {
    it('should return compliant when MFA is enabled', () => {
      const mfaDevices = [{ SerialNumber: 'arn:aws:iam::123456789012:mfa/user' }];
      const result = Validators.validateIAMUserMFA('test-user', mfaDevices);

      expect(result.compliant).toBe(true);
      expect(result.reason).toBe('MFA enabled');
    });

    it('should return non-compliant when MFA is not enabled', () => {
      const result = Validators.validateIAMUserMFA('test-user', []);

      expect(result.compliant).toBe(false);
      expect(result.reason).toBe('MFA not enabled');
    });
  });

  describe('validateAccessKeyAge', () => {
    it('should return compliant for recent access keys', () => {
      const createDate = new Date();
      createDate.setDate(createDate.getDate() - 30);

      const result = Validators.validateAccessKeyAge('user-1', createDate, 90);

      expect(result.compliant).toBe(true);
    });

    it('should return non-compliant for aged access keys', () => {
      const createDate = new Date();
      createDate.setDate(createDate.getDate() - 120);

      const result = Validators.validateAccessKeyAge('user-1', createDate, 90);

      expect(result.compliant).toBe(false);
    });
  });

  describe('validateIAMNoAdminPolicy', () => {
    it('should return non-compliant when admin access is present', () => {
      const policy = {
        Statement: [
          {
            Effect: 'Allow',
            Action: '*',
            Resource: '*'
          }
        ]
      };

      const result = Validators.validateIAMNoAdminPolicy('admin-policy', policy);

      expect(result.compliant).toBe(false);
    });

    it('should return compliant when admin access is not present', () => {
      const policy = {
        Statement: [
          {
            Effect: 'Allow',
            Action: 's3:GetObject',
            Resource: 'arn:aws:s3:::bucket/*'
          }
        ]
      };

      const result = Validators.validateIAMNoAdminPolicy('s3-policy', policy);

      expect(result.compliant).toBe(true);
    });
  });
});
