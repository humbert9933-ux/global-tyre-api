const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Groq = require('groq-sdk');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        let catalogo = "";
        try { catalogo = fs.readFileSync('llantas_maxell_camion.json', 'utf8'); } catch (e) { catalogo = "Catálogo no disponible."; }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Eres el Asesor Senior de Ventas de 'Global Tyre' en Bolivia. 
                    TU OBJETIVO: Vender con autoridad y cerrar el pedido.
                    USA ESTE CATÁLOGO REAL: ${catalogo}.
                    REGLAS:
                    1. Da precios exactos y resalta beneficios.
                    2. Menciona que Atlander es tailandesa con 50,000 km de garantía.
                    3. Sé persuasivo. Al final, invita a añadir al carrito y enviar el WhatsApp.`
                },
                { role: "user", content: message }
            ],
            model: "llama3-8b-8192",
        });

        res.json({ response: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ response: "Error de conexión: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { console.log(`✅ Nuevo motor Groq activo.`); });
