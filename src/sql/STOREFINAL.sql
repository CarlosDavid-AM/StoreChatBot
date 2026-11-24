
-- =====================================================
-- BASE DE DATOS: STOREFINAL
-- Modelo normalizado hasta 3FN
-- =====================================================

DROP DATABASE IF EXISTS STOREFINAL;

CREATE DATABASE STOREFINAL
    CHARACTER SET utf8mb4
    COLLATE utf8mb4_unicode_ci;

USE STOREFINAL;


-- =====================================================
-- 1. TABLA: PRODUCTOS
-- =====================================================

CREATE TABLE productos (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    categoria VARCHAR(60) NOT NULL,
    marca VARCHAR(60) NOT NULL,
    modelo VARCHAR(80) NOT NULL,
    descripcion VARCHAR(255) NOT NULL,
    garantia TINYINT UNSIGNED NOT NULL DEFAULT 0,
    stock INT UNSIGNED NOT NULL DEFAULT 0,
    fotografia VARCHAR(255),
    metodo_pago ENUM('EFECTIVO', 'VISA') NOT NULL,
    precio DECIMAL(10,2) NOT NULL,
    disponible BOOLEAN NOT NULL DEFAULT TRUE,

    CONSTRAINT chk_precio
        CHECK (precio >= 0)
) ENGINE=InnoDB;


-- =====================================================
-- 2. TABLA: ESPECIFICACIONES
-- =====================================================

CREATE TABLE especificaciones (
    id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_producto INT UNSIGNED NOT NULL,
    especificacion VARCHAR(60) NOT NULL,
    valor VARCHAR(100) NOT NULL,

    CONSTRAINT fk_especificaciones_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    CONSTRAINT uq_producto_especificacion
        UNIQUE (id_producto, especificacion)

) ENGINE=InnoDB;


-- =====================================================
-- 3. TABLA: CONSULTADOS
-- =====================================================

CREATE TABLE consultados (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    id_producto INT UNSIGNED NOT NULL,
    fechahora DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT fk_consultados_producto
        FOREIGN KEY (id_producto)
        REFERENCES productos(id)
        ON UPDATE CASCADE
        ON DELETE CASCADE,

    INDEX idx_consultados_producto_fecha
        (id_producto, fechahora)

) ENGINE=InnoDB;


-- =====================================================
-- DATOS DE PRUEBA
-- =====================================================

-- PRODUCTOS

INSERT INTO productos (
    categoria,
    marca,
    modelo,
    descripcion,
    garantia,
    stock,
    fotografia,
    metodo_pago,
    precio,
    disponible
) VALUES
(
    'Informática',
    'DELL',
    'All in One',
    'Computadora personal',
    24,
    5,
    NULL,
    'VISA',
    4500.00,
    TRUE
),
(
    'Informática',
    'LOGITECH',
    'M90',
    'Mouse básico USB',
    12,
    10,
    NULL,
    'EFECTIVO',
    65.00,
    TRUE
),
(
    'Periféricos',
    'LOGITECH',
    'G203',
    'Mouse gamer RGB',
    12,
    8,
    NULL,
    'VISA',
    120.00,
    TRUE
);


-- ESPECIFICACIONES

INSERT INTO especificaciones (
    id_producto,
    especificacion,
    valor
) VALUES
(1, 'RAM', '32 GB'),
(1, 'CPU', 'Intel Core i7 14G'),
(1, 'SSD', '1000 GB'),
(1, 'Gráfica', '3060 TI'),
(1, 'Pantalla', '24 pulgadas'),

(2, 'Conexión', 'USB'),
(2, 'Sensor', 'Óptico'),

(3, 'Conexión', 'USB'),
(3, 'Iluminación', 'RGB'),
(3, 'DPI', '8000');


-- CONSULTADOS

INSERT INTO consultados (
    id_producto,
    fechahora
) VALUES
(1, '2026-11-20 13:18:00'),
(1, '2026-11-20 17:00:00'),
(2, '2026-11-20 18:30:00');

