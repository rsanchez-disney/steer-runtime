# AWS Development Standards

## IAM
- Follow least-privilege principle for all roles and policies
- Use IAM roles for services, never long-lived access keys
- Use condition keys to restrict access by VPC, IP, or tag
- Rotate credentials regularly

## Networking
- Use VPCs with private subnets for backend services
- Use security groups as primary network control
- Enable VPC Flow Logs for audit
- Use PrivateLink for AWS service access where available

## Compute (ECS/Lambda)
- Set memory and CPU limits explicitly
- Use health checks and auto-scaling
- For Lambda: keep functions focused, set appropriate timeouts, use layers for shared code
- For ECS: use Fargate for simplicity, EC2 for cost optimization at scale

## Storage
- Enable encryption at rest for all data stores (S3, RDS, DynamoDB)
- Enable versioning on S3 buckets
- Use lifecycle policies for cost management
- Never make S3 buckets public unless explicitly required

## Databases (RDS/DynamoDB)
- Use Multi-AZ for production RDS instances
- Enable automated backups with appropriate retention
- Use parameter groups for configuration
- For DynamoDB: design for access patterns, use GSIs sparingly

## Logging & Monitoring
- Send all logs to CloudWatch Logs
- Use CloudWatch Alarms for critical metrics
- Enable CloudTrail for API audit
- Use X-Ray or equivalent for distributed tracing
