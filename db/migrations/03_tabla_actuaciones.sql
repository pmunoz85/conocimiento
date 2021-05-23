///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql

drop table actuaciones;

create table actuaciones (
  id INT NOT NULL AUTO_INCREMENT, 
  incidencia_id INT NOT NULL,
  descripcion TEXT, 
  solucion  BOOLEAN, 
  created_at DATETIME, 
  updated_at DATETIME, 
  PRIMARY KEY (id),
  FOREIGN KEY (incidencia_id) REFERENCES incidencias(id)
  );

// PostgreSql

drop table actuaciones;

create table actuaciones (
  id SERIAL, 
  incidencia_id INT NOT NULL,
  descripcion TEXT, 
  solucion  BOOLEAN, 
  created_at timestamp, 
  updated_at timestamp, 
  PRIMARY KEY (id),
  FOREIGN KEY (incidencia_id) REFERENCES incidencias(id)
  );

