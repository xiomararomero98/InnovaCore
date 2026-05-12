FROM mysql:8
ENV MYSQL_ROOT_PASSWORD=root1234
ENV MYSQL_DATABASE=db_seguridad
COPY ms_seguridad_usuarios.sql /docker-entrypoint-initdb.d/init.sql