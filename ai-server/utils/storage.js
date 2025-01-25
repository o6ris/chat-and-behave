const fs = require('fs').promises;
const path = require('path');

const dataPath = path.join(__dirname, '../data');

const storage = {
    async readData(file) {
        const filePath = path.join(dataPath, file);
        try {
            const data = await fs.readFile(filePath, 'utf8');
            return JSON.parse(data);
        } catch (error) {
            return [];
        }
    },

    async writeData(file, data) {
        const filePath = path.join(dataPath, file);
        await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    }
};

module.exports = storage;
