# AGENT_RULES.md
Project: Campus Lost & Found with AI Item Matching (AWS, us-east-1).
Stack: React frontend, FastAPI backend (Docker on EC2), MySQL on RDS (private subnet),
S3 (photos), Rekognition DetectLabels, SNS (match emails), SSM Parameter Store (secrets),
CloudWatch (logs + CPU alarm), AWS Budgets ($0.01).
HARD RULES:
1. No hardcoded keys/passwords anywhere. boto3 uses EC2 IAM role. Secrets from SSM SecureString.
2. No NAT Gateway, no Multi-AZ RDS, no ALB, t3.micro/db.t3.micro only.
3. Not serverless: backend runs on EC2.
4. Passwords hashed with bcrypt; JWT auth; roles: student, security.
5. Do ONE phase at a time. After each phase, list files changed and how I test it. Do not start the next phase.
6. Keep code simple, commented, no extra libraries beyond requirements.txt.
7. Never fake features. Every button must work end to end.
Layout: /backend /frontend /infra /docs /docker-compose.yml