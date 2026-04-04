# 🏗️ Terraform Blueprint: Secure S3 Static Website
# Author: Guilherme Gomes (AWS CCP)
# Description: Automates a secure, high-performance static site using S3, CloudFront and OAI.

provider "aws" {
  region = "us-east-1"
}

# 1. S3 Bucket (Private, for content storage)
resource "aws_s3_bucket" "website_bucket" {
  bucket = "empresa-site-estatico-producao"
}

resource "aws_s3_bucket_public_access_block" "website_bucket_pab" {
  bucket = website_bucket.id

  block_public_acls       = true
  block_public_policy     = true
  ignore_public_acls      = true
  restrict_public_buckets = true
}

# 2. CloudFront Origin Access Identity (OAI)
resource "aws_cloudfront_origin_access_identity" "oai" {
  comment = "OAI for Empresa Website"
}

# 3. CloudFront Distribution
resource "aws_cloudfront_distribution" "s3_distribution" {
  origin {
    domain_name = aws_s3_bucket.website_bucket.bucket_regional_domain_name
    origin_id   = "S3Origin"

    s3_origin_config {
      origin_access_identity = aws_cloudfront_origin_access_identity.oai.cloudfront_access_identity_path
    }
  }

  enabled             = true
  is_ipv6_enabled     = true
  default_root_object = "index.html"

  default_cache_behavior {
    allowed_methods  = ["GET", "HEAD"]
    cached_methods   = ["GET", "HEAD"]
    target_origin_id = "S3Origin"

    forwarded_values {
      query_string = false
      cookies {
        forward = "none"
      }
    }

    viewer_protocol_policy = "redirect-to-https"
  }

  restrictions {
    geo_restriction {
      restriction_type = "none"
    }
  }

  viewer_certificate {
    cloudfront_default_certificate = true
  }
}
