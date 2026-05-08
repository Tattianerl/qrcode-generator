const API_BASE_URL = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
    ? "http://localhost:3000"
    : "https://qrcode-generator-5x59.onrender.com"; 

const icons = { text: "📝", url: "🌐", phone: "📱", whatsapp: "💬", wifi: "📶", vcard: "👤" };
let timeout;

/* ================= RENDERIZAÇÃO ================= */
function renderFields() {
    const type = document.getElementById("type").value;
    const fields = document.getElementById("fields");
    const result = document.getElementById("result");
    if (result) result.innerHTML = ""; 

    if (type === "vcard") {
        fields.innerHTML = `
            <input id="name" placeholder="Nome">
            <input id="phone_field" placeholder="Telefone">
            <input id="email" placeholder="Email">`;
    } else if (type === "whatsapp") {
        fields.innerHTML = `
            <div class="field-group">
                <p class="field-label">Inclua o código do país (ex: 55)</p>
                <input id="phone_field" placeholder="5521999999999">
            </div>
            <div class="field-group full-width">
                <input id="message" placeholder="Mensagem opcional">
            </div>`;
    } else if (type === "wifi") {
        fields.innerHTML = `
            <input id="ssid" placeholder="Nome da rede (SSID)">
            <input id="password" type="password" placeholder="Senha">
            <select id="security">
                <option value="WPA">WPA/WPA2</option>
                <option value="WEP">WEP</option>
                <option value="nopass">Sem senha</option>
            </select>`;
    } else {
        fields.innerHTML = `<input id="single" placeholder="${type === 'url' ? 'https://exemplo.com' : 'Digite aqui...'}">`;
    }
}

