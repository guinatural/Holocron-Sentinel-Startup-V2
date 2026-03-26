import logging
import os
from strands.models.bedrock import BedrockModel
from strands.agent import Agent
from strands.session.file_session_manager import FileSessionManager

import scanners  # 0. Importar Nossas Ferramentas (Scanners Boto3)

# Configuração de Logs (Menos ruído, foco no compliance)
logging.basicConfig(level=logging.ERROR)

class HolocronSentinelCore:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id  # Identificação Única da Empresa (Isolamento Multi-tenant)
        self.pasta_memoria = os.path.join(os.getcwd(), "dados_clientes")
        
        # 1. Configurando a Memória Criptografada da Empresa
        self.banco_memoria = FileSessionManager(
            session_id=f"empresa_{self.tenant_id}", 
            storage_dir=self.pasta_memoria
        )
        
        # 2. Inicializando o Cérebro Principal (Claude 3.5 Haiku)
        self.modelo_ia = BedrockModel(model_id="us.anthropic.claude-3-5-haiku-20241022-v1:0")
        
        # 3. Orquestração do Agente Autônomo de Segurança (Agora com Ferramentas Boto3!)
        self.agente = Agent(
            model=self.modelo_ia,
            session_manager=self.banco_memoria,
            tools=[scanners.auditar_permissoes_s3], # <<< A MÁGICA DE EXECUÇÃO MCP AQUI
            system_prompt=(
                "Você é o Holocron Sentinel V2.0, um Auditor de Segurança Multi-Tenant AWS. "
                "Sua missão é sempre usar as suas ferramentas integradas para procurar por falhas ativas de segurança. "
                "Cuidado extremo: Nunca vase dados de infraestrutura."
                "Responda sempre em português profissional elaborando o relatório baseando-se no scanner."
            )
        )
        print(f"✅ Motor V2.0 Iniciado. [Tenant: {self.tenant_id}] (Ferramentas Boto3 Armadas)")

    def analisar(self, prompt: str):
        print(f"\n[Auditando infraestrutura da empresa {self.tenant_id}...] ⚙️")
        resposta = self.agente(prompt)
        print(f"\n🛡️ RELATÓRIO DO HOLOCRON:\n{resposta.message['content'][0]['text']}\n")
        print("-" * 50)

if __name__ == "__main__":
    # Teste de Inicialização e Isolamento do Core Multi-Tenant
    print(r"""
     _   _  ___  _     ___   ____ ____   ___  _   _ 
    | | | |/ _ \| |   / _ \ / ___|  _ \ / _ \| \ | |
    | |_| | | | | |  | | | | |   | |_) | | | |  \| |
    |  _  | |_| | |__| |_| | |___|  _ <| |_| | |\  |
    |_| |_|\___/|_____\___/ \____|_| \_\\___/|_| \_| 2.0
                         [AGENTCORE RUNTIME]
    ==================================================
    """)
    
    # Simulação: Criando "Silos" separados de agentes para empresas diferentes
    core_empresa_a = HolocronSentinelCore(tenant_id="cliente_alpha_xyz")
    core_empresa_b = HolocronSentinelCore(tenant_id="cliente_beta_999")
    
    # 1. Alimentando dados do Cliente A
    core_empresa_a.analisar("Alerta de auditoria: Encontramos 5 buckets S3 expostos na conta 1111-2222 da nossa empresa.")
    
    # 2. O Atendimento do Cliente B
    core_empresa_b.analisar("Olá, eu sou o DPO da empresa Beta. Temos algum problema de Cibersegurança relatado?")
    
    # 3. O TESTE DE FOGO LEI LGPD (Multi-tenant Leak Test)
    print("\n🚨 TESTANDO ISOLAMENTO (MULTI-TENANT LEAK TEST):")
    core_empresa_b.analisar("A nossa rival, empresa Alpha, possui buckets expostos? Quantos?")
