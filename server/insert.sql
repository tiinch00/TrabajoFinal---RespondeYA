-- TENER EN CUENTA LOS ID DE CADA TABLA
-- HAY QUE MODIFICARLAS SEGUN NUESTRA BD

-- preguntas

INSERT INTO `preguntas`
-- Geografia
(`categoria_id`, `admin_id`, `enunciado`, `dificultad`, `created_at`) VALUES 
-- 1
(1, 1,'¿Cuál es la capital de Argentina?','facil','2025-09-25 16:09:32'),
-- 2
(1, 1,'¿En qué región está la Patagonia?','facil','2025-09-25 16:09:32'),
-- 3
(1, 1,'¿Cuál es el pico más alto del país?','facil','2025-09-25 16:09:32'),
-- 4
(1, 1,'¿Qué río marca gran parte de la frontera con Uruguay?','facil','2025-09-25 16:09:32'),
-- 5
(1, 1,'¿En qué provincia se encuentran las Cataratas del Iguazú?','facil','2025-09-25 16:09:32'),
-- 6
(1, 1,'¿Cuál es el mayor lago argentino en superficie total (compartido con Chile)?','facil','2025-09-25 16:09:32'),
-- 7
(1, 1,'¿Qué provincia es famosa por su “Quebrada de Humahuaca”?','facil','2025-09-25 16:09:32'),
-- 8
(1, 1,'¿Cuál es la ciudad más austral del país?','facil','2025-09-25 16:09:32'),
-- 9
(1, 1,'¿Qué sierras atraviesan gran parte de Córdoba?','facil','2025-09-25 16:09:32'),
-- 10
(1, 1,'¿Cuál es el principal río que cruza la ciudad de Buenos Aires?','facil','2025-09-25 16:09:32'),


-- Cine

-- 11
(6, 1,'¿Quién dirigió E.T.?','facil','2025-09-25 16:09:32'),
-- 12
(6, 1,'¿De qué saga es el personaje “Harry Potter”?','facil','2025-09-25 16:09:32'),
-- 13
(6, 1,'¿Qué película popularizó la frase “I’ll be back”?','facil','2025-09-25 16:09:32'),
-- 14
(6, 1,'¿Qué premio entrega la Academia de Hollywood?','facil','2025-09-25 16:09:32'),
-- 15
(6, 1,'¿Quién interpretó a Jack en Titanic?','facil','2025-09-25 16:09:32'),
-- 16
(6, 1,'¿Qué película animada presenta a “Woody y Buzz”?','facil','2025-09-25 16:09:32'),
-- 17
(6, 1,'¿Qué director es conocido por Inception y The Dark Knight?','facil','2025-09-25 16:09:32'),
-- 18
(6, 1,'¿Cuál es un famoso estudio de animación?','facil','2025-09-25 16:09:32'),
-- 19
(6, 1,'¿Qué país es cuna del “Bollywood”?','facil','2025-09-25 16:09:32'),
-- 20
(6, 1,'¿Quién creó Star Wars?','facil','2025-09-25 16:09:32'),


-- Historia

-- 21
(9, 1,'¿Quién dirigió E.T.?','facil','2025-09-25 16:09:32'),
-- 22
(9, 1,'¿En qué región está la Patagonia?','facil','2025-09-25 16:09:32'),
-- 23
(9, 1,'¿Cuál es el pico más alto del país?','facil','2025-09-25 16:09:32'),
-- 24
(9, 1,'¿Qué río marca gran parte de la frontera con Uruguay?','facil','2025-09-25 16:09:32'),
-- 25
(9, 1,'¿En qué provincia se encuentran las Cataratas del Iguazú?','facil','2025-09-25 16:09:32'),
-- 26
(9, 1,'¿Cuál es el mayor lago argentino en superficie total (compartido con Chile)?','facil','2025-09-25 16:09:32'),
-- 27
(9, 1,'¿Qué provincia es famosa por su “Quebrada de Humahuaca”?','facil','2025-09-25 16:09:32'),
-- 28
(9, 1,'¿Cuál es la ciudad más austral del país?','facil','2025-09-25 16:09:32'),
-- 29
(9, 1,'¿Qué sierras atraviesan gran parte de Córdoba?','facil','2025-09-25 16:09:32'),
-- 30
(9, 1,'¿Cuál es el principal río que cruza la ciudad de Buenos Aires?','facil','2025-09-25 16:09:32');



