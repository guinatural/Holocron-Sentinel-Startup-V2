# Wayfinder Cloud Governance

Automated AWS Cloud Governance and Security Remediation Platform with Lambda, EventBridge, and Terraform.

## Overview

Wayfinder Cloud Governance is a serverless solution that continuously monitors AWS resources for policy violations and automatically remediates security issues. It detects non-compliant S3 buckets, RDS instances, and IAM configurations, triggering automated remediation workflows.

## Features

- **Real-time Detection**: AWS EventBridge integration for continuous monitoring
- **Automated Remediation**: Auto-fix security violations in S3, RDS, and IAM
- **Audit Trail**: DynamoDB-based event logging for compliance tracking
- **Infrastructure as Code**: Complete Terraform deployment
- **Production-ready**: ES6 modules, comprehensive error handling, and logging

## Quick Start

### Prerequisites

- Node.js 18+
- AWS CLI configured
- Terraform
- Docker (optional)

### Installation

```bash
npm install
cp .env.example .env
```

### Testing

```bash
npm test
npm run test:coverage
```

### Deployment

```bash
npm run build:lambda
cd terraform
terraform init
terraform plan
terraform apply
```

## Architecture

See [ARCHITECTURE.md](./docs/ARCHITECTURE.md) for detailed system design.

## Deployment Guide

See [DEPLOYMENT.md](./docs/DEPLOYMENT.md) for step-by-step deployment instructions.

## Project Structure

```
wayfinder-cloud/
├── src/
│   ├── detectors/       # Policy violation detectors
│   ├── remediators/     # Auto-remediation functions
│   ├── utils/           # Utilities and helpers
│   ├── tests/           # Jest unit tests
│   └── index.js         # Entry point
├── terraform/           # IaC definitions
├── docs/                # Documentation
└── package.json
```

## License

MIT
