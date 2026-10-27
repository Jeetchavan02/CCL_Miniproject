# Campus Lost & Found with AI-Assisted Item Matching (LostFound@CRCE)

**Institution:** Fr. Conceicao Rodrigues College of Engineering (Fr. CRCE), Bandra-West, Mumbai  
**Department:** Department of Computer Engineering  
**Course:** Cloud Computing Lab Mini-Project (CCL)  
**Evaluation Target:** 20 / 20 Marks (Excellence across R1–R5 Rubrics)  
**Live Cloud Deployment:** [http://44.204.123.67](http://44.204.123.67)

---

## 📌 Executive Summary & Problem Definition (R1)
Misplacing personal valuables (laptops, bags, official student IDs, earphones, calculators, watches) across college campus facilities—such as seminar halls, canteen tables, computer labs, and corridors—is a frequent issue. Traditional college lost-and-found systems rely on paper register notebooks or static notice boards, leading to delayed recoveries, lost property, and no automated matching.

**LostFound@CRCE** is a cloud-native platform featuring:
1. **Live Camera Capture & Direct S3 Upload**: Students/staff take live webcam snapshots of found items on campus, uploaded via secure presigned endpoints to Amazon S3.
2. **Computer Vision & Semantic AI Matching**: AWS Rekognition automatically extracts labels, object classifications, and visual features. A similarity engine compares them against reported lost valuables.
3. **Automated Alerts**: Real-time notifications dispatched via Amazon SNS to alert owners of high-confidence matches.
4. **Official Security Handover Desk**: Campus security officers inspect proof descriptions, verify student college identities, and authorize official property releases.

---

## 🏛️ Cloud Architecture & AWS Services (R2)

```text
[ Client Web Browser / Mobile ]
               │
        HTTP :80 (Reverse Proxy)
               ▼
┌─────────────────────────────────────────────────────────────┐
│ AWS EC2 (lostfound-app: 44.204.123.67)                      │
│                                                             │
│   ┌───────────────────────────┐  ┌────────────────────────┐ │
│   │ lostfound-frontend (Nginx)│  │ lostfound-backend      │ │
│   │ React 18 + Tailwind / Neo │  │ FastAPI + SQLAlchemy   │ │
│   └───────────────────────────┘  └────────────────────────┘ │
└──────────────┬───────────────────────────────┬──────────────┘
               │                               │
        Private VPC Subnet             IAM Instance Profile
               │                       (Least Privilege)
               ▼                               ▼
    ┌──────────────────────┐        ┌─────────────────────────┐
    │  Amazon RDS MySQL    │        │  Amazon S3 Bucket       │
    │  (lostfound-db)      │        │  Photos & Presigned URLs│
    │  Port 3306 Encrypted │        └─────────────────────────┘
    └──────────────────────┘                   │
                                               ▼
                                    ┌─────────────────────────┐
                                    │  Amazon Rekognition     │
                                    │  DetectLabels Vision AI │
                                    └─────────────────────────┘
                                               │
                                               ▼
                                    ┌─────────────────────────┐
                                    │  Amazon SNS Alerts      │
                                    │  lostfound-alerts       │
                                    └─────────────────────────┘
```

### AWS Cloud Components
- **Compute (Amazon EC2)**: `t3.small` / `t2.micro` running Amazon Linux 2023 with Docker Compose v2.24.5 orchestrating isolated frontend and backend containers.
- **Relational Database (Amazon RDS)**: Managed MySQL 8.4 engine (`lostfound-db`) residing in a private subnet with automated automated backups and SSL connection encryption.
- **Object Storage (Amazon S3)**: S3 bucket `lostfound-photos-ccl-miniproject` for photos with short-lived presigned URLs for least-privilege security.
- **AI Computer Vision (Amazon Rekognition)**: Automated feature detection (`DetectLabels`) analyzing snapshots to detect item categories, brands, and colors.
- **Messaging & Notifications (Amazon SNS)**: Topic `lostfound-alerts` triggering automated notification dispatches upon AI match computation.
- **Security & Parameter Management (AWS SSM & IAM)**: EC2 IAM Role with fine-grained policies for S3, Rekognition, and SNS. Secret database credentials and JWT keys stored securely via AWS Systems Manager Parameter Store.

---

## 🚀 Live Evaluation Credentials

The application provides dual-portal authentication:

| Portal | Access URL | User Email | Password | Role & Permissions |
| :--- | :--- | :--- | :--- | :--- |
| **Security Handover Desk** | [http://44.204.123.67/login](http://44.204.123.67/login) | `officer@college.edu` | `AdminPass123!` | Review claims, inspect proof, approve custody release |
| **Student Portal** | [http://44.204.123.67/login](http://44.204.123.67/login) | `student@college.edu` | `StudentPass123!` | Report lost items, camera capture, track matches, file claim |

---

## 💻 Local Development & Testing

### Prerequisites
- Node.js 18+
- Python 3.11+
- Docker & Docker Compose (optional for local container testing)

### Backend Setup
```bash
cd backend
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Frontend Setup
```bash
cd frontend
npm install
npm run dev
```

---

## 🔒 Security & Best Practices (R4)
- **Zero Hardcoded Secrets**: Secrets (JWT secret, DB password, AWS keys) are managed via `.env` and AWS Systems Manager Parameter Store.
- **Role-Based Access Control (RBAC)**: Distinct permissions for `student` vs. `security` officer roles with JWT Bearer authentication.
- **Least Privilege IAM**: EC2 instance profile scoped specifically to the project's S3 bucket, SNS topic, and Rekognition APIs.
- **Consistent Vector UI**: Clean SVG icon system (no emojis) adhering to Fr. CRCE high-contrast Neo-Brutalist brand identity.

---

## 👥 Authors
- **Jeet Chavan** (Computer Engineering, Fr. CRCE)
- **CCL Mini-Project Team**
