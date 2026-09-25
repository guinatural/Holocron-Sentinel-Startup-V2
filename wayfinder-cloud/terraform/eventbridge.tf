# EventBridge Rule for scheduled governance checks
resource "aws_cloudwatch_event_rule" "governance_schedule" {
  name                = "wayfinder-governance-schedule"
  description         = "Trigger Wayfinder governance checks on schedule"
  schedule_expression = var.eventbridge_schedule

  tags = {
    Name        = "wayfinder-governance-schedule"
    Environment = var.environment
  }
}

# EventBridge Target - Lambda
resource "aws_cloudwatch_event_target" "governance_lambda" {
  rule      = aws_cloudwatch_event_rule.governance_schedule.name
  target_id = "WayfinderGovernanceLambda"
  arn       = aws_lambda_function.wayfinder_governance.arn
  role_arn  = aws_iam_role.eventbridge_role.arn

  dead_letter_config {
    arn = aws_sqs_queue.governance_dlq.arn
  }

  retry_policy {
    maximum_event_age       = 3600
    maximum_retry_attempts  = 2
  }
}

# EventBridge Rule for compliance violations
resource "aws_cloudwatch_event_rule" "compliance_violations" {
  name        = "wayfinder-compliance-violations"
  description = "Capture compliance violation events"

  event_pattern = jsonencode({
    source      = ["wayfinder.governance"]
    detail-type = ["ComplianceViolationDetected"]
  })

  tags = {
    Name        = "wayfinder-compliance-violations"
    Environment = var.environment
  }
}

# EventBridge Target for violations - SNS notification
resource "aws_cloudwatch_event_target" "violations_sns" {
  rule      = aws_cloudwatch_event_rule.compliance_violations.name
  target_id = "ComplianceViolationsSNS"
  arn       = aws_sns_topic.compliance_alerts.arn
  role_arn  = aws_iam_role.eventbridge_role.arn
}

# SNS Topic for compliance alerts
resource "aws_sns_topic" "compliance_alerts" {
  name = "wayfinder-compliance-alerts"

  tags = {
    Name        = "wayfinder-compliance-alerts"
    Environment = var.environment
  }
}

# SNS Topic subscription (email)
resource "aws_sns_topic_subscription" "compliance_email" {
  topic_arn = aws_sns_topic.compliance_alerts.arn
  protocol  = "email"
  endpoint  = var.alert_email

  depends_on = [aws_sns_topic.compliance_alerts]
}

# SQS Dead Letter Queue for failed events
resource "aws_sqs_queue" "governance_dlq" {
  name                      = "wayfinder-governance-dlq"
  message_retention_seconds = 1209600 # 14 days

  tags = {
    Name        = "wayfinder-governance-dlq"
    Environment = var.environment
  }
}

# IAM Role for EventBridge
resource "aws_iam_role" "eventbridge_role" {
  name = "wayfinder-eventbridge-role"

  assume_role_policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Action = "sts:AssumeRole"
        Effect = "Allow"
        Principal = {
          Service = "events.amazonaws.com"
        }
      }
    ]
  })
}

# IAM Policy for EventBridge to invoke Lambda and SNS
resource "aws_iam_role_policy" "eventbridge_policy" {
  name = "wayfinder-eventbridge-policy"
  role = aws_iam_role.eventbridge_role.id

  policy = jsonencode({
    Version = "2012-10-17"
    Statement = [
      {
        Effect = "Allow"
        Action = [
          "lambda:InvokeFunction"
        ]
        Resource = aws_lambda_function.wayfinder_governance.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sns:Publish"
        ]
        Resource = aws_sns_topic.compliance_alerts.arn
      },
      {
        Effect = "Allow"
        Action = [
          "sqs:SendMessage"
        ]
        Resource = aws_sqs_queue.governance_dlq.arn
      }
    ]
  })
}

output "eventbridge_rule_arn" {
  value       = aws_cloudwatch_event_rule.governance_schedule.arn
  description = "ARN of EventBridge governance schedule rule"
}

output "compliance_alerts_topic" {
  value       = aws_sns_topic.compliance_alerts.arn
  description = "SNS Topic for compliance alerts"
}

output "dlq_url" {
  value       = aws_sqs_queue.governance_dlq.url
  description = "Dead Letter Queue URL for failed events"
}
