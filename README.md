# 🛡️ Holocron Sentinel Startup V2
**DPO Autônomo e Auditor de Cibersegurança Multi-Tenant para Nuvem AWS.**

![Status](https://img.shields.io/badge/Status-Vers%C3%A3o%202.0%20(Enterprise)-green)
![AWS](https://img.shields.io/badge/AWS-Bedrock%20AgentCore-FF9900)
![Python](https://img.shields.io/badge/Python-3.12-blue)
![Strands](https://img.shields.io/badge/Strands-AgentCore-darkred)

## 📋 Sobre o Produto
O **Holocron Sentinel V2** é a evolução oficial da ferramenta de auditoria de linha de comando. Construída sobre a arquitetura AgentCore da AWS (usando Modelos Claude 3.5 Anthropic), o V2 atua como um SaaS (Software-as-a-Service) Multi-Tenant. 
Sua missão primária é gerenciar múltiplos ambientes AWS em conformidade com a LGPD e realizar varreduras em tempo real, mantendo um histórico auditável isolado para cada cliente.

## 🚀 Funcionalidades Chave (Arquitetura)
1. **Governança Multi-Tenant Corporativa:**
   - Silos de memória persistente baseados em `FileSessionManager` local.
   - Proteção Ativa contra vazamentos inter-sistemas corporativos (Data Leak Block implementado na raiz do Cérebro do Agente).
2. **Scanner Ativo (Ferramentas MCP via Boto3):**
   - **Módulo Scanner S3:** O Agente usa suas "Ferramentas" para realizar requests na infraestrutura AWS em modo de leitura (Read-Only) investigando o status do "Block Public Access".
3. **Console Executivo Dashboard (Streamlit):**
   - Interface imersiva construída para Administradores de Segurança e DPOs gerarem Relacionatórios Críticos formatados visualmente.

## 🔑 Instalação para Recrutadores (Execução Local)

*O V2 utiliza bibliotecas avançadas do ecossistema Strands AgentCore.*

```powershell
# Instalar Dependências
pip install -r requirements.txt

# Inicializar o Painel DPO Multi-Tenant
streamlit run holocron_ui_v2.py
```

## 🏗️ Autor e Arquitetura
Desenvolvido por **Guilherme Barreto**, focado em Cloud Security, Práticas LGPD e Integrações de IA via AWS Bedrock (Compliance Portfolio 2026).
