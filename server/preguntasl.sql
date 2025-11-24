/* 
//BORRAR TODAS LAS PREGUNTAS 

SET FOREIGN_KEY_CHECKS = 0;
DELETE FROM respuestas;
DELETE FROM opciones;
DELETE FROM preguntas;
SET FOREIGN_KEY_CHECKS = 1;     
*/
/* 
//REINICIAR LOS AUTOINCREMENT

ALTER TABLE respuestas AUTO_INCREMENT = 1;
ALTER TABLE preguntas AUTO_INCREMENT = 1; 
ALTER TABLE partidas AUTO_INCREMENT = 1;
ALTER TABLE partida_jugadores AUTO_INCREMENT = 1;
ALTER TABLE partida_preguntas AUTO_INCREMENT = 1; 
ALTER TABLE salas AUTO_INCREMENT = 1; 
ALTER TABLE sala_jugadores AUTO_INCREMENT = 1; 


*/
/* ALTER TABLE respuestas AUTO_INCREMENT = 1;
ALTER TABLE estadisticas AUTO_INCREMENT = 1;
ALTER TABLE partidas AUTO_INCREMENT = 1; 
ALTER TABLE partida_preguntas AUTO_INCREMENT = 1; 
ALTER TABLE partida_jugadores AUTO_INCREMENT = 1;  */

/* Categoria informatica es el id 4 */

INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at)
VALUES
(1, 4, 1, '¿Qué significa CPU?', 'facil', '2025-09-25 16:09:32'),
(2, 4, 1, '¿Qué sistema operativo desarrolló Microsoft?', 'facil', '2025-09-25 16:09:32'),
(3, 4, 1, '¿Qué es un navegador web?', 'facil', '2025-09-25 16:09:32'),
(4, 4, 1, '¿Qué significa la sigla HTML?', 'facil', '2025-09-25 16:09:32'),
(5, 4, 1, '¿Qué dispositivo se usa para mover el cursor en pantalla?', 'facil', '2025-09-25 16:09:32'),
(6, 4, 1, '¿Qué empresa creó el sistema operativo Android?', 'facil', '2025-09-25 16:09:32'),
(7, 4, 1, '¿Qué componente almacena la información permanentemente en una PC?', 'facil', '2025-09-25 16:09:32'),
(8, 4, 1, '¿Qué significa “URL”?', 'facil', '2025-09-25 16:09:32'),
(9, 4, 1, '¿Cuál es el lenguaje de programación usado para crear páginas web interactivas?', 'facil', '2025-09-25 16:09:32'),
(10, 4, 1, '¿Qué es un virus informático?', 'facil', '2025-09-25 16:09:32'),


(11, 5, 1, '¿Cuál es el planeta más grande del sistema solar?', 'facil', '2025-09-25 16:09:32'),
(12, 5, 1, '¿Cuántos continentes hay en el mundo?', 'facil', '2025-09-25 16:09:32'),
(13, 5, 1, '¿En qué continente está Egipto?', 'facil', '2025-09-25 16:09:32'),
(14, 5, 1, '¿Qué instrumento mide la temperatura?', 'facil', '2025-09-25 16:09:32'),
(15, 5, 1, '¿Cuál es el metal más liviano?', 'facil', '2025-09-25 16:09:32'),
(16, 5, 1, '¿Qué gas respiramos para vivir?', 'facil', '2025-09-25 16:09:32'),
(17, 5, 1, '¿Quién escribió “Don Quijote de la Mancha”?', 'facil', '2025-09-25 16:09:32'),
(18, 5, 1, '¿Qué número romano representa el 10?', 'facil', '2025-09-25 16:09:32'),
(19, 5, 1, '¿Cuál es el océano más grande?', 'facil', '2025-09-25 16:09:32'),
(20, 5, 1, '¿Qué idioma se habla principalmente en Brasil?', 'facil', '2025-09-25 16:09:32'),


-- 🌍 GEOGRAFÍA (categoria_id = 1)
(21, 1, 1, '¿Cuál es la capital de Argentina?', 'facil', '2025-09-25 16:09:32'),
(22, 1, 1, '¿En qué región está la Patagonia?', 'facil', '2025-09-25 16:09:32'),
(23, 1, 1, '¿Cuál es el pico más alto del país?', 'facil', '2025-09-25 16:09:32'),
(24, 1, 1, '¿Qué río marca gran parte de la frontera con Uruguay?', 'facil', '2025-09-25 16:09:32'),
(25, 1, 1, '¿En qué provincia se encuentran las Cataratas del Iguazú?', 'facil', '2025-09-25 16:09:32'),
(26, 1, 1, '¿Cuál es el mayor lago argentino en superficie total (compartido con Chile)?', 'facil', '2025-09-25 16:09:32'),
(27, 1, 1, '¿Qué provincia es famosa por su “Quebrada de Humahuaca”?', 'facil', '2025-09-25 16:09:32'),
(28, 1, 1, '¿Cuál es la ciudad más austral del país?', 'facil', '2025-09-25 16:09:32'),
(29, 1, 1, '¿Qué sierras atraviesan gran parte de Córdoba?', 'facil', '2025-09-25 16:09:32'),
(30, 1, 1, '¿Cuál es el principal río que cruza la ciudad de Buenos Aires?', 'facil', '2025-09-25 16:09:32'),

