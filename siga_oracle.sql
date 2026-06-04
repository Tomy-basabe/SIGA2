-- ==========================================
-- PROYECTO S.I.G.A. - Script para Oracle
-- Sistema Integral de Gestion Academica
-- ==========================================

-- ==========================================
-- 0. LIMPIEZA DE TABLAS PREVIAS
-- (Borra tablas anteriores para evitar ORA-00955)
-- ==========================================
DROP TABLE DICTA CASCADE CONSTRAINTS;
DROP TABLE CURSA CASCADE CONSTRAINTS;
DROP TABLE TIPOGRAFIA_APUNTE CASCADE CONSTRAINTS;
DROP TABLE APUNTES CASCADE CONSTRAINTS;
DROP TABLE EXAMEN CASCADE CONSTRAINTS;
DROP TABLE HORARIOCONSULTA CASCADE CONSTRAINTS;
DROP TABLE MATERIA CASCADE CONSTRAINTS;
DROP TABLE PROFESOR CASCADE CONSTRAINTS;
DROP TABLE USUARIO CASCADE CONSTRAINTS;
DROP TABLE PLANDECARRERA CASCADE CONSTRAINTS;

-- ==========================================
-- 1. CREACION DE TABLAS (DDL)
-- ==========================================

-- Tablas Fuertes / Maestras

CREATE TABLE PLANDECARRERA (
    IdPlan INTEGER PRIMARY KEY,
    anio_plan INTEGER NOT NULL
);

CREATE TABLE USUARIO (
    email VARCHAR2(30) PRIMARY KEY,
    NombreyApeAlumn VARCHAR2(40) NOT NULL,
    legajo INTEGER UNIQUE NOT NULL
);

CREATE TABLE PROFESOR (
    idProfe INTEGER PRIMARY KEY,
    numeroTelefonico INTEGER UNIQUE,
    email VARCHAR2(50) NOT NULL,
    NombreyApelProfe VARCHAR2(30) NOT NULL
);

-- Tablas Hijas (con Claves Foraneas)

CREATE TABLE MATERIA (
    idMateria INTEGER PRIMARY KEY,
    id_plan INTEGER NOT NULL,
    AulaCursado VARCHAR2(10),
    NombreMateria VARCHAR2(30) NOT NULL,
    Descripcion VARCHAR2(100),
    CONSTRAINT fk_materia_plan FOREIGN KEY (id_plan) REFERENCES PLANDECARRERA(IdPlan)
);

CREATE TABLE HORARIOCONSULTA (
    idHorario INTEGER PRIMARY KEY,
    idProfe INTEGER NOT NULL,
    dia_semana DATE NOT NULL,
    hora_inicio VARCHAR2(5) NOT NULL,
    AulaConsulta VARCHAR2(20),
    hora_fin VARCHAR2(5),
    CONSTRAINT fk_horario_profe FOREIGN KEY (idProfe) REFERENCES PROFESOR(idProfe),
    CONSTRAINT chk_horas CHECK (hora_fin > hora_inicio)
);

CREATE TABLE EXAMEN (
    id_examen INTEGER PRIMARY KEY,
    email VARCHAR2(50) NOT NULL,
    idmateria INTEGER NOT NULL,
    descripcion VARCHAR2(150),
    CalificacionExamen INTEGER,
    TipoExamen VARCHAR2(20) NOT NULL,
    fecha_hora_inicio TIMESTAMP NOT NULL,
    fecha_hora_fin TIMESTAMP,
    CONSTRAINT fk_examen_usuario FOREIGN KEY (email) REFERENCES USUARIO(email),
    CONSTRAINT fk_examen_materia FOREIGN KEY (idmateria) REFERENCES MATERIA(idMateria),
    CONSTRAINT chk_fechas CHECK (fecha_hora_fin > fecha_hora_inicio)
);

CREATE TABLE APUNTES (
    id_apunte INTEGER PRIMARY KEY,
    email VARCHAR2(50) NOT NULL,
    contenido VARCHAR2(1000),
    nombre VARCHAR2(20) NOT NULL,
    fecha_creacion TIMESTAMP NOT NULL,
    CONSTRAINT fk_apuntes_usuario FOREIGN KEY (email) REFERENCES USUARIO(email)
);

CREATE TABLE TIPOGRAFIA_APUNTE (
    tipografia VARCHAR2(20),
    id_apunte INTEGER,
    PRIMARY KEY (tipografia, id_apunte),
    CONSTRAINT fk_tipo_apunte FOREIGN KEY (id_apunte) REFERENCES APUNTES(id_apunte)
);

-- Tablas Intermedias (Relaciones N:M)

