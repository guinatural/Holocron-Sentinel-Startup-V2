# DynamoDB Table for governance events
resource "aws_dynamodb_table" "wayfinder_events" {
  name           = "wayfinder-governance-events"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "resource_id"
  range_key      = "timestamp"

  attribute {
    name = "resource_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "violation_type"
    type = "S"
  }

  attribute {
    name = "resource_type"
    type = "S"
  }

  # Global Secondary Index for querying by violation type
  global_secondary_index {
    name            = "violation_type_index"
    hash_key        = "violation_type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by resource type
  global_secondary_index {
    name            = "resource_type_index"
    hash_key        = "resource_type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Time to Live for automatic event expiration
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.enable_pitr
  }

  stream_specification {
    stream_view_type = "NEW_AND_OLD_IMAGES"
  }

  tags = {
    Name        = "wayfinder-governance-events"
    Environment = var.environment
    Project     = "Wayfinder"
  }
}

# DynamoDB Table for governance audit trail
resource "aws_dynamodb_table" "wayfinder_audit_trail" {
  name           = "wayfinder-governance-audit-trail"
  billing_mode   = "PAY_PER_REQUEST"
  hash_key       = "audit_id"
  range_key      = "timestamp"

  attribute {
    name = "audit_id"
    type = "S"
  }

  attribute {
    name = "timestamp"
    type = "N"
  }

  attribute {
    name = "action_type"
    type = "S"
  }

  attribute {
    name = "resource_id"
    type = "S"
  }

  # Global Secondary Index for querying by action type
  global_secondary_index {
    name            = "action_type_index"
    hash_key        = "action_type"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Global Secondary Index for querying by resource
  global_secondary_index {
    name            = "resource_audit_index"
    hash_key        = "resource_id"
    range_key       = "timestamp"
    projection_type = "ALL"
  }

  # Time to Live for automatic audit log expiration
  ttl {
    attribute_name = "ttl"
    enabled        = true
  }

  point_in_time_recovery {
    enabled = var.enable_pitr
  }

  stream_specification {
    stream_view_type = "NEW_AND_OLD_IMAGES"
  }

  tags = {
    Name        = "wayfinder-governance-audit-trail"
    Environment = var.environment
    Project     = "Wayfinder"
  }
}

# CloudWatch Alarms for DynamoDB
resource "aws_cloudwatch_metric_alarm" "dynamodb_throttling" {
  alarm_name          = "wayfinder-dynamodb-throttling"
  alarm_description   = "Alert when DynamoDB encounters throttling"
  comparison_operator = "GreaterThanOrEqualToThreshold"
  evaluation_periods  = 2
  metric_name         = "UserErrors"
  namespace           = "AWS/DynamoDB"
  period              = 300
  statistic           = "Sum"
  threshold           = 1
  alarm_actions       = [aws_sns_topic.compliance_alerts.arn]

  dimensions = {
    TableName = aws_dynamodb_table.wayfinder_events.name
  }
}

output "dynamodb_events_table" {
  value       = aws_dynamodb_table.wayfinder_events.name
  description = "DynamoDB table for governance events"
}

output "dynamodb_audit_trail_table" {
  value       = aws_dynamodb_table.wayfinder_audit_trail.name
  description = "DynamoDB table for audit trail"
}

output "dynamodb_stream_arn" {
  value       = aws_dynamodb_table.wayfinder_events.stream_arn
  description = "ARN of DynamoDB events stream"
}
