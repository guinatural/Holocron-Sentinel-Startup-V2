# Wayfinder Cloud - Projeto IA + AWS

## 📌 Descrição

Wayfinder Cloud é uma solução inteligente de navegação baseada em **AWS Cloud** com componentes de **IA/ML** para processamento de rotas otimizadas.

## 🏗️ Arquitetura

```
┌─────────────────────────────────────────────────────────────┐
│                    Client Layer (Web/Mobile)                │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────┴──────────────────────────────────┐
│              API Gateway (CloudFront CDN)                   │
└──────────────────────────┬──────────────────────────────────┘
                           │
    ┌──────────────────────┼──────────────────────┐
    │                      │                      │
    ▼                      ▼                      ▼
┌─────────────┐    ┌──────────────┐    ┌───────────────┐
│  Lambda     │    │  EC2 Compute │    │  SageMaker ML │
│  (Routes)   │    │  (Processing)│    │  (Route Opt)  │
└─────────────┘    └──────────────┘    └───────────────┘
    │                      │                      │
    └──────────────────────┼──────────────────────┘
                           │
                ┌──────────┴──────────┐
                │                     │
                ▼                     ▼
          ┌──────────────┐    ┌──────────────┐
          │   RDS Aurora │    │  DynamoDB    │
          │  (Metadata)  │    │  (Cache)     │
          └──────────────┘    └──────────────┘
```

## 🔧 Stack Técnico

- **Frontend**: React 18 + TypeScript + Mapbox GL
- **Backend**: Node.js + Express + TypeScript
- **Cloud**: AWS (EC2, Lambda, RDS Aurora, DynamoDB, SageMaker)
- **AI/ML**: SageMaker Endpoints para otimização de rotas
- **DevOps**: Docker, Terraform, GitHub Actions
- **Database**: PostgreSQL (Aurora RDS) + Redis Cache
- **Monitoring**: CloudWatch + X-Ray

## 📊 Labs Relacionados

- [x] EC2 Setup & Security Groups
- [x] RDS Aurora Configuration
- [x] Lambda + API Gateway Integration
- [x] SageMaker Model Training
- [x] CloudFront CDN Distribution
- [x] VPC Networking & NAT Gateway
- [x] IAM Policies & Roles (Least Privilege)

## 🚀 Deploy

```bash
# Desenvolvimento
npm install
npm run dev

# Staging (AWS)
terraform plan -var-file=staging.tfvars
terraform apply -var-file=staging.tfvars

# Produção (Multi-region)
aws s3 sync dist/ s3://wayfinder-prod-bucket/
aws cloudfront create-invalidation --id E27A3B5K8N7Z2 --paths "/*"
```

## 📈 Status

- **Versão**: 2.1.0
- **Status**: Produção (com melhorias contínuas)
- **Última atualização**: Setembro 2026
- **Performance**: 95ms p99 latency, 99.95% uptime

## 🔐 Conformidade

- ✅ OWASP Top 10 mitigations
- ✅ AIF Compliance (AWS Internal Framework)
- ✅ Data encryption in transit & at rest
- ✅ Regular security audits

---

**Desenvolvido por**: Guilherme Barreto  
**Mantido em**: GitHub + AWS CodePipeline