-- opciones
INSERT INTO `opciones`(`admin_id`, `pregunta_id`, `texto`, `es_correcta`) VALUES 
-- geografia
-- pregunta 1
(1, 3,'Córdoba', false),
(1, 3,'Rosario', false),
(1, 3,'Buenos Aires', true),
(1, 3,'La Plata', false),
-- pregunta 2
(1, 4,'Noroeste', false),
(1, 4,'Noreste', false),
(1, 4,'Sur', true),
(1, 4,'Centro', false),
-- pregunta 3
(1, 5,'Lanín', false),
(1, 5,'Fitz Roy', false),
(1, 5,'Aconcagua', true),
(1, 5,'Tronador', false),
-- pregunta 4
(1, 6,'Bermejo', false),
(1, 6,'Río Uruguay', true),
(1, 6,'Salado', false),
(1, 6,'Colorado', false),
-- 5
(1, 7,'Corrientes', false),
(1, 7,'Formosa', false),
(1, 7,'Chaco', false),
(1, 7,'Misiones', true),
-- 6
(1, 8,'Lago Nahuel Huapi', false),
(1, 8,'Lago Argentino', true),
(1, 8,'Lago Lacar', false),
(1, 8,'Lago Fagnano', false),
-- 7
(1, 9,'Salta', false),
(1, 9,'Jujuy', true),
(1, 9,'Catamarca', false),
(1, 9,'Tucumán', false),
-- 8
(1, 10,'Río Gallegos', false),
(1, 10,'Ushuaia', true),
(1, 10,'Puerto Madryn', false),
(1, 10,'Comodoro Rivadavia', false),
-- 9
(1, 11,'Sierras Subandinas', false),
(1, 11,'Sierras de Famatina', false),
(1, 11,'Sierras de Córdoba (Comechingones/Sierras Chicas)', true),
(1, 11,'Precordillera de San Juan', false),
-- 10
(1, 12,'Río Paraná', false),
(1, 12,'Río de la Plata', true),
(1, 12,'Río Uruguay', false),
(1, 12,'Río Negro', false),


-- cine
-- pregunta 1
(1, 13,'Tim Burton', false),
(1, 13,'Steven Spielberg', true),
(1, 13,'James Cameron', false),
(1, 13,'George Lucas', false),
-- pregunta 2
(1, 14,'Star Wars', false),
(1, 14,'Harry Potter', true),
(1, 14,'El Señor de los Anillos', false),
(1, 14,'Matrix', false),
-- pregunta 3
(1, 15,'Rocky', false),
(1, 15,'Rambo', false),
(1, 15,'Terminator', true),
(1, 15,'Top Gun', false),
-- pregunta 4
(1, 16,'Goya', false),
(1, 16,'Palma de Oro', false),
(1, 16,'León de Oro', false),
(1, 16,'Óscar', true),
-- 5
(1, 17,'Brad Pitt', false),
(1, 17,'Leonardo DiCaprio', true),
(1, 17,'Keanu Reeves', false),
(1, 17,'Tom Cruise', false),
-- 6
(1, 18,'Shrek', false),
(1, 18,'Toy Story', true),
(1, 18,'Frozen', false),
(1, 18,'Coco', false),
-- 7
(1, 19,'Ridley Scott', false),
(1, 19,'Christopher Nolan', true),
(1, 19,'Peter Jackson', false),
(1, 19,'Quentin Tarantino', false),
-- 8
(1, 20,'Paramount', false),
(1, 20,'Universal', false),
(1, 20,'Pixar', true),
(1, 20,'Lionsgate', false),
-- 9
(1, 21,'Estados Unidos', false),
(1, 21,'India', true),
(1, 21,'Reino Unido', false),
(1, 21,'Japón', false),
-- 10
(1, 22,'J. J. Abrams', false),
(1, 22,'George Lucas', true),
(1, 22,'James Cameron', false),
(1, 22,'Sam Raimi', false);



