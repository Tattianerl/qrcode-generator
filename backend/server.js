import 'dotenv/config';
import express from "express";
import QRCode from "qrcode";
import cors from "cors";

const app = express();
app.use(cors({ 
  origin: process.env.FRONTEND_URL || "*" 
}));

// Limite de 10kb é ótimo para evitar ataques de negação de serviço (DoS)
app.use(express.json({ limit: "10kb" }));

const clean = (t = "") => String(t).trim();

function formatData(type, data) {
  if (!data) return "";

  switch (type) {
    case "url": 
      const link = clean(data);
      return link.startsWith("http") ? link : `https://${link}`;
    
    case "phone": 
      return `tel:${clean(data).replace(/[^\d+]/g, "")}`;
    
    case "whatsapp": 
      const p = clean(data.phone).replace(/\D/g, "");
      const m = encodeURIComponent(data.message || "");
      return `https://wa.me/${p}${m ? `?text=${m}` : ""}`;
    
    case "wifi": 
      const escape = (v) => String(v).replace(/([\\;,":])/g, "\\$1");
      return `WIFI:T:${data.security || "WPA"};S:${escape(data.ssid)};P:${escape(data.password || "")};;`;
    
    case "vcard": 
      return `BEGIN:VCARD\r\nVERSION:3.0\r\nFN:${clean(data.name)}\r\nTEL:${clean(data.phone)}\r\nEMAIL:${clean(data.email)}\r\nEND:VCARD`;
    
    default: 
      return clean(data);
  }
}
// Rota de teste para confirmar que o servidor está online
app.get("/", (req, res) => {
  res.send("🚀 Servidor QR Code Pro está online e aguardando requisições POST!");
});

app.post("/generate", async (req, res) => {
  try {
    const { type, data } = req.body;
    if (!type || !data) {
      return res.status(400).json({ error: "Dados ausentes ou incompletos" });
    }

    const formatted = formatData(type, data);
    
    const qr = await QRCode.toDataURL(formatted, { 
      errorCorrectionLevel: "H", 
      margin: 2, 
      width: 800,
      color: {
        dark: "#000000", 
        light: "#ffffff" 
      }
    });

    res.json({ qr });
    
  } catch (err) {
    console.error("Erro no Servidor:", err); 
    res.status(500).json({ error: "Erro interno ao gerar QR Code" });
  }
} );

const PORT = process.env.PORT || 3000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Servidor QR Pro Online na porta: ${PORT}`);
});