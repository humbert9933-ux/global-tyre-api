const express = require('express');
const cors = require('cors');
const fs = require('fs'); // Nueva herramienta para leer el catálogo
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

app.use(cors({ origin: '*' }));
app.use(express.json());

if (!process.env.GEMINI_API_KEY) {
    console.error("⚠️ ALERTA: Falta tu GEMINI_API_KEY en Render");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// El servidor carga tu catálogo en su memoria al encender
let catalogoLlantas = "Catálogo no disponible en este momento.";
try {
    catalogoLlantas = fs.readFileSync('llantas_maxell_camion.json', 'utf8');
} catch (err) {
    console.error("⚠️ No se encontró el archivo llantas_maxell_camion.json");
}

app.post('/api/chat', async (req, res) => {
    try {
        const message = req.body.message;

        if (!message) {
            return res.status(400).json({ response: "Mensaje vacío." });
        }

        // CEREBRO DE LA IA: Perfil Comercial "Lobo de Wall Street" versión Llantas
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.5-flash",
            systemInstruction: `Eres el Asesor de Ventas Estrella y Experto Técnico de 'Global Tyre' y 'Grupo Limex' en Bolivia.
            
            TU PERSONALIDAD:
            Eres persuasivo, muy seguro de ti mismo, directo y altamente enfocado en cerrar la venta. Tratas al cliente con respeto profesional pero con un tono comercial atractivo. Siempre resaltas el retorno de inversión y la durabilidad de nuestras llantas.

            TUS PRODUCTOS ESTRELLA:
            - Alto tonelaje: Maxell, Royal Black y Zunny.
            - Off-road/Agrícola: Atlander (TAILANDESA, destaca con fuerza su garantía de 50,000 km).
            - Motos: Maxibras, Zunny y Runwell.

            TU BASE DE DATOS (Catálogo actual de la empresa con precios):
            ${catalogoLlantas}

            REGLAS ESTRICTAS DE VENTA:
            1. Usa la base de datos de arriba para dar precios y medidas EXACTAS.
            2. NUNCA inventes una medida o un precio que no esté en la base de datos. Si el cliente pide algo que no tenemos, ofrécele la alternativa más cercana que sí tengamos.
            3. No des solo el precio; justifica el valor (ej: "Es una excelente inversión por X bolivianos gracias a su resistencia en rutas de tierra").
            4. CIERRE DE VENTA: En casi todas tus respuestas, debes guiar e invitar al cliente a que busque la medida en el catálogo de la pantalla y presione el botón rojo "Añadir al Carrito" para generar su cotización oficial por WhatsApp.`
        });

        const result = await model.generateContent(message);
        res.json({ response: result.response.text() });

    } catch (error) {
        console.error("Error de IA:", error);
        res.status(500).json({ response: "Nuestros asesores están ocupados en este instante. Por favor, añade tus llantas al carrito y envíanos el WhatsApp." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Servidor Comercial activo en puerto ${PORT}`);
});
