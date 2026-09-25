# 🚀 Guia de Setup: Portfolio no GitHub Pages

Este documento descreve como publicar seu portfólio profissional online usando GitHub Pages.

---

## 📋 Checklist Rápido

- [x] Portfólio importado na pasta `portfolio/`
- [x] README.md otimizado e profissional
- [x] Arquivos HTML/CSS/JS organizados
- [x] Commit realizado no Git (`guinatural-effective-spoon` branch)
- [ ] **PRÓXIMO**: Push para GitHub
- [ ] Configurar GitHub Pages
- [ ] Verificar site ao vivo
- [ ] (Opcional) Adicionar domínio personalizado

---

## 🔧 Passo 1: Preparar o Repositório

Se este repositório ainda não está no GitHub:

```bash
# Adicione o remote origin
git remote add origin https://github.com/seu-usuario/Holocron-Sentinel-Startup-V2.git

# Verifique
git remote -v
```

Se já tem:
```bash
# Confirme
git remote -v
```

---

## 📤 Passo 2: Push para GitHub

```bash
# Envie a branch atual
git push origin guinatural-effective-spoon

# (Ou defina como upstream)
git push -u origin guinatural-effective-spoon
```

---

## ⚙️ Passo 3: Configurar GitHub Pages

### Opção A: Portfolio na raiz do site

Se você quer que o portfólio seja a página principal:

1. Vá para **Settings** → **Pages** (no GitHub)
2. **Source**: Selecione `main` branch
3. **Folder**: Selecione `/portfolio`
4. Salve

**URL resultante**: `https://seu-usuario.github.io/`

### Opção B: Portfolio em subpasta

Se você quer que o portfólio seja em um caminho específico:

1. Vá para **Settings** → **Pages**
2. **Source**: Selecione `main` branch
3. **Folder**: Raiz (default)
4. Salve

**URL resultante**: `https://seu-usuario.github.io/portfolio/`

### Opção C: Domínio Personalizado

Para usar seu domínio próprio (ex: `guilhermebarreto.dev`):

1. Você precisa de um domínio registrado
2. Configure DNS apontando para GitHub Pages:
   - Type: `A` → IP: `185.199.108.153` (e 3 outros IPs do GitHub)
   - Ou Type: `CNAME` → `seu-usuario.github.io`
3. Em **Settings** → **Pages** → **Custom domain**: digite seu domínio
4. GitHub criará um arquivo `CNAME` automaticamente

---

## ✅ Passo 4: Verificar

Após 1-2 minutos, acesse:

```
https://seu-usuario.github.io/portfolio/
```

Você deve ver:
- ✅ Landing page (index.html)
- ✅ Menu de navegação
- ✅ Seções de projetos, experiência, certificações
- ✅ Links funcionando
- ✅ Imagens carregando

---

## 🎨 Passo 5: Customizações & Ajustes

### Editar Conteúdo

1. **Portfolio pessoal**: Edite `portfolio/index.html`
2. **Labs e projetos**: Edite `portfolio/labs.html`
3. **Currículo**: Edite `portfolio/curriculo.html`
4. **Caso de estudo**: Edite `portfolio/wayfinder.html`

### Adicionar Imagens

1. Salve imagens em `portfolio/img/`
2. Referencie no HTML: `<img src="img/sua-imagem.png">`
3. Commit e push

### Usar Scripts Python

Se quiser atualizar conteúdo em batch:

```bash
cd portfolio/

# Exemplo: gerar HTML para labs
python build_labs_html.py

# Atualizar seção de experiência
python update_experiencia.py

# Commit das mudanças
git add .
git commit -m "docs: atualizar conteúdo do portfólio"
git push
```

---

## 🔒 SEO & Performance

### Otimizar para Recrutadores

Seu README.md já tem meta tags e palavras-chave. Adicione também:

1. **Google Search Console**: 
   - Acesse: https://search.google.com/search-console
   - Submeta seu URL
   - Verifique a propriedade

2. **LinkedIn**:
   - Compartilhe o link do portfólio
   - Adicione à seção "Website" do seu perfil

3. **CV & Email**:
   - Coloque URL do portfólio em destaque
   - "Portfolio técnico: https://seu-usuario.github.io/portfolio"

### Verificar Performance

```bash
# Lighthouse (via Chrome DevTools)
# 1. F12 → Lighthouse
# 2. Gere relatório

# Ou online: https://pagespeed.web.dev/
```

---

## 🌍 Próximas Etapas

### Curto Prazo (1-2 semanas)
- [ ] Publicar no GitHub Pages
- [ ] Testar em diferentes navegadores/dispositivos
- [ ] Compartilhar no LinkedIn
- [ ] Enviar link em candidaturas de emprego

### Médio Prazo (1-2 meses)
- [ ] Adicionar domínio personalizado
- [ ] Implementar dark mode
- [ ] Adicionar blog/artigos técnicos
- [ ] Google Analytics
- [ ] Migrar para AWS S3 + CloudFront (como projeto)

### Longo Prazo (3-6 meses)
- [ ] Publicar em múltiplos idiomas
- [ ] Integrar newsletter (se houver)
- [ ] Video case studies dos projetos
- [ ] Open source contributions showcase
- [ ] Certificações atualizadas via Credly API

---

## 🆘 Troubleshooting

### ❌ GitHub Pages não aparece

1. Verifique se o repository é **público**
2. Confirme branch correta em Settings → Pages
3. Espere 5-10 minutos (às vezes demora)
4. Limpe cache: Ctrl+Shift+Del ou Cmd+Shift+Del

### ❌ Imagens ou CSS não carregam

1. Verifique caminhos relativos (use `/portfolio/img/` se necessário)
2. Confirme que arquivos estão commitados: `git status`
3. Teste localmente: `python -m http.server 8000`

### ❌ HTML não renderiza

1. Verifique sintaxe: F12 → Console (procure erros JavaScript)
2. Valide HTML: https://validator.w3.org/
3. Teste offline: Abra arquivo `.html` direto no navegador

### ❌ Links quebrados

```bash
# Use um validador de links
# https://www.w3.org/developers/tools/

# Ou manualmente:
# Abra cada página e clique em todos os links
```

---

## 📞 Contato & Suporte

Se tiver dúvidas:

1. **Documentação GitHub Pages**: https://docs.github.com/pages
2. **Comunidade**: Stack Overflow (tag: `github-pages`)
3. **Contato direto**: guilherme@email.com ou LinkedIn

---

## 📝 Nota Final

Seu portfólio agora está:
- ✅ **Profissional**: Linguagem técnica com toque humano
- ✅ **Otimizado**: SEO para recrutadores
- ✅ **Escalável**: Fácil manter e expandir
- ✅ **Gratuito**: GitHub Pages + seu domínio (opcional)
- ✅ **Seguro**: Conteúdo estático, sem backend vulnerável

Use este portfólio como diferencial em candidaturas!

---

**Última atualização**: 25 de Setembro, 2026  
**Preparado por**: GitHub Copilot CLI  
**Status**: ✅ Pronto para publicar