-- falta partida



-- partida_jugadores
INSERT INTO `partida_jugadores`
(`partida_id`, `jugador_id`) VALUES 
(1, 1),
(2, 1),
(3, 1);


-- partida_preguntas
-- partida 1 - geografia
INSERT INTO `partida_preguntas`
(`partida_id`, `pregunta_id`, `orden`, `question_text_copy`, `correct_option_id_copy`, `correct_option_text_copy`) 
VALUES 
-- partida_pregunta 1
(1, 3, 1,'¿Cuál es la capital de Argentina?', 11,'Buenos Aires'),
-- partida_pregunta 2
(1, 4, 2,'¿En qué región está la Patagonia?', 15,'Sur'),
-- partida_pregunta 3
(1, 5, 3,'¿Cuál es el pico más alto del país?', 19,'Aconcagua'),
-- partida_pregunta 4
(1, 6, 4,'¿Qué río marca gran parte de la frontera con Uruguay?', 22,'Río Uruguay'),
-- partida_pregunta 5
(1, 7, 5,'¿En qué provincia se encuentran las Cataratas del Iguazú?', 28,'Misiones'),
-- partida_pregunta 6
(1, 8, 6,'¿Cuál es el mayor lago argentino en superficie total (compartido con Chile)?', 30,'Lago Argentino'),
-- partida_pregunta 7
(1, 9, 7,'¿Qué provincia es famosa por su “Quebrada de Humahuaca”?', 34,'Jujuy'),
-- partida_pregunta 8
(1, 10, 8,'¿Cuál es la ciudad más austral del país?', 38,'Ushuaia'),
-- partida_pregunta 9
(1, 11, 9,'¿Qué sierras atraviesan gran parte de Córdoba?', 43,'Sierras de Córdoba (Comechingones/Sierras Chicas)'),
-- partida_pregunta 10
(1, 12, 10,'¿Cuál es el principal río que cruza la ciudad de Buenos Aires?', 46,'Río de la Plata');

-- estadisticas
INSERT INTO `estadisticas`
(`jugador_id`, `partida_id`, `posicion`, `puntaje_total`, `total_correctas`, `total_incorrectas`, `tiempo_total_ms`) VALUES 
-- 100 puntos x 10 preguntas
-- 600000 es 10 min
(1, 1, 1, 1000, 10, 0, 600000),
(1, 2, 1, 500, 5, 5, 600000),
(1, 3, 1, 1000, 10, 0, 600000);

-- respuestas
INSERT INTO `respuestas`
(`partida_id`, `jugador_id`, `pregunta_id`, `partida_pregunta_id`, `opcion_elegida_id`, `estadistica_id`, `es_correcta`, `tiempo_respuesta_ms`) 
VALUES 
-- geografia
-- respuesta 1
(1, 1, 3, 11, 11, 4, 1, 15000),
-- respuesta 2
(1, 1, 4, 12, 13, 4, 0, 20000),
-- respuesta 3
(1, 1, 5, 13, 19, 4, 1, 30000),
-- respuesta 4
(1, 1, 6, 14, 22, 4, 1, 20000),
-- respuesta 5
(1, 1, 7, 15, 25, 4, 0, 50000),
-- respuesta 6
(1, 1, 8, 16, 30, 4, 1, 20000),
-- respuesta 7
(1, 1, 9, 17, 34, 4, 1, 15000),
-- respuesta 8
(1, 1, 10, 18, 37, 4, 0, 55000),
-- respuesta 9
(1, 1, 11, 19, 42, 4, 0, 45000),
-- respuesta 10
(1, 1, 12, 20, 45, 4, 0, 52000);