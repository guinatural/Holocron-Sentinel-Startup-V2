# Wayfinder Cloud Governance - Architecture

## Overview

Wayfinder Cloud Governance is a serverless, event-driven platform that continuously monitors AWS resources for policy violations and automatically remediates security issues. The system uses AWS Lambda, EventBridge, DynamoDB, and SNS to provide real-time governance and compliance tracking.

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                      EventBridge Schedule                        │
│                    (Cron-based triggers)                         │
└────────────────────────┬────────────────────────────────────────┘
                         │
                         ▼
┌─────────────────────────────────────────────────────────────────┐
│                   AWS Lambda Function                            │
│                (wayfinder-governance)                            │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │ Detectors:                                               │   │
│  │ ├─ S3Detector (encryption, public access, versioning)  │   │
│  │ ├─ RDSDetector (encryption, backups, Multi-AZ)         │   │
│  │ └─ IAMDetector (MFA, access key age, admin policies)   │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Remediators:                                             │   │
│  │ ├─ S3Remediator (auto-fix S3 violations)               │   │
│  │ ├─ RDSRemediator (auto-fix RDS violations)             │   │
│  │ └─ IAMRemediator (auto-fix IAM violations)             │   │
│  ├──────────────────────────────────────────────────────────┤   │
│  │ Publishers:                                              │   │
│  │ └─ EventBridgePublisher (emit events)                   │   │
│  └──────────────────────────────────────────────────────────┘   │
└───────────────────────┬───────────────────┬─────────────────────┘
                        │                   │
        ┌───────────────▼─┐            ┌────▼────────────┐
        │  DynamoDB Events│            │  DynamoDB Audit │
        │     Table       │            │  Trail Table    │
        └─────────────────┘            └─────────────────┘
                        │                   │
                        └───────────┬───────┘
                                    │
                    ┌───────────────▼─────────────────┐
                    │    EventBridge Rules            │
                    │                                 │
                    │ • ComplianceViolationDetected   │
                    │ • RemediationCompleted          │
                    └───────────────┬─────────────────┘
                                    │
                          ┌─────────▼──────────┐
                          │   SNS Topic        │
                          │ (Compliance Alerts)│
                          └────────────────────┘
                                    │
                                    ▼
                              Email Notification
```

## Components

### 1. Detectors

Detectors scan AWS resources for policy violations:

#### S3Detector
- Lists all S3 buckets
- Checks encryption configuration
- Verifies public access block settings
- Validates versioning status

#### RDSDetector
- Enumerates RDS instances
- Checks storage encryption
- Validates backup retention periods
- Monitors Multi-AZ deployment status

#### IAMDetector
- Lists IAM users
- Verifies MFA enablement
- Checks access key age
- Identifies users with admin policies

### 2. Remediators

Remediators automatically fix detected violations (when enabled):

#### S3Remediator
- Enables default encryption (AES256)
- Applies public access blocks
- Enables object versioning
- Supports dry-run mode for testing

#### RDSRemediator
- Enables automated backups
- Configures backup retention
- Enables Multi-AZ deployment
- Notes manual steps for encryption

#### IAMRemediator
- Deactivates aged access keys
- Reports MFA requirements
- Suggests admin policy removal
- Generates compliance recommendations

### 3. Utilities

#### Logger
- Structured logging with Pino
- Namespace-based logging
- Configurable log levels
- Event tracking for audit trail

#### EventBridgePublisher
- Publishes compliance violations
- Batch event publishing
- Error handling and retry logic
- Event enrichment with timestamps

#### Validators
- Policy compliance validation
- Reusable validation logic
- Consistent violation formatting
- Detailed compliance reasoning

### 4. Data Storage

#### DynamoDB Events Table
- **Partition Key**: resource_id
- **Sort Key**: timestamp (Unix milliseconds)
- **GSI 1**: violation_type + timestamp
- **GSI 2**: resource_type + timestamp
- **TTL**: Automatic expiration (configurable)

#### DynamoDB Audit Trail Table
- **Partition Key**: audit_id
- **Sort Key**: timestamp
- **GSI 1**: action_type + timestamp
- **GSI 2**: resource_id + timestamp
- **TTL**: Automatic expiration

### 5. Event Flow

```
1. EventBridge Schedule triggers Lambda
2. Lambda executes governance cycle:
   a. Detectors scan all resources
   b. Violations are identified
   c. Violations published to EventBridge
   d. Remediators fix issues (if enabled)
   e. Events logged to DynamoDB
