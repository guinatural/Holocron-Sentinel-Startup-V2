# Wayfinder Cloud Governance - Guia Rápido

## 🎯 O que é?

Wayfinder Cloud Governance é uma plataforma serverless que monitora continuamente recursos AWS para detectar violações de política de segurança e remediá-las automaticamente.

## 📋 Conteúdo da Documentação

### 1. **[README.md](./README.md)**
   - Visão geral do projeto
   - Features principais
   - Quick start
   - Estrutura de diretórios

### 2. **[docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)**
   - Arquitetura completa do sistema
   - Diagrama de fluxo
   - Descrição de componentes
   - Schema de eventos
   - Considerações de segurança
   - Métricas de performance

### 3. **[docs/DEPLOYMENT.md](./docs/DEPLOYMENT.md)**
   - Guia passo-a-passo de deployment
   - Configuração local e testes
   - Deploy com Terraform
   - Configuração de notificações
   - Troubleshooting
   - Maintenance

## 🏗️ Estrutura do Projeto

```
wayfinder-cloud/
├── src/
│   ├── detectors/        # Detectores de violações
│   │   ├── s3-detector.js
│   │   ├── rds-detector.js
│   │   └── iam-detector.js
│   ├── remediators/      # Remediadores automáticos
│   │   ├── s3-remediator.js
│   │   ├── rds-remediator.js
│   │   └── iam-remediator.js
│   ├── utils/            # Utilitários e helpers
│   │   ├── logger.js
│   │   ├── eventBridge.js
│   │   └── validators.js
│   ├── tests/            # Testes Jest
│   │   ├── detectors.test.js
│   │   ├── remediators.test.js
│   │   └── validators.test.js
│   └── index.js          # Entrada principal
├── terraform/            # Infraestrutura como código
│   ├── main.tf
│   ├── lambda.tf
│   ├── eventbridge.tf
│   ├── dynamodb.tf
│   └── variables.tf
├── docs/                 # Documentação
│   ├── ARCHITECTURE.md
│   └── DEPLOYMENT.md
├── package.json
├── jest.config.js
├── docker-compose.yml
├── Dockerfile
├── README.md
└── .env.example
```

## 🚀 Quick Start

### Desenvolvimento Local

```bash
# Instalar dependências
npm install

# Rodar testes
npm test

# Rodar em desenvolvimento (dry-run)
npm run dev
```

### Deployment em AWS

```bash
# Configurar variáveis
cd terraform
cp terraform.tfvars.example terraform.tfvars
# Editar terraform.tfvars

# Deploy
terraform init
terraform plan
terraform apply
```

## 🔍 Detectors Disponíveis

### S3
- ✓ Criptografia (AES256, KMS)
- ✓ Public access block
- ✓ Versionamento
- ✓ Logging

### RDS
- ✓ Criptografia armazenamento
- ✓ Backup automático
- ✓ Período de retenção
- ✓ Multi-AZ

### IAM
- ✓ MFA obrigatório
- ✓ Idade de access keys
- ✓ Políticas admin
- ✓ Uso de root

## 🔧 Remediadores Automáticos

### S3 Remediator
- Habilita criptografia padrão
- Bloqueia acesso público
- Ativa versionamento

### RDS Remediator
- Habilita backups automáticos
- Configura período de retenção
- Ativa Multi-AZ

### IAM Remediator
- Desativa access keys antigas
- Relata requisitos de MFA
- Sugere remoção de políticas admin

## 📊 Fluxo de Execução

```
EventBridge Schedule
        ↓
   Lambda Function
        ↓
   ┌───┴───┬───┴────┐
   ↓       ↓        ↓
  S3     RDS      IAM
Detector Detector Detector
   ↓       ↓        ↓
   └───┬───┴───┬────┘
       ↓       ↓
  Publish   Remediate
  Events    (if enabled)
       ↓
   DynamoDB
   EventBridge
   SNS Alerts
```

## 🔐 Segurança

- **IAM Roles**: Permissões mínimas necessárias
- **Audit Trail**: DynamoDB registra todas ações
- **Dry Run**: Modo teste antes de remediação real
- **CloudTrail**: Integração com AWS CloudTrail
- **Encryption**: Dados criptografados em repouso

## 📈 Monitoramento

- **CloudWatch Logs**: Logs estruturados de todas execuções
- **EventBridge**: Captura eventos de violação
- **SNS**: Alertas por email para violações críticas
- **DynamoDB Streams**: Rastreamento de mudanças
- **Métricas**: Invocações, erros, latência

## 💰 Custos Estimados

Ambiente pequeno (< 100 buckets S3, < 50 instâncias RDS, < 50 usuários IAM):

- **Lambda**: $0.20/mês (10,000 invocações/mês)
- **DynamoDB**: $5-10/mês (on-demand)
- **EventBridge**: $1/mês (eventos)
- **CloudWatch Logs**: $5/mês
- **SNS**: $0.50/mês
- **Total**: ~$12-17/mês

## 🛠️ Troubleshooting Rápido

### Lambda não executa
```bash
# Verificar rule do EventBridge
aws events describe-rule --name wayfinder-governance-schedule

# Verificar targets
aws events list-targets-by-rule --rule wayfinder-governance-schedule
```

### Sem permissões
```bash
# Verificar role policy
aws iam get-role-policy --role-name wayfinder-lambda-execution-role \
  --policy-name wayfinder-lambda-policy
```

### Violações não detectadas
```bash
# Verificar logs Lambda
aws logs tail /aws/lambda/wayfinder-governance --follow

# Verificar eventos DynamoDB
aws dynamodb scan --table-name wayfinder-governance-events --limit 5
```

## 📚 Recursos Adicionais

- [AWS Lambda Docs](https://docs.aws.amazon.com/lambda/)
- [AWS EventBridge Docs](https://docs.aws.amazon.com/eventbridge/)
- [AWS DynamoDB Docs](https://docs.aws.amazon.com/dynamodb/)
- [Terraform AWS Provider](https://registry.terraform.io/providers/hashicorp/aws/latest)
- [AWS SDK for JavaScript](https://docs.aws.amazon.com/sdk-for-javascript/)

## 🤝 Contribuindo

1. Criar branch feature (`git checkout -b feature/minha-feature`)
2. Fazer commits (`git commit -am 'Add minha-feature'`)
3. Push para branch (`git push origin feature/minha-feature`)
4. Abrir Pull Request

## 📝 Licença

MIT

## 📞 Suporte

Problemas? Consulte:
1. docs/ARCHITECTURE.md - Para entender o sistema
2. docs/DEPLOYMENT.md - Para problemas de deploy
3. Logs CloudWatch - Para erros de execução
4. DynamoDB audit trail - Para histórico de ações

---

**Última atualização**: 2024
**Versão**: 1.0.0
**Status**: Production Ready ✅
