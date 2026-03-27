# 🛡️ Holocron Sentinel Startup V2
**DPO Autônomo e Auditor de Cibersegurança Multi-Tenant para AWS**

![Status](https://img.shields.io/badge/Status-MVP%20Corporativo-green)
![Strands](https://img.shields.io/badge/Framework-AWS%20AgentCore-FF9900)
![Auth](https://img.shields.io/badge/Architecture-Multi--Tenant-blue)

O **Holocron Sentinel V2** é um projeto proprietário que eleva ferramentas tradicionais de linha de comando para o nível SaaS (Software-as-a-Service). Reescrito inteiramente sob a moderna arquitetura *AgentCore* da AWS, ele atua como um DPO (Data Protection Officer) Virtual Autônomo. 

Sua principal inovação é utilizar a inteligência do **Claude 3.5**, equipando a IA com "Mãos Reais" (Ferramentas Boto3/MCP) para analisar a postura de segurança (S3, IAM) em múltiplas contas AWS corporativas simultaneamente, garantindo isolamento total por cliente de acordo com a LGPD e prevenindo vazamento cruzado (*Data Leakage Block*).

---

## 🏗️ Arquitetura do Sistema

O diagrama abaixo detalha o fluxo de decisão assíncrono projetado:

```mermaid
graph TD;
    Admin["DPO / Security Admin"] -->|"Interface: Prompt de Auditoria"| UI("Streamlit Dashboard V2");
    
    subgraph "⚙️ Controlador AgentCore"
        UI -->|"Autenticação de Inquilino"| Core{"Holocron Sentinel Core"};
        Core -->|"Silo de Empresa A"| MemA[("FileSessionManager: Tenant A")];
        Core -->|"Silo de Empresa B"| MemB[("FileSessionManager: Tenant B")];
    end
    
    subgraph "🤖 IA Governamental e Raciocínio"
        Core <-->|"Raciocínio & Decisão Logica"| Bedrock["AWS Bedrock: Claude 3.5"];
        Bedrock -.->|"Acionamento Autônomo de Ferramenta"| MCP["Scanners Boto3 API"];
    end
    
    subgraph "☁️ AWS Infrastrutura do Cliente"
        MCP -->|"Block Public Access Auditing"| AWS_S3[("Amazon S3 (Buckets)")];
        MCP -->|"Role & Policy Auditing"| AWS_IAM["Amazon IAM"];
    end

    style Admin fill:#112240,stroke:#64ffda,stroke-width:2px,color:#fff
    style Core fill:#0a192f,stroke:#00d2ff,stroke-width:2px,color:#fff
    style Bedrock fill:#ff9900,stroke:#333,stroke-width:2px,color:#fff
```

## 🚀 Diferenciais de Mercado (Business Value)
1. **🛡️ Governança Criptográfica Multi-Tenant:** O sistema isola memórias localmente. Se o "Cliente Alfa" solicitar varreduras secretas, o Histórico do "Cliente Beta" sequer pode ser acessado em ataques de injeção de prompt no Agente (Anti-Espionagem Ativa).
2. **🤖 Agência Ativa:** A IA não responde apenas dúvidas da ISO 27001 em prosa. Ela assume o controle do Terminal, chama os Scanners de Vulnerabilidade Boto3 de forma autônoma e devolve relatórios executivos de correção.
3. **📊 Conformidade LGPD Implacável:** Mapeia ACLs perigosas atuando no pilar Preventivo imposto pela legislação brasileira para startups parceiras.

---

## 📸 Evidências Visuais e Execução
🛠️ *[Área reservada para demonstrações prontas do produto (Em Breve)]*
- ✔️ **Print 1:** Identificação Autônoma de Buckets Abertos
- ✔️ **Print 2:** Dashboard Multi-Tenant e Proteção Anti-Vazamento (Hack Test)

## 💻 Instalação Rápida
```bash
# Clone the repository
git clone https://github.com/guinatural/Holocron-Sentinel-Startup-V2.git
cd Holocron-Sentinel-V2

# Instalar Core
pip install -r requirements.txt

# Subir Arquitetura Dashboard na porta local
streamlit run holocron_ui_v2.py
```