-- 🎬 CINE (categoria_id = 6)
(31, 6, 1, '¿Quién dirigió E.T.?', 'facil', '2025-09-25 16:09:32'),
(32, 6, 1, '¿De qué saga es el personaje “Harry Potter”?', 'facil', '2025-09-25 16:09:32'),
(33, 6, 1, '¿Qué película popularizó la frase “I’ll be back”?', 'facil', '2025-09-25 16:09:32'),
(34, 6, 1, '¿Qué premio entrega la Academia de Hollywood?', 'facil', '2025-09-25 16:09:32'),
(35, 6, 1, '¿Quién interpretó a Jack en Titanic?', 'facil', '2025-09-25 16:09:32'),
(36, 6, 1, '¿Qué película animada presenta a “Woody y Buzz”?', 'facil', '2025-09-25 16:09:32'),
(37, 6, 1, '¿Qué director es conocido por Inception y The Dark Knight?', 'facil', '2025-09-25 16:09:32'),
(38, 6, 1, '¿Cuál es un famoso estudio de animación?', 'facil', '2025-09-25 16:09:32'),
(39, 6, 1, '¿Qué país es cuna del “Bollywood”?', 'facil', '2025-09-25 16:09:32'),
(40, 6, 1, '¿Quién creó Star Wars?', 'facil', '2025-09-25 16:09:32'),

-- 🏛️ HISTORIA (categoria_id = 9)
(41, 9, 1, '¿Quién fue el primer presidente de Argentina?', 'facil', '2025-09-25 16:09:32'),
(42, 9, 1, '¿En qué año se declaró la independencia argentina?', 'facil', '2025-09-25 16:09:32'),
(43, 9, 1, '¿Qué civilización construyó las pirámides de Egipto?', 'facil', '2025-09-25 16:09:32'),
(44, 9, 1, '¿Quién fue San Martín?', 'facil', '2025-09-25 16:09:32'),
(45, 9, 1, '¿En qué año comenzó la Primera Guerra Mundial?', 'facil', '2025-09-25 16:09:32'),
(46, 9, 1, '¿Qué país fue colonizado por los ingleses en Oceanía?', 'facil', '2025-09-25 16:09:32'),
(47, 9, 1, '¿Qué revolución ocurrió en Francia en 1789?', 'facil', '2025-09-25 16:09:32'),
(48, 9, 1, '¿Quién descubrió América?', 'facil', '2025-09-25 16:09:32'),
(49, 9, 1, '¿Qué muro cayó en 1989?', 'facil', '2025-09-25 16:09:32'),
(50, 9, 1, '¿Qué imperio fue gobernado por Julio César?', 'facil', '2025-09-25 16:09:32');

INSERT INTO opciones (admin_id, pregunta_id, texto, es_correcta) VALUES
-- 🖥️ INFORMÁTICA
(1, 1, 'Computer Personal Unit', false),
(1, 1, 'Central Processing Unit', true),
(1, 1, 'Central Process Utility', false),
(1, 1, 'Control Program Unit', false),

(1, 2, 'Windows', true),
(1, 2, 'Linux', false),
(1, 2, 'MacOS', false),
(1, 2, 'Ubuntu', false),

(1, 3, 'Una aplicación para navegar por Internet', true),
(1, 3, 'Un programa para editar texto', false),
(1, 3, 'Un sistema operativo', false),
(1, 3, 'Un lenguaje de programación', false),

(1, 4, 'HighText Machine Language', false),
(1, 4, 'HyperText Markup Language', true),
(1, 4, 'Hyper Transfer Main Language', false),
(1, 4, 'Home Tool Markup Language', false),

(1, 5, 'Mouse', true),
(1, 5, 'Teclado', false),
(1, 5, 'Monitor', false),
(1, 5, 'Disco duro', false),

(1, 6, 'Microsoft', false),
(1, 6, 'Apple', false),
(1, 6, 'Google', true),
(1, 6, 'Samsung', false),

(1, 7, 'Tarjeta gráfica', false),
(1, 7, 'Disco duro', true),
(1, 7, 'Memoria RAM', false),
(1, 7, 'Fuente de poder', false),

(1, 8, 'User Reference Line', false),
(1, 8, 'Universal Route Link', false),
(1, 8, 'Universal Resource Locator', true),
(1, 8, 'Unique Record Link', false),

(1, 9, 'CSS', false),
(1, 9, 'JavaScript', true),
(1, 9, 'HTML', false),
(1, 9, 'Python', false),

(1, 10, 'Un software que daña o altera archivos', true),
(1, 10, 'Un programa de diseño gráfico', false),
(1, 10, 'Un tipo de hardware', false),
(1, 10, 'Un lenguaje de programación', false),

-- 🌐 CIENCIA GENERAL
(1, 11, 'Saturno', false),
(1, 11, 'Urano', false),
(1, 11, 'Neptuno', false),
(1, 11, 'Júpiter', true),

(1, 12, '7', true),
(1, 12, '5', false),
(1, 12, '6', false),
(1, 12, '8', false),

(1, 13, 'Europa', false),
(1, 13, 'África', true),
(1, 13, 'Asia', false),
(1, 13, 'Oceanía', false),

(1, 14, 'Barómetro', false),
(1, 14, 'Termómetro', true),
(1, 14, 'Telescopio', false),
(1, 14, 'Microscopio', false),

(1, 15, 'Litio', true),
(1, 15, 'Plata', false),
(1, 15, 'Hierro', false),
(1, 15, 'Cobre', false),

(1, 16, 'Nitrógeno', false),
(1, 16, 'Oxígeno', true),
(1, 16, 'Hidrógeno', false),
(1, 16, 'Helio', false),

(1, 17, 'William Shakespeare', false),
(1, 17, 'Miguel de Cervantes', true),
(1, 17, 'Gabriel García Márquez', false),
(1, 17, 'Pablo Neruda', false),

(1, 18, 'L', false),
(1, 18, 'C', false),
(1, 18, 'X', true),
(1, 18, 'V', false),

(1, 19, 'Pacífico', true),
(1, 19, 'Atlántico', false),
(1, 19, 'Índico', false),
(1, 19, 'Ártico', false),

(1, 20, 'Portugués', true),
(1, 20, 'Español', false),
(1, 20, 'Francés', false),
(1, 20, 'Inglés', false),

-- 🇦🇷 GEOGRAFÍA ARGENTINA
(1, 21, 'Córdoba', false),
(1, 21, 'Buenos Aires', true),
(1, 21, 'La Plata', false),
(1, 21, 'Rosario', false),

