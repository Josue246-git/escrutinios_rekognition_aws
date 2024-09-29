const express = require('express');
const fileUpload = require('express-fileupload');
const { validarImagen, subirImagen } = require('./validaciones/imagenes_subidas');
const validarActa = require('./validaciones/num_acta');
const extraerDatos = require('./extraerDatos');
const { connectToDatabase, getConnection } = require('./conexionDb'); // Importa las funciones del módulo de conexión

require('dotenv').config(); 
const app = express();

app.use(fileUpload());
app.use(express.json()); 

app.post('/procesar-acta', async (req, res) => {
    const { numeroActa } = req.body;
    const archivo = req.files.archivoActa;

    try {
        // Validar si el número de acta ya existe
        const actaExistente = await validarActa(numeroActa);
        if (actaExistente) {
            return res.status(400).json({ error: "El número de acta ya ha sido registrado." });
        }

        // Validar la imagen
        // const { valido, error } = await validarImagen(archivo.data);
        // if (!valido) {
        //     return res.status(400).json({ error });
        // }

        // Subir imagen a S3
        const { exito, error: s3Error } = await subirImagen(numeroActa, archivo);
        if (!exito) {
            return res.status(500).json({ error: s3Error });
        }

        // Procesar imagen con Textract
        const { forms, tables } = await extraerDatos(numeroActa);

        // Aquí podrías guardar los resultados en la base de datos...
        const connection = getConnection(); // Obtén la conexión a la base de datos

        res.json({ forms, tables });

    } catch (err) {
        res.status(500).json({ error: "Error al procesar el acta" });
    }
});

// Inicia la conexión a la base de datos y el servidor
const startServer = async () => {
    await connectToDatabase();
    const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
};

startServer();
