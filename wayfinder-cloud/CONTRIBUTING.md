# Contributing to Wayfinder Cloud Governance

Thank you for your interest in contributing! Please follow these guidelines.

## Code of Conduct

- Be respectful and inclusive
- Report issues responsibly
- Focus on constructive feedback

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- Git
- Terraform 1.0+
- AWS CLI v2

### Development Setup

```bash
# Clone the repository
git clone https://github.com/your-org/wayfinder-cloud-governance.git
cd wayfinder-cloud-governance

# Install dependencies
npm install

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and test
npm test
npm run lint
```

## Development Workflow

### 1. Create a Feature Branch

```bash
git checkout -b feature/detector-cloudfront
# or for fixes
git checkout -b fix/lambda-timeout
```

### 2. Make Changes

- Write clean, documented code
- Follow ESLint rules
- Add tests for new functionality
- Update documentation

### 3. Test Locally

```bash
# Run unit tests
npm test

# Run with coverage
npm run test:coverage

# Lint code
npm run lint

# Development mode (dry-run)
npm run dev
```

### 4. Commit Changes

```bash
git add .
git commit -m "feat: add CloudFront detector

- Checks SSL/TLS configuration
- Validates access logs
- Closes #123"
```

### 5. Push and Create PR

```bash
git push origin feature/detector-cloudfront
```

Then open a Pull Request on GitHub.

## Commit Message Format

Use conventional commits:

```
<type>(<scope>): <subject>

<body>

<footer>
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation
- `style`: Code style (no functional changes)
- `refactor`: Refactoring without feature/fix
- `perf`: Performance improvement
- `test`: Test addition/modification
- `chore`: Build, deps, tooling

### Examples

```bash
git commit -m "feat(s3-detector): add bucket logging check"
git commit -m "fix(lambda): increase timeout from 300 to 600 seconds"
git commit -m "docs: update deployment guide for AWS region selection"
git commit -m "refactor(validators): extract common validation logic"
```

## Adding New Detectors

### Example: CloudFront Detector

1. **Create detector file**

```bash
touch src/detectors/cloudfront-detector.js
```

2. **Implement detector**

```javascript
import { CloudFrontClient, ListDistributionsCommand } from '@aws-sdk/client-cloudfront';
import Logger from '../utils/logger.js';

const logger = new Logger('CloudFrontDetector');

class CloudFrontDetector {
  constructor() {
    this.client = new CloudFrontClient({ region: process.env.AWS_REGION });
  }

  async scanAllDistributions() {
    try {
      // Implementation
    } catch (error) {
      logger.error('CloudFront scan failed', { error: error.message });
      throw error;
    }
  }
}

export default CloudFrontDetector;
```

3. **Create remediator** (if applicable)

```bash
touch src/remediators/cloudfront-remediator.js
```

4. **Add tests**

```bash
# Create test file
touch src/tests/cloudfront-detector.test.js

# Add test cases
```

5. **Update main index.js**

```javascript
import CloudFrontDetector from './detectors/cloudfront-detector.js';

class WayfinderGovernance {
  // ... existing code ...
  
  async detectViolations() {
    // ... existing detectors ...
    
    const cfViolations = await this.cloudFrontDetector.scanAllDistributions();
    allViolations.push(...cfViolations);
  }
}
```

6. **Update documentation**

- Add detector to ARCHITECTURE.md
- Document compliance checks
- Add configuration examples

## Code Review Checklist

Before submitting a PR, verify:

- [ ] Code passes ESLint (`npm run lint`)
- [ ] All tests pass (`npm test`)
- [ ] Coverage is maintained (>80%)
- [ ] Documentation is updated
- [ ] Commit messages follow convention
- [ ] No secrets or credentials in code
- [ ] AWS permissions are minimal
- [ ] Error handling is comprehensive
- [ ] Logging is appropriate
- [ ] No breaking changes (unless major version)

## Testing Guidelines

### Unit Tests

```javascript
describe('S3Detector', () => {
  let detector;

  beforeEach(() => {
    detector = new S3Detector();
  });

  it('should list all S3 buckets', async () => {
    // Arrange
    s3Mock.on(ListBucketsCommand).resolves({
      Buckets: [{ Name: 'test-bucket' }]
    });

    // Act
    const result = await detector.listBuckets();

    // Assert
    expect(result).toHaveLength(1);
    expect(result[0].Name).toBe('test-bucket');
  });
});
```

### Test Coverage Requirements

- Detectors: >80% coverage
- Remediators: >80% coverage
- Utils: >85% coverage
- Overall: >80% coverage

### Running Tests

```bash
# All tests
npm test

# Specific test file
npm test -- src/tests/validators.test.js

# Watch mode
npm run test:watch

# Coverage report
npm run test:coverage
```

## Documentation

### Update README.md
- For new features or major changes
- Keep it concise and clear

### Update docs/ARCHITECTURE.md
- For system design changes
- Add diagrams if helpful
- Document new components

### Update docs/DEPLOYMENT.md
- For deployment procedures
- Add troubleshooting sections
- Document new configuration options

### Code Comments
- Explain "why" not "what"
- JSDoc for public functions
- Keep comments concise

```javascript
/**
 * Check S3 bucket encryption compliance
 * @param {string} bucketName - The S3 bucket name
 * @returns {Object} Validation result with compliant flag and reason
 */
async checkEncryption(bucketName) {
  // Implementation
}
```

## Terraform Changes

When updating Terraform:

1. Follow best practices
2. Use variables for configuration
3. Add comments for complex logic
4. Validate syntax: `terraform fmt -recursive terraform/`
5. Plan before apply
6. Update documentation

```hcl
# Add new resource
resource "aws_cloudwatch_event_rule" "new_rule" {
  name        = "wayfinder-new-rule"
  description = "Description of what this rule does"

  event_pattern = jsonencode({
    source      = ["custom.source"]
    detail-type = ["Event Type"]
  })

  tags = {
    Name        = "wayfinder-new-rule"
    Environment = var.environment
  }
}
```

## Reporting Issues

### Bug Reports

Include:
- Clear description
- Steps to reproduce
- Expected vs actual behavior
- Environment details
- Logs/error messages

### Feature Requests

Include:
- Clear description
- Use case/motivation
- Proposed implementation (optional)
- Alternative solutions considered

## Security

### Reporting Security Issues

**Do not** open public issues for security vulnerabilities.

1. Email security@example.com with details
2. Include: description, impact, reproduction steps
3. Allow 90 days for patch before disclosure

### Security Best Practices

- Never commit secrets
- Use AWS IAM properly
- Validate input data
- Escape output appropriately
- Keep dependencies updated
- Run security scans (`npm audit`)

## Merge Requirements

- Passing CI/CD pipeline
- Code review approval (1+ maintainer)
- Updated documentation
- No breaking changes (unless major version)
- Squash commits before merge

## Release Process

### Version Numbers

Follow [Semantic Versioning](https://semver.org/):
- MAJOR.MINOR.PATCH
- Example: v1.2.3

### Release Steps

1. Update version in `package.json`
2. Update CHANGELOG.md
3. Create git tag: `git tag -a v1.2.3 -m "Release v1.2.3"`
4. Push tag: `git push origin v1.2.3`
5. Create GitHub Release with notes

## Questions?

- Check documentation first
- Search existing issues
- Ask in discussions
- Contact maintainers

## Thank You!

Your contributions help make Wayfinder Cloud Governance better for everyone.

---

**Happy Contributing! 🚀**