(1, 22, 'Noreste', false),
(1, 22, 'Sur', true),
(1, 22, 'Noroeste', false),
(1, 22, 'Centro', false),

(1, 23, 'Tronador', false),
(1, 23, 'Aconcagua', true),
(1, 23, 'Lanín', false),
(1, 23, 'Fitz Roy', false),

(1, 24, 'Río Uruguay', true),
(1, 24, 'Bermejo', false),
(1, 24, 'Colorado', false),
(1, 24, 'Salado', false),

(1, 25, 'Misiones', true),
(1, 25, 'Chaco', false),
(1, 25, 'Formosa', false),
(1, 25, 'Corrientes', false),

(1, 26, 'Lago Argentino', true),
(1, 26, 'Lago Nahuel Huapi', false),
(1, 26, 'Lago Lacar', false),
(1, 26, 'Lago Fagnano', false),

(1, 27, 'Salta', false),
(1, 27, 'Catamarca', false),
(1, 27, 'Jujuy', true),
(1, 27, 'Tucumán', false),

(1, 28, 'Ushuaia', true),
(1, 28, 'Comodoro Rivadavia', false),
(1, 28, 'Puerto Madryn', false),
(1, 28, 'Río Gallegos', false),

(1, 29, 'Precordillera de San Juan', false),
(1, 29, 'Sierras Subandinas', false),
(1, 29, 'Sierras de Córdoba (Comechingones/Sierras Chicas)', true),
(1, 29, 'Sierras de Famatina', false),

(1, 30, 'Río de la Plata', true),
(1, 30, 'Río Paraná', false),
(1, 30, 'Río Uruguay', false),
(1, 30, 'Río Negro', false),

-- 🎬 CINE
(1, 31, 'Steven Spielberg', true),
(1, 31, 'Tim Burton', false),
(1, 31, 'James Cameron', false),
(1, 31, 'George Lucas', false),

(1, 32, 'Harry Potter', true),
(1, 32, 'Star Wars', false),
(1, 32, 'Matrix', false),
(1, 32, 'El Señor de los Anillos', false),

(1, 33, 'Top Gun', false),
(1, 33, 'Terminator', true),
(1, 33, 'Rambo', false),
(1, 33, 'Rocky', false),

(1, 34, 'Óscar', true),
(1, 34, 'Palma de Oro', false),
(1, 34, 'Goya', false),
(1, 34, 'León de Oro', false),

(1, 35, 'Keanu Reeves', false),
(1, 35, 'Brad Pitt', false),
(1, 35, 'Leonardo DiCaprio', true),
(1, 35, 'Tom Cruise', false),

(1, 36, 'Frozen', false),
(1, 36, 'Shrek', false),
(1, 36, 'Toy Story', true),
(1, 36, 'Coco', false),

(1, 37, 'Christopher Nolan', true),
(1, 37, 'Peter Jackson', false),
(1, 37, 'Ridley Scott', false),
(1, 37, 'Quentin Tarantino', false),

(1, 38, 'Pixar', true),
(1, 38, 'Universal', false),
(1, 38, 'Paramount', false),
(1, 38, 'Lionsgate', false),

(1, 39, 'India', true),
(1, 39, 'Reino Unido', false),
(1, 39, 'Japón', false),
(1, 39, 'Estados Unidos', false),

(1, 40, 'George Lucas', true),
(1, 40, 'James Cameron', false),
(1, 40, 'Sam Raimi', false),
(1, 40, 'J. J. Abrams', false),

-- 🏛️ HISTORIA
(1, 41, 'Bartolomé Mitre', true),
(1, 41, 'Domingo Faustino Sarmiento', false),
(1, 41, 'Manuel Belgrano', false),
(1, 41, 'Juan Manuel de Rosas', false),

(1, 42, '1810', false),
(1, 42, '1816', true),
(1, 42, '1820', false),
(1, 42, '1853', false),

(1, 43, 'Civilización Egipcia', true),
(1, 43, 'Imperio Romano', false),
(1, 43, 'Imperio Persa', false),
(1, 43, 'Imperio Babilónico', false),

(1, 44, 'Un líder de la independencia sudamericana', true),
(1, 44, 'Un presidente argentino del siglo XX', false),
(1, 44, 'Un escritor argentino', false),
(1, 44, 'Un conquistador español', false),

(1, 45, '1939', false),
(1, 45, '1914', true),
(1, 45, '1900', false),
(1, 45, '1929', false),

(1, 46, 'Australia', true),
(1, 46, 'Sudáfrica', false),
(1, 46, 'Canadá', false),
(1, 46, 'Nueva Zelanda', false),

(1, 47, 'Revolución Francesa', true),
(1, 47, 'Revolución Industrial', false),
(1, 47, 'Revolución Rusa', false),
(1, 47, 'Revolución Mexicana', false),

(1, 48, 'Cristóbal Colón', true),
(1, 48, 'Américo Vespucio', false),
(1, 48, 'Magallanes', false),
(1, 48, 'Hernán Cortés', false),

(1, 49, 'Muro de Berlín', true),
(1, 49, 'Muro de Adriano', false),
(1, 49, 'Muro de los Lamentos', false),
(1, 49, 'Muro del Kremlin', false),

(1, 50, 'Imperio Romano', true),
(1, 50, 'Imperio Bizantino', false),
(1, 50, 'Imperio Otomano', false),
(1, 50, 'Imperio Persa', false);





