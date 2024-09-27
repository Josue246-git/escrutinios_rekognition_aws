// AWS SDK v3
const { RekognitionClient, DetectTextCommand } = require("@aws-sdk/client-rekognition");

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

// Función de detección de texto
const detectText = async () => {
    try {
        const command = new DetectTextCommand(params);
        const data = await client.send(command);

        const detections = data.TextDetections;

        // Almacenar datos extraídos
        let extractedData = {
            titulo: '',
            fecha: '',
            asunto: '',
            circunscripcion: '',
            numeroActa: '',
            control: '',
            firmas: 'Imágenes extraídas',
            codigoBarras: 'Imágenes extraídas',
            partidos: []
        };

        // Almacenar bloques relacionados por cercanía
        let partidosTemp = [];
        let currentParty = {};

        detections.forEach(item => {
            const detectedText = item.DetectedText.toUpperCase();

            // Detectar el título
            if (detectedText.includes("ELECCIONES SECCIONALES Y CPCCS")) {
                extractedData.titulo = detectedText;
            }

            // Detectar la fecha
            if (detectedText.match(/\d{1,2} DE \w+ DE \d{4}/)) {
                extractedData.fecha = detectedText;
            }

            // Detectar el asunto
            if (detectedText.includes("VOCALES DE JUNTA PARROQUIAL RURAL")) {
                extractedData.asunto = detectedText;
            }

            // Detectar la circunscripción
            if (detectedText.includes("CIRCUNSCRIPCIÓN")) {
                extractedData.circunscripcion = detectedText;
            }

            // Detectar número de acta y control
            if (detectedText.includes("ACTA N")) {
                extractedData.numeroActa = detectedText;
            }
            if (detectedText.includes("CONTROL N")) {
                extractedData.control = detectedText;
            }

            // Filtrar por posibles números de lista y votos (esto dependerá del formato exacto del acta)
            if (detectedText.match(/^\d{1,3}$/)) {
                // Posible número de lista (por ejemplo, 001, 002, etc.)
                currentParty.lista = detectedText;
            } else if (detectedText.match(/^\d+$/)) {
                // Posible número de votos (si son solo dígitos)
                currentParty.votos = detectedText;

                // Guardar el partido actual en la lista
                if (currentParty.lista && currentParty.votos) {
                    partidosTemp.push({ lista: currentParty.lista, votos: currentParty.votos });
                    currentParty = {};  // Reiniciar para el siguiente partido
                }
            } else if (detectedText.length > 3 && detectedText.length < 40) {
                // Posible nombre de partido (filtrar texto relevante entre 3 y 40 caracteres)
                currentParty.nombre = detectedText;
            }
        });

        // Asignar los partidos al resultado final
        extractedData.partidos = partidosTemp;

        console.log("Datos extraídos:", extractedData);

    } catch (error) {
        console.error("Error detecting text:", error);
    }
};

// Llamar a la función
detectText();
