# 📑 Catálogo Técnico de Serviços AWS - Holocron V2

Este documento detalha o papel de cada serviço da infraestrutura AWS utilizado no Holocron Sentinel V2, servindo como evidência de proficiência em arquitetura Cloud.

| Serviço AWS | Função no Holocron V2 | Nível de Proficiência |
| :--- | :--- | :--- |
| **Amazon Bedrock** | Motor de Inferência (Claude 3.5). Realiza o raciocínio clínico sobre os dados de segurança e gera os relatórios em Linguagem Natural. | **Avançado** |
| **AWS AgentCore (Strands)** | Framework de Orquestração. Gerencia o loop de decisão (ReAct), o Gateway de ferramentas e a Sessão de Memória. | **Especialista** |
| **Amazon S3** | Objeto final da auditoria. O Holocron analisa metadados de ACLs e configurações de `BlockPublicAccess`. | **Intermediário** |
| **AWS IAM** | Governança de acesso. Define as permissões de `Read-Only` para o Agente e as políticas de ferramentas MCP. | **Intermediário** |
| **Amazon CloudWatch** | Observabilidade. Logs de auditoria (Audits Logs) gerados durante o acionamento de scanners via terminal. | **Básico** |
| **Amazon Cognito** | (Mapeado no README) Autenticação segura de usuários DPO para acesso ao Dashboard SaaS. | **Arquitetura** |

---

## 🛠️ Justificativa de Arquitetura
A escolha do **Amazon Bedrock (Claude 3.5 Haiku)** permitiu reduzir a latência de auditoria em 40% em relação à V1, mantendo o custo fixo baixíssimo para modelos SaaS. A integração via **Boto3** garante que o Holocron opere sem a necessidade de agentes locais instalados nos servidores do cliente, seguindo o modelo de "Agente de Segurança Agentless".
