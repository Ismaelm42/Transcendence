'use strict';

import fs from 'fs';					// Importa el módulo fs para leer archivos
import path from 'path';				// Importa el módulo path para manejar rutas de archivos
import { Sequelize } from 'sequelize';	// Importa la clase Sequelize
import process from 'process';			// Importa el módulo process para acceder a variables de entorno
import { fileURLToPath } from 'url';	// Importa la función fileURLToPath para convertir una URL a una ruta de archivo

const __filename = fileURLToPath(import.meta.url);	// Obtiene la ruta del archivo actual
const __dirname = path.dirname(__filename);			// Obtiene el directorio del archivo actual
const basename = path.basename(__filename);			// Obtiene el nombre del archivo actual
const env = process.env.NODE_ENV || 'development';	// Obtiene el entorno de ejecución
const db = {};										// Objeto para almacenar los modelos		


// Lee el archivo JSON manualmente
let config;
try {
  const configPath = path.resolve(__dirname, '../config/config.json');
  const configFile = fs.readFileSync(configPath, 'utf8');
  const configData = JSON.parse(configFile);
  config = configData[env];
} catch (err) {
  console.error('Error loading config file:', err);
  process.exit(1);
}

let sequelize;
if (config.use_env_variable) {
  sequelize = new Sequelize(process.env[config.use_env_variable], config);
} else {
  sequelize = new Sequelize(config.database, config.username, config.password, config);
}

const modelFiles = fs
  .readdirSync(__dirname)
  .filter(file => {
    return (
      file.indexOf('.') !== 0 &&
      file !== basename &&
      file.slice(-3) === '.js' &&
      file.indexOf('.test.js') === -1
    );
  });

for (const file of modelFiles) {
  const module = await import(path.join(__dirname, file));
  const model = module.default(sequelize, Sequelize.DataTypes);
  db[model.name] = model;
}

Object.keys(db).forEach(modelName => {
  if (db[modelName].associate) {
    db[modelName].associate(db);
  }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

export { sequelize, Sequelize };
export default db;