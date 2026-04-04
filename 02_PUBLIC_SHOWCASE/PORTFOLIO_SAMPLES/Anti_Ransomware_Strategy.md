# 🛡️ Guia de Resiliência: Backup Anti-Ransomware AWS
## Estratégia: S3 Object Lock & Glacier Vault Lock
### Consultor: Guilherme Gomes (AWS Certified Cloud Practitioner)

---

## 1. O Problema: Ransomware na Nuvem
Ataques de Ransomware modernos não apenas criptografam os dados locais, eles tentam invadir a conta da AWS para apagar os backups. Se o backup for apagável, a empresa está em risco total.

## 2. A Solução: Imutabilidade de Dados (WORM)
Implementamos uma arquitetura de "Write Once, Read Many" (WORM) utilizando as ferramentas nativas da AWS:

### ✅ S3 Object Lock (Compliance Mode)
*   **Ação:** Ativar o bloqueio por 30 ou 90 dias em buckets de backup crítico.
*   **Resultado:** Nem mesmo o usuário Root da conta consegue apagar os arquivos antes do prazo expirar.

### ✅ S3 Cross-Region Replication (CRR)
*   **Ação:** Replicar os dados automaticamente para uma região AWS diferente (Ex: `us-east-1` para `sa-east-1`).
*   **Resultado:** Sobrevivência contra desastres geográficos ou quedas regionais da AWS.

### ✅ Glacier Vault Lock
*   **Ação:** Trava de cofre em nível de conformidade legal.
*   **Resultado:** Auditoria permanente e impossibilidade de deleção maliciosa.

---

## 3. Checklist de Implementação (Serviço AWS CCP)
1.  Criar o Bucket de Backup.
2.  Ativar o Versionamento de Objetos.
3.  Configurar a Política de Ciclo de Vida (S3 Lifecycle).
4.  Aplicar a Trava de Objeto (Object Lock).

---
*Documento de estratégia para blindagem de infraestrutura crítica.*