3. EventBridge rules capture violation events
4. SNS sends alerts to configured recipients
```

## Configuration

### Environment Variables

```env
AWS_REGION=us-east-1
AUTO_REMEDIATE=false          # Enable/disable auto-remediation
DRY_RUN=true                  # Run without making changes
LOG_LEVEL=info                # Logging level

# S3 Rules
S3_ENABLE_ENCRYPTION=true
S3_BLOCK_PUBLIC_ACCESS=true
S3_ENABLE_VERSIONING=true

# RDS Rules
RDS_ENABLE_ENCRYPTION=true
RDS_ENABLE_BACKUP=true
RDS_BACKUP_RETENTION=7
RDS_ENABLE_MULTI_AZ=false

# IAM Rules
IAM_ENFORCE_MFA=true
IAM_MAX_ACCESS_KEY_AGE=90
```

### Terraform Variables

Key variables for infrastructure deployment:

- `eventbridge_schedule`: Cron expression for governance checks
- `alert_email`: Email for compliance notifications
- `auto_remediate`: Enable automatic remediation
- `dry_run`: Run in test mode
- Environment-specific compliance rules

## Event Schema

### Compliance Violation Event

```json
{
  "detail-type": "ComplianceViolationDetected",
  "source": "wayfinder.governance",
  "detail": {
    "type": "S3_ENCRYPTION_DISABLED",
    "resource": "my-bucket",
    "severity": "HIGH",
    "compliant": false,
    "reason": "No encryption configuration found",
    "timestamp": "2024-01-15T10:30:00.000Z"
  }
}
```

### Remediation Event

```json
{
  "detail-type": "RemediationCompleted",
  "source": "wayfinder.governance",
  "detail": {
    "success": true,
    "bucketName": "my-bucket",
    "action": "encryption_enabled",
    "dryRun": false,
    "timestamp": "2024-01-15T10:31:00.000Z"
  }
}
```

## Security Considerations

### IAM Permissions

Lambda execution role includes:
- Read-only access to S3, RDS, IAM (for detection)
- Modify permissions only for authorized services (for remediation)
- CloudWatch Logs for monitoring
- DynamoDB for audit trail
- EventBridge for publishing events

### Data Protection

- All data in transit uses HTTPS
- DynamoDB encryption at rest (AWS managed)
- CloudWatch Logs encrypted
- No sensitive data logged (passwords, keys)

### Audit Trail

- All actions logged to DynamoDB audit trail
- EventBridge captures all events
- CloudWatch Logs retain all execution details
- TTL prevents indefinite retention

## Performance

- **Lambda timeout**: 300 seconds
- **Memory allocation**: 512 MB
- **Concurrent execution**: Auto-scaling based on EventBridge load
- **DynamoDB**: On-demand billing (scales automatically)

## Cost Optimization

1. **DynamoDB on-demand**: Pay per request, no provisioning
2. **EventBridge**: Pay per published event
3. **Lambda**: Pay per execution and duration
4. **SNS**: Minimal cost for notifications
5. **CloudWatch**: Standard pricing for logs

Typical monthly cost for small AWS environment: $10-$50

## Monitoring and Alerts

### CloudWatch Metrics

- Lambda invocations and errors
- DynamoDB throttling
- EventBridge failed invocations
- Violation counts by type

### SNS Alerts

- Critical violations (public S3, old access keys)
- Remediation failures
- System errors

### CloudWatch Logs

- All Lambda executions logged
- Structured logging with namespaces
- Log Insights queries for compliance reports

## Limitations

1. **RDS Encryption**: Requires snapshot/restore (manual process)
2. **IAM MFA**: Cannot be automated (manual enablement required)
3. **IAM Policies**: Requires manual review before removal
4. **Dry Run**: Useful for testing but doesn't validate full workflow

## Future Enhancements

1. CloudFront distribution compliance
2. API Gateway authentication policies
3. VPC security group rules validation
4. AWS Config integration
5. Automated incident tickets (Jira/ServiceNow)
6. Advanced ML-based anomaly detection
