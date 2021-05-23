const db = {};
const Sequelize = require('sequelize');
let sequelize;

if (process.env.DATABASE_URL) {
  // PostgreSql Heroku PRODUCTION
  sequelize = new Sequelize(process.env.DATABASE_URL, {
    dialect: 'postgres',
    protocol: 'postgres',
    native: true,
    ssl: true,
    port: 5432,
    pool: {
      max: 5,
      min: 0,
      acquire: 30000,
      idle: 10000,
    },
  });
} else {
  // PostgreSql
  sequelize = new Sequelize(
    process.env.DB,
    process.env.DB_USER,
    process.env.DB_PASSWORD,
    {
      host: process.env.DB_HOST,
      dialect: process.env.DB_DIALECT,
      port: process.env.DB_PORT,
      pool: {
        max: parseInt(process.env.DB_POOL_MAX, 10),
        min: parseInt(process.env.DB_POOL_MIN, 0),
        acquire: parseInt(process.env.DB_POOL_ACQUIRE, 30000),
        idle: parseInt(process.env.DB_POOL_IDLE, 10000),
      },
    }
  );
}

db.Sequelize = Sequelize;
db.sequelize = sequelize;

// Tablas
db.Incidencias = require('../models/incidencias')(db.sequelize, db.Sequelize);
db.Actuaciones = require('../models/actuaciones')(db.sequelize, db.Sequelize);

db.Actuaciones.belongsTo(db.Incidencias);
db.Incidencias.hasMany(db.Actuaciones);

module.exports = db;