CREATE TABLE CURSA (
    idMateria INTEGER,
    email VARCHAR2(30),
    PRIMARY KEY (idMateria, email),
    CONSTRAINT fk_cursa_materia FOREIGN KEY (idMateria) REFERENCES MATERIA(idMateria),
    CONSTRAINT fk_cursa_usuario FOREIGN KEY (email) REFERENCES USUARIO(email)
);

CREATE TABLE DICTA (
    idMateria INTEGER,
    idProfe INTEGER,
    Resenia VARCHAR2(30),
    PRIMARY KEY (idMateria, idProfe),
    CONSTRAINT fk_dicta_materia FOREIGN KEY (idMateria) REFERENCES MATERIA(idMateria),
    CONSTRAINT fk_dicta_profe FOREIGN KEY (idProfe) REFERENCES PROFESOR(idProfe)
);

-- ==========================================
-- 2. CARGA DE DATOS DE PRUEBA (DML)
-- ==========================================

INSERT INTO PLANDECARRERA (IdPlan, anio_plan) VALUES (1, 2023);

INSERT INTO USUARIO (email, NombreyApeAlumn, legajo) 
VALUES ('alumno@utn.edu.ar', 'Tomas Basabe', 12345);

INSERT INTO PROFESOR (idProfe, numeroTelefonico, email, NombreyApelProfe) 
VALUES (10, 261555123, 'profe@utn.edu.ar', 'Andres Moreno');

INSERT INTO MATERIA (idMateria, id_plan, AulaCursado, NombreMateria, Descripcion) 
VALUES (101, 1, 'Aula 10', 'Base de Datos', 'Modelado y SQL');

INSERT INTO CURSA (idMateria, email) VALUES (101, 'alumno@utn.edu.ar');

INSERT INTO DICTA (idMateria, idProfe, Resenia) VALUES (101, 10, 'Buen profesor');

INSERT INTO EXAMEN (id_examen, email, idmateria, descripcion, CalificacionExamen, TipoExamen, fecha_hora_inicio, fecha_hora_fin) 
VALUES (1, 'alumno@utn.edu.ar', 101, 'Primer Parcial Practico', NULL, 'Parcial', TO_TIMESTAMP('2026-06-15 18:00:00', 'YYYY-MM-DD HH24:MI:SS'), TO_TIMESTAMP('2026-06-15 20:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO APUNTES (id_apunte, email, contenido, nombre, fecha_creacion) 
VALUES (500, 'alumno@utn.edu.ar', 'Resumen de Normalizacion', 'Resumen BD', TO_TIMESTAMP('2026-06-01 10:00:00', 'YYYY-MM-DD HH24:MI:SS'));

INSERT INTO TIPOGRAFIA_APUNTE (tipografia, id_apunte) VALUES ('Arial', 500);

INSERT INTO TIPOGRAFIA_APUNTE (tipografia, id_apunte) VALUES ('Roboto', 500);

INSERT INTO HORARIOCONSULTA (idHorario, idProfe, dia_semana, hora_inicio, hora_fin, AulaConsulta) 
VALUES (1, 10, TO_DATE('2026-06-10', 'YYYY-MM-DD'), '15:00', '17:00', 'Lab 3');

COMMIT;

-- ==========================================
-- 3. CONSULTAS SQL
-- ==========================================

-- Consulta 1: Proximos examenes de un alumno especifico ordenados por fecha
-- Pregunta: Que examenes tiene proximos el usuario con legajo 12345?
SELECT M.NombreMateria, E.TipoExamen, E.fecha_hora_inicio
FROM USUARIO U
INNER JOIN EXAMEN E ON U.email = E.email
INNER JOIN MATERIA M ON E.idmateria = M.idMateria
WHERE U.legajo = 12345
ORDER BY E.fecha_hora_inicio ASC;

-- Consulta 2: Cantidad de tipografias por apunte de un usuario
-- Pregunta: Cuantas tipografias tiene cada apunte del alumno?
SELECT A.nombre AS Nombre_Apunte, COUNT(T.tipografia) AS Cantidad_Tipografias
FROM APUNTES A
INNER JOIN TIPOGRAFIA_APUNTE T ON A.id_apunte = T.id_apunte
WHERE A.email = 'alumno@utn.edu.ar'
GROUP BY A.nombre
ORDER BY Cantidad_Tipografias DESC;

-- Consulta 3: Materias y plan de carrera de un estudiante
-- Pregunta: Que materias cursa el alumno y a que plan pertenecen?
SELECT M.NombreMateria, P.anio_plan
FROM CURSA C
INNER JOIN MATERIA M ON C.idMateria = M.idMateria
INNER JOIN PLANDECARRERA P ON M.id_plan = P.IdPlan
WHERE C.email = 'alumno@utn.edu.ar'
ORDER BY P.anio_plan ASC;
