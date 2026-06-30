# zkHelios infrastructure (skeleton). Apply per workspace: staging / production.
terraform {
  required_version = ">= 1.6"
  required_providers {
    aws = { source = "hashicorp/aws", version = "~> 5.0" }
  }
  backend "s3" {
    bucket         = "zkhelios-tfstate"
    key            = "infra/terraform.tfstate"
    region         = "us-east-1"
    dynamodb_table = "zkhelios-tflock"
    encrypt        = true
  }
}

provider "aws" {
  region = var.region
}

module "networking" {
  source = "./modules/networking"
  env    = var.env
}

module "database" {
  source        = "./modules/database" # RDS Postgres 16
  env           = var.env
  vpc_id        = module.networking.vpc_id
  subnet_ids    = module.networking.private_subnet_ids
  instance_size = var.db_instance_size
}

module "cache" {
  source     = "./modules/cache" # ElastiCache Redis 7
  env        = var.env
  vpc_id     = module.networking.vpc_id
  subnet_ids = module.networking.private_subnet_ids
}

module "compute" {
  source = "./modules/compute" # EKS (or ECS) for api/indexer/workers
  env    = var.env
  vpc_id = module.networking.vpc_id
}

module "dns" {
  source = "./modules/dns" # Route53 + ACM
  env    = var.env
}
