-- =========================================================
-- USUARIOS (cuenta + datos de juego)
-- =========================================================
CREATE TABLE users (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    role ENUM('jugador', 'administrador') NULL,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =========================================================
-- JUGADORES (1:1 con users, PK propia + user_id único)
-- =========================================================
CREATE TABLE jugadores (
    jugador_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    puntaje INT UNSIGNED NOT NULL DEFAULT 0,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT uq_jugadores_user UNIQUE (user_id),
    CONSTRAINT fk_jugadores_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =========================================================
-- ADMINISTRADORES (1:1 con users, PK propia + user_id único)
-- =========================================================
CREATE TABLE administradores (
    admin_id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    user_id INT UNSIGNED NOT NULL,
    CONSTRAINT uq_admin_user UNIQUE (user_id),
    CONSTRAINT fk_admin_user FOREIGN KEY (user_id) REFERENCES users(id) ON UPDATE CASCADE ON DELETE CASCADE,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =========================================================
-- AMIGOS (entre jugadores)
-- =========================================================
DROP TABLE IF EXISTS amigos;

CREATE TABLE amigos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT UNSIGNED NOT NULL,
    amigo_id INT UNSIGNED NOT NULL,
    creado_en DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    aceptado_en DATETIME NULL,
    CONSTRAINT fk_amigos_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_amigos_amigo FOREIGN KEY (amigo_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uc_amigos_par UNIQUE (jugador_id, amigo_id),
    CONSTRAINT chk_no_self CHECK (jugador_id <> amigo_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE INDEX idx_amigos_jugador ON amigos (jugador_id);

CREATE INDEX idx_amigos_amigo ON amigos (amigo_id);

-- =========================================================
-- CATALOGO DE PREGUNTAS
-- =========================================================
CREATE TABLE categorias (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NULL,
    -- ← UNSIGNED para matchear
    nombre VARCHAR(100) NOT NULL UNIQUE,
    descripcion VARCHAR(255) NOT NULL UNIQUE,
    CONSTRAINT fk_categorias_admin FOREIGN KEY (admin_id) REFERENCES administradores(admin_id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE preguntas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    categoria_id INT UNSIGNED NOT NULL,
    admin_id INT UNSIGNED NULL,
    -- ← UNSIGNED
    enunciado TEXT NOT NULL,
    dificultad ENUM('facil', 'normal', 'dificil') NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_preguntas_admin FOREIGN KEY (admin_id) REFERENCES administradores(admin_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_preguntas_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- OPCIONES
CREATE TABLE opciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NULL,
    -- ← UNSIGNED
    pregunta_id INT UNSIGNED NOT NULL,
    texto VARCHAR(255) NOT NULL,
    es_correcta TINYINT(1) NOT NULL DEFAULT 0,
    CONSTRAINT fk_opciones_admin FOREIGN KEY (admin_id) REFERENCES administradores(admin_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_opciones_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =========================================================
-- LOBBY (multijugador)
-- =========================================================
CREATE TABLE salas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    codigo VARCHAR(12) NULL UNIQUE,
    categoria_id INT UNSIGNED NULL,
    max_jugadores TINYINT UNSIGNED NOT NULL DEFAULT 2,
    estado ENUM('esperando', 'en_curso', 'cancelada') NOT NULL DEFAULT 'esperando',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_salas_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE
    SET
        NULL
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE sala_jugadores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sala_id INT UNSIGNED NOT NULL,
    jugador_id INT UNSIGNED NOT NULL,
    joined_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sj_sala FOREIGN KEY (sala_id) REFERENCES salas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_sj_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uc_sj_unico UNIQUE (sala_id, jugador_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =========================================================
-- PARTIDAS
-- =========================================================
CREATE TABLE partidas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    sala_id INT UNSIGNED NULL,
    categoria_id INT UNSIGNED NULL,
    modo ENUM('individual', 'multijugador') NOT NULL,
    total_preguntas TINYINT UNSIGNED NOT NULL,
    estado ENUM('pendiente', 'en_curso', 'finalizada', 'abandonada') NOT NULL DEFAULT 'en_curso',
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    started_at DATETIME NULL,
    ended_at DATETIME NULL,
    CONSTRAINT fk_partidas_sala FOREIGN KEY (sala_id) REFERENCES salas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_partidas_categoria FOREIGN KEY (categoria_id) REFERENCES categorias(id) ON UPDATE CASCADE ON DELETE
    SET
        NULL,
        CONSTRAINT uc_partidas_sala UNIQUE (sala_id) -- Nota: se eliminó el CHECK que referenciaba 'usuario_id' porque esa columna no existe
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE partida_jugadores (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partida_id INT UNSIGNED NOT NULL,
    jugador_id INT UNSIGNED NOT NULL,
    CONSTRAINT fk_pj_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pj_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT uc_pj_unico UNIQUE (partida_id, jugador_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE partida_preguntas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partida_id INT UNSIGNED NOT NULL,
    pregunta_id INT UNSIGNED NOT NULL,
    orden TINYINT UNSIGNED NOT NULL,
    question_text_copy TEXT NULL,
    correct_option_id_copy INT UNSIGNED NULL,
    correct_option_text_copy VARCHAR(255) NULL,
    CONSTRAINT fk_pp_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_pp_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uc_pp_orden UNIQUE (partida_id, orden)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE estadisticas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT UNSIGNED NULL,
    partida_id INT UNSIGNED NULL,
    posicion TINYINT UNSIGNED NOT NULL,
    puntaje_total INT UNSIGNED NOT NULL DEFAULT 0,
    total_correctas INT UNSIGNED NOT NULL DEFAULT 0,
    total_incorrectas INT UNSIGNED NOT NULL DEFAULT 0,
    tiempo_total_ms INT UNSIGNED NOT NULL DEFAULT 0,
    FOREIGN KEY (jugador_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE RESTRICT,
    FOREIGN KEY (partida_id) REFERENCES partidas(id) ON UPDATE CASCADE ON DELETE RESTRICT
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE respuestas (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    partida_id INT UNSIGNED NOT NULL,
    jugador_id INT UNSIGNED NOT NULL,
    pregunta_id INT UNSIGNED NOT NULL,
    partida_pregunta_id INT UNSIGNED NOT NULL,
    opcion_elegida_id INT UNSIGNED NOT NULL,
    estadistica_id INT UNSIGNED NOT NULL,
    es_correcta TINYINT(1) NOT NULL,
    tiempo_respuesta_ms INT UNSIGNED NOT NULL,
    CONSTRAINT fk_r_partida FOREIGN KEY (partida_id) REFERENCES partidas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_r_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_r_pregunta FOREIGN KEY (pregunta_id) REFERENCES preguntas(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT fk_r_partida_pregunta FOREIGN KEY (partida_pregunta_id) REFERENCES partida_preguntas(id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_r_opcion FOREIGN KEY (opcion_elegida_id) REFERENCES opciones(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uc_r_unica UNIQUE (partida_id, jugador_id, pregunta_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

-- =========================================================
-- TIENDA DE AVATARES
-- =========================================================
CREATE TABLE avatares (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    admin_id INT UNSIGNED NULL,
    -- ← UNSIGNED
    nombre VARCHAR(100) NOT NULL,
    division VARCHAR(50) NOT NULL,
    precio_puntos INT UNSIGNED NOT NULL,
    activo TINYINT(1) NOT NULL DEFAULT 1,
    preview_url VARCHAR(255) NULL,
    CONSTRAINT fk_avatars_admin FOREIGN KEY (admin_id) REFERENCES administradores(admin_id) ON UPDATE CASCADE ON DELETE CASCADE
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;

CREATE TABLE user_avatars (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    jugador_id INT UNSIGNED NOT NULL,
    avatar_id INT UNSIGNED NOT NULL,
    origen ENUM('compra', 'recompensa', 'admin') NOT NULL DEFAULT 'compra',
    adquirido_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_ua_jugador FOREIGN KEY (jugador_id) REFERENCES jugadores(jugador_id) ON UPDATE CASCADE ON DELETE CASCADE,
    CONSTRAINT fk_ua_avatar FOREIGN KEY (avatar_id) REFERENCES avatares(id) ON UPDATE CASCADE ON DELETE RESTRICT,
    CONSTRAINT uc_ua_unico UNIQUE (jugador_id, avatar_id)
) ENGINE = InnoDB DEFAULT CHARSET = utf8mb4;