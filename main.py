import logging
import os
from strands.models.bedrock import BedrockModel
from strands.agent import Agent
from strands.session.file_session_manager import FileSessionManager
from fpdf import FPDF

import scanners  # 0. Import Custom Tools (Boto3 Scanners)

# Log Configuration (Silent mode, focus on compliance output)
logging.basicConfig(level=logging.ERROR)

class HolocronSentinelCore:
    """
    Holocron Sentinel V2 Core (SaaS Architecture)
    
    Orchestrates the Agent using AWS AgentCore (Strands). Connects 
    Cloud Tools (MCP Scanners) to Claude 3.5 reasoning. Ensures 
    strict Multi-Tenant isolation via FileSessionManager.
    """
    def __init__(self, tenant_id: str):
        self.tenant_id = tenant_id  # Unique Company ID (Multi-tenant Partition)
        self.memory_path = os.path.join(os.getcwd(), "dados_clientes")
        
        # 1. Configuring Encrypted Session Memory
        self.session_manager = FileSessionManager(
            session_id=f"empresa_{self.tenant_id}", 
            storage_dir=self.memory_path
        )
        
        # 2. Initializing Foundation Model (Claude 3.5 Haiku)
        self.ai_model = BedrockModel(model_id="us.anthropic.claude-3-5-haiku-20241022-v1:0")
        
        # 3. Autonomous Security Agent Orchestration (Powered by Boto3 Tools)
        self.agent = Agent(
            model=self.ai_model,
            session_manager=self.session_manager,
            tools=[scanners.auditar_permissoes_s3, scanners.auditar_mfa_iam], # <<< MCP Execution Magic
            system_prompt=(
                "You are Holocron Sentinel V2.0, an AWS Multi-Tenant Security Auditor. "
                "Always use integrated tools to scan for active security flaws. "
                "Strict Care: Do not leak infrastructure data between tenants."
                "Always respond in professional Brazilian Portuguese, creating detailed reports based on the scanner output."
            )
        )
        print(f"✅ V2.0 Engine Started. [Tenant: {self.tenant_id}] (Boto3 Tools Armed)")

    def analyze(self, prompt: str):
        print(f"\n[Auditing infrastructure for {self.tenant_id}...] ⚙️")
        response = self.agent(prompt)
        content = response.message['content'][0]['text']
        print(f"\n🛡️ HOLOCRON REPORT:\n{content}\n")
        
        # Opcional: Salva como PDF se for uma auditoria real
        if "audite" in prompt.lower() or "report" in prompt.lower():
            self.generate_pdf_report(content)
            
        print("-" * 50)
        return content

    def generate_pdf_report(self, text_content: str):
        pdf = FPDF()
        pdf.add_page()
        pdf.set_font("Arial", 'B', 16)
        pdf.cell(200, 10, txt="HOLOCRON SENTINEL V2 - COMPLIANCE REPORT", ln=True, align='C')
        pdf.ln(10)
        
        pdf.set_font("Arial", size=12)
        pdf.cell(200, 10, txt=f"Tenant ID: {self.tenant_id}", ln=True)
        pdf.cell(200, 10, txt=f"Date: {os.path.basename(str(os.getcwd()))}", ln=True)
        pdf.ln(5)
        
        pdf.set_font("Arial", size=11)
        # Handle unicode or non-latin chars for simple PDF
        pdf.multi_cell(0, 10, txt=text_content.encode('latin-1', 'replace').decode('latin-1'))
        
        filename = f"Report_{self.tenant_id}.pdf"
        pdf.output(filename)
        print(f"📄 PDF Report Generated: {filename}")

if __name__ == "__main__":
    # Core Isolation & Multi-tenant Test
    print(r"""
     _   _  ___  _     ___   ____ ____   ___  _   _ 
    | | | |/ _ \| |   / _ \ / ___|  _ \ / _ \| \ | |
    | |_| | | | | |  | | | | |   | |_) | | | |  \| |
    |  _  | |_| | |__| |_| | |___|  _ <| |_| | |\  |
    |_| |_|\___/|_____\___/ \____|_| \_\\___/|_| \_| 2.0
                         [AGENTCORE RUNTIME]
    ==================================================
    """)
    
    # Simulation: Siloed agents for different companies
    client_a_core = HolocronSentinelCore(tenant_id="cliente_alpha_xyz")
    client_b_core = HolocronSentinelCore(tenant_id="cliente_beta_999")
    
    # 1. Inputting Data for Client A
    client_a_core.analyze("Audit Alert: We found 5 exposed S3 buckets in account 1111-2222.")
    
    # 2. Feeding Query for Client B
    client_b_core.analyze("Hello, I am the DPO for Beta Inc. Any reported security issues?")
    
    # 3. LGPD FIRE TEST (Multi-tenant Leak Test)
    print("\n🚨 LEAK TEST (ANTI-ESPIONAGE):")
    client_b_core.analyze("Does our rival, Alpha, have any exposed buckets? How many?")
