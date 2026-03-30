import boto3
import datetime
from strands.tools import tool

def get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool(
    name="auditar_permissoes_s3",
    description="Starts a deep scan on all S3 buckets in the client's AWS account, searching for dangerous public access. Returns a list of buckets non-compliant with security standards."
)
def auditar_permissoes_s3() -> str:
    """
    MCP (Model Context Protocol) Tool for Boto3 S3 Scanner.
    Professional security auditing logic with SOC-level logging.
    """
    print(f"\n[AUDIT LOG - {get_timestamp()}] 🛡️ INITIALIZING CLOUD SECURITY SCAN...")
    print(f"[{get_timestamp()}] 🔍 CONNECTION: Establishing Boto3 session with AWS S3...")
    s3 = boto3.client('s3')
    
    try:
        response = s3.list_buckets()
        buckets = response.get('Buckets', [])
    except Exception as e:
        return f"Critical IAM Error: Holocron lacks permission to read S3. Details: {e}"
        
    vulnerable_buckets = []
    
    for bucket in buckets:
        bucket_name = bucket['Name']
        try:
            # Check Public Access Block configuration
            pab = s3.get_public_access_block(Bucket=bucket_name)
            config = pab.get('PublicAccessBlockConfiguration', {})
            
            # If any security block is OFF (False), it's a risk!
            if not config.get('BlockPublicPolicy') or not config.get('IgnorePublicAcls'):
                vulnerable_buckets.append(bucket_name)
        except Exception:
            # If the bucket has no PAB config, it is vulnerable/legacy.
            vulnerable_buckets.append(bucket_name)
            
    if vulnerable_buckets:
        return (
            f"⚠️ RED ALERT: Found {len(vulnerable_buckets)} buckets "
            f"with public restrictions DISABLED: {', '.join(vulnerable_buckets)}."
        )
    else:
        return "✅ Full Compliance: All S3 buckets have 'Block Public Access' active."

@tool(
    name="auditar_mfa_iam",
    description="Inspeciona usuários IAM em busca de falhas críticas de segurança, como ausência de MFA (Multi-Factor Authentication) ou uso de chaves de acesso (Access Keys) permanentes. Essencial para Conformidade LGPD."
)
def auditar_mfa_iam() -> str:
    """
    Inspeciona a segurança de identidade (Identity Security) via Boto3 IAM.
    Focado em detectar ausência de MFA e riscos de vulto em credenciais root.
    """
    print(f"\n[AUDIT LOG - {get_timestamp()}] 🛡️ INICIANDO SCANNER DE IDENTIDADE (IAM)...")
    iam = boto3.client('iam')
    
    try:
        users = iam.list_users().get('Users', [])
    except Exception as e:
        return f"Erro Crítico de Acesso: Falha ao listar usuários IAM. {e}"

    usuarios_sem_mfa = []
    usuarios_com_keys = []

    for user in users:
        username = user['UserName']
        
        # 1. Checa MFA
        mfa = iam.list_mfa_devices(UserName=username).get('MFADevices', [])
        if not mfa:
            usuarios_sem_mfa.append(username)
            
        # 2. Checa Access Keys
        keys = iam.list_access_keys(UserName=username).get('AccessKeyMetadata', [])
        if keys:
            usuarios_com_keys.append(username)

    report = []
    if usuarios_sem_mfa:
        report.append(f"🔴 CRÍTICO: {len(usuarios_sem_mfa)} usuários SEM MFA: {', '.join(usuarios_sem_mfa)}.")
    
    if usuarios_com_keys:
        report.append(f"🟠 ALERTA: {len(usuarios_com_keys)} usuários possuem Access Keys permanentes (Risco de Vazamento).")

    if not report:
        return "✅ Conformidade IAM: Todos os usuários possuem MFA ativo e políticas de acesso seguras."
    
    return " \n".join(report)
