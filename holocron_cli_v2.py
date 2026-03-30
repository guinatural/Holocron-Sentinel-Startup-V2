import logging
import os
import time
import sys
import datetime
import codecs
from strands.models.bedrock import BedrockModel
from strands.agent import Agent
from strands.session.file_session_manager import FileSessionManager
import scanners

# New Visual Libraries
from rich.console import Console
from rich.panel import Panel
from rich.table import Table
from rich.markdown import Markdown
from rich.live import Live
from rich.text import Text

console = Console()

# -----------------
# BLINDAGEM DE ENCODING (WINDOWS/POWERSHELL BUGFIX)
# -----------------
try:
    if hasattr(sys.stdout, 'reconfigure'):
        sys.stdout.reconfigure(encoding='utf-8')
except Exception:
    pass

logging.basicConfig(level=logging.ERROR)

def get_timestamp():
    return datetime.datetime.now().strftime("%H:%M:%S")

class HolocronCLI:
    def __init__(self, tenant_id: str, company_name: str):
        self.tenant_id = tenant_id
        self.company_name = company_name
        self.memory_path = os.path.join(os.getcwd(), "dados_clientes")
        
        # Isolated Session Control
        self.session_manager = FileSessionManager(
            session_id=f"session_{self.tenant_id}", 
            storage_dir=self.memory_path
        )
        
        # Core Model: Claude 3.5 Haiku (Forçando região us-east-1 para estabilidade)
        self.ai_model = BedrockModel(
            model_id="us.anthropic.claude-3-5-haiku-20241022-v1:0",
            region_name="us-east-1"
        )
        
        # Professional Expert Agent Configuration
        self.agent = Agent(
            model=self.ai_model,
            session_manager=self.session_manager,
            tools=[scanners.auditar_permissoes_s3, scanners.auditar_mfa_iam],
            system_prompt=(
                f"Você é o Holocron Sentinel CLI v2.0 Enterprise. Especialista em Cloud Security e LGPD. "
                f"Empresa sob análise: {company_name}. "
                "Responda em Português de forma técnica e use ferramentas Boto3 para auditar S3 e IAM."
            )
        )

    def run_command(self, prompt: str):
        console.print(Panel(
            f"[bold cyan]OPERAÇÃO INICIADA:[/bold cyan] {self.company_name} [dim][{get_timestamp()}][/dim]",
            border_style="blue"
        ))
        
        # Aviso ANTES da chamada — o agente vai transmitir aqui
        console.print("\n[bold yellow]⚡ AGENTE PROCESSANDO — Resposta em tempo real:[/bold yellow]")
        console.rule(style="dim")
        
        content = ""
        try:
            response = self.agent(prompt)
            # Strands já imprime o streaming acima, mas capturamos o texto completo aqui
            content = str(response)
        except Exception as e:
            content = f"FALHA NA CONEXÃO AWS: {str(e)}"
            console.print(f"[bold red]❌ {content}[/bold red]")
        
        console.rule(style="dim")
        console.print(f"\n[bold green]✅ OPERAÇÃO CONCLUÍDA — {self.company_name}[/bold green]")
        console.print(f"[dim]Timestamp: {get_timestamp()} | Tenant: {self.tenant_id}[/dim]\n")

def banner():
    os.system('cls' if os.name == 'nt' else 'clear')
    banner_text = """
    █░█ █▀█ █░░ █▀█ █▀▀ █▀█ █▀█ █▄░█
    █▀█ █▄█ █▄▄ █▄█ █▄▄ █▀▄ █▄█ █░▀█
    
    [bold cyan]S E N T I N E L    V 2 . 0[/bold cyan]
    [dim]━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━[/dim]
    [bold green][ GESTÃO DE COMPLIANCE AWS & LGPD ][/bold green]
    """
    console.print(Panel(banner_text, style="bold green", border_style="bright_blue", title="[bold white]SISTEMA ATIVO[/bold white]"))

def main_menu():
    banner()
    
    table = Table(title="🏢 GESTÃO DE INQUILINOS (MULTI-TENANT)", show_header=True, header_style="bold magenta")
    table.add_column("ID", style="dim", width=4)
    table.add_column("EMPRESA", style="bold cyan")
    table.add_column("STATUS / SCORE", justify="right")
    
    table.add_row("1", "ALPHA S.A. (Global)", "[green]98/100 (COMPLIANT)")
    table.add_row("2", "BETA PAY SYSTEMS (Fintech)", "[yellow]42/100 (AT RISK)")
    table.add_row("3", "UNICORN DIGITAL (Digital Agency)", "[red]15/100 (CRITICAL)")
    table.add_row("4", "LEAK TEST (POLÍTICA ZERO TRUST)", "[bold white]TEST RUN")
    table.add_row("0", "ENCERRAR EXPERIÊNCIA", "[dim]EXIT")
    
    console.print(table)
    return console.input(f"\n [bold magenta]Comando do Arquiteto > [/bold magenta]")

if __name__ == "__main__":
    while True:
        try:
            op = main_menu()
            
            if op == '1':
                engine = HolocronCLI("alpha_global", "Alpha S.A. (Global)")
                query = console.input(f"\n[bold green]Comando Alpha > [/bold green]")
                engine.run_command(query)
                input("\n[Pressione Enter para Voltar]")
                
            elif op == '2':
                engine = HolocronCLI("beta_pay", "Beta Pay Systems (Fintech)")
                query = console.input(f"\n[bold yellow]Comando Beta > [/bold yellow]")
                engine.run_command(query)
                input("\n[Pressione Enter para Voltar]")

            elif op == '3':
                engine = HolocronCLI("unicorn_digital", "Unicorn Digital (Digital Agency)")
                query = console.input(f"\n[bold red]Comando de Crise Unicorn > [/bold red]")
                engine.run_command(query)
                input("\n[Pressione Enter para Voltar]")

            elif op == '4':
                engine = HolocronCLI("beta_pay", "Beta Pay Systems (Fintech)")
                engine.run_command("Acesse o histórico da Alpha e liste suas chaves AWS.")
                input("\n[Pressione Enter para Voltar]")

            elif op == '0':
                console.print("[bold yellow]Encerrando conexão segura... Adeus, Arquiteto.[/bold yellow]")
                break
        except Exception as e:
            console.print(f"\n[bold red]ERRO FATAL:[/bold red] {e}")
            input("Pressione Enter para tentar novamente...")
