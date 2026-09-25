resource "aws_lambda_function" "wayfinder_governance" {
  filename         = "lambda.zip"
  function_name    = "wayfinder-governance"
  role             = aws_iam_role.wayfinder_lambda_role.arn
  handler          = "src/index.handler"
  runtime          = "nodejs18.x"
  timeout          = 300
  memory_size      = 512
  source_code_hash = data.archive_file.lambda_zip.output_base64sha256

  environment {
    variables = {
      AWS_REGION              = var.aws_region
      DYNAMODB_TABLE          = aws_dynamodb_table.wayfinder_events.name
      AUTO_REMEDIATE          = var.auto_remediate
      DRY_RUN                 = var.dry_run
      LOG_LEVEL               = var.log_level
      S3_ENABLE_ENCRYPTION    = var.s3_enable_encryption
      S3_BLOCK_PUBLIC_ACCESS  = var.s3_block_public_access
      S3_ENABLE_VERSIONING    = var.s3_enable_versioning
      RDS_ENABLE_ENCRYPTION   = var.rds_enable_encryption
      RDS_ENABLE_BACKUP       = var.rds_enable_backup
      RDS_BACKUP_RETENTION    = var.rds_backup_retention
      RDS_ENABLE_MULTI_AZ     = var.rds_enable_multi_az
      IAM_ENFORCE_MFA         = var.iam_enforce_mfa
      IAM_MAX_ACCESS_KEY_AGE  = var.iam_max_access_key_age
    }
  }

  layers = [
    aws_lambda_layer_version.dependencies.arn
  ]

  tags = {
    Name        = "wayfinder-governance-lambda"
    Environment = var.environment
    Project     = "Wayfinder"
  }

  depends_on = [
    aws_iam_role_policy.wayfinder_lambda_policy,
    aws_cloudwatch_log_group.wayfinder_logs
  ]
}

# Lambda Layer for dependencies
data "archive_file" "node_modules_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../node_modules"
  output_path = "${path.module}/node_modules.zip"
}

resource "aws_lambda_layer_version" "dependencies" {
  layer_name          = "wayfinder-dependencies"
  filename            = data.archive_file.node_modules_zip.output_path
  source_code_hash    = data.archive_file.node_modules_zip.output_base64sha256
  compatible_runtimes = ["nodejs18.x"]
}

# Lambda function archive
data "archive_file" "lambda_zip" {
  type        = "zip"
  source_dir  = "${path.module}/../src"
  output_path = "${path.module}/lambda.zip"
  excludes    = ["tests", "node_modules"]
}

# Lambda function logs insight
resource "aws_cloudwatch_log_group" "lambda_logs" {
  name              = "/aws/lambda/wayfinder-governance"
  retention_in_days = var.log_retention_days

  tags = {
    Name        = "wayfinder-lambda-logs"
    Environment = var.environment
  }
}

# Lambda permissions for EventBridge
resource "aws_lambda_permission" "allow_eventbridge" {
  statement_id  = "AllowExecutionFromEventBridge"
  action        = "lambda:InvokeFunction"
  function_name = aws_lambda_function.wayfinder_governance.function_name
  principal     = "events.amazonaws.com"
  source_arn    = aws_cloudwatch_event_rule.governance_schedule.arn
}

output "lambda_function_arn" {
  value       = aws_lambda_function.wayfinder_governance.arn
  description = "ARN of the Wayfinder governance Lambda function"
}

output "lambda_function_name" {
  value       = aws_lambda_function.wayfinder_governance.function_name
  description = "Name of the Wayfinder governance Lambda function"
}

output "lambda_role_arn" {
  value       = aws_iam_role.wayfinder_lambda_role.arn
  description = "ARN of Lambda execution role"
}
