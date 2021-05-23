const fs = require('fs');
const path = require('path');
const handlebars = require('handlebars');
const helpers = require('handlebars-helpers')({ handlebars: handlebars });

const db = require('../db/connection.js');
const directorio_vista = '../views/incidencias/';
const directorio_imagenes = '../public/imagenes/';
const url_imagenes = '/imagenes/';
const array_paginador = require('../helpers/paginador');
const campos_incidencias = ['id', 'descripcion', 'created_at', 'updated_at'];
const campos_actuaciones = [
  'id',
  'incidencia_id',
  'descripcion',
  'solucion',
  'file_path',
  'created_at',
  'updated_at',
];

let alerta = '';

// ########################################################
// index
const indice = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorio_vista, 'index.hbs');
  const registros = [];

  const pagina = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = 0 + (pagina - 1) * limit;

  console.log('======= INDICE ==========');

  //const incidencias = await db.Incidencias.findAll({
  const incidencias_count = await db.Incidencias.findAndCountAll({
    offset: offset,
    limit: limit,
    attributes: campos_incidencias,
    include: 'actuaciones',
  });

  const incidencias = incidencias_count.rows;
  const ultima_pagina = Math.ceil(incidencias_count.count / limit);
  const botones_paginas = array_paginador(pagina, ultima_pagina);

  let actuaciones;
  let actuacionesDB;

  for (let i = 0; i < incidencias.length; i += 1) {
    const element = incidencias[i];

    actuaciones = [];
    actuacionesDB = await db.Actuaciones.findAll({
      where: {
        incidencia_id: element.dataValues.id,
      },
      attributes: campos_actuaciones,
    });

    if (element.actuaciones) {
      for (let n = 0; n < actuacionesDB.length; n += 1) {
        const elementDB = actuacionesDB[n];

        actuaciones.push({
          id: elementDB.dataValues.id,
          incidencia_id: elementDB.dataValues.incidencia_id,
          descripcion: elementDB.dataValues.descripcion,
          solucion: elementDB.dataValues.solucion ? 'Sí' : 'No',
          created_at: elementDB.dataValues.created_at.toLocaleDateString(),
          updated_at: elementDB.dataValues.updated_at.toLocaleDateString(),
        });
      }
    }

    registros.push({
      id: element.dataValues.id,
      descripcion: element.dataValues.descripcion,
      created_at: element.dataValues.created_at.toLocaleDateString(),
      updated_at: element.dataValues.updated_at.toLocaleDateString(),
      actuaciones: actuaciones,
    });
  }

  res.status(200).render(rutaFichero, {
    registros,
    actuaciones,
    alerta,
    home_active: 'active',
    total_registros: incidencias_count.count,
    previous_disabled: pagina === 1 ? 'disabled' : '',
    next_disabled: pagina < ultima_pagina ? '' : 'disabled',
    pagina_anterior: pagina - 1,
    pagina_posterior: pagina < ultima_pagina ? pagina + 1 : pagina,
    botones_paginas,
    pagina,
  });
  alerta = '';
};

// ########################################################
// new
const nuevo = (req, res) => {
  console.log('======= NUEVO =========');

  const rutaFichero = path.join(__dirname, directorio_vista, 'new.hbs');
  res
    .status(200)
    .render(rutaFichero, { alerta, nueva_incidencia_active: 'active' });
  alerta = '';
};

// create
const crear = async (req, res) => {
  console.log('======= CREAR =========');

  const { descripcion } = req.body;
  const nIncidencia = {
    descripcion,
  };

  try {
    const inci = await db.Incidencias.build(nIncidencia);
    const nuevoRegistro = await inci.save();

    alerta = 'La incidencia ha sido creada correctamente.';
    res.redirect(`/incidencias/${nuevoRegistro.dataValues.id}`);
  } catch (error) {
    alerta =
      'ERROR: no fue posible crear la incidencia correctamente, vuelva a intentarlo';
    console.log(error);
    res.redirect(`/incidencias/new`);
  }
};

// ########################################################
// show
const mostrar = async (req, res) => {
  console.log('======= MOSTRAR =========');

  const registros = [];
  const rutaFichero = path.join(__dirname, directorio_vista, 'show.hbs');
  const { id } = req.params;

  const incidencia = await db.Incidencias.findOne({
    where: {
      id,
    },
    attributes: campos_incidencias,
    include: 'actuaciones',
  });

  if (incidencia) {
    let actuacionesDB = await db.Actuaciones.findAll({
      where: {
        incidencia_id: incidencia.dataValues.id,
      },
      attributes: campos_actuaciones,
    });

    if (actuacionesDB) {
      for (let n = 0; n < actuacionesDB.length; n += 1) {
        const elementDB = actuacionesDB[n];

        registros.push({
          id: elementDB.dataValues.id,
          incidencia_id: elementDB.dataValues.incidencia_id,
          descripcion: elementDB.dataValues.descripcion,
          solucion: elementDB.dataValues.solucion ? 'Sí' : 'No',
          file_path: elementDB.dataValues.file_path,
          created_at: elementDB.dataValues.created_at.toLocaleDateString(),
          updated_at: elementDB.dataValues.updated_at.toLocaleDateString(),
        });
      }
    }
  }

  const uDatos = incidencia.dataValues;
  res.status(200).render(rutaFichero, { uDatos, registros, alerta });
  alerta = '';
};

// ########################################################
// edit
const editar = async (req, res) => {
  console.log('======= EDITAR =========');

  const rutaFichero = path.join(__dirname, directorio_vista, 'edit.hbs');
  const { id } = req.params;

  const incidencia = await db.Incidencias.findOne({
    where: {
      id,
    },
    attributes: campos_incidencias,
  });

  const uDatos = incidencia.dataValues;
  res.status(200).render(rutaFichero, { uDatos, alerta });
  alerta = '';
};

