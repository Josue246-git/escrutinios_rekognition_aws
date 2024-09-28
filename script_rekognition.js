const { RekognitionClient, DetectTextCommand } = require("@aws-sdk/client-rekognition");
const fs = require('fs'); // Módulo para manipular archivos

// Inicializar el cliente de Rekognition con el SDK v3
const client = new RekognitionClient({ region: 'us-west-2' });

// Parámetros para el comando detectText
const params = {
    Image: {
        S3Object: {
            Bucket: 'test-electoral-rekognition',
            Name: 'Mejor-de-los-casos.png'
        }
    }
};

// Función principal para ejecutar el comando DetectText
async function detectText() {
    try {
        // Usar el comando DetectTextCommand
        const command = new DetectTextCommand(params);
        const response = await client.send(command);

        // Procesa los bloques de texto detectados
        const detectedText = response.TextDetections;

        // Inicializar variable para almacenar la salida
        let output = "===== Todos los textos detectados =====\n";

        detectedText.forEach(text => {
            output += `Texto: ${text.DetectedText}\n`;
            output += `Tipo: ${text.Type}\n`; // LINE o WORD
            output += `Confianza: ${text.Confidence}\n`; // Confianza de la detección
            output += `Coordenadas: ${JSON.stringify(text.Geometry.BoundingBox)}\n`; // Coordenadas del bloque de texto en la imagen
            output += "----------------------------------------\n";
        });

        output += "========================================\n";

        // Escribir la salida en un archivo txt
        fs.writeFileSync('resultado_rekognition.txt', output);

        console.log("Texto detectado guardado en 'resultado_rekognition.txt'");

    } catch (err) {
        console.error("Error detectando el texto:", err);
    }
}

// Ejecutar la función
detectText();