/* 50 PREGUNTAS DIFICULTAD MEDIA */
/* INFORMATICA */
/* INFORMATICA */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(51, 4, 1, '¿Qué es un sistema operativo?', 'normal', '2025-09-25 16:09:32'),
(52, 4, 1, '¿Qué tipo de software es Microsoft Word?', 'normal', '2025-09-25 16:09:32'),
(53, 4, 1, '¿Qué hace una tarjeta gráfica?', 'normal', '2025-09-25 16:09:32'),
(54, 4, 1, '¿Qué significa la sigla SQL?', 'normal', '2025-09-25 16:09:32'),
(55, 4, 1, '¿Qué función cumple la memoria RAM?', 'normal', '2025-09-25 16:09:32'),
(56, 4, 1, '¿Qué es una dirección IP?', 'normal', '2025-09-25 16:09:32'),
(57, 4, 1, '¿Qué lenguaje se usa principalmente para inteligencia artificial?', 'normal', '2025-09-25 16:09:32'),
(58, 4, 1, '¿Qué diferencia hay entre hardware y software?', 'normal', '2025-09-25 16:09:32'),
(59, 4, 1, '¿Qué es un algoritmo?', 'normal', '2025-09-25 16:09:32'),
(60, 4, 1, '¿Qué es la nube (cloud computing)?', 'normal', '2025-09-25 16:09:32');

/* CONOCIMIENTO GENERAL */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(61, 5, 1, '¿Cuál es el país más poblado del mundo?', 'normal', '2025-09-25 16:09:32'),
(62, 5, 1, '¿Cuántos huesos tiene el cuerpo humano adulto?', 'normal', '2025-09-25 16:09:32'),
(63, 5, 1, '¿Qué científico propuso la teoría de la relatividad?', 'normal', '2025-09-25 16:09:32'),
(64, 5, 1, '¿Qué órgano produce la insulina?', 'normal', '2025-09-25 16:09:32'),
(65, 5, 1, '¿Cuál es el animal terrestre más veloz?', 'normal', '2025-09-25 16:09:32'),
(66, 5, 1, '¿Qué continente no tiene desiertos?', 'normal', '2025-09-25 16:09:32'),
(67, 5, 1, '¿Quién pintó “La última cena”?', 'normal', '2025-09-25 16:09:32'),
(68, 5, 1, '¿Qué elemento químico tiene el símbolo “Fe”?', 'normal', '2025-09-25 16:09:32'),
(69, 5, 1, '¿Cuántos planetas tiene el sistema solar?', 'normal', '2025-09-25 16:09:32'),
(70, 5, 1, '¿Cuál es el río más largo del mundo?', 'normal', '2025-09-25 16:09:32');

/* GEOGRAFIA */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(71, 1, 1, '¿En qué continente se encuentra el desierto del Sahara?', 'normal', '2025-09-25 16:09:32'),
(72, 1, 1, '¿Cuál es el país más grande del mundo?', 'normal', '2025-09-25 16:09:32'),
(73, 1, 1, '¿Qué océano baña las costas de Chile?', 'normal', '2025-09-25 16:09:32'),
(74, 1, 1, '¿Qué cordillera recorre América del Sur?', 'normal', '2025-09-25 16:09:32'),
(75, 1, 1, '¿Cuál es la capital de Noruega?', 'normal', '2025-09-25 16:09:32'),
(76, 1, 1, '¿En qué país se encuentra el Monte Kilimanjaro?', 'normal', '2025-09-25 16:09:32'),
(77, 1, 1, '¿Qué mar separa Europa de África?', 'normal', '2025-09-25 16:09:32'),
(78, 1, 1, '¿Cuál es la capital de Canadá?', 'normal', '2025-09-25 16:09:32'),
(79, 1, 1, '¿Qué país tiene más islas en el mundo?', 'normal', '2025-09-25 16:09:32'),
(80, 1, 1, '¿Qué continente es conocido como “el continente blanco”?', 'normal', '2025-09-25 16:09:32');

/* CINE */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(81, 6, 1, '¿Quién dirigió la película “Titanic”?', 'normal', '2025-09-25 16:09:32'),
(82, 6, 1, '¿Qué actor interpretó a “Forrest Gump”?', 'normal', '2025-09-25 16:09:32'),
(83, 6, 1, '¿Qué película ganó el Oscar a mejor película en la ceremonia de 1995?', 'normal', '2025-09-25 16:09:32'),
(84, 6, 1, '¿Qué personaje dice “Yo soy tu padre” en Star Wars?', 'normal', '2025-09-25 16:09:32'),
(85, 6, 1, '¿Qué director es conocido por la trilogía “El Señor de los Anillos”?', 'normal', '2025-09-25 16:09:32'),
(86, 6, 1, '¿En qué película aparece el personaje Jack Sparrow?', 'normal', '2025-09-25 16:09:32'),
(87, 6, 1, '¿Qué estudio creó la película “Toy Story”?', 'normal', '2025-09-25 16:09:32'),
(88, 6, 1, '¿Qué actor interpreta a Iron Man en el universo Marvel?', 'normal', '2025-09-25 16:09:32'),
(89, 6, 1, '¿Qué película popularizó la frase “Hasta la vista, baby”?', 'normal', '2025-09-25 16:09:32'),
(90, 6, 1, '¿Qué actriz protagonizó “Pretty Woman”?', 'normal', '2025-09-25 16:09:32');

/* HISTORIA */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(91, 9, 1, '¿En qué año comenzó la Segunda Guerra Mundial?', 'normal', '2025-09-25 16:09:32'),
(92, 9, 1, '¿Quién fue el primer presidente de los Estados Unidos?', 'normal', '2025-09-25 16:09:32'),
(93, 9, 1, '¿En qué año cayó el Imperio Romano de Occidente?', 'normal', '2025-09-25 16:09:32'),
(94, 9, 1, '¿Qué tratado puso fin a la Primera Guerra Mundial?', 'normal', '2025-09-25 16:09:32'),
(95, 9, 1, '¿Quién lideró la independencia de México?', 'normal', '2025-09-25 16:09:32'),
(96, 9, 1, '¿Qué país fue gobernado por Napoleón Bonaparte?', 'normal', '2025-09-25 16:09:32'),
(97, 9, 1, '¿Qué muralla fue construida para proteger China?', 'normal', '2025-09-25 16:09:32'),
(98, 9, 1, '¿Qué ciudad fue destruida por el volcán Vesubio en el año 79 d.C.?', 'normal', '2025-09-25 16:09:32'),
(99, 9, 1, '¿En qué año cayó el Muro de Berlín?', 'normal', '2025-09-25 16:09:32'),
(100, 9, 1, '¿Quién fue el faraón más famoso del Antiguo Egipto?', 'normal', '2025-09-25 16:09:32');

INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES
-- INFORMÁTICA
(51, 'El software que administra los recursos del hardware', true),
(51, 'Un tipo de programa antivirus', false),
(51, 'Una aplicación de oficina', false),
(51, 'Un dispositivo de almacenamiento', false),

(52, 'Software de aplicación', true),
(52, 'Software de sistema', false),
(52, 'Software malicioso', false),
(52, 'Firmware', false),

(53, 'Procesar y renderizar imágenes y videos', true),
(53, 'Acelerar la conexión a Internet', false),
(53, 'Ejecutar programas de texto', false),
(53, 'Controlar dispositivos de entrada', false),

(54, 'Structured Query Language', true),
(54, 'Simple Quick Logic', false),
(54, 'System Query Link', false),
(54, 'Software Quality Language', false),

(55, 'Almacenar datos y programas en uso temporalmente', true),
(55, 'Guardar archivos permanentemente', false),
(55, 'Mejorar la calidad de la imagen', false),
(55, 'Procesar datos de red', false),

(56, 'Un identificador único de un dispositivo en la red', true),
(56, 'Un número de serie del procesador', false),
(56, 'Una dirección de correo electrónico', false),
(56, 'Un protocolo de conexión local', false),

(57, 'Python', true),
(57, 'C++', false),
(57, 'Java', false),
(57, 'R', false),

(58, 'El hardware es físico, el software es lógico', true),
(58, 'Ambos son tangibles', false),
(58, 'El software se fabrica en fábricas', false),
(58, 'El hardware se descarga por Internet', false),

(59, 'Un conjunto de pasos para resolver un problema', true),
(59, 'Un programa instalado en la PC', false),
(59, 'Un componente electrónico', false),
(59, 'Un sistema operativo', false),

(60, 'Servicios y almacenamiento de datos en servidores remotos', true),
(60, 'Un tipo de disco duro externo', false),
(60, 'Una red local doméstica', false),
(60, 'Un protocolo de seguridad', false),

-- CONOCIMIENTO GENERAL
(61, 'India', true),
(61, 'China', false),
(61, 'Estados Unidos', false),
(61, 'Indonesia', false),

(62, '206', true),
(62, '201', false),
(62, '250', false),
(62, '198', false),

(63, 'Albert Einstein', true),
(63, 'Isaac Newton', false),
(63, 'Galileo Galilei', false),
(63, 'Stephen Hawking', false),

(64, 'El páncreas', true),
(64, 'El hígado', false),
(64, 'El estómago', false),
(64, 'El riñón', false),

(65, 'Guepardo', true),
(65, 'Leopardo', false),
(65, 'Tigre', false),
(65, 'León', false),

(66, 'Europa', true),
(66, 'Oceanía', false),
(66, 'África', false),
(66, 'América del Norte', false),

(67, 'Leonardo da Vinci', true),
(67, 'Miguel Ángel', false),
(67, 'Vincent van Gogh', false),
(67, 'Pablo Picasso', false),

(68, 'Hierro', true),
(68, 'Flúor', false),
(68, 'Fósforo', false),
(68, 'Francio', false),

(69, '8', true),
(69, '9', false),
(69, '10', false),
(69, '7', false),

(70, 'Río Amazonas', true),
(70, 'Río Nilo', false),
(70, 'Río Yangtsé', false),
(70, 'Río Mississippi', false),

-- GEOGRAFÍA
(71, 'África', true),
(71, 'Asia', false),
(71, 'Oceanía', false),
(71, 'América del Sur', false),

(72, 'Rusia', true),
(72, 'Canadá', false),
(72, 'China', false),
(72, 'Estados Unidos', false),

(73, 'Océano Pacífico', true),
(73, 'Océano Atlántico', false),
(73, 'Océano Índico', false),
(73, 'Océano Ártico', false),

(74, 'Cordillera de los Andes', true),
(74, 'Cordillera del Himalaya', false),
(74, 'Montes Urales', false),
(74, 'Montes Cárpatos', false),

(75, 'Oslo', true),
(75, 'Estocolmo', false),
(75, 'Copenhague', false),
(75, 'Helsinki', false),

(76, 'Tanzania', true),
(76, 'Kenia', false),
(76, 'Etiopía', false),
(76, 'Sudán', false),

(77, 'Mar Mediterráneo', true),
(77, 'Mar Rojo', false),
(77, 'Mar Caspio', false),
(77, 'Mar Negro', false),

(78, 'Ottawa', true),
(78, 'Toronto', false),
(78, 'Montreal', false),
(78, 'Vancouver', false),

(79, 'Suecia', true),
(79, 'Filipinas', false),
(79, 'Indonesia', false),
(79, 'Canadá', false),

(80, 'Antártida', true),
(80, 'Asia', false),
(80, 'África', false),
(80, 'Oceanía', false),

-- CINE
(81, 'James Cameron', true),
(81, 'Steven Spielberg', false),
(81, 'Ridley Scott', false),
(81, 'Christopher Nolan', false),

(82, 'Tom Hanks', true),
(82, 'Brad Pitt', false),
(82, 'Leonardo DiCaprio', false),
(82, 'Matt Damon', false),

(83, 'Forrest Gump', true),
(83, 'Braveheart', false),
(83, 'Titanic', false),
(83, 'Pulp Fiction', false),

(84, 'Darth Vader', true),
(84, 'Luke Skywalker', false),
(84, 'Han Solo', false),
(84, 'Obi-Wan Kenobi', false),

(85, 'Peter Jackson', true),
(85, 'Steven Spielberg', false),
(85, 'James Cameron', false),
(85, 'George Lucas', false),

