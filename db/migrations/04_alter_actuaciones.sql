///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql

Down
alter table actuaciones drop file_path;

Up
alter table actuaciones add file_path VARCHAR(1024);


// PostgreSql

Down
alter table actuaciones drop file_path;

Up
alter table actuaciones add file_path VARCHAR(1024);

