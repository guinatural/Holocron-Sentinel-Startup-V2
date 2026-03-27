import boto3
from strands.tools import tool

# -----------------
# FERRAMENTAS DO CORE (AgentCore Tools)
# O modelo Claude não tem mãos, então nós damos "Scripts Boto3" para ele rodar na AWS
# -----------------

@tool(
    name="auditar_permissoes_s3",
    description="Inicia uma varredura profunda (Scanner) em todos os buckets S3 da conta AWS do cliente buscando por acessos públicos perigosos. Retorna a lista de buckets não conformes com a LGPD."
)
def auditar_permissoes_s3() -> str:
    """
    Ferramenta MCP (Model Context Protocol) para Scanner Boto3 S3
    
    Operando em nível "Somente-Leitura" (Read-Only) por segurança arquitetural,
    esta função mapeia a infraestrutura em tempo de execução para alimentar
    o raciocínio do modelo fundacional de IA (Bedrock/Claude). Focada na 
    detecção de conformidade Preventiva para a LGPD e regulamentações corporativas.
    """
    print("\n[Scanner Boto3] Conectando à infraestrutura AWS S3 do cliente... 🔍")
    s3 = boto3.client('s3')
    
    try:
        response = s3.list_buckets()
        buckets = response.get('Buckets', [])
    except Exception as e:
        return f"Erro Crítico de IAM: O Holocron não tem permissão para ler o S3. Detalhes: {e}"
        
    buckets_vulneraveis = []
    
    for bucket in buckets:
        nome_bucket = bucket['Name']
        try:
            # Tenta ler as regras de bloqueio público do Bucket
            pab = s3.get_public_access_block(Bucket=nome_bucket)
            configuracao = pab.get('PublicAccessBlockConfiguration', {})
            
            # Se qualquer bloqueio de segurança estiver desligado (False), é um risco!
            if not configuracao.get('BlockPublicPolicy') or not configuracao.get('IgnorePublicAcls'):
                buckets_vulneraveis.append(nome_bucket)
        except Exception:
            # Se o bucket sequer tem uma configuração de bloqueio aplicada, ele é "Legacy" ou Vulnerável
            buckets_vulneraveis.append(nome_bucket)
            
    if buckets_vulneraveis:
        return (
            f"⚠️ ALERTA VERMELHO LGPD (Art. 46): Encontrei {len(buckets_vulneraveis)} buckets "
            f"com restrições públicas DESATIVADAS. Eis os nomes: {', '.join(buckets_vulneraveis)}."
        )
    else:
        return "✅ Conformidade Total: Todos os buckets S3 possuem o 'Block Public Access' ativado."

# Você poderá criar outras funções aqui depois como:
# @tool(name="auditar_mfa_iam")
# @tool(name="auditar_portas_ec2")
