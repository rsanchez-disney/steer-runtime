# Check ECS Tasks

Check how many tasks are running in the specified ECS cluster.

## Instructions
1. Read AWS credentials from ~/.aws/credentials
2. Export credentials as environment variables
3. List all ECS clusters if cluster name is uncertain
4. Count running tasks in the target cluster using: `aws ecs list-tasks --cluster <cluster-name> --region us-west-2 --desired-status RUNNING --query 'length(taskArns)'`

## Common Clusters
- cart-latest
- cart-stage
- cart-prod
- cart-load
