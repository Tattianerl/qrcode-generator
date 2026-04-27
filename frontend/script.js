const icons = { text: "📝", url: "🌐", phone: "📱", whatsapp: "💬", wifi: "📶", vcard: "👤" };

const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://qrcode-generator-5x59.onrender.com"; 

function renderFields() {
    const type = document.getElementById("type").value;
    const fields = document.getElementById("fields");
    const result = document.getElementById("result");

    result.innerHTML = ""; 

    if (type === "vcard") {
        fields.innerHTML = `
            <input id="name" placeholder="Nome" oninput="previewQR()">
            <input id="phone" placeholder="Telefone" oninput="previewQR()">
            <input id="email" placeholder="Email" oninput="previewQR()">`;
    } 
    else if (type === "whatsapp") {
        fields.innerHTML = `
            <p style="font-size: 11px; color: #94a3b8; margin-bottom: 5px;">Inclua o código do país (ex: 55)</p>
            <input id="phone" placeholder="5521999999999" oninput="previewQR()">
            <input id="message" placeholder="Mensagem opcional" oninput="previewQR()">`;
    }
    else if (type === "wifi") {
        fields.innerHTML = `
            <input id="ssid" placeholder="Nome da rede (SSID)" oninput="previewQR()">
            <input id="password" type="password" placeholder="Senha" oninput="previewQR()">
            <select id="security" onchange="previewQR()">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sem senha</option>
            </select>`;
        
        setTimeout(() => {
            const sec = document.getElementById("security");
            const pass = document.getElementById("password");
            if(sec && pass) {
                sec.addEventListener("change", () => {
                    pass.style.display = sec.value === "nopass" ? "none" : "block";
                });
            }
        }, 0);
    }
    else {
        fields.innerHTML = `<input id="single" placeholder="${type === 'url' ? 'https://exemplo.com' : 'Digite aqui...'}" oninput="previewQR()">`;
    }
    setTimeout(() => document.querySelector("#fields input")?.focus(), 0);
}

let timeout;
function previewQR() {
    clearTimeout(timeout);
    timeout = setTimeout(async () => {
        const type = document.getElementById("type").value;
        const result = document.getElementById("result");
        let data;

        if (type === "vcard") {
            data = { name: document.getElementById("name")?.value, phone: document.getElementById("phone")?.value, email: document.getElementById("email")?.value };
            if (!data.name || !data.phone) return;
        } 
        else if (type === "whatsapp") {
            data = { phone: document.getElementById("phone")?.value, message: document.getElementById("message")?.value };
            if (!data.phone || data.phone.length < 8) return;
        }
        else if (type === "wifi") {
            data = { ssid: document.getElementById("ssid")?.value, password: document.getElementById("password")?.value, security: document.getElementById("security")?.value };
            if (!data.ssid) return;
        }
        else {
            data = document.getElementById("single")?.value;
            if (!data || data.length < 2) return;
        }

        result.innerHTML = `<div class="loader"></div>`;
        
        try {
            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, data })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || "Erro ao gerar QR");
            }

            const res = await response.json();

            result.innerHTML = `
                <canvas id="qrCanvas"></canvas>
                <div class="qr-actions">
                    <a id="downloadLink" class="btn-action">⬇️ Baixar</a>
                    <button onclick="copyQR()" class="btn-action">📋 Copiar</button>
                </div>`;
            
            drawQRWithLogo(res.qr);
            saveHistory(type, data);
            renderHistory();
        } catch (err) {
            result.innerHTML = `<p style="color: var(--error); font-size: 13px; margin-top: 10px;">❌ ${err.message}</p>`;
        }
    }, 800);
}

function generate() { previewQR(); }

function clearAll() {
    document.getElementById("type").value = "text";
    renderFields();
    document.getElementById("result").innerHTML = "";
}

