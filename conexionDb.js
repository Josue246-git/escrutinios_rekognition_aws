// db.js
const mysql = require('mysql2/promise'); // Importamos mysql2 con promesas

require('dotenv').config();

// Configuración de la conexión a la base de datos
const dbConfig = {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME, 
};

let connection;

const connectToDatabase = async () => {
    try {
        connection = await mysql.createConnection(dbConfig);
        console.log('Conexión a la base de datos exitosa');
    } catch (error) {
        console.error('Error al conectar a la base de datos:', error);
        process.exit(1); // Salir del proceso si no se puede conectar
    }
};

// Exportar la función de conexión y la conexión misma
module.exports = {
    connectToDatabase,
    getConnection: () => connection,
};
