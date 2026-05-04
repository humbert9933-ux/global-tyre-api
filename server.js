const express = require('express');
const cors = require('cors');
const fs = require('fs');
const { GoogleGenerativeAI } = require('@google/generative-ai');

const app = express();

// Permisos de seguridad para que tu web se conecte sin problemas
app.use(cors({ origin: '*' }));
app.use(express.json());

// Verificación de la API KEY
if (!process.env.GEMINI_API_KEY) {
    console.error("⚠️ ERROR: No se encontró la GEMINI_API_KEY en Render.");
}

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// Función para leer la base de datos de llantas
function obtenerCatalogo() {
    try {
        const data = fs.readFileSync('llantas_maxell_camion.json', 'utf8');
        return data;
    } catch (err) {
        console.error("⚠️ No se pudo leer el archivo JSON:", err);
        return "Catálogo temporalmente no disponible.";
    }
}

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        if (!message) return res.status(400).json({ response: "Mensaje vacío." });

        const catalogoActual = obtenerCatalogo();

        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `Eres el Asesor Senior de Ventas de 'Global Tyre' y 'Grupo Limex' en Bolivia. 
            
            TU OBJETIVO: Cerrar ventas y asesorar técnicamente con autoridad.
            
            PERSONALIDAD: 
            Eres entusiasta, profesional, persuasivo y experto. No solo das datos, "vendes" los beneficios. 
            Si el cliente pregunta por algo que NO está en el catálogo, ofrécele lo más parecido y resalta sus ventajas.

            CONOCIMIENTO ESTRATÉGICO:
            - Atlander: Marca tailandesa de alto rendimiento. ¡Resalta siempre su GARANTÍA DE 50,000 KM para uso agrícola y off-road! Es un argumento de venta clave.
            - Grupo Limex: Somos especialistas importadores en llantas de moto con marcas como Maxibras, Zunny y Runwell.
            - Camión/Bus: Manejamos Maxell, Royal Black y Zunny con la mejor relación costo-kilómetro.

            TU BASE DE DATOS REAL (Usa estos precios y modelos):
            ${catalogoActual}

            REGLAS COMERCIALES:
            1. Siempre que menciones un producto, indica su PRECIO exacto según el catálogo.
            2. Usa un lenguaje que genere confianza (ej: "Esta Maxell es la favorita de las flotas en Santa Cruz por su durabilidad").
            3. Si el cliente duda, recuerda que somos expertos en logística nacional.
            4. CIERRE: Siempre termina invitando al cliente a que añada el producto a su carrito en la página y presione el botón de WhatsApp para que tú o el equipo comercial cierren el pedido formal.`
        });

        const result = await model.generateContent(message);
        res.json({ response: result.response.text() });

    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ response: "Estamos recibiendo muchas consultas. Por favor, añade tus productos al carrito y contáctanos por WhatsApp directamente." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`✅ Cerebro Comercial de Global Tyre activo en puerto ${PORT}`);
});
