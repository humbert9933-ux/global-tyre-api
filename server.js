const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Inicialización de la IA
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        
        let catalogo = "";
        try {
            catalogo = fs.readFileSync('llantas_maxell_camion.json', 'utf8');
        } catch (e) {
            catalogo = "Error cargando catálogo.";
        }

        // USAMOS EL MODELO FLASH 1.5 CON LA RUTA CORRECTA
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash" 
        });

        const chat = model.startChat({
            history: [
                {
                    role: "user",
                    parts: [{ text: `Eres un vendedor estrella de Global Tyre en Bolivia. Tu catálogo es: ${catalogo}. Sé persuasivo y cierra ventas.` }],
                },
                {
                    role: "model",
                    parts: [{ text: "Entendido. Soy el asesor experto de Global Tyre y estoy listo para vender." }],
                },
            ],
        });

        const result = await chat.sendMessage(message);
        const response = await result.response;
        res.json({ response: response.text() });

    } catch (error) {
        console.error("DETALLE DEL ERROR:", error);
        res.status(500).json({ response: "⚠️ Error de conexión con Gemini: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor actualizado y corriendo.`);
});
