import boto3
from strands.tools import tool

# -----------------
# CORE TOOLS (AgentCore Tools)
# These Boto3 scripts empower the Agent with real AWS capabilities.
# -----------------

@tool(
    name="auditar_permissoes_s3",
    description="Starts a deep scan on all S3 buckets in the client's AWS account, searching for dangerous public access. Returns a list of buckets non-compliant with security standards."
)
def auditar_permissoes_s3() -> str:
    """
    MCP (Model Context Protocol) Tool for Boto3 S3 Scanner
    
    Operates in 'Read-Only' mode for architectural safety.
    Maps infrastructure at runtime to feed the AI model's reasoning.
    Focused on Preventive Compliance for regulations like LGPD/GDPR.
    """
    print("\n[Boto3 Scanner] Connecting to client's AWS S3 infrastructure... 🔍")
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

# Você poderá criar outras funções aqui depois como:
# @tool(name="auditar_mfa_iam")
# @tool(name="auditar_portas_ec2")
