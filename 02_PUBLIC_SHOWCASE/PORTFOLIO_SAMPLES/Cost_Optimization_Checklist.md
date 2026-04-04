# 💰 Relatório de Corte de Custos (FinOps for SMBs)
## Cliente: [DADOS_ANIONIMOS_EXEMPLO] | Score de Eficiência: 64%
### Auditor: Guilherme Gomes (AWS Certified Cloud Practitioner)

---

## 1. Oportunidades de Economia (Savings Plans)

| Recurso | Estado Atual | Ação Sugerida | Estimativa de Economia (Mensal) |
| :--- | :--- | :--- | :--- |
| **Volumes EBS (Root)** | GP2 (Antigo) | Migrar para **GP3** (Maior performance, 20% mais barato). | $ 45.00 |
| **Instâncias EC2** | On-Demand (T3.large) | Trocar por **Instâncias Reservadas (RI)** de 1 ano. | $ 120.00 |
| **Endereços IP Elásticos** | Ociosos (Unassociated) | Liberar IPs não utilizados. | $ 15.00 |
| **Snapshots Antigos** | > 365 dias (S3 Standard) | Migrar para **S3 Glacier Deep Archive**. | $ 80.00 |

---

## 2. Análise de "Bill Shock"
Identificamos um pico de custos em `us-east-1` devido a transferência de dados (Data Egress) excessiva em buckets S3 sem **CloudFront**.
*   **Solução:** Implementar CloudFront Caching para reduzir o tráfego direto de rede e economizar na transferência de dados para a internet.

---

## 3. Planejamento Estratégico (AWS CCP Level)
*   **Ação Final:** Ativar o **AWS Cost Explorer** e o **AWS Budget Alerts** com limite de 10% do orçamento mensal para evitar surpresas no cartão de crédito.

---
*Gerado automaticamente pelo Agente FinOps Sentinel.*
