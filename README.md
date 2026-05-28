# ✦ ResumeATS — ATS Resume Checker

A full-stack, production-ready ATS (Applicant Tracking System) resume scoring platform built with **Java Spring Boot**, **React**, **Google Gemini AI**, and deployed on **AWS**.

---

## 🚀 Features

- 📄 **Multi-format support** — PDF, DOCX, DOC, ODT, TXT, RTF
- 🎯 **7-category ATS scoring** — Keywords, Contact, Sections, Bullets, Action Verbs, Quantified Results, Readability
- 🤖 **Google Gemini AI Report** — Strengths, Weaknesses, Missing Keywords, Rewrite Suggestions
- 👤 **Multi-user accounts** — JWT authentication, personal scan history
- ☁️ **AWS S3** — Secure resume storage with pre-signed URLs
- 🐳 **Docker** — Local dev with Docker Compose, production on AWS ECS

---

## 🏃 Quick Start (Local Development)

### Prerequisites
- Java 21+
- Node.js 18+
- Docker Desktop
- PostgreSQL (or use Docker)

### Step 1 — Set up environment variables

```bash
cp .env.example .env
# Edit .env and fill in your keys (see below)
```

### Step 2 — Run with Docker Compose

```bash
docker-compose up --build
```

App will be available at:
- **Frontend**: http://localhost:80
- **Backend API**: http://localhost:8080

---

## 🔑 Required API Keys

### 1. AWS Keys (for S3)
1. Log in to [AWS Console](https://console.aws.amazon.com/)
2. Go to **IAM** → Create user with `AmazonS3FullAccess`
3. Create access key → copy `AWS_ACCESS_KEY_ID` and `AWS_SECRET_ACCESS_KEY`
4. Create an S3 bucket → paste name as `AWS_S3_BUCKET`
5. Set `AWS_REGION` (e.g. `us-east-1`)

### 2. JWT Secret
Generate a strong random string (64+ characters):
```bash
# PowerShell
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 64 | ForEach-Object {[char]$_})
```

---

## 🔧 Run Without Docker (Dev Mode)

### Backend
```bash
cd backend
# Set environment variables or add to application.yml
mvn spring-boot:run
```

### Frontend
```bash
cd frontend
npm install
npm run dev
# Open http://localhost:5173
```

---

## ☁️ AWS Production Deployment

### Architecture
```
CloudFront CDN
      │
      ├── S3 Static Hosting (React frontend)
      │
      └── Application Load Balancer
                │
                └── ECS Fargate (Spring Boot backend)
                          │
                          └── RDS PostgreSQL
                          └── S3 Bucket (resume files)
```

### Steps
1. **Push to GitHub** — CI/CD runs automatically on `main` branch
2. **Set GitHub Secrets**: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`
3. **Create ECR repositories**: `ats-resume-checker-backend`, `ats-resume-checker-frontend`
4. **Create ECS Cluster**: `ats-resume-checker`
5. **Create ECS Services**: `ats-backend`, `ats-frontend` using the ECR images
6. **Create RDS PostgreSQL** instance and update env vars
7. **Set Task Definition env vars** from AWS Secrets Manager

---

## 📁 Project Structure

```
ats-resume-checker/
├── backend/                   ← Java Spring Boot
│   ├── src/main/java/com/atscheck/
│   │   ├── config/            ← Security, JWT, AWS
│   │   ├── controller/        ← Auth, Resume, History
│   │   ├── service/           ← Parser, ATS Engine, Gemini, S3
│   │   ├── model/             ← JPA Entities + DTOs
│   │   └── repository/        ← JPA Repositories
│   └── Dockerfile
│
├── frontend/                  ← React + Vite
│   ├── src/
│   │   ├── pages/             ← Landing, Login, Register, Dashboard, Analyze, Report
│   │   ├── context/           ← AuthContext
│   │   └── api/               ← Axios client
│   ├── nginx.conf
│   └── Dockerfile
│
├── .github/workflows/
│   └── deploy.yml             ← GitHub Actions CI/CD → AWS ECS
├── docker-compose.yml
├── .env.example
└── README.md
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| Backend | Java 21, Spring Boot 3.2 |
| Auth | Spring Security + JWT |
| Database | PostgreSQL + Spring Data JPA |
| File Parsing | Apache Tika (all formats) |
| AI Reports | Google Gemini 1.5 Pro |
| File Storage | AWS S3 |
| Frontend | React 18 + Vite 4 |
| Deployment | Docker, AWS ECS + RDS + S3 + CloudFront |
| CI/CD | GitHub Actions → ECR → ECS |

---

## 📊 ATS Scoring Categories

| Category | Weight |
|---|---|
| Keyword Match (vs Job Description) | 30% |
| Quantified Achievements | 15% |
| Section Headings | 15% |
| Contact Information | 10% |
| Readability | 10% |
| Bullet Point Usage | 10% |
| Action Verbs | 10% |
