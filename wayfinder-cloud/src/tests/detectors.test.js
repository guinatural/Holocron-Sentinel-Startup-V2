import { mockClient } from 'aws-sdk-client-mock';
import {
  S3Client,
  ListBucketsCommand,
  GetBucketEncryptionCommand,
  GetPublicAccessBlockCommand,
  GetBucketVersioningCommand
} from '@aws-sdk/client-s3';
import S3Detector from '../detectors/s3-detector.js';

const s3Mock = mockClient(S3Client);

describe('S3Detector', () => {
  let detector;

  beforeEach(() => {
    s3Mock.reset();
    detector = new S3Detector();
  });

  describe('listBuckets', () => {
    it('should list all S3 buckets', async () => {
      const buckets = [
        { Name: 'bucket-1' },
        { Name: 'bucket-2' }
      ];

      s3Mock.on(ListBucketsCommand).resolves({
        Buckets: buckets
      });

      const result = await detector.listBuckets();

      expect(result).toEqual(buckets);
    });

    it('should handle empty bucket list', async () => {
      s3Mock.on(ListBucketsCommand).resolves({
        Buckets: []
      });

      const result = await detector.listBuckets();

      expect(result).toEqual([]);
    });
  });

  describe('checkEncryption', () => {
    it('should detect enabled encryption', async () => {
      s3Mock.on(GetBucketEncryptionCommand).resolves({
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

      const result = await detector.checkEncryption('test-bucket');

      expect(result.compliant).toBe(true);
      expect(result.reason).toBe('Encryption enabled');
    });

    it('should detect disabled encryption', async () => {
      s3Mock.on(GetBucketEncryptionCommand).rejects({
        name: 'ServerSideEncryptionConfigurationNotFoundError'
      });

      const result = await detector.checkEncryption('test-bucket');

      expect(result.compliant).toBe(false);
    });
  });

  describe('checkPublicAccess', () => {
    it('should detect when public access is blocked', async () => {
      s3Mock.on(GetPublicAccessBlockCommand).resolves({
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: true,
          BlockPublicPolicy: true,
          IgnorePublicAcls: true,
          RestrictPublicBuckets: true
        }
      });

      const result = await detector.checkPublicAccess('test-bucket');

      expect(result.compliant).toBe(true);
    });

    it('should detect when public access is not blocked', async () => {
      s3Mock.on(GetPublicAccessBlockCommand).resolves({
        PublicAccessBlockConfiguration: {
          BlockPublicAcls: false,
          BlockPublicPolicy: false,
          IgnorePublicAcls: false,
          RestrictPublicBuckets: false
        }
      });

      const result = await detector.checkPublicAccess('test-bucket');

      expect(result.compliant).toBe(false);
    });
  });

  describe('checkVersioning', () => {
    it('should detect enabled versioning', async () => {
      s3Mock.on(GetBucketVersioningCommand).resolves({
        Status: 'Enabled'
      });

      const result = await detector.checkVersioning('test-bucket');

      expect(result.compliant).toBe(true);
    });

    it('should detect disabled versioning', async () => {
      s3Mock.on(GetBucketVersioningCommand).resolves({
        Status: 'Suspended'
      });

      const result = await detector.checkVersioning('test-bucket');

      expect(result.compliant).toBe(false);
    });
  });
});
