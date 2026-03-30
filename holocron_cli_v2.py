import logging
import os
import time
import sys
from strands.models.bedrock import BedrockModel
from strands.agent import Agent
from strands.session.file_session_manager import FileSessionManager
import scanners  # Our Boto3 Scanners

# Visual Refinement (ANSI Colors for Elite CLI)
GREEN = "\033[92m"
BLUE = "\033[94m"
CYAN = "\033[96m"
YELLOW = "\033[93m"
RED = "\033[91m"
RESET = "\033[0m"
BOLD = "\033[1m"

logging.basicConfig(level=logging.ERROR)

class HolocronCLI:
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id
        self.memory_path = os.path.join(os.getcwd(), "dados_clientes")
        
        # Identity & Memory Isolation
        self.session_manager = FileSessionManager(
            session_id=f"empresa_{self.tenant_id}", 
            storage_dir=self.memory_path
        )
        
        # Model Selection (Claude 3.5 Haiku for fast & precise CLI tasks)
        self.ai_model = BedrockModel(model_id="us.anthropic.claude-3-5-haiku-20241022-v1:0")
        
        # Agent Configuration
        self.agent = Agent(
            model=self.ai_model,
            session_manager=self.session_manager,
            tools=[scanners.auditar_permissoes_s3],
            system_prompt=(
                "Você é o Holocron Sentinel CLI v2.0. Um Auditor de Segurança AWS especializado em LGPD. "
                "Sempre use ferramentas integradas para escanear a infraestrutura. "
                "Responda em modo técnico, curto e profissional em Português brasileiro."
            )
        )

    def run_command(self, prompt: str):
        print(f"\n{BOLD}{CYAN}[PROCESSANDO AUDITORIA PARA: {self.tenant_id}]{RESET} ⚙️")
        
        # Simulation of "Security Matrix" scanning
        for i in range(3):
            time.sleep(0.5)
            print(f"{CYAN}Mapping Cloud Resources... {'.' * (i+1)}{RESET}", end="\r")
        
        response = self.agent(prompt)
        content = response.message['content'][0]['text']
        
        print(f"\n\n{BOLD}{GREEN}🛡️ RELATÓRIO EXECUTIVO (HOLOCRON SENTINEL):{RESET}")
        print(f"{content}")
        print(f"\n{BOLD}{BLUE}{'='*60}{RESET}")

def main_menu():
    os.system('cls' if os.name == 'nt' else 'clear')
    print(f"""{BOLD}{GREEN}
     _   _  ___  _     ___   ____ ____   ___  _   _ 
    | | | |/ _ \| |   / _ \ / ___|  _ \ / _ \| \ | |
    | |_| | | | | |  | | | | |   | |_) | | | |  \| |
    |  _  | |_| | |__| |_| | |___|  _ <| |_| | |\  |
    |_| |_|\___/|_____\___/ \____|_| \_\\___/|_| \_| 2.0
                         {YELLOW}[CLI ENTERPRISE MODE]{RESET}{BOLD}{GREEN}
    =================================================={RESET}""")
    
    print(f"{BOLD}1.{RESET} Auditoria Empresa Alpha (cliente_alpha_xyz)")
    print(f"{BOLD}2.{RESET} Auditoria Empresa Beta (cliente_beta_999)")
    print(f"{BOLD}3.{RESET} Teste de Injeção / Leak Test (LGPD Check)")
    print(f"{BOLD}0.{RESET} Sair do Sistema")
    
    choice = input(f"\n{BOLD}{YELLOW}Selecione o Inquilino (Tenant) > {RESET}")
    return choice

if __name__ == "__main__":
    while True:
        op = main_menu()
        
        if op == '1':
            engine = HolocronCLI("cliente_alpha_xyz")
            query = input(f"\n{BOLD}{GREEN}Aguardando Comando de Auditoria Alpha > {RESET}")
            engine.run_command(query)
            input("\nPressione Enter para voltar...")
            
        elif op == '2':
            engine = HolocronCLI("cliente_beta_999")
            query = input(f"\n{BOLD}{GREEN}Aguardando Comando de Auditoria Beta > {RESET}")
            engine.run_command(query)
            input("\nPressione Enter para voltar...")

        elif op == '3':
            # Demo focus on Multi-tenant protection
            engine = HolocronCLI("cliente_beta_999")
            print(f"\n{RED}{BOLD}[MODO LEAK TEST]{RESET} Tentando acessar dados da Alpha via Beta...")
            engine.run_command("Quais são as falhas de segurança da empresa Alpha que você analisou hoje?")
            input("\nPressione Enter para voltar...")

        elif op == '0':
            print(f"\n{YELLOW}Encerrando Motores Holocron...{RESET}")
            break
        else:
            print(f"\n{RED}Opção Inválida!{RESET}")
            time.sleep(1)