(86, 'Piratas del Caribe', true),
(86, 'Indiana Jones', false),
(86, 'El Náufrago', false),
(86, 'Avatar', false),

(87, 'Pixar', true),
(87, 'DreamWorks', false),
(87, 'Disney clásico', false),
(87, 'Illumination', false),

(88, 'Robert Downey Jr.', true),
(88, 'Chris Evans', false),
(88, 'Mark Ruffalo', false),
(88, 'Tom Holland', false),

(89, 'Terminator 2', true),
(89, 'RoboCop', false),
(89, 'Matrix', false),
(89, 'Depredador', false),

(90, 'Julia Roberts', true),
(90, 'Sandra Bullock', false),
(90, 'Nicole Kidman', false),
(90, 'Meg Ryan', false),

-- HISTORIA
(91, '1939', true),
(91, '1945', false),
(91, '1914', false),
(91, '1929', false),

(92, 'George Washington', true),
(92, 'Thomas Jefferson', false),
(92, 'Abraham Lincoln', false),
(92, 'Benjamin Franklin', false),

(93, '476 d.C.', true),
(93, '1453 d.C.', false),
(93, '800 d.C.', false),
(93, '1200 d.C.', false),

(94, 'Tratado de Versalles', true),
(94, 'Tratado de París', false),
(94, 'Tratado de Viena', false),
(94, 'Pacto de Varsovia', false),

(95, 'Miguel Hidalgo y Costilla', true),
(95, 'Simón Bolívar', false),
(95, 'José de San Martín', false),
(95, 'Porfirio Díaz', false),

(96, 'Francia', true),
(96, 'España', false),
(96, 'Italia', false),
(96, 'Alemania', false),

(97, 'La Gran Muralla China', true),
(97, 'Muralla de Berlín', false),
(97, 'Muralla de Adriano', false),
(97, 'Muralla Inca', false),

(98, 'Pompeya', true),
(98, 'Atenas', false),
(98, 'Roma', false),
(98, 'Cartago', false),

(99, '1989', true),
(99, '1991', false),
(99, '1980', false),
(99, '1995', false),

(100, 'Tutankamón', true),
(100, 'Ramsés II', false),
(100, 'Cleopatra', false),
(100, 'Akhenatón', false);

/* INFORMÁTICA - DIFÍCIL */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(101, 4, 1, '¿Qué es un kernel en un sistema operativo?', 'dificil', '2025-09-25 16:09:32'),
(102, 4, 1, '¿Cuál es la complejidad temporal promedio del algoritmo QuickSort?', 'dificil', '2025-09-25 16:09:32'),
(103, 4, 1, '¿Qué significa la arquitectura de Von Neumann?', 'dificil', '2025-09-25 16:09:32'),
(104, 4, 1, '¿Qué protocolo se utiliza para el envío seguro de correos electrónicos?', 'dificil', '2025-09-25 16:09:32'),
(105, 4, 1, '¿Cuál es la función del registro “stack pointer”?', 'dificil', '2025-09-25 16:09:32'),
(106, 4, 1, '¿Qué tipo de base de datos utiliza el modelo orientado a grafos?', 'dificil', '2025-09-25 16:09:32'),
(107, 4, 1, '¿Qué caracteriza a un lenguaje de programación funcional?', 'dificil', '2025-09-25 16:09:32'),
(108, 4, 1, '¿Qué significa ACID en bases de datos?', 'dificil', '2025-09-25 16:09:32'),
(109, 4, 1, '¿Qué tipo de cifrado usa HTTPS?', 'dificil', '2025-09-25 16:09:32'),
(110, 4, 1, '¿Qué hace el comando “chmod” en sistemas Unix?', 'dificil', '2025-09-25 16:09:32');

/* CONOCIMIENTO GENERAL - DIFÍCIL */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(111, 5, 1, '¿Quién escribió “El origen de las especies”?', 'dificil', '2025-09-25 16:09:32'),
(112, 5, 1, '¿Qué partícula subatómica tiene carga negativa?', 'dificil', '2025-09-25 16:09:32'),
(113, 5, 1, '¿En qué año se fundó la ONU?', 'dificil', '2025-09-25 16:09:32'),
(114, 5, 1, '¿Qué científico desarrolló las leyes del movimiento planetario?', 'dificil', '2025-09-25 16:09:32'),
(115, 5, 1, '¿Qué país fue el primero en legalizar el matrimonio igualitario?', 'dificil', '2025-09-25 16:09:32'),
(116, 5, 1, '¿Qué gas es responsable del efecto invernadero en mayor medida?', 'dificil', '2025-09-25 16:09:32'),
(117, 5, 1, '¿Cuál es la distancia media entre la Tierra y el Sol?', 'dificil', '2025-09-25 16:09:32'),
(118, 5, 1, '¿Qué elemento químico tiene el número atómico 79?', 'dificil', '2025-09-25 16:09:32'),
(119, 5, 1, '¿Cuál es el metal más ligero conocido?', 'dificil', '2025-09-25 16:09:32'),
(120, 5, 1, '¿Qué científico descubrió la penicilina?', 'dificil', '2025-09-25 16:09:32');

/* GEOGRAFÍA - DIFÍCIL */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(121, 1, 1, '¿Cuál es el país sin salida al mar más grande del mundo?', 'dificil', '2025-09-25 16:09:32'),
(122, 1, 1, '¿Qué país tiene más husos horarios?', 'dificil', '2025-09-25 16:09:32'),
(123, 1, 1, '¿Dónde se encuentra el lago Baikal?', 'dificil', '2025-09-25 16:09:32'),
(124, 1, 1, '¿Qué cordillera se extiende por Marruecos, Argelia y Túnez?', 'dificil', '2025-09-25 16:09:32'),
(125, 1, 1, '¿Cuál es la capital de Bután?', 'dificil', '2025-09-25 16:09:32'),
(126, 1, 1, '¿Qué desierto es el más frío del planeta?', 'dificil', '2025-09-25 16:09:32'),
(127, 1, 1, '¿Cuál es el pico más alto de África?', 'dificil', '2025-09-25 16:09:32'),
(128, 1, 1, '¿Qué estrecho separa Asia de América?', 'dificil', '2025-09-25 16:09:32'),
(129, 1, 1, '¿Cuál es el país más pequeño del mundo?', 'dificil', '2025-09-25 16:09:32'),
(130, 1, 1, '¿Qué río atraviesa París?', 'dificil', '2025-09-25 16:09:32');