/* ================= GERAÇÃO ================= */
async function generate(immediate = false) {
    clearTimeout(timeout);
    const delay = immediate ? 0 : 800;

    timeout = setTimeout(async () => {
        const typeEl = document.getElementById("type");
        if (!typeEl) return; 
        
        const type = typeEl.value;
        let data;

        if (type === "vcard") {
            data = { 
                name: document.getElementById("name")?.value, 
                phone: document.getElementById("phone_field")?.value, 
                email: document.getElementById("email")?.value
            };
            if (!data.name || !data.phone) return;
        } else if (type === "whatsapp") {
            data = { 
                phone: document.getElementById("phone_field")?.value, 
                message: document.getElementById("message")?.value
            };
            if (!data.phone) return;
        } else if (type === "wifi") {
            data = { 
                ssid: document.getElementById("ssid")?.value, 
                password: document.getElementById("password")?.value, 
                security: document.getElementById("security")?.value
            };
            if (!data.ssid) return;
        } else {
            data = document.getElementById("single")?.value;
            if (!data) return;
        }

        const result = document.getElementById("result");
        result.innerHTML = `<div class="loader"></div>`;
        
        try {
            const response = await fetch(`${API_BASE_URL}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ type, data })
            });

            if (!response.ok) throw new Error("Falha na resposta da API");

            const res = await response.json();
            
            if (result) {
                result.innerHTML = `
                    <canvas id="qrCanvas"></canvas>
                    <div class="qr-actions">
                        <a id="downloadLink" class="btn-action">⬇️ Baixar</a>
                        <button id="copyBtn" class="btn-action">📋 Copiar</button>
                    </div>`;
            
            drawQR(res.qr);
            saveHistory(type, data);
            }
       } catch (err) {
            console.error("Erro na geração:", err);
            if (result) {
                result.innerHTML = `<p style="color: var(--error);">⚠️ Não foi possível gerar o código. Tente novamente.</p>`;
            }
        }
    }, delay);
}
function drawQR(qrDataUrl) {
    const canvas = document.getElementById("qrCanvas");
    const ctx = canvas.getContext("2d");
    const downloadLink = document.getElementById("downloadLink");
    
    const qrImg = new Image();
    const logoImg = new Image();

    qrImg.src = qrDataUrl;
    logoImg.src = "./assets/logo.png"; 

    qrImg.onload = () => {
        canvas.width = qrImg.width;
        canvas.height = qrImg.height;
        
      
        ctx.drawImage(qrImg, 0, 0);

        logoImg.onload = () => {
            const logoSize = canvas.width * 0.2;
            const x = (canvas.width - logoSize) / 2;
            const y = (canvas.height - logoSize) / 2;

            
            ctx.fillStyle = "white";
            ctx.beginPath();
            
            ctx.fillRect(x - 2, y - 2, logoSize + 4, logoSize + 4); 
            ctx.fill();

            ctx.drawImage(logoImg, x, y, logoSize, logoSize);
            
            
            const finalImage = canvas.toDataURL("image/png");
            downloadLink.href = finalImage;
            downloadLink.setAttribute("download", `qrcode_${Date.now()}.png`);
        };

        
        logoImg.onerror = () => {
            downloadLink.href = canvas.toDataURL("image/png");
            downloadLink.setAttribute("download", "qrcode.png");
        };
    };
}


/* ================= HISTÓRICO ================= */
function saveHistory(type, data) {
    let history = JSON.parse(localStorage.getItem("qrHistory")) || [];
    if (history.length > 0 && JSON.stringify(history[0].data) === JSON.stringify(data)) return;
    history.unshift({ type, data, date: Date.now() });
    localStorage.setItem("qrHistory", JSON.stringify(history.slice(0, 10)));
    renderHistory();
}

function renderHistory() {
    const historyList = document.getElementById("history");
    const btnTrash = document.getElementById("btnClearHistory"); 
    const history = JSON.parse(localStorage.getItem("qrHistory")) || [];
    
    if (history.length === 0) {
        historyList.innerHTML = "<p style='font-size:12px; opacity:0.5; padding:20px;'>Nenhum QR Code gerado ainda.</p>";
        if (btnTrash) btnTrash.style.display = "none"; 
        return;
    }

    if (btnTrash) btnTrash.style.display = "block"; 
    
    historyList.innerHTML = history.map((item, i) => `
        <div class="history-item" onclick="loadHistory(${i})">
            <span>${icons[item.type] || "📄"} ${item.type}</span>
            <small style="opacity:0.5;">${new Date(item.date).toLocaleTimeString()}</small>
        </div>`).join("");
}
window.loadHistory = (index) => {
    const history = JSON.parse(localStorage.getItem("qrHistory"));
    const item = history[index];
    document.getElementById("type").value = item.type;
    renderFields();
    setTimeout(() => {
        if (typeof item.data === "object") {
            Object.keys(item.data).forEach(k => {
                const id = k === "phone" ? "phone_field" : k;
                if(document.getElementById(id)) document.getElementById(id).value = item.data[k];
            });
        } else {
            if(document.getElementById("single")) document.getElementById("single").value = item.data;
        }
        generate(true);
    }, 50);
};
/* ================= INICIALIZAÇÃO (ATUALIZADA) ================= */
document.addEventListener("DOMContentLoaded", () => {
    renderFields();
    renderHistory();

    const customSelect = document.getElementById("customSelect");
    const trigger = customSelect?.querySelector(".custom-select-trigger");
    const options = customSelect?.querySelectorAll(".custom-option");
    const realSelect = document.getElementById("type");

    if (trigger && options) {
        trigger.onclick = (e) => {
            e.stopPropagation(); 
            customSelect.classList.toggle("open");
        };

        options.forEach(option => {
            option.onclick = () => {
                options.forEach(opt => opt.classList.remove("selected"));
                option.classList.add("selected");
                
                customSelect.classList.remove("open");
                trigger.querySelector("span").textContent = option.textContent;

                if (realSelect) {
                    realSelect.value = option.getAttribute("data-value");
                    renderFields(); 
                }
            };
        });

        window.addEventListener("click", () => {
            customSelect.classList.remove("open");
        });
    }

    document.getElementById("btnGenerate").onclick = () => generate(true);
    
    document.getElementById("btnClear").onclick = () => { 
        renderFields(); 
        const result = document.getElementById("result");
        if (result) result.innerHTML = ""; 
    };

    // Gestão do Histórico e Modal
    document.getElementById("btnToggleHistory").onclick = () => 
        document.getElementById("history-container").classList.toggle("hidden");

    document.getElementById("btnClearHistory").onclick = () => 
        document.getElementById("confirmModal").classList.remove("hidden");

    document.getElementById("closeModal").onclick = () => 
        document.getElementById("confirmModal").classList.add("hidden");

    document.getElementById("confirmClear").onclick = () => {
        localStorage.removeItem("qrHistory");
        renderHistory();
        document.getElementById("confirmModal").classList.add("hidden");
    };

    // Debounce e Inputs Dinâmicos
    document.getElementById("fields").oninput = () => generate();

    // 6. Alternância de Tema
    document.getElementById("theme-toggle").onclick = () => {
        const currentTheme = document.documentElement.getAttribute("data-theme");
        const newTheme = currentTheme === "dark" ? "light" : "dark";
        document.documentElement.setAttribute("data-theme", newTheme);
    };
});

document.addEventListener("click", e => {
    if (e.target.id === "copyBtn") {
        const canvas = document.getElementById("qrCanvas");
        canvas.toBlob(blob => {
            navigator.clipboard.write([new ClipboardItem({"image/png": blob})]);
            const t = document.createElement("div");
            t.style = "position:fixed; bottom:20px; left:50%; transform:translateX(-50%); background:var(--success); color:white; padding:8px 16px; border-radius:20px; font-size:12px; z-index:9999;";
            t.innerText = "Copiado!";
            document.body.appendChild(t);
            setTimeout(() => t.remove(), 2000);
        });
    }
});