terraform {
  required_version = ">= 1.0"
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }

  backend "s3" {
    # Configure with: -backend-config="bucket=my-bucket" -backend-config="key=wayfinder/terraform.tfstate" -backend-config="region=us-east-1"
  }
}

provider "aws" {
  region = var.aws_region
}

# Data source for current AWS account
data "aws_caller_identity" "current" {}

# Data source for current region
data "aws_region" "current" {}

# CloudWatch Log Group for Lambda
resource "aws_cloudwatch_log_group" "wayfinder_logs" {
  name              = "/aws/lambda/wayfinder-governance"
  retention_in_days = 30

  tags = {
    Name        = "wayfinder-governance-logs"
    Environment = var.environment
    Project     = "Wayfinder"
  }
}

# IAM Role for Lambda
resource "aws_iam_role" "wayfinder_lambda_role" {
  name = "wayfinder-lambda-execution-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "lambda.amazonaws.com"
        }
      }
    ]
  })

  tags = {
    Name        = "wayfinder-lambda-role"
    Environment = var.environment
  }
}

# Policy for Lambda to access CloudWatch Logs
resource "aws_iam_role_policy_attachment" "lambda_logs_policy" {
  role       = aws_iam_role.wayfinder_lambda_role.name
  policy_arn = "arn:aws:iam::aws:policy/service-role/AWSLambdaBasicExecutionRole"
}

# Policy for Lambda to read S3, RDS, IAM, DynamoDB
resource "aws_iam_role_policy" "wayfinder_lambda_policy" {
  name = "wayfinder-lambda-policy"
  role = aws_iam_role.wayfinder_lambda_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "s3:ListAllMyBuckets",
          "s3:GetBucketVersioning",
          "s3:GetEncryptionConfiguration",
          "s3:GetPublicAccessBlock",
          "s3:PutBucketEncryption",
          "s3:PutPublicAccessBlock",
          "s3:PutBucketVersioning"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "rds:DescribeDBInstances",
          "rds:ModifyDBInstance"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "iam:ListUsers",
          "iam:ListMFADevices",
          "iam:ListAccessKeys",
          "iam:ListAttachedUserPolicies",
          "iam:UpdateAccessKey"
        ]
        Resource = "*"
      },
      {
        Effect = "Allow"
        Action = [
          "dynamodb:PutItem",
          "dynamodb:Query",
          "dynamodb:Scan"
        ]
        Resource = aws_dynamodb_table.wayfinder_events.arn
      },
      {
        Effect = "Allow"
        Action = [
          "events:PutEvents"
        ]
        Resource = "arn:aws:events:${data.aws_region.current.name}:${data.aws_caller_identity.current.account_id}:event-bus/default"
      }
    ]
  })
}

output "lambda_role_arn" {
  value       = aws_iam_role.wayfinder_lambda_role.arn
  description = "ARN of Lambda execution role"
}

output "log_group_name" {
  value       = aws_cloudwatch_log_group.wayfinder_logs.name
  description = "CloudWatch Log Group name"
}
