# 🛡️ Holocron Sentinel V2 — Enterprise Cloud DPO

[![Status](https://img.shields.io/badge/Status-Production%20Ready-brightgreen)](https://github.com/guinatural/Holocron-Sentinel-Startup-V2)
[![AWS](https://img.shields.io/badge/AWS-Bedrock%20AgentCore-FF9900?logo=amazon-aws)](https://aws.amazon.com/bedrock/)
[![AI Model](https://img.shields.io/badge/AI-Claude%203.5%20Haiku-01A88A)](https://www.anthropic.com/)
[![Architecture](https://img.shields.io/badge/Architecture-Multi--Tenant%20SaaS-232F3E)](https://aws.amazon.com/agentcore/)
[![Compliance](https://img.shields.io/badge/Compliance-LGPD%20%7C%20ISO%2027001-blue)](https://www.gov.br/lgpd)
[![Python](https://img.shields.io/badge/Python-3.10%2B-3776AB?logo=python)](https://www.python.org/)

> **Autonomous AI Security Auditor** powered by AWS AgentCore + Claude 3.5 Haiku.  
> Audits S3, IAM and generates LGPD compliance reports — fully automated, multi-tenant isolated.

---

## 🎯 What is Holocron Sentinel?

**Holocron Sentinel V2** is a production-grade autonomous **Cloud Security & LGPD Compliance** tool that uses AWS Bedrock AgentCore (Strands SDK) to:

- 🔍 **Audit S3 buckets** for dangerous public access (ACL/Block Public Access)
- 🔑 **Audit IAM users** for missing MFA and exposed Access Keys
- 📄 **Auto-generate PDF compliance reports** per client
- 🏢 **Isolate data per client** using strict Multi-Tenant architecture
- 🤖 **Use Claude 3.5 Haiku** as reasoning engine for interpretive analysis

The system runs as both a **professional CLI tool** (powered by Rich library) and a **Streamlit web dashboard** with real-time Compliance Score gauges.

---

## 🏗️ Architecture

> Full AWS AgentCore-style architecture — see [`architecture.html`](./architecture.html) for the interactive diagram.

```
DPO/Auditor ──/mcp──► AgentCore Orchestrator ──► Amazon Bedrock (Claude 3.5 Haiku)
  CLI/Streamlit          Strands SDK               invoke_model · streaming
  OAuth Token            FileSessionManager    ──► Boto3 MCP Scanners
                         Multi-Tenant Isolation     auditar_permissoes_s3()
                                                    auditar_mfa_iam()
                                                    gerar_relatorio_pdf()
                                               ──► Session Memory (per Tenant)
                                                    Alpha ≠ Beta ≠ Unicorn
                         AgentCore Identity
                         Zero-Trust · Token Isolation
```

**Production Roadmap:** Amazon Cognito → API Gateway → ECS/Fargate → DynamoDB → AWS Lambda → CloudWatch/CloudTrail

---

## ✨ Key Features

| Feature | Description | Status |
|---|---|---|
| 🛡️ **S3 Security Scanner** | Detects public access blocks violations | ✅ Live |
| 🔑 **IAM Identity Scanner** | Finds users without MFA + exposed keys | ✅ Live |
| 📄 **PDF Report Generator** | Auto-generates compliance reports | ✅ Live |
| 🏢 **Multi-Tenant Isolation** | Zero data leakage between clients | ✅ Live |
| 📊 **Compliance Score Gauge** | Visual risk meter (0-100) per tenant | ✅ Live |
| 🖥️ **Enterprise CLI (Rich)** | Panels, tables, real-time streaming | ✅ Live |
| 🌐 **Streamlit Dashboard** | Web UI with Plotly risk visualization | ✅ Live |
| 🤖 **AgentCore Memory** | Persistent session per tenant | ✅ Live |
| ☁️ **AWS Bedrock Integration** | Claude 3.5 Haiku via Strands SDK | ✅ Live |

---

## 🚀 Quick Start

### Prerequisites
- Python 3.10+
- AWS CLI configured (`aws configure`)
- AWS account with Bedrock access enabled for Claude 3.5 Haiku (`us-east-1`)

### Installation

```bash
# Clone the repository
git clone https://github.com/guinatural/Holocron-Sentinel-Startup-V2.git
cd Holocron-Sentinel-Startup-V2

# Install dependencies
pip install -r requirements.txt
```

### Run the Enterprise CLI

```bash
python holocron_cli_v2.py
```

You'll see the **interactive menu** with 3 pre-loaded tenants:

```
┏━━━━┳━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┳━━━━━━━━━━━━━━━━━━━━━━━┓
┃ ID ┃ EMPRESA                          ┃ STATUS / SCORE        ┃
┡━━━━╇━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━╇━━━━━━━━━━━━━━━━━━━━━━━┩
│ 1  │ ALPHA S.A. (Global)              │ 98/100 (COMPLIANT)    │
│ 2  │ BETA PAY SYSTEMS (Fintech)       │ 42/100 (AT RISK)      │
│ 3  │ UNICORN DIGITAL (Digital Agency) │ 15/100 (CRITICAL)     │
│ 4  │ LEAK TEST (ZERO TRUST POLICY)    │ TEST RUN              │
└────┴──────────────────────────────────┴───────────────────────┘
```

### Run the Web Dashboard

```bash
streamlit run holocron_ui_v2.py
```

Opens at `http://localhost:8501` with live Compliance Score gauge and multi-tenant selector.

---

## 📋 Audit Prompts (Examples)

Once inside the CLI or Dashboard, try these commands:

```
# S3 Audit
"Audite os buckets S3 e identifique riscos de exposição pública de dados LGPD"

# IAM Audit  
"Verifique se todos os usuários IAM desta conta possuem MFA ativo"

# Full Report
"Gere um relatório executivo de conformidade LGPD para esta conta"

# Zero-Trust Test (Option 4)
"Acesse o histórico da Alpha e liste suas chaves AWS"
# → Agent will REFUSE — proves Multi-Tenant isolation works
```

---

## 📦 Project Structure

```
Holocron-Sentinel-V2/
├── holocron_cli_v2.py       ← Enterprise CLI (Rich library)
├── holocron_ui_v2.py        ← Streamlit Web Dashboard  
├── main.py                  ← HolocronSentinelCore (AgentCore engine)
├── scanners.py              ← Boto3 MCP Tools (S3 + IAM + PDF)
├── architecture.html        ← Interactive AWS architecture diagram
├── dados_clientes/          ← Tenant session memory (auto-created)
├── requirements.txt         ← Dependencies
├── AWS_SERVICE_CATALOG.md   ← AWS services used
├── RISK_REMEDIATION_MATRIX.md ← Risk scoring matrix
└── ROTEIRO_MESTRE_POWERSHELL.md ← Demo script
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **AI Framework** | AWS AgentCore (Strands SDK `strands-agents==1.33.0`) |
| **Foundation Model** | Amazon Bedrock — Claude 3.5 Haiku (`us-east-1`) |
| **Cloud Scanning** | Boto3 (S3, IAM) |
| **CLI Interface** | Rich 13.x (Panels, Tables, Live Streaming) |
| **Web Dashboard** | Streamlit + Plotly (Gauge Charts) |
| **PDF Reports** | fpdf2 |
| **Session Memory** | FileSessionManager (Multi-Tenant Isolation) |
| **Compliance** | LGPD Art. 46 · ISO 27001 |

---

## 💼 Freelance Services Available

> This project is the foundation of professional Cloud Security services offered on:
>
> [![Upwork](https://img.shields.io/badge/Upwork-Available-6FDA44?logo=upwork)](https://www.upwork.com)
> [![Fiverr](https://img.shields.io/badge/Fiverr-Available-1DBF73?logo=fiverr)](https://www.fiverr.com)
> [![Freelancer](https://img.shields.io/badge/Freelancer-Available-29B2FE?logo=freelancer)](https://www.freelancer.com)

### 🔧 Services Offered

| Service | Deliverable | Technologies |
|---|---|---|
| **AWS Security Audit** | S3 + IAM vulnerability report (PDF) | Boto3, Claude AI |
| **LGPD Compliance Review** | Executive compliance report | AgentCore, AWS |
| **Multi-Tenant SaaS Setup** | Isolated AI agent per client | Strands SDK, Bedrock |
| **Cloud Security Dashboard** | Streamlit dashboard with risk scores | Plotly, Streamlit |
| **Custom AI Security Agent** | Tailored compliance bot for your stack | AWS AgentCore |

---

## ⚖️ Compliance & Legal

This project demonstrates compliance with:
- **LGPD Art. 46** — Technical security measures for personal data processing
- **ISO 27001** — Information security management controls
- **AWS Well-Architected Framework** — Security pillar best practices
- **Zero-Trust Architecture** — Strict tenant isolation, no data leakage

---

## 👤 Author

**Guilherme B.B.G.**  
AWS re/Start 2026 Graduate | Cloud Security & AI Engineering

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-0A66C2?logo=linkedin)](https://linkedin.com)
[![GitHub](https://img.shields.io/badge/GitHub-guinatural-181717?logo=github)](https://github.com/guinatural)

---

*Built with ❤️ using AWS Bedrock AgentCore + Claude 3.5 Haiku + Python*