function drawQRWithLogo(qrDataUrl) {
    const canvas = document.getElementById("qrCanvas");
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    const qr = new Image();
    const logo = new Image();
    
    qr.crossOrigin = "anonymous";
    logo.crossOrigin = "anonymous";

    qr.src = qrDataUrl;
    logo.src = "assets/logo.png"; 

    qr.onload = () => {
        canvas.width = qr.width; 
        canvas.height = qr.height;
        
        ctx.drawImage(qr, 0, 0);
        
        const downloadBtn = document.getElementById("downloadLink");

        logo.onload = () => {
            const size = canvas.width * 0.22;
            const x = (canvas.width - size) / 2;
            const y = (canvas.height - size) / 2;

            ctx.fillStyle = "#fff";
            ctx.fillRect(x - 5, y - 5, size + 10, size + 10);
            
            ctx.drawImage(logo, x, y, size, size);

            downloadBtn.href = canvas.toDataURL("image/png");
            downloadBtn.download = "qrcode-pro.png";
        };

        logo.onerror = () => {
            console.warn("Logo não encontrada em assets/logo.png. Gerando QR sem logo.");
            
            downloadBtn.href = canvas.toDataURL("image/png");
            downloadBtn.download = "qrcode.png";
        };
    };
}

async function copyQR() {
    const canvas = document.getElementById("qrCanvas");
    if (!canvas) return showToast("❌ Gere um QR Code primeiro");

    try {
        canvas.toBlob(async (blob) => {
            if (!blob) return showToast("❌ Erro ao processar imagem");
            
            try {
                const item = new ClipboardItem({ "image/png": blob });
                await navigator.clipboard.write([item]);
                showToast("📋 Copiado com sucesso!");
            } catch (err) {
                console.error("Erro na cópia:", err);
                showToast("❌ Navegador bloqueou a cópia");
            }
        }, "image/png");
    } catch (err) {
        showToast("❌ Erro ao acessar área de transferência");
    }
}

function saveHistory(type, data) {
    let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
    const entry = { type, data, date: new Date().getTime() };
    
    if (history.length > 0 && JSON.stringify(history[0].data) === JSON.stringify(data)) return;
    
    history.unshift(entry);
    if (history.length > 10) history.pop();
    localStorage.setItem("qrHistory", JSON.stringify(history));
}

function renderHistory() {
    const historyDiv = document.getElementById("history");
    const history = JSON.parse(localStorage.getItem("qrHistory")) || [];
    
    if (!history.length) {
        historyDiv.innerHTML = "<p style='font-size: 12px; color: var(--text-sub);'>Nenhum QR gerado ainda</p>";
        return;
    }

    historyDiv.innerHTML = history.map((item, i) => `
        <div class="history-item" onclick="loadHistory(${i})">
            <div>
                ${icons[item.type] || "📄"} <strong>${item.type.toUpperCase()}</strong>
            </div>
            <span>${typeof item.data === 'object' ? (item.data.ssid || item.data.name || item.data.phone || "Dados") : item.data.substring(0, 15) + "..."}</span>
        </div>`).join("");
}

function loadHistory(index) {
    const history = JSON.parse(localStorage.getItem("qrHistory")) || [];
    const item = history[index];
    if (!item) return;

    document.getElementById("type").value = item.type;
    renderFields();

    setTimeout(() => {
        if (typeof item.data === "object") {
            Object.keys(item.data).forEach(key => {
                const el = document.getElementById(key);
                if (el) el.value = item.data[key];
            });
        } else {
            const input = document.getElementById("single");
            if (input) input.value = item.data;
        }
        previewQR();
    }, 50);
}

function toggleHistory() { 
    document.getElementById("history-container").classList.toggle("hidden"); 
}

function clearHistory() {
    if (confirm("Deseja apagar todo o seu histórico local?")) {
        localStorage.removeItem("qrHistory");
        renderHistory();
        showToast("✨ Histórico limpo!");
    }
}

function showToast(message) {
    const existing = document.getElementById("toast");
    if (existing) existing.remove();

    const t = document.createElement("div"); 
    t.id = "toast"; 
    t.innerText = message;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function initTheme() {
    const themeToggle = document.getElementById("theme-toggle");
    const htmlElement = document.documentElement;

    const savedTheme = localStorage.getItem("theme") || "dark";
    htmlElement.setAttribute("data-theme", savedTheme);

    if (themeToggle) {
        themeToggle.addEventListener("click", () => {
            const currentTheme = htmlElement.getAttribute("data-theme");
            const newTheme = currentTheme === "dark" ? "light" : "dark";
            
            htmlElement.setAttribute("data-theme", newTheme);
            localStorage.setItem("theme", newTheme);
            showToast(`🌙 Modo ${newTheme === 'dark' ? 'Escuro' : 'Claro'} ativado`);
        });
    }
}

document.addEventListener("DOMContentLoaded", () => { 
    renderFields(); 
    renderHistory(); 
    initTheme();
});