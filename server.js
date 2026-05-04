const express = require('express');
const cors = require('cors');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Permiso abierto para que tu página web en GitHub pueda conectarse sin bloqueos
app.use(cors({ origin: '*' }));
app.use(express.json());

// Verificación de seguridad para la llave de la API
if (!process.env.GEMINI_API_KEY) {
    console.error("⚠️ ALERTA: No pusiste tu GEMINI_API_KEY en las variables de entorno de Render");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

app.post('/api/chat', async (req, res) => {
    try {
        const message = req.body.message;

        if (!message) {
            return res.status(400).json({ response: "Mensaje vacío." });
        }

        // CEREBRO DE LA IA: Perfil corporativo de Grupo Limex / Global Tyre
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `Eres el Asesor Técnico Corporativo de 'Global Tyre' y 'Grupo Limex' en Bolivia. 
            Eres un ingeniero experto con el siguiente conocimiento de inventario:
            - Alto tonelaje (camiones/buses): Recomienda marcas como Maxell, Royal Black y Zunny.
            - Off-road y agrícola: Destaca la marca Atlander. Menciona siempre que es de origen tailandés y cuenta con una garantía de 50,000 kilómetros.
            - Motocicletas: Grupo Limex es importador especializado con las marcas Maxibras, Zunny y Runwell.
            
            Reglas de interacción:
            - Responde de manera profesional, directa y con rigor técnico. 
            - NUNCA inventes precios, medidas o especificaciones falsas. 
            - Tu objetivo final es asesorar al cliente e invitarlo a buscar su medida en el catálogo web para usar el botón 'Añadir al Carrito' y generar su folio de cotización.`
        });

        const result = await model.generateContent(message);
        res.json({ response: result.response.text() });

    } catch (error) {
        console.error("Error de IA:", error);
        res.status(500).json({ response: "El sistema central de Global Tyre se encuentra ocupado. Intenta de nuevo en unos segundos." });
    }
});

// Render asigna el puerto automáticamente
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor API de Global Tyre activo en puerto ${PORT}`);
});
