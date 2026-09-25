# 🚀 Configuração GitHub Pages - Passo a Passo

## ✅ Pré-Requisitos Verificados

- [x] Repositório público: `guinatural/Holocron-Sentinel-Startup-V2`
- [x] Branch `main` existe
- [x] Pasta `portfolio/` com arquivos HTML/CSS/JS
- [x] README.md otimizado
- [x] `.gitignore` configurado
- [x] Commits realizados e pushed

---

## 📋 Step-by-Step GitHub Pages Setup

### PASSO 1: Acessar Settings

1. Vá para: https://github.com/guinatural/Holocron-Sentinel-Startup-V2
2. Clique em **Settings** (engrenagem no topo)
3. No menu esquerdo, procure por **Pages** (deve estar na seção "Code and automation")

### PASSO 2: Configurar Source

1. Em **Settings → Pages**
2. **Source**: Selecione **Deploy from a branch**
3. **Branch**: Selecione `main`
4. **Folder**: Selecione `/portfolio` (IMPORTANTE!)
5. Clique em **Save**

![Imagem: GitHub Pages Configuration](./docs/github-pages-config.png)

### PASSO 3: Aguardar Deploy

- GitHub iniciará automaticamente o deploy
- Você verá uma barra de progresso: "Deployment is in progress..."
- Aguarde 1-3 minutos para conclusão

### PASSO 4: Verificar URL

Após conclusão, você verá:
```
✅ Your site is live at: 
   https://guinatural.github.io/portfolio/
```

---

## 🔗 URLs Resultantes

| Página | URL |
|--------|-----|
| **Landing (PT-BR)** | `https://guinatural.github.io/portfolio/` |
| **Landing (EN)** | `https://guinatural.github.io/portfolio/index_en.html` |
| **Labs** | `https://guinatural.github.io/portfolio/labs.html` |
| **Wayfinder** | `https://guinatural.github.io/portfolio/wayfinder.html` |
| **Currículo** | `https://guinatural.github.io/portfolio/curriculo.html` |

---

## 🆘 Troubleshooting

### ❌ "Pages are not currently published"

**Solução**:
1. Verifique se o repositório é **PÚBLICO**
2. Confirme que `main` branch tem a pasta `portfolio/`
3. Aguarde 5-10 minutos (às vezes leva mais)
4. Limpe cache do navegador (Ctrl+Shift+Del)

### ❌ "404 Not Found"

**Solução**:
1. Verifique a URL (deve ser `/portfolio/`, não `/`)
2. Teste: `https://guinatural.github.io/portfolio/index.html`
3. Confirme que HTML está commitado (`git log portfolio/`)

### ❌ Imagens/CSS não carregam

**Solução**:
1. Use caminhos relativos: `./img/arquivo.png` (não `/img/...`)
2. Ou use absolute GitHub URL: `https://raw.githubusercontent.com/guinatural/Holocron-Sentinel-Startup-V2/main/portfolio/img/arquivo.png`
3. Verifique file case sensitivity (imagens.png vs Imagens.png)

### ❌ Demora para atualizar

**Solução**:
1. Aguarde 5 minutos após push
2. Limpe cache: Ctrl+F5
3. Teste em navegador anônimo/privado
4. Verifique Actions aba para build logs

---

## 🎨 Opcional: Domínio Personalizado

Se você quiser usar `seu-dominio.com` ao invés de `guinatural.github.io`:

### PASSO A: Comprar domínio
- Registradores: Godaddy, Namecheap, Route53 (AWS), etc
- Custo: $5-15/ano tipicamente

### PASSO B: Configurar DNS

Se usando **AWS Route53**:
```
Record Type: A
Name: seu-dominio.com
Value: 185.199.108.153 (e 3 outros IPs do GitHub)

Ou Type: CNAME
Name: www.seu-dominio.com
Value: guinatural.github.io
```

Se usando outro registrador:
- Procure por "DNS settings" ou "Nameserver settings"
- Encontre registros A ou CNAME
- Aponte para IPs do GitHub (veja: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site)

### PASSO C: Configurar em GitHub

1. Settings → Pages
2. **Custom domain**: Digite seu domínio (ex: `seu-dominio.com`)
3. GitHub criará arquivo `CNAME` automaticamente
4. Selecione "Enforce HTTPS" (recomendado)

---

## ✅ Validação Final

Após configurar, verifique:

```bash
# Test 1: Site acessível
curl -I https://guinatural.github.io/portfolio/

# Test 2: Páginas principais carregam
# - index.html (PT)
# - index_en.html (EN)
# - labs.html
# - wayfinder.html
# - curriculo.html

# Test 3: Imagens carregam
# Abra DevTools (F12) → Console
# Procure por erros 404

# Test 4: Links funcionam
# Clique em todos os links internos e externos

# Test 5: Mobile responsiveness
# F12 → Toggle device toolbar
# Teste em mobile sizes (375px, 768px, 1024px)
```

---

## 📊 Monitoramento

### GitHub Pages Dashboard

1. Vá para Settings → Pages
2. Você verá:
   - Status do último deploy
   - URL ao vivo
   - Histórico de builds

### Google Search Console (Recomendado)

1. Acesse: https://search.google.com/search-console
2. Add property: `https://guinatural.github.io/portfolio/`
3. Verifique via "DNS record" ou "HTML tag"
4. Submeta sitemap para indexação

### Lighthouse Score (Performance)

1. Abra seu site
2. F12 → Lighthouse tab
3. Run audit (Desktop)
4. Alvo: Score 90+

---

## 🔐 Segurança

GitHub Pages é **100% seguro**:
- ✅ HTTPS automático (seu site URL começa com `https://`)
- ✅ GitHub gerencia SSL/TLS certificates
- ✅ DDoS protection incluído
- ✅ Sem dados sensíveis (site estático)

**Cuidados**:
- ❌ Não coloque API keys no HTML
- ❌ Não commite `.env` files
- ❌ Use `.gitignore` para secrets

---

## 📞 Próximos Passos

1. ✅ Configurar GitHub Pages (acima)
2. ⏭️ Testar site ao vivo
3. ⏭️ Compartilhar no LinkedIn
4. ⏭️ Enviar para recrutadores

---

## 📚 Recursos

- Official: https://docs.github.com/pages
- GitHub Pages Limitations: https://docs.github.com/pages/getting-started-with-github-pages/about-github-pages
- Custom Domain Setup: https://docs.github.com/pages/configuring-a-custom-domain-for-your-github-pages-site
- Troubleshooting: https://docs.github.com/pages/getting-started-with-github-pages/troubleshooting-publishing-issues-for-github-pages

---

**Status**: ✅ Pronto para configurar  
**Tempo Estimado**: 5-10 minutos  
**Custo**: Grátis 🎉

*Após configurar, seu portfólio estará ao vivo para o mundo!*
