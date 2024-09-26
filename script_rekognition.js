// Importar el SDK de AWS
const AWS = require('aws-sdk');

// Configurar el servicio de Rekognition
const rekognition = new AWS.Rekognition({
    region: 'us-west-2' // Cambia esto por la región de tu bucket S3
});

// Definir los parámetros del bucket y la imagen
const params = {
    Image: {
        S3Object: {
            Bucket: 'test-electoral-rekognition',  // Cambia por el nombre de tu bucket
            Name: 'nombre-de-la-imagen.jpg' // Cambia por el nombre de tu imagen
        }
    }
};

// Llamar a Rekognition para detectar texto
rekognition.detectText(params, (err, data) => {
    if (err) {
        console.log("Error detectando el texto:", err);
    } else {
        console.log("Texto detectado:", data.TextDetections);
        // Aquí puedes procesar los datos detectados
        data.TextDetections.forEach(text => {
            console.log(text.DetectedText, text.Geometry); // Muestra el texto y sus coordenadas
        });
    }
});
