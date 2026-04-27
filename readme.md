# 🔳 QR Code Pro

Gerador de QR Code moderno, rápido e inteligente, capaz de interpretar diferentes tipos de dados (Wi-Fi, contato, WhatsApp, etc.) e gerar códigos prontos com identidade visual personalizada.

---

## ✨ Funcionalidades

* 🌍 **WhatsApp Internacional**
  Formata automaticamente números para padrão global.

* 🎨 **QR Code com Logo**
  Geração com logo central para identidade visual profissional.

* 🧠 **Histórico Inteligente**
  Armazena os últimos 10 QR Codes no navegador.

* ⚡ **Preview em Tempo Real**
  Geração automática com debounce (melhor experiência do usuário).

* 📥 **Download e Cópia**
  Baixe em PNG ou copie direto para a área de transferência.

* 🌗 **Tema Dark/Light**
  Alternância automática e manual com persistência.

---

## 🛠️ Tecnologias

### Frontend

* HTML5
* CSS3 (Custom Properties / Theme System)
* JavaScript Vanilla

### Backend

* Node.js
* Express
* QRCode

### Outros

* CORS
* Canvas API

---

## 🌐 Deploy

* Frontend: Vercel
* Backend: Render

---

## 🚀 Como executar o projeto

### 🔹 1. Clonar repositório

```bash
git clone https://github.com/Tattianerl/qrcode-generator.git
cd qrcode-generator
```

---

### 🔹 2. Backend

Instale as dependências:

```bash
npm install
```

Crie o arquivo `.env`:

```env
PORT=3000
```

Execute o servidor:

```bash
npm start
```

Servidor disponível em:

```
http://localhost:3000
```

---

### 🔹 3. Frontend

Abra o arquivo:

```
index.html
```

💡 Recomendado: usar **Live Server (VS Code)**

---

## 🔌 API

### POST `/generate`


## 📂 Estrutura do Projeto

```
QRCODE-GENERATOR/
├── backend/
│    └── server.js          <-- (Lógica da API)
├── frontend/
│    ├── assets/
│    │    └── logo.png      <-- (Sua marca)
│    ├── index.html         <-- (Interface)
│    ├── style.css          <-- (Design)
│    └── script.js          <-- (Comunicação com API)
├── .env                    <-- (Variáveis sensíveis - NÃO SOBE PRO GIT)
├── .gitignore              <-- (Ignorar node_modules e .env)
└── package.json            <-- (Configurações do Node)
```

---

## 🎯 Diferenciais do Projeto

* QR Code com logo (error correction nível alto)
* Validação robusta (frontend + backend)
* UX otimizada com debounce
* Interface moderna e responsiva
* Histórico persistente com LocalStorage

---


## 👩‍💻 Autora

**Tatiane Lima**
🔗 https://www.linkedin.com/in/tati-lima85/

---

## 📄 Licença

Este projeto está sob a licença MIT.
