# Evaluation Rubrics & Max-Score Guide (Fr. CRCE — Cloud Computing Lab)

**Institution:** Fr. Conceicao Rodrigues College of Engineering (Fr. CRCE), Bandra-West, Mumbai  
**Department:** Computer Engineering  
**Course:** Cloud Computing Lab Mini-Project  
**Target:** 20 / 20 Marks (100% "Excellent" across all criteria)

---

## 1. Summary Rubrics Matrix

| Criteria Code | Criteria Name | Max Marks | Target Level | Key Requirements for Full Marks |
| :--- | :--- | :---: | :---: | :--- |
| **R1** | **Problem Definition & Project Planning** | **4** | **Excellent (4)** | Clear, relevant, and well-scoped for cloud; objectives, workflows, and project planning well defined. |
| **R2** | **Cloud Service Selection & Architecture Design** | **4** | **Excellent (4)** | Appropriate services selected & logically integrated; complete, technically sound, scalable, and suitable architecture. |
| **R3** | **Implementation & Functional Execution** | **5** | **Excellent (5)** | Fully implemented and working correctly; core features demonstrate genuine, effective use of cloud resources. |
| **R4** | **Security Handling in App & Cloud Setup** | **4** | **Excellent (4)** | Proper app & cloud security: authentication, authorization, IAM least-privilege, SSM parameter store (no hardcoded keys). |
| **R5** | **Report & Documentation** | **3** | **Excellent (3)** | Complete & structured report: problem statement, objectives, methodology, architecture diagram, implementation, results, conclusion, cost details, and references. |
| **Total** | | **20** | **20 / 20** | |

---

## 2. Rubric Breakdown & Target Scoring Strategy

### 🎯 Criteria R1: Problem Definition and Project Planning (4 Marks)
- **Goal for 4/4 ("Excellent")**:
  - The problem statement must be **practical, relevant, and distinctly cloud-native** (must require cloud elasticity, asynchronous processing, managed storage, or security — not something that runs identically on a local laptop without reason).
  - Explicit definition of:
    1. Core business problem / real-world pain point.
    2. Specific functional & non-functional requirements.
    3. Workflow diagram illustrating how data and requests transition between actors and cloud components.
    4. Execution timeline / milestone plan.

---

### 🎯 Criteria R2: Cloud Service Selection and Architecture Design (4 Marks)
- **Goal for 4/4 ("Excellent")**:
  - Every selected service must have an undeniable, non-redundant functional role:
    - **Compute**: Amazon EC2 / Docker container for the continuous core backend.
    - **Networking**: Custom VPC with distinct Public & Private Subnets, Route Tables, IGW, and least-privilege Security Groups.
    - **Database**: Managed Amazon RDS (PostgreSQL or MySQL) housed inside Private Subnets.
    - **Storage**: Amazon S3 with genuine lifecycle/file handling (presigned URLs, reports, uploads).
    - **Supporting Cloud Capabilities (Min 2)**: e.g., Amazon SNS (email alerts), AWS Lambda (event-driven processor on S3 upload), Application Load Balancer / Auto Scaling, or CloudFront.
  - Architecture diagram must clearly show:
    - VPC boundary, Availability Zones, Subnets (CIDR blocks), Internet Gateway, EC2 instance, RDS, S3, IAM Roles, and CloudWatch.

---

### 🎯 Criteria R3: Implementation and Functional Execution (5 Marks)
- **Goal for 5/5 ("Excellent")**:
  - The application must be **100% working and testable end-to-end** during the live demonstration.
  - End-to-end user journey:
    1. Frontend client interaction.
    2. Backend API processing on EC2.
    3. Secure transaction storage in RDS.
    4. Asset management via S3.
    5. Triggering asynchronous / supporting components (e.g., S3 event -> Lambda -> SNS notification).
  - No broken links, dummy non-functioning buttons, or fake services.

---

### 🎯 Criteria R4: Security Handling in Application and Cloud Setup (4 Marks)
- **Goal for 4/4 ("Excellent")**:
  - **Zero hard-coded credentials** in source code or Git.
  - **AWS IAM**:
    - IAM Role with least-privilege policies attached to EC2 instance profile.
    - AWS SDK automatically discovers credentials from the instance metadata service (IMDSv2).
  - **Secrets Management**:
    - Database password, JWT secret, and API tokens stored in **AWS Systems Manager (SSM) Parameter Store** (`SecureString`).
  - **Network Isolation**:
    - RDS instances placed in private subnets with Security Groups allowing ingress *only* from the EC2 security group on port 5432/3306.
    - EC2 security group exposes only HTTP/HTTPS (and optionally restricted SSH).
  - **Application-Level Security**:
    - User authentication (e.g., JWT / secure password hashing with bcrypt) and role-based access control.

---

### 🎯 Criteria R5: Report and Documentation (3 Marks)
- **Goal for 3/3 ("Excellent")**:
  - Academic-grade report strictly following college structure:
    1. Cover Page (Student Name, Roll No, Department of Computer Engineering, Fr. CRCE).
    2. Problem Statement & Objectives.
    3. Service Justification Table.
    4. Comprehensive Architecture Diagram.
    5. Implementation Details & Methodology.
    6. Screenshots & Proof of Working (VPC, Subnets, EC2, RDS, S3, SSM, CloudWatch metrics/alarms, AWS Budget).
    7. Cost Analysis & Free-Tier Consumption breakdown.
    8. Conclusion & References.

---

## 3. Strict Compliance Guardrails (Free Tier & Constraints)

1. **NO NAT Gateway** (avoiding ~$32/month AWS charges).
2. **NO Multi-AZ RDS** (keeping within free 750 hrs/month `db.t3.micro`/`db.t4g.micro`).
3. **EC2 Instance**: `t2.micro` or `t3.micro`.
4. **AWS Budget**: Configured at $0.01 threshold with email alerts.
5. **Meaningful CloudWatch Alarm**: Configured on EC2 CPU utilization or RDS storage/connections with SNS notification.
