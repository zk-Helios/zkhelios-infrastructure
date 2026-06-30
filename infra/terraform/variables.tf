variable "env" {
  type        = string
  description = "Deployment environment (staging | production)"
}

variable "region" {
  type    = string
  default = "us-east-1"
}

variable "db_instance_size" {
  type    = string
  default = "db.t4g.medium"
}
