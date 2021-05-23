module.exports = (sequelize, Sequelize) => {
  const Incidencias = sequelize.define(
    'incidencias',
    {
      id: {
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
        required: true,
        primaryKey: true,
      },
      descripcion: {
        type: Sequelize.DataTypes.TEXT,
        required: true,
      },
    },
    { underscored: true, tableName: 'incidencias' }
  );

  return Incidencias;
};
