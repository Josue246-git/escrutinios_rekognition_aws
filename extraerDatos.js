const { TextractClient, AnalyzeDocumentCommand } = require("@aws-sdk/client-textract");

const client = new TextractClient({ region: 'us-west-2' });

const extraerDatos = async (numeroActa) => {
    const params = {
        Document: {
            S3Object: {
                Bucket: 'test-electoral-rekognition',
                Name: `${numeroActa}.png`
            }
        },
        FeatureTypes: ["TABLES", "FORMS"]
    };

    try {
        const data = await client.send(new AnalyzeDocumentCommand(params));
        const blockMap = {};
        let forms = {};
        let tables = [];

        // Mapeo de los bloques detectados por Textract
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

        // Lógica para extraer los formularios (ya está en tu código)
        const essentialFields = ["CANTON", "PROVINCIA", "ZONA", "PARROQUIA", "CIRCUNSCRIPCION", "ACTA N'", "JUNTAN", "CONTROL N"];
        
        data.Blocks.forEach(block => {
            if (block.BlockType === 'KEY_VALUE_SET' && block.EntityTypes.includes('KEY')) {
                
                let keyText = getText(block).trim();

                if (/ELECCIONES SECCIONALES Y CPCCS/.test(keyText)) {

                    let valueBlock = block.Relationships.find(rel => rel.Type === 'VALUE');
                    let year = '';

                    if (valueBlock) {
                        year = valueBlock.Ids.map(id => getText(blockMap[id])).join(' ').trim();
                    }
                    forms["título"] = `${keyText} ${year}`.trim();
                } 
                else if (essentialFields.includes(keyText)) {
                    let valueBlock = block.Relationships.find(rel => rel.Type === 'VALUE');

                    if (valueBlock) {
                        let valueText = valueBlock.Ids.map(id => getText(blockMap[id])).join(' ').trim();
                        forms[keyText] = valueText;
                    }
                }
            }
        });

        // Lógica para extraer las tablas (también en tu código)
        data.Blocks.forEach(block => {
            if (block.BlockType === 'TABLE') 
            {
                const table = {};
                const tableRows = [];

                const cellIds = block.Relationships.find(rel => rel.Type === 'CHILD').Ids;
                cellIds.forEach(cellId => {
                    const cellBlock = blockMap[cellId];

                    if (cellBlock.BlockType === 'CELL') 
                    {
                        const cellText = getText(cellBlock);
                        const rowIndex = cellBlock.RowIndex;
                        const columnIndex = cellBlock.ColumnIndex;

                        if (!tableRows[rowIndex - 1]) {
                            tableRows[rowIndex - 1] = [];
                        }
                        tableRows[rowIndex - 1][columnIndex - 1] = cellText;
                    }
                });

                table.rows = tableRows;
                tables.push(table);
            }
        });

        return { forms, tables };
    } catch (err) {
        console.error("Error al analizar el documento: ", err);
        throw err;
    }
};

module.exports = extraerDatos;
