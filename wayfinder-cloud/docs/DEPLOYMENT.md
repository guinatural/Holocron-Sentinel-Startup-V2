# Wayfinder Cloud Governance - Deployment Guide

## Prerequisites

### Required Tools

- Node.js 18.x or later
- npm or yarn
- Terraform 1.0+
- AWS CLI v2
- Docker (optional, for local testing)

### AWS Account Requirements

- Sufficient permissions to create Lambda, EventBridge, DynamoDB, IAM roles
- S3 bucket for Terraform state (recommended)
- Verified SNS email subscription

## Step 1: Clone and Setup

```bash
# Clone the repository
git clone <repository-url> wayfinder-cloud
cd wayfinder-cloud

# Install dependencies
npm install

# Copy environment file
cp .env.example .env

# Edit .env with your configuration
nano .env
```

## Step 2: Local Testing

### Run Tests

```bash
# Run all unit tests
npm test

# Run with coverage report
npm run test:coverage

# Watch mode for development
npm run test:watch
```

### Local Development

```bash
# Start in development mode (dry-run)
npm run dev

# Or manually
DRY_RUN=true AUTO_REMEDIATE=false npm start
```

### Docker Compose (with LocalStack)

```bash
# Start local AWS environment
docker-compose up -d

# Run tests against LocalStack
AWS_ENDPOINT_URL_S3=http://localhost:4566 \
AWS_ENDPOINT_URL_RDS=http://localhost:4566 \
npm test

# Stop services
docker-compose down
```

## Step 3: Terraform Deployment

### Initialize Terraform

```bash
cd terraform

# Initialize Terraform working directory
terraform init

# Optional: Configure remote state
terraform init \
  -backend-config="bucket=my-terraform-state" \
  -backend-config="key=wayfinder/terraform.tfstate" \
  -backend-config="region=us-east-1"
```

### Create terraform.tfvars

```bash
cat > terraform.tfvars << 'EOF'
aws_region              = "us-east-1"
environment             = "dev"
alert_email             = "security-team@example.com"
eventbridge_schedule    = "cron(0 2 * * ? *)"
auto_remediate          = false
dry_run                 = true
log_level               = "info"
enable_pitr             = true

# S3 Compliance
s3_enable_encryption    = true
s3_block_public_access  = true
s3_enable_versioning    = true

# RDS Compliance
rds_enable_encryption   = true
rds_enable_backup       = true
rds_backup_retention    = 7
rds_enable_multi_az     = false

# IAM Compliance
iam_enforce_mfa         = true
iam_max_access_key_age  = 90
EOF
```

### Plan Deployment

```bash
# Review infrastructure changes
terraform plan -out=tfplan

# Examine the plan
# Make sure permissions and resources are correct
```

### Apply Deployment

```bash
# Deploy infrastructure
terraform apply tfplan

# Save outputs
terraform output -json > outputs.json
```

### Important Outputs

After deployment, note these values:

```bash
terraform output lambda_function_name
terraform output lambda_function_arn
terraform output dynamodb_events_table
terraform output compliance_alerts_topic
```

## Step 4: Build and Deploy Lambda

### Build Lambda Package

```bash
# Create deployment package
npm run build:lambda

# This creates lambda.zip with all dependencies
```

### Upload to Lambda

```bash
# Using AWS CLI
aws lambda update-function-code \
  --function-name wayfinder-governance \
  --zip-file fileb://terraform/lambda.zip \
  --region us-east-1
```

## Step 5: Configure SNS Notifications

### Subscribe to SNS Topic

```bash
# Get the SNS topic ARN from Terraform outputs
SNS_ARN=$(terraform output -raw compliance_alerts_topic)

# Subscribe your email
aws sns subscribe \
  --topic-arn $SNS_ARN \
  --protocol email \
  --notification-endpoint your-email@example.com
```

### Confirm Subscription

1. Check your email
2. Click the confirmation link in the SNS notification
3. You'll now receive compliance alerts

## Step 6: Test Deployment

### Manual Lambda Invocation

```bash
# Invoke Lambda function
aws lambda invoke \
  --function-name wayfinder-governance \
  --region us-east-1 \
  --log-type Tail \
  response.json

# View the response
cat response.json | jq .

# View logs
aws logs tail /aws/lambda/wayfinder-governance --follow
```

### Check EventBridge Rules

```bash
# List EventBridge rules
aws events list-rules --region us-east-1

# Check rule targets
aws events list-targets-by-rule \
  --rule wayfinder-governance-schedule \
  --region us-east-1
```

### Query DynamoDB Events

```bash
# Scan events table
aws dynamodb scan \
  --table-name wayfinder-governance-events \
  --region us-east-1 \
  --limit 10

# Query by resource
aws dynamodb query \
  --table-name wayfinder-governance-events \
  --key-condition-expression "resource_id = :rid" \
  --expression-attribute-values '{":rid":{"S":"my-bucket"}}' \
  --region us-east-1
```

## Step 7: Monitor and Troubleshoot

### View Lambda Logs

```bash
# Real-time log streaming
aws logs tail /aws/lambda/wayfinder-governance --follow

# Retrieve specific time range
aws logs filter-log-events \
  --log-group-name /aws/lambda/wayfinder-governance \
  --start-time $(date -d '1 hour ago' +%s)000 \
  --region us-east-1
```

### Check Lambda Metrics

```bash
# View Lambda invocations
aws cloudwatch get-metric-statistics \
  --namespace AWS/Lambda \
  --metric-name Invocations \
  --dimensions Name=FunctionName,Value=wayfinder-governance \
  --start-time $(date -u -d '24 hours ago' +%Y-%m-%dT%H:%M:%S) \
  --end-time $(date -u +%Y-%m-%dT%H:%M:%S) \
  --period 3600 \
  --statistics Sum
```

