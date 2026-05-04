const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Verificamos que la llave exista antes de intentar conectar
const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ response: "Mensaje vacío" });

        let catalogo = "";
        try {
            catalogo = fs.readFileSync('llantas_maxell_camion.json', 'utf8');
        } catch (e) {
            catalogo = "Error al leer el catálogo.";
        }

        // Usamos el modelo flash-1.5 que es el más estable actualmente
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        const promptFinal = `Actúa como asesor de ventas de Global Tyre Bolivia. 
        Usa estos datos: ${catalogo}. 
        Cliente pregunta: ${message}`;

        const result = await model.generateContent(promptFinal);
        const text = result.response.text();

        res.json({ response: text });

    } catch (error) {
        console.error("ERROR DETALLADO:", error);
        // Si el error persiste, este mensaje nos dirá por qué:
        res.status(500).json({ response: "⚠️ Error: " + error.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor comercial listo.`);
});
