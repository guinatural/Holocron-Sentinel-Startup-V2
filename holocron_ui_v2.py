import streamlit as st
import os

# Adicionamos a pasta atual ao caminho para que o Streamlit enxergue o main.py e scanners.py
import sys
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from main import HolocronSentinelCore

st.set_page_config(page_title="Holocron V2 Enterprise", page_icon="🛡️", layout="wide")

# CSS Premium (Modo Corporativo Multi-Tenant)
st.markdown("""
<style>
    .stApp { background-color: #050a14; color: #e2e8f0; }
    h1 { color: #00d2ff; font-family: 'Inter', sans-serif; font-weight: 800; border-bottom: 2px solid #112240; padding-bottom: 10px; }
    h3 { color: #64ffda; }
    .sidebar-text { font-size: 14px; color: #8892b0; }
    .chat-user { background-color: #112240; border-radius: 10px; padding: 15px; margin: 10px 0; border-left: 4px solid #00d2ff; }
    .chat-bot { background-color: #0a192f; border-radius: 10px; padding: 15px; margin: 10px 0; border-left: 4px solid #64ffda; }
</style>
""", unsafe_allow_html=True)

# Barra Lateral: Escolha de "Inquilino" (A magia do Multi-Tenant)
with st.sidebar:
    st.image("https://upload.wikimedia.org/wikipedia/commons/9/93/Amazon_Web_Services_Logo.svg", width=150)
    st.markdown("### 🏢 Gestão de Clientes (Multi-Tenant)")
    st.markdown("<p class='sidebar-text'>Selecione para qual empresa o DPO está auditando a nuvem no momento.</p>", unsafe_allow_html=True)
    
    empresa_selecionada = st.selectbox(
        "Empresa (Tenant ID):",
        ["cliente_alpha_xyz", "cliente_beta_999", "sua_startup_123"]
    )
    
    st.markdown("---")
    st.markdown("### 🛠️ Scanners Ativos")
    st.checkbox("Scanner S3 Boto3", value=True, disabled=True)
    st.checkbox("Scanner IAM", value=False, disabled=True)
    st.checkbox("Memória AgentCore", value=True, disabled=True)

# -----------------
# INICIALIZAÇÃO DO NÚCLEO HOLOCRON V2
# -----------------
@st.cache_resource(show_spinner="Iniciando Cérebro AgentCore...", hash_funcs={"main.HolocronSentinelCore": id})
def carregar_motor_por_empresa(tenant_id):
    # Isso cria Cópias "Silos" da IA na memória do servidor para cada empresa não ver a outra
    return HolocronSentinelCore(tenant_id=tenant_id)

# Carrega o núcleo dinamicamente toda vez que a Empresa na barra lateral muda
motor_ia = carregar_motor_por_empresa(empresa_selecionada)

# -----------------
# TELA PRINCIPAL (CHAT)
# -----------------
st.title(f"🚀 Dashboard de Auditoria - Empresa: {empresa_selecionada}")
st.markdown("Bem-vindo ao Holocron Sentinel V2. O único DPO Autônomo com memória persistente e execução real na nuvem.")

# Controle de Histórico em tela
if "mensagens_interface" not in st.session_state:
    st.session_state.mensagens_interface = {}

if empresa_selecionada not in st.session_state.mensagens_interface:
    st.session_state.mensagens_interface[empresa_selecionada] = [
        {"role": "assistant", "content": f"Sistemas Seguros Iniciados. Motor Claude 3.5 operante. O que deseja auditar na {empresa_selecionada} hoje?"}
    ]

# Renderizar Histórico
for msg in st.session_state.mensagens_interface[empresa_selecionada]:
    classe_css = "chat-user" if msg["role"] == "user" else "chat-bot"
    st.markdown(f"<div class='{classe_css}'><b>{'Você' if msg['role'] == 'user' else 'Holocron'}:</b><br>{msg['content']}</div>", unsafe_allow_html=True)

# Campo de Texto (Input)
pergunta = st.chat_input("Ex: 'Audite os buckets S3 desta conta.' ou 'Quais foram nossas últimas conversas?'")

if pergunta:
    # 1. Mostrar pergunta do usuário
    st.session_state.mensagens_interface[empresa_selecionada].append({"role": "user", "content": pergunta})
    st.markdown(f"<div class='chat-user'><b>Você:</b><br>{pergunta}</div>", unsafe_allow_html=True)
    
    # 2. Processamento IA
    with st.spinner("O Agente está varrendo a infraestrutura Boto3 e consultando a Memória..."):
        try:
            # Chama a função do main.py
            resposta_bruta = motor_ia.agente(pergunta)
            texto_resposta = resposta_bruta.message['content'][0]['text']
            
            # 3. Mostrar e salvar resposta do bot
            st.session_state.mensagens_interface[empresa_selecionada].append({"role": "assistant", "content": texto_resposta})
            st.markdown(f"<div class='chat-bot'><b>Holocron:</b><br>{texto_resposta}</div>", unsafe_allow_html=True)
            
        except Exception as e:
            st.error(f"Falha de Segurança (Proteção AWS ativada): {e}")