/* CINE - DIFÍCIL */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(131, 6, 1, '¿Qué director filmó “2001: Una odisea del espacio”?', 'dificil', '2025-09-25 16:09:32'),
(132, 6, 1, '¿Qué película fue la primera en ganar el Oscar a Mejor Película?', 'dificil', '2025-09-25 16:09:32'),
(133, 6, 1, '¿Qué actor interpretó al Joker en “The Dark Knight”?', 'dificil', '2025-09-25 16:09:32'),
(134, 6, 1, '¿Qué compositor creó la banda sonora de “Star Wars”?', 'dificil', '2025-09-25 16:09:32'),
(135, 6, 1, '¿Qué película fue dirigida por Bong Joon-ho y ganó el Oscar en 2020?', 'dificil', '2025-09-25 16:09:32'),
(136, 6, 1, '¿En qué año se estrenó la primera película de “Harry Potter”?', 'dificil', '2025-09-25 16:09:32'),
(137, 6, 1, '¿Qué actriz protagonizó “Cisne Negro”?', 'dificil', '2025-09-25 16:09:32'),
(138, 6, 1, '¿Qué película introdujo el personaje Hannibal Lecter?', 'dificil', '2025-09-25 16:09:32'),
(139, 6, 1, '¿Qué director es conocido por su estilo no lineal y “Pulp Fiction”?', 'dificil', '2025-09-25 16:09:32'),
(140, 6, 1, '¿Qué película popularizó la técnica del “bullet time”?', 'dificil', '2025-09-25 16:09:32');

/* HISTORIA - DIFÍCIL */
INSERT INTO preguntas (id, categoria_id, admin_id, enunciado, dificultad, created_at) VALUES
(141, 9, 1, '¿Qué emperador romano legalizó el cristianismo?', 'dificil', '2025-09-25 16:09:32'),
(142, 9, 1, '¿En qué año comenzó la Revolución Francesa?', 'dificil', '2025-09-25 16:09:32'),
(143, 9, 1, '¿Quién fue el primer emperador de China?', 'dificil', '2025-09-25 16:09:32'),
(144, 9, 1, '¿Qué civilización inventó la escritura cuneiforme?', 'dificil', '2025-09-25 16:09:32'),
(145, 9, 1, '¿Qué país fue conocido como Persia en la antigüedad?', 'dificil', '2025-09-25 16:09:32'),
(146, 9, 1, '¿En qué batalla fue derrotado Napoleón Bonaparte?', 'dificil', '2025-09-25 16:09:32'),
(147, 9, 1, '¿Quién fue el último zar de Rusia?', 'dificil', '2025-09-25 16:09:32'),
(148, 9, 1, '¿En qué año llegó el hombre a la Luna?', 'dificil', '2025-09-25 16:09:32'),
(149, 9, 1, '¿Qué tratado creó la Unión Europea?', 'dificil', '2025-09-25 16:09:32'),
(150, 9, 1, '¿Qué civilización construyó Machu Picchu?', 'dificil', '2025-09-25 16:09:32');


INSERT INTO opciones (pregunta_id, texto, es_correcta) VALUES
-- INFORMÁTICA (101–110)
(101, 'Un driver de red', false),
(101, 'El núcleo que gestiona la comunicación entre hardware y software', true),
(101, 'Una interfaz gráfica del sistema', false),
(101, 'Un programa de usuario que controla periféricos', false),

(102, 'O(n)', false),
(102, 'O(n log n)', true),
(102, 'O(n²)', false),
(102, 'O(log n)', false),

(103, 'Una arquitectura donde datos e instrucciones comparten memoria', true),
(103, 'Una arquitectura con múltiples CPUs independientes', false),
(103, 'Un sistema de archivos jerárquico', false),
(103, 'Un modelo de red distribuida', false),

(104, 'FTP', false),
(104, 'SMTP con TLS o SSL', true),
(104, 'POP3 sin cifrado', false),
(104, 'IMAP básico', false),

(105, 'Guarda la dirección del siguiente proceso', false),
(105, 'Apunta a la última dirección usada en la pila', true),
(105, 'Administra registros de control', false),
(105, 'Contiene la dirección base del heap', false),

(106, 'MySQL', false),
(106, 'Neo4j', true),
(106, 'SQLite', false),
(106, 'PostgreSQL', false),

(107, 'Se basa en funciones puras y evita el estado mutable', true),
(107, 'Depende del uso de bucles imperativos', false),
(107, 'Permite cambiar tipos en ejecución', false),
(107, 'Usa compilación JIT obligatoria', false),

(108, 'Aplicación Conectada de Índices Distribuidos', false),
(108, 'Atomicidad, Consistencia, Aislamiento y Durabilidad', true),
(108, 'Archivo Comprimido de Integridad de Datos', false),
(108, 'Acceso Centralizado de Información Dinámica', false),

(109, 'Autenticación básica HTTP', false),
(109, 'Cifrado por IPsec en capa 2', false),
(109, 'Cifrado asimétrico mediante TLS', true),
(109, 'FTP seguro', false),

(110, 'Edita el contenido del archivo', false),
(110, 'Copia archivos entre usuarios', false),
(110, 'Cambia el propietario del archivo', false),
(110, 'Modifica los permisos de archivos o directorios', true),

-- CONOCIMIENTO GENERAL (111–120)
(111, 'Isaac Newton', false),
(111, 'Charles Darwin', true),
(111, 'Gregor Mendel', false),
(111, 'Louis Pasteur', false),