## Step 8: Enable Auto-Remediation (Cautiously)

### Before Enabling:

1. Test with `dry_run = true` first
2. Review all detected violations
3. Understand the remediation actions
4. Test in dev/staging environment

### Enable in Staging:

```bash
# Update terraform.tfvars
sed -i 's/dry_run = true/dry_run = false/' terraform.tfvars
sed -i 's/auto_remediate = false/auto_remediate = true/' terraform.tfvars

# Plan and apply changes
terraform plan
terraform apply

# Monitor for issues
aws logs tail /aws/lambda/wayfinder-governance --follow
```

## Step 9: Production Deployment

### Pre-Production Checklist

- [ ] All tests passing locally
- [ ] Staging environment tested
- [ ] SNS notifications verified
- [ ] CloudWatch alarms configured
- [ ] Backup strategy defined
- [ ] Rollback plan documented
- [ ] Stakeholder approval obtained

### Blue/Green Deployment

```bash
# Create new Lambda version
aws lambda publish-version \
  --function-name wayfinder-governance

# Route EventBridge to new version
aws events put-targets \
  --rule wayfinder-governance-schedule \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:wayfinder-governance:VERSION"
```

### Gradual Rollout

1. Deploy to dev environment
2. Test for 1 week
3. Deploy to staging
4. Test for 1-2 weeks with real data
5. Deploy to production
6. Monitor for issues

## Rollback Procedure

### Rollback Lambda Function

```bash
# Get previous version
PREV_VERSION=$(aws lambda list-versions-by-function \
  --function-name wayfinder-governance \
  --query 'Versions[-2].Version' \
  --output text)

# Update EventBridge target to previous version
aws events put-targets \
  --rule wayfinder-governance-schedule \
  --targets "Id"="1","Arn"="arn:aws:lambda:us-east-1:ACCOUNT:function:wayfinder-governance:$PREV_VERSION"
```

### Rollback Terraform

```bash
# Revert terraform.tfvars
git checkout terraform.tfvars

# Apply previous configuration
terraform apply
```

## Troubleshooting

### Lambda Execution Timeout

- **Problem**: Governance scan takes longer than 300 seconds
- **Solution**: Increase Lambda timeout in `lambda.tf`

```hcl
timeout = 600  # Increase to 10 minutes
```

### DynamoDB Throttling

- **Problem**: High violation rates cause DynamoDB throttling
- **Solution**: Add provisioned capacity or use DAX cache

```hcl
billing_mode = "PROVISIONED"
read_capacity_units  = 100
write_capacity_units = 100
```

### Access Denied Errors

- **Problem**: Lambda lacks permissions to access resources
- **Solution**: Check IAM role policy in `main.tf`

```bash
# View lambda role policy
aws iam get-role-policy \
  --role-name wayfinder-lambda-execution-role \
  --policy-name wayfinder-lambda-policy
```

### EventBridge Not Triggering

- **Problem**: Lambda not invoked on schedule
- **Solution**: Verify rule and targets

```bash
# Check rule status
aws events describe-rule \
  --name wayfinder-governance-schedule \
  --query State

# Check targets
aws events list-targets-by-rule \
  --rule wayfinder-governance-schedule
```

## Maintenance

### Update Dependencies

```bash
# Check for updates
npm outdated

# Update packages
npm update

# Rebuild and deploy
npm run build:lambda
aws lambda update-function-code \
  --function-name wayfinder-governance \
  --zip-file fileb://terraform/lambda.zip
```

### Backup DynamoDB Data

```bash
# Create on-demand backup
aws dynamodb create-backup \
  --table-name wayfinder-governance-events \
  --backup-name wayfinder-governance-events-$(date +%Y%m%d)
```

### Review Compliance Reports

```bash
# Generate violation summary
aws dynamodb query \
  --table-name wayfinder-governance-events \
  --index-name violation_type_index \
  --key-condition-expression "violation_type = :vt" \
  --expression-attribute-values '{":vt":{"S":"S3_ENCRYPTION_DISABLED"}}' \
  --region us-east-1 | jq '.Items | length'
```

## Cost Optimization

### Monitor Costs

```bash
# View Lambda costs
aws ce get-cost-and-usage \
  --time-period Start=$(date -d '30 days ago' +%Y-%m-%d),End=$(date +%Y-%m-%d) \
  --granularity MONTHLY \
  --metrics BlendedCost \
  --filter file://filter.json
```

### Optimize Schedule

```bash
# Run less frequently for non-critical environments
eventbridge_schedule = "cron(0 0 * * ? *)"  # Daily at midnight
```

### Archive Old Events

```bash
# Move old events to S3 Glacier
# Implement lifecycle policy or manual archival script
```

## Security Hardening

### Enable VPC Integration

```hcl
vpc_config {
  subnet_ids         = var.private_subnet_ids
  security_group_ids = var.lambda_security_group_ids
}
```

### Encrypt Sensitive Data

```bash
# Use AWS Secrets Manager for credentials
aws secretsmanager create-secret \
  --name wayfinder/api-key \
  --secret-string "your-secret-value"
```

### Enable CloudTrail

```bash
# Log all Lambda API calls
aws cloudtrail start-logging \
  --trail-name wayfinder-governance-trail
```

## Support and Resources

- **AWS Lambda**: https://docs.aws.amazon.com/lambda/
- **EventBridge**: https://docs.aws.amazon.com/eventbridge/
- **DynamoDB**: https://docs.aws.amazon.com/dynamodb/
- **Terraform AWS Provider**: https://registry.terraform.io/providers/hashicorp/aws/latest

## Contact

For issues or questions:
1. Check CloudWatch logs
2. Review ARCHITECTURE.md
3. Run tests locally
4. Contact security-team@example.com
