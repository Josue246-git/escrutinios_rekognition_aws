const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");

// Inicializar el cliente de Textract con el SDK v3
const client = new TextractClient({ region: 'us-west-2' });

// Parámetros para el comando AnalyzeDocument
const params = {
    Document: {
        S3Object: {
            Bucket: 'test-electoral-rekognition',  // Nombre de tu bucket S3
            Name: 'Peor-casos-acta-escrutinio.png'        // Nombre del archivo en S3 
        }
    },
    FeatureTypes: ["TABLES", "FORMS"]  // Analizar tablas y formularios
};

// Función para optimizar la extracción de los datos del formulario
const analyzeDocument = async () => {
    try {
        const data = await client.send(new AnalyzeDocumentCommand(params));

        // Mapeo para los bloques detectados por Textract
        const blockMap = {};
        data.Blocks.forEach(block => {
            blockMap[block.Id] = block;
        });

        // Función auxiliar para obtener el texto de un bloque
        const getText = (block) => {
            if (block.Relationships) {
                return block.Relationships
                    .filter(rel => rel.Type === 'CHILD')
                    .flatMap(rel => rel.Ids)
                    .map(id => blockMap[id].Text)
                    .join(' ');
            }
            return '';
        };

        // Filtrado de datos para formularios esenciales
        let forms = {};

        // Lista de campos esenciales de cabecera a extraer con generalización
        const essentialFields = [
            "CANTON", "PROVINCIA", "ZONA", "PARROQUIA", 
            "CIRCUNSCRIPCION", "ACTA N'", "JUNTAN", "CONTROL N", 
        ];

        // Extraer información de formularios
        data.Blocks.forEach(block => {
            if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes.includes('KEY')) {
                let keyText = getText(block).trim();

                // Generalización para título y fecha
                if (/ELECCIONES SECCIONALES Y CPCCS/.test(keyText)) {
                    let valueBlock = block.Relationships.find(rel => rel.Type === 'VALUE');
                    let year = '';
                    if (valueBlock) {
                        year = valueBlock.Ids.map(id => getText(blockMap[id])).join(' ').trim();
                    }
                    forms["título"] = `${keyText} ${year}`.trim(); // Añadir el año al título
                } else if (essentialFields.includes(keyText)) {
                    let valueBlock = block.Relationships.find(rel => rel.Type === 'VALUE');
                    if (valueBlock) {
                        let valueText = valueBlock.Ids.map(id => getText(blockMap[id])).join(' ').trim();
                        forms[keyText] = valueText;
                    }
                }
            }
        });

        // Identificación de la fecha como inline
        const datePattern = /\d{1,2} DE \w+ DE \d{4}/;

        data.Blocks.forEach(block => {
            if (block.BlockType === 'LINE') {
                const lineText = getText(block).trim();
                const dateMatch = lineText.match(datePattern);
                if (dateMatch) {
                    forms["fecha"] = dateMatch[0]; // Capturar la fecha
                }
            }
        });

        // Extracción de información de las tablas
        let tables = [];

        data.Blocks.forEach(block => {
            if (block.BlockType === 'TABLE') {
                const table = {};
                const tableRows = [];

                // Recorrer las relaciones de la tabla para obtener filas y celdas
                const cellIds = block.Relationships.find(rel => rel.Type === 'CHILD').Ids;
                cellIds.forEach(cellId => {
                    const cellBlock = blockMap[cellId];
                    if (cellBlock.BlockType === 'CELL') {
                        const cellText = getText(cellBlock);
                        const rowIndex = cellBlock.RowIndex;
                        const columnIndex = cellBlock.ColumnIndex;

                        // Si la fila no existe, crearla
                        if (!tableRows[rowIndex - 1]) {
                            tableRows[rowIndex - 1] = [];
                        }
                        // Añadir el texto de la celda a la fila correspondiente
                        tableRows[rowIndex - 1][columnIndex - 1] = cellText;
                    }
                });

                // Añadir las filas de la tabla al objeto de la tabla
                table.rows = tableRows;
                tables.push(table);
            }
        });

        // Mostrar información de las tablas
        console.log("Tablas:", JSON.stringify(tables, null, 2));
        // Mostrar los resultados optimizados del formulario
        console.log("Formulario Optimizado:", JSON.stringify(forms, null, 2));
 

    } catch (err) {
        console.error("Error al analizar el documento: ", err);
    }
};

// Ejecutar la función principal
analyzeDocument();
