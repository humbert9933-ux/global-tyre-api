const express = require('express');
const cors = require('cors');
const fs = require('fs');
const Groq = require('groq-sdk');

const app = express();
app.use(cors({ origin: '*' }));
app.use(express.json());

// Iniciamos Groq con tu llave gsk_...
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

app.post('/api/chat', async (req, res) => {
    try {
        const { message } = req.body;
        let catalogo = "";
        try { 
            catalogo = fs.readFileSync('llantas_maxell_camion.json', 'utf8'); 
        } catch (e) { 
            catalogo = "Catálogo no disponible en este momento."; 
        }

        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `Eres el Asesor Senior de Ventas de 'Global Tyre' en Bolivia. 
                    TU OBJETIVO: Vender con autoridad, persuasión y cerrar el pedido.
                    USA ESTE CATÁLOGO REAL: ${catalogo}.
                    
                    REGLAS COMERCIALES:
                    1. Da precios exactos según el catálogo.
                    2. Resalta que Atlander es TAILANDESA con 50,000 km de garantía para uso agrícola/mixto.
                    3. Sé muy amable pero enfocado en la venta. 
                    4. Al final de cada respuesta, invita al cliente a añadir el producto al carrito y presionar el botón de WhatsApp para concretar la compra.`
                },
                { role: "user", content: message }
            ],
            // ESTE ES EL MODELO ACTUALIZADO Y COMPATIBLE (Llama 3.1)
            model: "llama-3.1-8b-instant",
            temperature: 0.7,
        });

        res.json({ response: chatCompletion.choices[0].message.content });
    } catch (error) {
        console.error("Error en el servidor:", error);
        res.status(500).json({ response: "Estamos actualizando el sistema de ventas. Por favor, añade tus productos al carrito y envíanos un WhatsApp." });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => { 
    console.log(`✅ Motor Llama 3.1 activado para Global Tyre.`); 
});
