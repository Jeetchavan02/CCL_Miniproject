# Cloud Computing Mini Project — Requirements & Constraints

This document defines the architectural rules, constraints, mandatory services, and evaluation criteria for the project. All architectural decisions, code, and deployment steps must strictly comply with these guidelines.

---

## 1. Core Architecture Requirements

- **Three-Tier Architecture**: A fully functional cloud-based application with a **Frontend**, **Backend**, and **Database**.
- **Compute Tier**:
  - Main backend/application **must run on EC2**, container-based compute (e.g. ECS/Docker on EC2), or equivalent cloud compute.
  - **A completely serverless architecture is NOT allowed** (unless explicit permission is granted by faculty). Serverless services (Lambda, API Gateway) are strictly for supporting/asynchronous components.
- **Disallowed Projects**:
  - Static website hosting only (S3 / CloudFront alone).
  - Simple portfolio or resume websites.
  - Basic CRUD apps without deep cloud integration.
  - A single EC2-hosted static webpage.

---

## 2. Mandatory Cloud Pillars & Core Services (Min. 5 Cloud Services)

The architecture must demonstrate competencies across at least 5 foundational cloud domains:

| Cloud Pillar | Mandatory Requirement | Implementation Specification |
| :--- | :--- | :--- |
| **Networking** | Custom VPC Setup | Custom VPC, Public/Private Subnets, Route Tables, Internet Gateway (IGW), and granular Security Groups. |
| **Compute** | Non-Serverless Core | Amazon EC2 (Free-tier `t2.micro` or `t3.micro`) or Docker container compute on EC2. |
| **Database** | Managed Relational DB | Amazon RDS (e.g., PostgreSQL or MySQL, db.t3.micro/db.t4g.micro single-AZ free tier). |
| **Storage** | Object Storage | Amazon S3 for genuine application assets (uploads, reports, document storage, or automated backups). |
| **Security & IAM** | Least-Privilege & Secrets | Dedicated IAM Roles attached to EC2 via Instance Profiles (NO hard-coded AWS keys). Sensitive configs & DB credentials stored in **SSM Parameter Store** (SecureString). |
| **Monitoring** | Observability & Alerting | Amazon CloudWatch for centralized application/system logs, metrics, and at least **one meaningful CloudWatch Alarm** (e.g., CPU utilization, error count, or disk space). |

---

## 3. Additional Cloud Capabilities (Must Implement At Least 2)

In addition to the mandatory services above, the project must implement **at least two** of the following cloud capabilities:

- [ ] **Load Balancing**: Application Load Balancer (ALB) across subnets.
- [ ] **Auto Scaling**: EC2 Auto Scaling Group (ASG) based on traffic/utilization.
- [ ] **Messaging & Queuing**: Amazon SNS (notifications) or Amazon SQS (decoupled background processing).
- [ ] **Supporting Serverless**: AWS Lambda (e.g., S3 event-driven thumbnail generation, report processing, or data hygiene).
- [ ] **NoSQL / Caching**: Amazon DynamoDB or ElastiCache.
- [ ] **CDN & Edge**: Amazon CloudFront for frontend distribution or asset caching.
- [ ] **Infrastructure as Code (IaC)**: Terraform or AWS CloudFormation / CDK.
- [ ] **CI/CD Pipeline**: GitHub Actions or AWS CodePipeline/CodeBuild.
- [ ] **Containerization**: Dockerized application deployed on EC2/ECS.
- [ ] **AI/ML Integration**: Amazon Rekognition, Comprehend, Textract, or Bedrock for smart processing.

> **Rule on Service Usage**: Every cloud service must have a clear, functional purpose. Dummy services created solely to artificially boost service counts are prohibited.

---

## 4. Cost Optimization & Free Tier Guardrails

- **Free Tier First**: Target `t2.micro`/`t3.micro` EC2 instances and Single-AZ `db.t3.micro`/`db.t4g.micro` RDS instances.
- **Services to AVOID (Prevent Unwanted Bills)**:
  - ❌ **NO NAT Gateways** (use public subnets with tight security groups, or a lightweight NAT instance only if strictly required).
  - ❌ **NO Multi-AZ RDS** deployments.
  - ❌ **NO Large EC2/RDS instances** (`t2.medium+`, `m5`, etc.).
  - ❌ **NO Idle Load Balancers or unattached Elastic IPs**.
- **Cost Alerting**: Must set up an **AWS Budget / CloudWatch Cost Alarm** (e.g., $0.01 threshold or Free Tier usage alerts).
- **Resource Hygiene**: Demonstration/test resources must be stoppable or destroyable when not in active use.

---

## 5. Deliverables & Submission Checklist

- [ ] **Architecture Diagram**: Clear visual showing VPC, subnets, route tables, compute, RDS, S3, IAM, and monitoring flow.
- [ ] **Service Justification**: Concise writeup detailing why each service was selected and how it functions in the overall system.
- [ ] **Source Code**: Clean, well-structured codebase in this repository.
- [ ] **Working Demonstration**: Video recording or live demo of end-to-end functionality.
- [ ] **Screenshots / Evidence**:
  - VPC configuration, route tables, subnets, and security groups.
  - EC2 instance and IAM role attachment.
  - RDS database running in private subnet.
  - S3 bucket and object lifecycle/uploads.
  - SSM Parameter Store parameters.
  - CloudWatch logs, dashboard, and fired/configured alarm.
  - AWS Budget alert setup.
- [ ] **Approximate Cost Analysis**: Breakdown of free-tier utilization and estimated production costs.

---

## 6. Academic Evaluation Rubrics (Fr. CRCE — Total: 20 Marks)

*Detailed breakdown available in [Rubrics.md](file:///Users/jeetchavan/CCL_Miniproject/Rubrics.md)*

| Criteria Code | Assessment Focus | Max Marks | Target Benchmark |
| :--- | :--- | :---: | :--- |
| **R1** | Problem Definition & Project Planning | **4** | Clearly formulated real-world problem, system workflow, and clear milestones. |
| **R2** | Cloud Service Selection & Architecture Design | **4** | Sound VPC/EC2/RDS/S3 design, logical integration, scalable and justified. |
| **R3** | Implementation & Functional Execution | **5** | 100% working live demo, core features actively utilizing cloud capabilities. |
| **R4** | Security Handling in App & Cloud Setup | **4** | Least-privilege IAM roles, SSM Parameter Store secrets, private subnet RDS, no hardcoded keys. |
| **R5** | Report & Documentation | **3** | Formal lab report with architecture diagrams, proof screenshots, and cost breakdown. |
| **TOTAL** | | **20 / 20** | |

