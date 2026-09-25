variable "aws_region" {
  description = "AWS region for deployment"
  type        = string
  default     = "us-east-1"
}

variable "environment" {
  description = "Environment name (dev, staging, prod)"
  type        = string
  default     = "dev"

  validation {
    condition     = contains(["dev", "staging", "prod"], var.environment)
    error_message = "Environment must be dev, staging, or prod"
  }
}

# Lambda Configuration
variable "log_retention_days" {
  description = "CloudWatch log retention in days"
  type        = number
  default     = 30
}

# EventBridge Configuration
variable "eventbridge_schedule" {
  description = "Cron expression for governance checks schedule"
  type        = string
  default     = "cron(0 2 * * ? *)" # Daily at 2 AM UTC
}

variable "alert_email" {
  description = "Email address for compliance alerts"
  type        = string
}

# S3 Compliance Rules
variable "s3_enable_encryption" {
  description = "Enable S3 encryption checks and auto-remediation"
  type        = bool
  default     = true
}

variable "s3_block_public_access" {
  description = "Enable S3 public access block checks and auto-remediation"
  type        = bool
  default     = true
}

variable "s3_enable_versioning" {
  description = "Enable S3 versioning checks and auto-remediation"
  type        = bool
  default     = true
}

# RDS Compliance Rules
variable "rds_enable_encryption" {
  description = "Enable RDS encryption checks"
  type        = bool
  default     = true
}

variable "rds_enable_backup" {
  description = "Enable RDS backup checks and auto-remediation"
  type        = bool
  default     = true
}

variable "rds_backup_retention" {
  description = "Minimum RDS backup retention period in days"
  type        = number
  default     = 7
}

variable "rds_enable_multi_az" {
  description = "Enable RDS Multi-AZ checks"
  type        = bool
  default     = false
}

# IAM Compliance Rules
variable "iam_enforce_mfa" {
  description = "Enforce MFA for all IAM users"
  type        = bool
  default     = true
}

variable "iam_max_access_key_age" {
  description = "Maximum age of IAM access keys in days"
  type        = number
  default     = 90
}

# Remediation Configuration
variable "auto_remediate" {
  description = "Enable automatic remediation of violations"
  type        = bool
  default     = false
}

variable "dry_run" {
  description = "Run in dry-run mode (no actual changes)"
  type        = bool
  default     = false
}

variable "log_level" {
  description = "Lambda function log level"
  type        = string
  default     = "info"

  validation {
    condition     = contains(["debug", "info", "warn", "error"], var.log_level)
    error_message = "Log level must be debug, info, warn, or error"
  }
}

# DynamoDB Configuration
variable "enable_pitr" {
  description = "Enable point-in-time recovery for DynamoDB tables"
  type        = bool
  default     = true
}

# Tags
variable "tags" {
  description = "Common tags to apply to all resources"
  type        = map(string)
  default = {
    Project    = "Wayfinder"
    Component  = "CloudGovernance"
    ManagedBy  = "Terraform"
  }
}