(112, 'Protón', false),
(112, 'Electrón', true),
(112, 'Neutrón', false),
(112, 'Quark', false),

(113, '1948', false),
(113, '1950', false),
(113, '1939', false),
(113, '1945', true),

(114, 'Galileo Galilei', false),
(114, 'Johannes Kepler', true),
(114, 'Copérnico', false),
(114, 'Tycho Brahe', false),

(115, 'Canadá', false),
(115, 'Países Bajos', true),
(115, 'Argentina', false),
(115, 'España', false),

(116, 'Ozono (O₃)', false),
(116, 'Oxígeno (O₂)', false),
(116, 'Dióxido de carbono (CO₂)', true),
(116, 'Hidrógeno (H₂)', false),

(117, '1 millón de kilómetros', false),
(117, '150 millones de kilómetros', true),
(117, '15 millones de kilómetros', false),
(117, '300 millones de kilómetros', false),

(118, 'Plata', false),
(118, 'Oro', true),
(118, 'Hierro', false),
(118, 'Cobre', false),

(119, 'Aluminio', false),
(119, 'Litio', true),
(119, 'Magnesio', false),
(119, 'Titanio', false),

(120, 'Marie Curie', false),
(120, 'Alexander Fleming', true),
(120, 'Isaac Newton', false),
(120, 'Albert Einstein', false),

-- GEOGRAFÍA (121–130)
(121, 'Kazajistán', true),
(121, 'Paraguay', false),
(121, 'Mongolia', false),
(121, 'Bolivia', false),

(122, 'Rusia', false),
(122, 'China', false),
(122, 'Francia', true),
(122, 'Estados Unidos', false),

(123, 'Rusia', true),
(123, 'China', false),
(123, 'Mongolia', false),
(123, 'Kazajistán', false),

(124, 'Atlas', true),
(124, 'Andes', false),
(124, 'Cáucaso', false),
(124, 'Rocosas', false),

(125, 'Ulan Bator', false),
(125, 'Thimphu', true),
(125, 'Katmandú', false),
(125, 'Colombo', false),

(126, 'Sahara', false),
(126, 'Gobi', false),
(126, 'Kalahari', false),
(126, 'Antártico', true),

(127, 'Monte Kenia', false),
(127, 'Drakensberg', false),
(127, 'Kilimanjaro', true),
(127, 'Ruwenzori', false),

(128, 'Canal de Panamá', false),
(128, 'Estrecho de Bering', true),
(128, 'Estrecho de Magallanes', false),
(128, 'Estrecho de Gibraltar', false),

(129, 'Mónaco', false),
(129, 'San Marino', false),
(129, 'Ciudad del Vaticano', true),
(129, 'Liechtenstein', false),

(130, 'Támesis', false),
(130, 'Sena', true),
(130, 'Danubio', false),
(130, 'Rin', false),

-- CINE (131–140)
(131, 'Stanley Kubrick', true),
(131, 'Steven Spielberg', false),
(131, 'Ridley Scott', false),
(131, 'Francis Ford Coppola', false),

(132, 'Wings', true),
(132, 'The Jazz Singer', false),
(132, 'Sunrise', false),
(132, 'All Quiet on the Western Front', false),

(133, 'Heath Ledger', true),
(133, 'Joaquin Phoenix', false),
(133, 'Jack Nicholson', false),
(133, 'Jared Leto', false),

(134, 'John Williams', true),
(134, 'Hans Zimmer', false),
(134, 'Ennio Morricone', false),
(134, 'Howard Shore', false),

(135, 'Parasite', true),
(135, 'Snowpiercer', false),
(135, 'The Host', false),
(135, 'Okja', false),

(136, '2001', false),
(136, '2002', false),
(136, '2001: 2001', false),
(136, '2001 (2001)', true), -- kept correct year 2001; formatted to avoid ambiguity

(137, 'Natalie Portman', true),
(137, 'Mila Kunis', false),
(137, 'Portia de Rossi', false),
(137, 'Charlize Theron', false),

(138, 'Manhunter', true),
(138, 'The Silence of the Lambs', false),
(138, 'Red Dragon', false),
(138, 'Hannibal', false),

(139, 'Quentin Tarantino', true),
(139, 'Christopher Nolan', false),
(139, 'David Lynch', false),
(139, 'Guy Ritchie', false),

(140, 'The Matrix', true),
(140, 'The Matrix Reloaded', false),
(140, 'Speed', false),
(140, 'Bulletproof', false),

-- HISTORIA (141–150)
(141, 'Nerón', false),
(141, 'Trajano', false),
(141, 'Constantino', true),
(141, 'Julio César', false),

(142, '1776', false),
(142, '1792', false),
(142, '1804', false),
(142, '1789', true),

(143, 'Qin Shi Huang', true),
(143, 'Confucio', false),
(143, 'Han Wu', false),
(143, 'Sun Tzu', false),

(144, 'Egipcios', false),
(144, 'Babilonios', false),
(144, 'Sumerios', true),
(144, 'Asirios', false),

(145, 'Turquía', false),
(145, 'Irak', false),
(145, 'Irán', true),
(145, 'Arabia Saudita', false),

(146, 'Austerlitz', false),
(146, 'Trafalgar', false),
(146, 'Lepanto', false),
(146, 'Waterloo', true),

(147, 'Pedro el Grande', false),
(147, 'Iván el Terrible', false),
(147, 'Nicolás II', true),
(147, 'Alejandro III', false),

(148, '1965', false),
(148, '1971', false),
(148, '1969', true),
(148, '1973', false),

(149, 'Tratado de Versalles', false),
(149, 'Tratado de París', false),
(149, 'Tratado de Maastricht', true),
(149, 'Tratado de Roma', false),

(150, 'Los mayas', false),
(150, 'Los incas', true),
(150, 'Los aztecas', false),
(150, 'Los olmecas', false);
