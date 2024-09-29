const mysql = require('mysql2/promise');


// Crear pool de conexiones para la base de datos
const db = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'password',
    database: 'actas_db'
});

// Función para verificar si el número de acta ya está registrado
const validarActa = async (numeroActa) => {
    try {
        const [rows] = await db.query('SELECT * FROM actas WHERE numero = ?', [numeroActa]);
        return rows.length > 0;  // true si existe, false si no
    } catch (err) {
        console.error("Error al validar el número de acta: ", err);
        throw err;
    }
};

module.exports = validarActa;
