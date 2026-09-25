import { mockClient } from 'aws-sdk-client-mock';
import {
  S3Client,
  PutBucketEncryptionCommand,
  PutPublicAccessBlockCommand,
  PutBucketVersioningCommand
} from '@aws-sdk/client-s3';
import S3Remediator from '../remediators/s3-remediator.js';

const s3Mock = mockClient(S3Client);

describe('S3Remediator', () => {
  let remediator;

  beforeEach(() => {
    s3Mock.reset();
    process.env.DRY_RUN = 'false';
    remediator = new S3Remediator();
  });

  afterEach(() => {
    delete process.env.DRY_RUN;
  });

  describe('enableEncryption', () => {
    it('should enable encryption on bucket', async () => {
      s3Mock.on(PutBucketEncryptionCommand).resolves({});

      const result = await remediator.enableEncryption('test-bucket');

      expect(result.success).toBe(true);
      expect(result.action).toBe('encryption_enabled');
    });

    it('should handle dry-run mode', async () => {
      process.env.DRY_RUN = 'true';
      const newRemediator = new S3Remediator();

      const result = await newRemediator.enableEncryption('test-bucket');

      expect(result.success).toBe(true);
      expect(result.dryRun).toBe(true);
    });

    it('should handle errors', async () => {
      s3Mock.on(PutBucketEncryptionCommand).rejects(
        new Error('Access Denied')
      );

      const result = await remediator.enableEncryption('test-bucket');

      expect(result.success).toBe(false);
      expect(result.error).toContain('Access Denied');
    });
  });

  describe('blockPublicAccess', () => {
    it('should block public access on bucket', async () => {
      s3Mock.on(PutPublicAccessBlockCommand).resolves({});

      const result = await remediator.blockPublicAccess('test-bucket');

      expect(result.success).toBe(true);
      expect(result.action).toBe('public_access_blocked');
    });

    it('should set all public access block flags', async () => {
      s3Mock.on(PutPublicAccessBlockCommand).callsFake(input => {
        const config = input.PublicAccessBlockConfiguration;
        expect(config.BlockPublicAcls).toBe(true);
        expect(config.BlockPublicPolicy).toBe(true);
        expect(config.IgnorePublicAcls).toBe(true);
        expect(config.RestrictPublicBuckets).toBe(true);
        return Promise.resolve({});
      });

      await remediator.blockPublicAccess('test-bucket');

      expect(s3Mock.call(0).args[0].input).toBeDefined();
    });
  });

  describe('enableVersioning', () => {
    it('should enable versioning on bucket', async () => {
      s3Mock.on(PutBucketVersioningCommand).resolves({});

      const result = await remediator.enableVersioning('test-bucket');

      expect(result.success).toBe(true);
      expect(result.action).toBe('versioning_enabled');
    });
  });

  describe('remediateBucket', () => {
    it('should remediate multiple violations', async () => {
      s3Mock.on(PutBucketEncryptionCommand).resolves({});
      s3Mock.on(PutPublicAccessBlockCommand).resolves({});
      s3Mock.on(PutBucketVersioningCommand).resolves({});

      const violations = [
        { type: 'S3_ENCRYPTION_DISABLED' },
        { type: 'S3_PUBLIC_ACCESS_ALLOWED' },
        { type: 'S3_VERSIONING_DISABLED' }
      ];

      const results = await remediator.remediateBucket('test-bucket', violations);

      expect(results).toHaveLength(3);
      expect(results.every(r => r.success)).toBe(true);
    });

    it('should handle unknown violation types', async () => {
      const violations = [
        { type: 'UNKNOWN_TYPE' }
      ];

      const results = await remediator.remediateBucket('test-bucket', violations);

      expect(results).toHaveLength(1);
    });
  });
});
