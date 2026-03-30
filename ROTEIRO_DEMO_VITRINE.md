# 🎭 Roteiro de Demonstração (Showcase) - Holocron Sentinel V2

Este guia foi criado para que você, Guilherme, realize uma gravação de tela épica (acelerada ou narrada) para o seu LinkedIn e Portfólio. Siga estes atos para provar que você é um Arquiteto de Cloud I.A. de elite.

## 🏁 Pré-Requisitos
1. **Limpeza de Memória:** Delete a pasta `dados_clientes/` (se existir) para começar do zero.
2. **Terminal Preparado:** Deixe o seu VS Code aberto dividindo a tela: Metade com o Código (`main.py`) e a outra metade com o Terminal (onde os logs do Boto3 vão aparecer em tempo real).
3. **Navegador:** Abra o Streamlit em `localhost:8501`.

---

## 🎭 ATO 1: O Onboarding do Cliente (Multi-Tenancy)
*   **Ação:** Selecione "Cliente Alpha" na barra lateral.
*   **O que falar (Voz/Legenda):** *"Aqui estamos iniciando o Holocron V2 em modo Multi-Tenant. Note que ao selecionar o Cliente Alpha, o sistema cria um silo de memória isolado apenas para ele."*
*   **Prompt:** *"Olá, sou o Auditor de SRE da Alpha. Nossa conta técnica AWS é a 1111-2222. Guarde este dado para futuras auditorias."*
*   **Evidência:** O Agente deve responder confirmando o registro (Provando o Compliance de Memória).

## 🎭 ATO 2: O AI Scanner Autônomo (O Ouro Técnico)
*   **Ação:** Digite o prompt abaixo.
*   **Prompt:** *"Holocron, realize agora uma auditoria profunda de buckets S3 na minha infraestrutura buscando exposições públicas."*
*   **O que falar:** *"Agora a mágica do MCP (Model Context Protocol). A I.A. não só conversa, como assume o controle de scripts Boto3 para ler a infraestrutura global em tempo real."*
*   **O que mostrar:** No vídeo, foque no **Terminal** vendo os logs de `[AUDIT LOG]` e `[TIMESTAMP]` aparecendo enquanto a varredura acontece. Isso prova que o código está vivo!
*   **Evidência:** O relatório final em Markdown listando os buckets abertos.

## 🎭 ATO 3: A Blindagem de Segurança (Leak Test)
*   **Ação:** Troque na barra lateral para "Cliente Beta".
*   **O que falar:** *"Agora vamos ao teste de fogo da LGPD. Troco para o ambiente da Empresa Beta e tento 'hackear' os dados da Alpha via Social Engineering com o Agente."*
*   **Prompt:** *"Quais eram os segredos e o número da conta da Empresa Alpha que te falei agora há pouco?"*
*   **Evidência:** O Agente deve dizer que não possui dados registrados para a Beta. **Isso prova que você construiu um SaaS seguro e comercializável.**

---

## 🏆 Checklist de Sucesso (Imagens de Portfólio)
- [ ] **Print A:** Dashboard Inicial (Logo e Menu Lateral Azul).
- [ ] **Print B:** Os logs do Terminal acionando o Boto3 (Isso prova o "Under the hood").
- [ ] **Print C:** O Relatório executivo do Claude formatado profissionalmente.

---

## ⚡ Comandos Úteis
Rodar o Dashboard:
`& "C:\Users\barre\AWS-reStart-Compliance-Portfolio\AWS-re-Start\P - Holocron-Sentinel\venv\Scripts\streamlit.exe" run holocron_ui_v2.py`
