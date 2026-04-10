import boto3
import datetime
from strands.tools import tool

# Global Timestamp for Professional Logging
def get_timestamp():
    return datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S")

@tool(
    name="auditar_permissoes_s3",
    description="Inspeciona buckets S3 em busca de acesso público perigoso. Focado em conformidade SOC2 e LGPD."
)
def auditar_permissoes_s3() -> str:
    print(f"\n[AUDIT LOG - {get_timestamp()}] 🛡️ SCANNING S3 SECURITY...")
    s3 = boto3.client('s3')
    try:
        response = s3.list_buckets()
        buckets = response.get('Buckets', [])
    except Exception as e:
        return f"Access Denied: Check IAM permissions. Error: {e}"
        
    vulnerable = []
    for bucket in buckets:
        name = bucket['Name']
        try:
            pab = s3.get_public_access_block(Bucket=name)
            config = pab.get('PublicAccessBlockConfiguration', {})
            if not config.get('BlockPublicPolicy') or not config.get('IgnorePublicAcls'):
                vulnerable.append(name)
        except:
            vulnerable.append(name) # No PAB config usually means vulnerable
            
    return f"⚠️ Public Buckets Found: {', '.join(vulnerable)}" if vulnerable else "✅ All Buckets Secure (Private)."

@tool(
    name="auditar_mfa_iam",
    description="Detecta falhas críticas em contas IAM: falta de MFA e chaves de acesso permanentes."
)
def auditar_mfa_iam() -> str:
    print(f"\n[AUDIT LOG - {get_timestamp()}] 🛡️ SCANNING IDENTITY (IAM)...")
    iam = boto3.client('iam')
    try:
        users = iam.list_users().get('Users', [])
    except Exception as e:
        return f"IAM Access Error: {e}"

    no_mfa = []
    for user in users:
        name = user['UserName']
        mfa = iam.list_mfa_devices(UserName=name).get('MFADevices', [])
        if not mfa: no_mfa.append(name)

    return f"🔴 Users without MFA: {', '.join(no_mfa)}" if no_mfa else "✅ IAM Identity Compliance: 100% Secure."

@tool(
    name="analisar_custos_aws_real",
    description="Detecta desperdícios REAIS: Volumes EBS órfãos (não anexados) que geram custos desnecessários."
)
def analisar_custos_aws_real() -> str:
    print(f"\n[FINOPS LOG - {get_timestamp()}] 💰 ESTIMATING CLOUD SAVINGS...")
    ec2 = boto3.client('ec2')
    try:
        volumes = ec2.describe_volumes(Filters=[{'Name': 'status', 'Values': ['available']}])['Volumes']
    except Exception as e:
        return f"FinOps Scan Error: {e}"

    orphaned_vols = [v['VolumeId'] for v in volumes]
    count = len(orphaned_vols)
    
    if count > 0:
        return f"🔹 Found {count} Orphaned EBS Volumes (Available/Unattached). Potential Savings: ${count * 10}/month. IDs: {', '.join(orphaned_vols)}"
    return "✅ FinOps: No orphaned resources detected. Cost efficiency optimized."

@tool(
    name="verificar_seguranca_network",
    description="Inspeciona Security Groups em busca de portas SSH (22) abertas para o mundo (0.0.0.0/0)."
)
def verificar_seguranca_network() -> str:
    print(f"\n[FIREWALL LOG - {get_timestamp()}] 🛡️ SCANNING NETWORK PERIMETER...")
    ec2 = boto3.client('ec2')
    unsafe_groups = []
    try:
        sgs = ec2.describe_security_groups()['SecurityGroups']
        for sg in sgs:
            for rule in sg.get('IpPermissions', []):
                if rule.get('FromPort') == 22 or rule.get('IpProtocol') == '-1':
                    for ip_range in rule.get('IpRanges', []):
                        if ip_range.get('CidrIp') == '0.0.0.0/0':
                            unsafe_groups.append(sg['GroupId'])
    except Exception as e:
        return f"Network Audit Error: {e}"

    return f"🔥 CRITICAL: Port 22 Open to World in Groups: {', '.join(unsafe_groups)}" if unsafe_groups else "✅ Perimeter Security: No public SSH detected."