// update
const actualizar = async (req, res) => {
  console.log('======= ACTUALIZAR =========');

  const { id } = req.params;
  const { descripcion } = req.body;

  db.Incidencias.findOne({
    where: {
      id,
    },
    attributes: campos_incidencias,
  })
    .then((registro) => {
      if (!registro) throw new Error('Registro no encontrado');

      const valores = {
        descripcion,
      };

      registro.update(valores).then((actualizado) => {
        alerta = 'Incidencia actualizada correctamente';
        res.redirect(`/incidencias/${actualizado.id}`);
      });
    })
    .catch((error) => {
      res
        .status(201)
        .json({ msg: 'UPDATE - incidencias POST con identificador', error });
    });
};

// ########################################################
// delete
const borrar = (req, res) => {
  console.log('======= BORRAR =========');

  const { id } = req.params;

  db.Incidencias.destroy({
    where: {
      id,
    },
  })
    .then(async () => {
      await db.Actuaciones.destroy({
        where: {
          incidencia_id: id,
        },
      });

      alerta = 'La incidencia se ha borrado correctamente';
      res.redirect(`/incidencias`);
    })
    .catch((error) => {
      res.status(201).json({
        msg: 'DELETE - incidencias DELETE con identificador',
        error,
      });
    });
};

// ########################################################
// new action
const nuevaActuacion = (req, res) => {
  const rutaFichero = path.join(__dirname, directorio_vista, 'new_action.hbs');
  const incidenciaID = req.params.id;
  res.status(200).render(rutaFichero, { incidenciaID });
};

// create action
const crearActuacion = async (req, res) => {
  const incidenciaID = req.params.id;
  const { descripcion } = req.body;
  let nActuacion = {};

  if (req.files) {
    const file = req.files.file;
    const fecha_actual = String(Date.now());
    const nombre_fichero = file.name.replace(/\s|#|-|@|<>/g, '_');

    const rutaRelativa = path.join(url_imagenes, incidenciaID, fecha_actual);

    const rutaSubida = path.join(
      __dirname,
      directorio_imagenes,
      incidenciaID,
      fecha_actual
    );

    if (!fs.existsSync(rutaSubida)) {
      fs.mkdirSync(rutaSubida, {
        recursive: true,
      });
    }

    const nombreCompleto = rutaSubida + '/' + nombre_fichero;
    const nombreRelativo = rutaRelativa + '/' + nombre_fichero;

    file.mv(nombreCompleto, async (error) => {
      if (error) {
        console.error(error);
        res
          .status(500)
          .send(JSON.stringify({ estatus: 'error', message: error }));
      }
      nActuacion = {
        incidencia_id: incidenciaID,
        descripcion,
        file_path: nombreRelativo,
      };

      try {
        const act = await db.Actuaciones.build(nActuacion);
        await act.save();

        alerta = 'Actuación creada correctamente';
        res.redirect(`/incidencias/${incidenciaID}`);
      } catch (error) {
        res.status(201).json({ msg: 'CREATE - actuaciones POST', error });
      }
    });
  } else {
    nActuacion = {
      incidencia_id: incidenciaID,
      descripcion,
    };
    try {
      const act = await db.Actuaciones.build(nActuacion);
      await act.save();

      alerta = 'Actuación creada correctamente';
      res.redirect(`/incidencias/${incidenciaID}`);
    } catch (error) {
      res.status(201).json({ msg: 'CREATE - actuaciones POST', error });
    }
  }
};

// ########################################################
// edit action
const editarActuacion = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorio_vista, 'edit_action.hbs');
  const { id } = req.params;

  const actuaciones = await db.Actuaciones.findOne({
    where: {
      id,
    },
    attributes: campos_actuaciones,
  });

  const uDatos = actuaciones.dataValues;
  res.status(200).render(rutaFichero, { uDatos, alerta });
  alerta = '';
};

// update action
const actualizarActuacion = async (req, res) => {
  const { id } = req.params;
  const { descripcion, solucion } = req.body;

  const solucion_entero = solucion === 'on' ? 1 : 0; ///////////////////////// Esto hay que cambiarlo

  db.Actuaciones.findOne({
    where: {
      id,
    },
    attributes: campos_actuaciones,
  })
    .then((registro) => {
      if (!registro) throw new Error('Registro no encontrado');

      const valores = {
        descripcion,
        solucion: solucion_entero,
      };

      registro.update(valores).then((actualizado) => {
        alerta = 'Actuación actualizada correctamente';
        res.redirect(`/incidencias/${registro.incidencia_id}`);
      });
    })
    .catch((error) => {
      res
        .status(201)
        .json({ msg: 'UPDATE - actuaciones POST con identificador', error });
    });
};

// ########################################################
// delete action
const borrarActuacion = (req, res) => {
  const { id, incidenciaID } = req.params;

  db.Actuaciones.destroy({
    where: {
      id,
    },
  })
    .then(async (reg) => {
      alerta = 'Actuación borrada correctamentes';
      res.redirect(`/incidencias/${incidenciaID}`);
    })
    .catch((error) => {
      res.status(201).json({
        msg: 'DELETE - incidencias DELETE con identificador',
        error,
      });
    });
};

module.exports = {
  indice,
  nuevo,
  crear,
  editar,
  actualizar,
  mostrar,
  borrar,
  nuevaActuacion,
  crearActuacion,
  editarActuacion,
  actualizarActuacion,
  borrarActuacion,
};
