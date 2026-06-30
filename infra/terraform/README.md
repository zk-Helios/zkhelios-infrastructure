# Infrastructure (Terraform)

Skeleton IaC for the zkHelios backend. Modules: `networking` (VPC/subnets),
`database` (RDS Postgres 16), `cache` (ElastiCache Redis 7), `compute` (EKS/ECS),
`dns` (Route53 + ACM). State in S3 with DynamoDB locking; separate workspaces for
staging + production.

```bash
terraform workspace select staging   # or: new
terraform init
terraform plan  -var env=staging
terraform apply -var env=staging
```

> The module bodies under `modules/` are stubs to be filled per cloud account.
> Frontend (apps/web, apps/dapp, apps/docs) deploys to Vercel — not managed here.
