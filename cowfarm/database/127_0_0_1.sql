-- phpMyAdmin SQL Dump
-- version 5.2.1
-- https://www.phpmyadmin.net/
--
-- Servidor: 127.0.0.1
-- Tiempo de generación: 13-11-2026 a las 16:36:19
-- Versión del servidor: 10.4.32-MariaDB
-- Versión de PHP: 8.2.12

SET SQL_MODE = "NO_AUTO_VALUE_ON_ZERO";
START TRANSACTION;
SET time_zone = "+00:00";


/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;

--
-- Base de datos: `cowfarm`
--
CREATE DATABASE IF NOT EXISTS `cowfarm` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `cowfarm`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ajustes_inventario`
--

CREATE TABLE `ajustes_inventario` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `motivo` varchar(255) NOT NULL,
  `stock_resultante` int(11) NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `slug` varchar(120) DEFAULT NULL,
  `descripcion` varchar(500) DEFAULT NULL,
  `imagen_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`, `slug`, `descripcion`, `imagen_url`) VALUES
(1, 'Ganado', 'ganado', NULL, '/uploads/categorias/7537eb715469422bbdc28ad78e027175.jpg'),
(2, 'Insumo', 'insumo', NULL, '/uploads/categorias/26bc0ff59bea4ffc8b23a0c7c6c01368.jpg'),
(3, 'Cultivos', 'cultivos', NULL, '/uploads/categorias/fa58068765574028bbed6e5dc32cbe89.webp'),
(6, 'maquinaria', 'maquinaria', NULL, '/uploads/categorias/69d532ae81e24685b874605b51fe7092.avif'),
(13, 'fertilizantes', 'fertilizantes', 'fertilizantes', '/uploads/categorias/f36a04bd87ee4c69b0b44e1e652dd8a6.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unitario` decimal(12,2) NOT NULL,
  `subtotal` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unitario`, `subtotal`) VALUES
(5, 6, 5, 3, 200000.00, 600000.00),
(6, 8, 7, 1, 10000000.00, 10000000.00),
(7, 9, 1, 1, 150000.00, 150000.00),
(8, 10, 6, 1, 1000.00, 1000.00),
(9, 11, 4, 1, 150000.00, 150000.00),
(10, 12, 5, 1, 200000.00, 200000.00),
(11, 13, 1, 1, 150000.00, 150000.00),
(12, 14, 4, 1, 150000.00, 150000.00),
(13, 16, 6, 2, 1000.00, 2000.00),
(14, 17, 9, 1, 1000000.00, 1000000.00),
(15, 18, 9, 1, 1000000.00, 1000000.00),
(16, 19, 9, 1, 1000000.00, 1000000.00),
(17, 20, 9, 1, 1000000.00, 1000000.00),
(18, 21, 9, 1, 1000000.00, 1000000.00),
(19, 22, 9, 1, 1000000.00, 1000000.00),
(20, 23, 9, 1, 1000000.00, 1000000.00),
(21, 24, 9, 1, 1000000.00, 1000000.00),
(22, 25, 9, 1, 1000000.00, 1000000.00),
(23, 26, 9, 21, 1000000.00, 21000000.00),
(24, 27, 9, 1, 1000000.00, 1000000.00),
(25, 28, 3, 1, 20000.00, 20000.00),
(26, 29, 12, 1, 100000000.00, 100000000.00),
(27, 30, 5, 1, 200000.00, 200000.00),
(28, 31, 3, 1, 20000.00, 20000.00);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `direcciones`
--

CREATE TABLE `direcciones` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `departamento` varchar(100) NOT NULL,
  `municipio` varchar(100) NOT NULL,
  `vereda` varchar(100) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `direcciones`
--

INSERT INTO `direcciones` (`id`, `usuario_id`, `departamento`, `municipio`, `vereda`, `direccion`) VALUES
(1, 11, 'Caquetá', 'Florencia', 'el rosal', 'cra 43 #75 este');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `gastos_operativos`
--

CREATE TABLE `gastos_operativos` (
  `id` int(11) NOT NULL,
  `venta_id` int(11) NOT NULL,
  `vendedor_id` int(11) NOT NULL,
  `tipo` enum('TRANSPORTE','EMPAQUE','LOGISTICA','OTRO') NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `monto` decimal(12,2) NOT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `impuestos`
--

CREATE TABLE `impuestos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `porcentaje` decimal(5,2) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago`
--

CREATE TABLE `metodos_pago` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `descripcion` varchar(255) DEFAULT NULL,
  `activo` tinyint(1) NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `metodos_pago`
--

INSERT INTO `metodos_pago` (`id`, `nombre`, `descripcion`, `activo`) VALUES
(1, 'nequi', 'billetera Digitital', 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `metodos_pago_catalogo`
--

CREATE TABLE `metodos_pago_catalogo` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pagos`
--

CREATE TABLE `pagos` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `metodo_pago` enum('EFECTIVO','NEQUI','DAVIPLATA','TRANSFERENCIA','TARJETA') NOT NULL,
  `monto` decimal(12,2) NOT NULL,
  `estado` enum('PENDIENTE','PAGADO','RECHAZADO') NOT NULL,
  `fecha_pago` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pagos`
--

INSERT INTO `pagos` (`id`, `pedido_id`, `metodo_pago`, `monto`, `estado`, `fecha_pago`) VALUES
(1, 12, 'NEQUI', 200000.00, 'PENDIENTE', '2026-09-02 20:42:00'),
(2, 13, 'NEQUI', 150000.00, 'PENDIENTE', '2026-09-02 20:48:43'),
(3, 14, 'NEQUI', 150000.00, 'PENDIENTE', '2026-09-02 21:44:32'),
(4, 16, 'NEQUI', 2000.00, 'PENDIENTE', '2026-09-02 21:45:42'),
(5, 17, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-14 14:39:16'),
(6, 18, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-14 14:53:49'),
(7, 19, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-14 15:05:36'),
(8, 20, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-14 15:08:33'),
(9, 21, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-14 15:16:22'),
(10, 22, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-15 17:45:43'),
(11, 23, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-15 17:48:29'),
(12, 24, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-15 17:48:40'),
(13, 25, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-15 19:11:05'),
(14, 26, 'NEQUI', 21000000.00, 'PENDIENTE', '2026-09-15 19:35:54'),
(15, 27, 'NEQUI', 1000000.00, 'PENDIENTE', '2026-09-15 21:50:42'),
(16, 28, 'NEQUI', 20000.00, 'PENDIENTE', '2026-10-16 15:58:04'),
(17, 29, 'NEQUI', 100000000.00, 'PENDIENTE', '2026-11-13 14:17:06'),
(18, 30, 'NEQUI', 200000.00, 'PENDIENTE', '2026-11-13 15:06:31'),
(19, 31, 'NEQUI', 20000.00, 'PENDIENTE', '2026-11-13 15:23:23');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `comprador_id` int(11) NOT NULL,
  `fecha_pedido` timestamp NULL DEFAULT current_timestamp(),
  `estado` enum('PENDIENTE','ACEPTADO','EN_PREPARACION','EN_CAMINO','ENTREGADO','CANCELADO') NOT NULL,
  `total` decimal(12,2) NOT NULL,
  `distribuidor_id` int(11) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `comprador_id`, `fecha_pedido`, `estado`, `total`, `distribuidor_id`) VALUES
(5, 11, '2026-09-02 17:24:25', 'EN_PREPARACION', 0.00, 9),
(6, 11, '2026-09-02 17:24:29', 'PENDIENTE', 600000.00, NULL),
(7, 11, '2026-09-02 17:27:10', 'PENDIENTE', 0.00, NULL),
(8, 11, '2026-09-02 17:46:07', 'PENDIENTE', 10000000.00, NULL),
(9, 11, '2026-09-02 18:25:23', 'PENDIENTE', 150000.00, NULL),
(10, 11, '2026-09-02 19:55:12', 'PENDIENTE', 1000.00, NULL),
(11, 11, '2026-09-02 20:10:23', 'ACEPTADO', 150000.00, 9),
(12, 11, '2026-09-02 20:42:00', 'PENDIENTE', 200000.00, NULL),
(13, 16, '2026-09-02 20:48:43', 'ENTREGADO', 150000.00, 9),
(14, 17, '2026-09-02 21:44:32', 'ENTREGADO', 150000.00, 9),
(15, 17, '2026-09-02 21:45:06', 'PENDIENTE', 0.00, NULL),
(16, 17, '2026-09-02 21:45:42', 'EN_PREPARACION', 2000.00, 9),
(17, 11, '2026-09-14 14:39:15', 'ENTREGADO', 1000000.00, 9),
(18, 11, '2026-09-14 14:53:49', 'PENDIENTE', 1000000.00, NULL),
(19, 11, '2026-09-14 15:05:36', 'PENDIENTE', 1000000.00, NULL),
(20, 11, '2026-09-14 15:08:33', 'PENDIENTE', 1000000.00, NULL),
(21, 11, '2026-09-14 15:16:22', 'PENDIENTE', 1000000.00, NULL),
(22, 11, '2026-09-15 17:45:43', 'ENTREGADO', 1000000.00, 9),
(23, 11, '2026-09-15 17:48:29', 'PENDIENTE', 1000000.00, NULL),
(24, 11, '2026-09-15 17:48:40', 'PENDIENTE', 1000000.00, NULL),
(25, 11, '2026-09-15 19:11:05', 'PENDIENTE', 1000000.00, NULL),
(26, 1, '2026-09-15 19:35:54', 'PENDIENTE', 21000000.00, NULL),
(27, 11, '2026-09-15 21:50:42', 'CANCELADO', 1000000.00, NULL),
(28, 11, '2026-10-16 15:58:04', 'PENDIENTE', 20000.00, 9),
(29, 11, '2026-11-13 14:17:06', 'PENDIENTE', 100000000.00, 9),
(30, 11, '2026-11-13 15:06:31', 'PENDIENTE', 200000.00, 9),
(31, 11, '2026-11-13 15:23:23', 'PENDIENTE', 20000.00, 9);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `productor_id` int(11) NOT NULL,
  `categoria_id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `descripcion` text DEFAULT NULL,
  `precio` decimal(12,2) NOT NULL,
  `stock` int(11) NOT NULL,
  `unidad_medida` varchar(50) DEFAULT NULL,
  `fecha_creacion` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `productor_id`, `categoria_id`, `nombre`, `descripcion`, `precio`, `stock`, `unidad_medida`, `fecha_creacion`) VALUES
(1, 3, 1, 'ANGUS', '18 meses 36kg', 150000.00, 0, NULL, '2026-08-11 19:29:30'),
(2, 3, 2, 'composte', 'producto para el crecimiento de plantas', 5000.00, 20, NULL, '2026-08-11 19:31:32'),
(3, 3, 3, 'papa', 'semillas de papa pastusa', 20000.00, 1, NULL, '2026-08-11 19:47:25'),
(4, 3, 1, 'BRANGUS', 'NEGRO 500KG', 150000.00, 182, '', '2026-08-11 20:13:33'),
(5, 3, 1, 'BOSMARA 17 MESES', 'VACUNAS AL DIA', 200000.00, 0, NULL, '2026-08-31 12:25:15'),
(6, 12, 1, 'angus', 'gfhkjlñ{', 1000.00, 997, '', '2026-09-02 17:26:32'),
(7, 12, 1, 'angus', '<sdzfgh', 1000.00, 50000, '', '2026-09-02 17:45:14'),
(8, 12, 2, 'composta', 'organica', 50000.00, 500, NULL, '2026-09-02 17:47:14'),
(9, 12, 1, 'charolaise', 'blanca 20 meses', 1000000.00, 40, '', '2026-09-02 20:54:06'),
(10, 12, 1, 'jersey', 'cafe', 1800000.00, 10, NULL, '2026-09-02 20:56:33'),
(11, 19, 6, 'caterpila', 'maquina para recoger cultivo', 2000000.00, 3, NULL, '2026-09-02 21:54:32'),
(12, 12, 6, 'Tuneladora', 'Una tuneladora o minador a sección completa es una máquina capaz de excavar túneles a sección completa, a la vez que colabora en la colocación de la entibación para la sustentación del túnel si ésta es necesaria, ya sea de forma provisional o definitiva.', 100000000.00, 1, '500 tnl', '2026-09-15 19:14:58');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `producto_imagenes`
--

CREATE TABLE `producto_imagenes` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `url_imagen` varchar(500) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `producto_imagenes`
--

INSERT INTO `producto_imagenes` (`id`, `producto_id`, `url_imagen`) VALUES
(1, 8, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQQeSSvqzzmJV0sQNqwuAnCDT4Ke8TGf6XJP_Z1KbF4n4hXHH7mOIdVIlBa&s=10'),
(2, 9, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRnRAVQbQ75bHXPwCMSRr_wzI7644-nRNL19FCONNoe_CEx7kex2JEw2xFdaeHfToMubWvImp8LxxUvfy5yryqP0g1g44A-MWLOWdzmoQ&s=10'),
(3, 10, 'https://upload.wikimedia.org/wikipedia/commons/c/cb/Jersey_cattle_in_Jersey.jpg?utm_source=es.wikipedia.org&utm_campaign=index&utm_content=original'),
(4, 11, 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSOGnWtFhdWDKouKJ3euU93r1N2c4xz9xknOZD3Z3oqig&s=10'),
(5, 12, '/uploads/productos/5e6c68b965c64cb29bf91ecaf9ae35f9.webp');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `promociones`
--

CREATE TABLE `promociones` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `porcentaje_descuento` decimal(5,2) NOT NULL,
  `fecha_inicio` date NOT NULL,
  `fecha_fin` date NOT NULL,
  `activo` tinyint(1) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `proveedores`
--

CREATE TABLE `proveedores` (
  `id` int(11) NOT NULL,
  `nombre` varchar(150) NOT NULL,
  `tipo_insumo` varchar(100) DEFAULT NULL,
  `contacto_nombre` varchar(150) DEFAULT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `email` varchar(150) DEFAULT NULL,
  `direccion` varchar(255) DEFAULT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `resenas`
--

CREATE TABLE `resenas` (
  `id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `comprador_id` int(11) NOT NULL,
  `calificacion` int(11) NOT NULL,
  `comentario` varchar(500) DEFAULT NULL,
  `fecha` timestamp NULL DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuarios`
--

CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `email` varchar(150) NOT NULL,
  `telefono` varchar(20) DEFAULT NULL,
  `password` varchar(255) NOT NULL,
  `rol` enum('comprador','vendedor','administrador','distribuidor') NOT NULL,
  `fecha_registro` timestamp NULL DEFAULT current_timestamp(),
  `proveedor_auth` varchar(20) DEFAULT 'local',
  `proveedor_id` varchar(255) DEFAULT NULL,
  `avatar_url` varchar(500) DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuarios`
--

INSERT INTO `usuarios` (`id`, `nombre`, `apellido`, `email`, `telefono`, `password`, `rol`, `fecha_registro`, `proveedor_auth`, `proveedor_id`, `avatar_url`) VALUES
(1, 'danna', 'muñoz', 'dannamunri@gmail.com', '3195847722', '995ac82c7bbdcb4fb446bafb7d2921c3$20f04a83507b9e5eaa90742cba5234f96f784fe557edf7520def1f712f63acf4', 'administrador', '2026-08-11 17:59:17', 'google', '112306962108145479117', 'https://lh3.googleusercontent.com/a/ACg8ocJzXahXwKgKZKo52OaqI0QlbcUM6x2YfRdGD7ksfGd6I5cext4Ocg=s96-c'),
(3, 'jenny', 'bautista', 'jennybautista@gmail.com', '3024414403', '64c0b10cec319462e7104644757d625a$7873bbf97f6ee87ca248622aade48cbe11e7193d10c3a7e8d96bd649b5969deb', 'vendedor', '2026-08-11 19:07:36', 'local', NULL, NULL),
(4, 'camilo', 'cuervo', 'camilocuervo@gmail.com', '3114808989', '8e3a931d54bf11542f12619a07284169$5af5877a7cb426be11bbc8a1cb0211c11414e14e6764066846cb69a4fd8837e8', 'comprador', '2026-08-11 19:53:06', 'local', NULL, NULL),
(5, 'ULDARICO', 'ANDRADE', 'uldaricoandrade@gmail.com', '3114808989', 'e88aaed9edd5e51fbd74ea8a94545d4f$e7a1ebc7f1fac85e6df3eab8aee4671f652634c57188e424abecaa0cac8135f5', 'comprador', '2026-08-11 20:15:35', 'local', NULL, NULL),
(7, 'valeria', 'tique', 'valetique@gmail.com', NULL, 'c3e00ae574b8b2b49c87015db1b775d0$15905bcd67d4a06e1e6c9ab2ce3ad03bd3b9862a165b7b6564ac0a12810067f9', 'comprador', '2026-08-18 22:12:17', 'local', NULL, NULL),
(8, 'bladimir', 'murcia', 'bladimirmurcia@gmail.com', '3115874466', '581ce49f4471eb8e204a65b5bc46d538$4ac8f06f7b5e78565d926a4b9ffdd698c6d725c88450c7fb18830a6a47110a85', 'comprador', '2026-08-25 20:32:04', 'local', NULL, NULL),
(9, 'daniel', 'rozo', 'danielrozo@gmail.com', '3146572361', '62eed93c119915b8e248cfef6ffef197$415a19aa2f8f1798e1d71a8cfc79215d3be55fef3619b055e3b336e6d75bbbf6', 'distribuidor', '2026-08-25 21:01:36', 'local', NULL, NULL),
(11, 'David', 'Herrera', 'feliboster@gmail.com', NULL, '7f0dc3dfb80b08a3b480fc0ba9835e2e$8cc94453c53e6b0643784d94a58d3303f6c5ff90d815274a7c6e260ab84e8758', 'comprador', '2026-09-02 17:23:40', 'google', '117255760753558750566', 'https://lh3.googleusercontent.com/a/ACg8ocIaknfuRTNAvrGuhco7y4qUMirRIG_X1-Gr48MqkODwiBpaTpWa=s96-c'),
(12, 'David', 'Herrera', 'feliboster@gmail.co', 'feliboster@gmail.com', 'f73878e44acfc93bd7b131d9b9beaf02$3dbd286adee32f9f19d7328ebeda56e469229438ed1eb41ad99c24a89f83a2ef', 'vendedor', '2026-09-02 17:25:43', 'local', NULL, NULL),
(13, 'David', 'Herrera', 'feliboster@gmail.c', NULL, 'ab101124feb8f0f21bb2560cf2de9f1c$df4a3cc89afda57f5a58b7f55d78e68435035cefdeb4e7c896904d4ed843bfb1', 'administrador', '2026-09-02 17:43:32', 'local', NULL, NULL),
(14, 'camilo', 'cuervo', 'camilo@gmail.com', NULL, '66f550319612cde7886f0f6fd5dd9803$3b25b4f67f8023a2c97ba2892749dd1fdd19b9231c2267a332f3694aede0bf98', 'comprador', '2026-09-02 17:44:29', 'local', NULL, NULL),
(16, 'miguel', 'parra', 'parra@gmail.com', NULL, 'b95e2c00a8f673836d60025d427c88e9$c5fc81b7cf65e29416d779dc0b7fe8f6e822e3cfa10b4ce3f0664917c48963f1', 'administrador', '2026-09-02 20:46:01', 'local', NULL, NULL),
(17, 'sandra', 'rueda', 'sandra@gmail.com', NULL, '1ffa60cb8ceb2680a5c0c4cefdfe9b0a$337763c81011a67282443960cb049af36c6dff1e21052c3fb05da16adf0a4a18', 'comprador', '2026-09-02 21:43:37', 'local', NULL, NULL),
(18, 'uldarico', 'andrade', 'uldarico@gmail.com', NULL, 'f76ee777f95d1eeaa99a3612f88b212a$86de78288046af846fbeccd37d19f6632f0f11886310ba9e12ef4fbddb30093e', 'administrador', '2026-09-02 21:49:08', 'local', NULL, NULL),
(19, 'juan', 'mendez', 'juan@gmail.com', NULL, '3f160c74623ce779fc6e638180b7ddee$ec4e1bfc33ddcc96d30a2340729b89499900f0d6a03c993ef965a35d3246e078', 'vendedor', '2026-09-02 21:53:08', 'local', NULL, NULL),
(20, 'Valeria', 'Espinosa', 'espinosavaleria726@gmail.com', NULL, '8b7db52fb9d117b4aa39bea43e149a05$52d6664b47cde36b9f490aaaa40e0618fbad399061aed2d812bf617221ce4f1c', 'comprador', '2026-09-22 20:25:20', 'google', '112767981924333166201', 'https://lh3.googleusercontent.com/a/ACg8ocIhZ5kGEVbAaRxlbuDy2hpMdi3qONB58JiUppbqgNRkNTgIscW3=s96-c');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `ventas`
--

CREATE TABLE `ventas` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `fecha_venta` timestamp NULL DEFAULT current_timestamp(),
  `valor_total` decimal(12,2) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `ventas`
--

INSERT INTO `ventas` (`id`, `pedido_id`, `fecha_venta`, `valor_total`) VALUES
(1, 17, '2026-09-14 14:39:44', 1000000.00),
(2, 14, '2026-09-14 14:40:17', 150000.00),
(3, 22, '2026-09-15 21:49:06', 1000000.00);

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `ajustes_inventario`
--
ALTER TABLE `ajustes_inventario`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `gastos_operativos`
--
ALTER TABLE `gastos_operativos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `venta_id` (`venta_id`),
  ADD KEY `vendedor_id` (`vendedor_id`);

--
-- Indices de la tabla `impuestos`
--
ALTER TABLE `impuestos`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `metodos_pago_catalogo`
--
ALTER TABLE `metodos_pago_catalogo`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`);

--
-- Indices de la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `comprador_id` (`comprador_id`),
  ADD KEY `fk_pedidos_distribuidor` (`distribuidor_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `productor_id` (`productor_id`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD PRIMARY KEY (`id`),
  ADD KEY `producto_id` (`producto_id`),
  ADD KEY `comprador_id` (`comprador_id`);

--
-- Indices de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `email` (`email`);

--
-- Indices de la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `pedido_id` (`pedido_id`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `ajustes_inventario`
--
ALTER TABLE `ajustes_inventario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=14;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=29;

--
-- AUTO_INCREMENT de la tabla `direcciones`
--
ALTER TABLE `direcciones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `gastos_operativos`
--
ALTER TABLE `gastos_operativos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `impuestos`
--
ALTER TABLE `impuestos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `metodos_pago`
--
ALTER TABLE `metodos_pago`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=2;

--
-- AUTO_INCREMENT de la tabla `metodos_pago_catalogo`
--
ALTER TABLE `metodos_pago_catalogo`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pagos`
--
ALTER TABLE `pagos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=20;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=32;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=15;

--
-- AUTO_INCREMENT de la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `promociones`
--
ALTER TABLE `promociones`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `proveedores`
--
ALTER TABLE `proveedores`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `resenas`
--
ALTER TABLE `resenas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `usuarios`
--
ALTER TABLE `usuarios`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=21;

--
-- AUTO_INCREMENT de la tabla `ventas`
--
ALTER TABLE `ventas`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `ajustes_inventario`
--
ALTER TABLE `ajustes_inventario`
  ADD CONSTRAINT `ajustes_inventario_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `ajustes_inventario_ibfk_2` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `direcciones`
--
ALTER TABLE `direcciones`
  ADD CONSTRAINT `direcciones_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `gastos_operativos`
--
ALTER TABLE `gastos_operativos`
  ADD CONSTRAINT `gastos_operativos_ibfk_1` FOREIGN KEY (`venta_id`) REFERENCES `ventas` (`id`),
  ADD CONSTRAINT `gastos_operativos_ibfk_2` FOREIGN KEY (`vendedor_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `pagos`
--
ALTER TABLE `pagos`
  ADD CONSTRAINT `pagos_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `fk_pedidos_distribuidor` FOREIGN KEY (`distribuidor_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`productor_id`) REFERENCES `usuarios` (`id`),
  ADD CONSTRAINT `productos_ibfk_2` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);

--
-- Filtros para la tabla `producto_imagenes`
--
ALTER TABLE `producto_imagenes`
  ADD CONSTRAINT `producto_imagenes_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `promociones`
--
ALTER TABLE `promociones`
  ADD CONSTRAINT `promociones_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `resenas`
--
ALTER TABLE `resenas`
  ADD CONSTRAINT `resenas_ibfk_1` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`),
  ADD CONSTRAINT `resenas_ibfk_2` FOREIGN KEY (`comprador_id`) REFERENCES `usuarios` (`id`);

--
-- Filtros para la tabla `ventas`
--
ALTER TABLE `ventas`
  ADD CONSTRAINT `ventas_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`);
--
-- Base de datos: `phpmyadmin`
--
CREATE DATABASE IF NOT EXISTS `phpmyadmin` DEFAULT CHARACTER SET utf8 COLLATE utf8_bin;
USE `phpmyadmin`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__bookmark`
--

CREATE TABLE `pma__bookmark` (
  `id` int(10) UNSIGNED NOT NULL,
  `dbase` varchar(255) NOT NULL DEFAULT '',
  `user` varchar(255) NOT NULL DEFAULT '',
  `label` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `query` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Bookmarks';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__central_columns`
--

CREATE TABLE `pma__central_columns` (
  `db_name` varchar(64) NOT NULL,
  `col_name` varchar(64) NOT NULL,
  `col_type` varchar(64) NOT NULL,
  `col_length` text DEFAULT NULL,
  `col_collation` varchar(64) NOT NULL,
  `col_isNull` tinyint(1) NOT NULL,
  `col_extra` varchar(255) DEFAULT '',
  `col_default` text DEFAULT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Central list of columns';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__column_info`
--

CREATE TABLE `pma__column_info` (
  `id` int(5) UNSIGNED NOT NULL,
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `column_name` varchar(64) NOT NULL DEFAULT '',
  `comment` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `mimetype` varchar(255) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT '',
  `transformation` varchar(255) NOT NULL DEFAULT '',
  `transformation_options` varchar(255) NOT NULL DEFAULT '',
  `input_transformation` varchar(255) NOT NULL DEFAULT '',
  `input_transformation_options` varchar(255) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Column information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__designer_settings`
--

CREATE TABLE `pma__designer_settings` (
  `username` varchar(64) NOT NULL,
  `settings_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Settings related to Designer';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__export_templates`
--

CREATE TABLE `pma__export_templates` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL,
  `export_type` varchar(10) NOT NULL,
  `template_name` varchar(64) NOT NULL,
  `template_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved export templates';

--
-- Volcado de datos para la tabla `pma__export_templates`
--

INSERT INTO `pma__export_templates` (`id`, `username`, `export_type`, `template_name`, `template_data`) VALUES
(1, 'root', 'table', 'cowfarm', '{\"quick_or_custom\":\"quick\",\"what\":\"sql\",\"allrows\":\"1\",\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@TABLE@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Estructura de la tabla @TABLE@\",\"latex_structure_continued_caption\":\"Estructura de la tabla @TABLE@ (continúa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Contenido de la tabla @TABLE@\",\"latex_data_continued_caption\":\"Contenido de la tabla @TABLE@ (continúa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"xml_structure_or_data\":\"data\",\"xml_export_events\":\"something\",\"xml_export_functions\":\"something\",\"xml_export_procedures\":\"something\",\"xml_export_tables\":\"something\",\"xml_export_triggers\":\"something\",\"xml_export_views\":\"something\",\"xml_export_contents\":\"something\",\"yaml_structure_or_data\":\"data\",\"\":null,\"lock_tables\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_procedure_function\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}'),
(2, 'root', 'database', 'cowfarm', '{\"quick_or_custom\":\"quick\",\"what\":\"sql\",\"structure_or_data_forced\":\"0\",\"table_select[]\":[\"ajustes_inventario\",\"categorias\",\"detalle_pedido\",\"direcciones\",\"gastos_operativos\",\"impuestos\",\"metodos_pago\",\"metodos_pago_catalogo\",\"pagos\",\"pedidos\",\"productos\",\"producto_imagenes\",\"promociones\",\"proveedores\",\"resenas\",\"usuarios\",\"ventas\"],\"table_structure[]\":[\"ajustes_inventario\",\"categorias\",\"detalle_pedido\",\"direcciones\",\"gastos_operativos\",\"impuestos\",\"metodos_pago\",\"metodos_pago_catalogo\",\"pagos\",\"pedidos\",\"productos\",\"producto_imagenes\",\"promociones\",\"proveedores\",\"resenas\",\"usuarios\",\"ventas\"],\"table_data[]\":[\"ajustes_inventario\",\"categorias\",\"detalle_pedido\",\"direcciones\",\"gastos_operativos\",\"impuestos\",\"metodos_pago\",\"metodos_pago_catalogo\",\"pagos\",\"pedidos\",\"productos\",\"producto_imagenes\",\"promociones\",\"proveedores\",\"resenas\",\"usuarios\",\"ventas\"],\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@DATABASE@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Estructura de la tabla @TABLE@\",\"latex_structure_continued_caption\":\"Estructura de la tabla @TABLE@ (continúa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Contenido de la tabla @TABLE@\",\"latex_data_continued_caption\":\"Contenido de la tabla @TABLE@ (continúa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"structure_and_data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"structure_and_data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_procedure_function\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"xml_structure_or_data\":\"data\",\"xml_export_events\":\"something\",\"xml_export_functions\":\"something\",\"xml_export_procedures\":\"something\",\"xml_export_tables\":\"something\",\"xml_export_triggers\":\"something\",\"xml_export_views\":\"something\",\"xml_export_contents\":\"something\",\"yaml_structure_or_data\":\"data\",\"\":null,\"lock_tables\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_create_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}'),
(3, 'root', 'database', 'cowfarm2', '{\"quick_or_custom\":\"quick\",\"what\":\"sql\",\"structure_or_data_forced\":\"0\",\"table_select[]\":[\"ajustes_inventario\",\"categorias\",\"detalle_pedido\",\"direcciones\",\"gastos_operativos\",\"impuestos\",\"metodos_pago\",\"metodos_pago_catalogo\",\"pagos\",\"pedidos\",\"productos\",\"producto_imagenes\",\"promociones\",\"proveedores\",\"resenas\",\"usuarios\",\"ventas\"],\"table_structure[]\":[\"ajustes_inventario\",\"categorias\",\"detalle_pedido\",\"direcciones\",\"gastos_operativos\",\"impuestos\",\"metodos_pago\",\"metodos_pago_catalogo\",\"pagos\",\"pedidos\",\"productos\",\"producto_imagenes\",\"promociones\",\"proveedores\",\"resenas\",\"usuarios\",\"ventas\"],\"table_data[]\":[\"ajustes_inventario\",\"categorias\",\"detalle_pedido\",\"direcciones\",\"gastos_operativos\",\"impuestos\",\"metodos_pago\",\"metodos_pago_catalogo\",\"pagos\",\"pedidos\",\"productos\",\"producto_imagenes\",\"promociones\",\"proveedores\",\"resenas\",\"usuarios\",\"ventas\"],\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@DATABASE@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Estructura de la tabla @TABLE@\",\"latex_structure_continued_caption\":\"Estructura de la tabla @TABLE@ (continúa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Contenido de la tabla @TABLE@\",\"latex_data_continued_caption\":\"Contenido de la tabla @TABLE@ (continúa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"structure_and_data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"structure_and_data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_procedure_function\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"xml_structure_or_data\":\"data\",\"xml_export_events\":\"something\",\"xml_export_functions\":\"something\",\"xml_export_procedures\":\"something\",\"xml_export_tables\":\"something\",\"xml_export_triggers\":\"something\",\"xml_export_views\":\"something\",\"xml_export_contents\":\"something\",\"yaml_structure_or_data\":\"data\",\"\":null,\"lock_tables\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_create_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}'),
(4, 'root', 'server', 'cowfarm', '{\"quick_or_custom\":\"quick\",\"what\":\"sql\",\"db_select[]\":[\"cowfarm\",\"phpmyadmin\",\"test\",\"tienda_jmunoz_db\"],\"aliases_new\":\"\",\"output_format\":\"sendit\",\"filename_template\":\"@SERVER@\",\"remember_template\":\"on\",\"charset\":\"utf-8\",\"compression\":\"none\",\"maxsize\":\"\",\"codegen_structure_or_data\":\"data\",\"codegen_format\":\"0\",\"csv_separator\":\",\",\"csv_enclosed\":\"\\\"\",\"csv_escaped\":\"\\\"\",\"csv_terminated\":\"AUTO\",\"csv_null\":\"NULL\",\"csv_columns\":\"something\",\"csv_structure_or_data\":\"data\",\"excel_null\":\"NULL\",\"excel_columns\":\"something\",\"excel_edition\":\"win\",\"excel_structure_or_data\":\"data\",\"json_structure_or_data\":\"data\",\"json_unicode\":\"something\",\"latex_caption\":\"something\",\"latex_structure_or_data\":\"structure_and_data\",\"latex_structure_caption\":\"Estructura de la tabla @TABLE@\",\"latex_structure_continued_caption\":\"Estructura de la tabla @TABLE@ (continúa)\",\"latex_structure_label\":\"tab:@TABLE@-structure\",\"latex_relation\":\"something\",\"latex_comments\":\"something\",\"latex_mime\":\"something\",\"latex_columns\":\"something\",\"latex_data_caption\":\"Contenido de la tabla @TABLE@\",\"latex_data_continued_caption\":\"Contenido de la tabla @TABLE@ (continúa)\",\"latex_data_label\":\"tab:@TABLE@-data\",\"latex_null\":\"\\\\textit{NULL}\",\"mediawiki_structure_or_data\":\"data\",\"mediawiki_caption\":\"something\",\"mediawiki_headers\":\"something\",\"htmlword_structure_or_data\":\"structure_and_data\",\"htmlword_null\":\"NULL\",\"ods_null\":\"NULL\",\"ods_structure_or_data\":\"data\",\"odt_structure_or_data\":\"structure_and_data\",\"odt_relation\":\"something\",\"odt_comments\":\"something\",\"odt_mime\":\"something\",\"odt_columns\":\"something\",\"odt_null\":\"NULL\",\"pdf_report_title\":\"\",\"pdf_structure_or_data\":\"data\",\"phparray_structure_or_data\":\"data\",\"sql_include_comments\":\"something\",\"sql_header_comment\":\"\",\"sql_use_transaction\":\"something\",\"sql_compatibility\":\"NONE\",\"sql_structure_or_data\":\"structure_and_data\",\"sql_create_table\":\"something\",\"sql_auto_increment\":\"something\",\"sql_create_view\":\"something\",\"sql_create_trigger\":\"something\",\"sql_backquotes\":\"something\",\"sql_type\":\"INSERT\",\"sql_insert_syntax\":\"both\",\"sql_max_query_size\":\"50000\",\"sql_hex_for_binary\":\"something\",\"sql_utc_time\":\"something\",\"texytext_structure_or_data\":\"structure_and_data\",\"texytext_null\":\"NULL\",\"yaml_structure_or_data\":\"data\",\"\":null,\"as_separate_files\":null,\"csv_removeCRLF\":null,\"excel_removeCRLF\":null,\"json_pretty_print\":null,\"htmlword_columns\":null,\"ods_columns\":null,\"sql_dates\":null,\"sql_relation\":null,\"sql_mime\":null,\"sql_disable_fk\":null,\"sql_views_as_tables\":null,\"sql_metadata\":null,\"sql_drop_database\":null,\"sql_drop_table\":null,\"sql_if_not_exists\":null,\"sql_simple_view_export\":null,\"sql_view_current_user\":null,\"sql_or_replace_view\":null,\"sql_procedure_function\":null,\"sql_truncate\":null,\"sql_delayed\":null,\"sql_ignore\":null,\"texytext_columns\":null}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__favorite`
--

CREATE TABLE `pma__favorite` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Favorite tables';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__history`
--

CREATE TABLE `pma__history` (
  `id` bigint(20) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db` varchar(64) NOT NULL DEFAULT '',
  `table` varchar(64) NOT NULL DEFAULT '',
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp(),
  `sqlquery` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='SQL history for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__navigationhiding`
--

CREATE TABLE `pma__navigationhiding` (
  `username` varchar(64) NOT NULL,
  `item_name` varchar(64) NOT NULL,
  `item_type` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Hidden items of navigation tree';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__pdf_pages`
--

CREATE TABLE `pma__pdf_pages` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `page_nr` int(10) UNSIGNED NOT NULL,
  `page_descr` varchar(50) CHARACTER SET utf8 COLLATE utf8_general_ci NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='PDF relation pages for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__recent`
--

CREATE TABLE `pma__recent` (
  `username` varchar(64) NOT NULL,
  `tables` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Recently accessed tables';

--
-- Volcado de datos para la tabla `pma__recent`
--

INSERT INTO `pma__recent` (`username`, `tables`) VALUES
('root', '[{\"db\":\"cowfarm\",\"table\":\"direcciones\"},{\"db\":\"cowfarm\",\"table\":\"pedidos\"},{\"db\":\"cowfarm\",\"table\":\"usuarios\"},{\"db\":\"cowfarm\",\"table\":\"categorias\"},{\"db\":\"cowfarm\",\"table\":\"productos\"},{\"db\":\"tienda_jmunoz_db\",\"table\":\"usuario\"},{\"db\":\"tienda_jmunoz_db\",\"table\":\"categorias\"},{\"db\":\"tienda_jmunoz_db\",\"table\":\"productos\"},{\"db\":\"tienda_jmunoz_db\",\"table\":\"pedidos\"},{\"db\":\"tienda_jmunoz_db\",\"table\":\"detalle_pedido\"}]');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__relation`
--

CREATE TABLE `pma__relation` (
  `master_db` varchar(64) NOT NULL DEFAULT '',
  `master_table` varchar(64) NOT NULL DEFAULT '',
  `master_field` varchar(64) NOT NULL DEFAULT '',
  `foreign_db` varchar(64) NOT NULL DEFAULT '',
  `foreign_table` varchar(64) NOT NULL DEFAULT '',
  `foreign_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Relation table';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__savedsearches`
--

CREATE TABLE `pma__savedsearches` (
  `id` int(5) UNSIGNED NOT NULL,
  `username` varchar(64) NOT NULL DEFAULT '',
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `search_name` varchar(64) NOT NULL DEFAULT '',
  `search_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Saved searches';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_coords`
--

CREATE TABLE `pma__table_coords` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `pdf_page_number` int(11) NOT NULL DEFAULT 0,
  `x` float UNSIGNED NOT NULL DEFAULT 0,
  `y` float UNSIGNED NOT NULL DEFAULT 0
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table coordinates for phpMyAdmin PDF output';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_info`
--

CREATE TABLE `pma__table_info` (
  `db_name` varchar(64) NOT NULL DEFAULT '',
  `table_name` varchar(64) NOT NULL DEFAULT '',
  `display_field` varchar(64) NOT NULL DEFAULT ''
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Table information for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__table_uiprefs`
--

CREATE TABLE `pma__table_uiprefs` (
  `username` varchar(64) NOT NULL,
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `prefs` text NOT NULL,
  `last_update` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Tables'' UI preferences';

--
-- Volcado de datos para la tabla `pma__table_uiprefs`
--

INSERT INTO `pma__table_uiprefs` (`username`, `db_name`, `table_name`, `prefs`, `last_update`) VALUES
('root', 'tienda_jmunoz_db', 'usuario', '{\"CREATE_TIME\":\"2026-06-27 13:21:20\",\"col_order\":[0,1,2,3,4,5,6,7],\"col_visib\":[1,1,1,1,1,1,1,1]}', '2026-06-27 20:34:21');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__tracking`
--

CREATE TABLE `pma__tracking` (
  `db_name` varchar(64) NOT NULL,
  `table_name` varchar(64) NOT NULL,
  `version` int(10) UNSIGNED NOT NULL,
  `date_created` datetime NOT NULL,
  `date_updated` datetime NOT NULL,
  `schema_snapshot` text NOT NULL,
  `schema_sql` text DEFAULT NULL,
  `data_sql` longtext DEFAULT NULL,
  `tracking` set('UPDATE','REPLACE','INSERT','DELETE','TRUNCATE','CREATE DATABASE','ALTER DATABASE','DROP DATABASE','CREATE TABLE','ALTER TABLE','RENAME TABLE','DROP TABLE','CREATE INDEX','DROP INDEX','CREATE VIEW','ALTER VIEW','DROP VIEW') DEFAULT NULL,
  `tracking_active` int(1) UNSIGNED NOT NULL DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Database changes tracking for phpMyAdmin';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__userconfig`
--

CREATE TABLE `pma__userconfig` (
  `username` varchar(64) NOT NULL,
  `timevalue` timestamp NOT NULL DEFAULT current_timestamp() ON UPDATE current_timestamp(),
  `config_data` text NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User preferences storage for phpMyAdmin';

--
-- Volcado de datos para la tabla `pma__userconfig`
--

INSERT INTO `pma__userconfig` (`username`, `timevalue`, `config_data`) VALUES
('root', '2026-11-13 14:37:03', '{\"Console\\/Mode\":\"collapse\",\"lang\":\"es\"}');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__usergroups`
--

CREATE TABLE `pma__usergroups` (
  `usergroup` varchar(64) NOT NULL,
  `tab` varchar(64) NOT NULL,
  `allowed` enum('Y','N') NOT NULL DEFAULT 'N'
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='User groups with configured menu items';

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pma__users`
--

CREATE TABLE `pma__users` (
  `username` varchar(64) NOT NULL,
  `usergroup` varchar(64) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_bin COMMENT='Users and their assignments to user groups';

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  ADD PRIMARY KEY (`id`);

--
-- Indices de la tabla `pma__central_columns`
--
ALTER TABLE `pma__central_columns`
  ADD PRIMARY KEY (`db_name`,`col_name`);

--
-- Indices de la tabla `pma__column_info`
--
ALTER TABLE `pma__column_info`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `db_name` (`db_name`,`table_name`,`column_name`);

--
-- Indices de la tabla `pma__designer_settings`
--
ALTER TABLE `pma__designer_settings`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_user_type_template` (`username`,`export_type`,`template_name`);

--
-- Indices de la tabla `pma__favorite`
--
ALTER TABLE `pma__favorite`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__history`
--
ALTER TABLE `pma__history`
  ADD PRIMARY KEY (`id`),
  ADD KEY `username` (`username`,`db`,`table`,`timevalue`);

--
-- Indices de la tabla `pma__navigationhiding`
--
ALTER TABLE `pma__navigationhiding`
  ADD PRIMARY KEY (`username`,`item_name`,`item_type`,`db_name`,`table_name`);

--
-- Indices de la tabla `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  ADD PRIMARY KEY (`page_nr`),
  ADD KEY `db_name` (`db_name`);

--
-- Indices de la tabla `pma__recent`
--
ALTER TABLE `pma__recent`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__relation`
--
ALTER TABLE `pma__relation`
  ADD PRIMARY KEY (`master_db`,`master_table`,`master_field`),
  ADD KEY `foreign_field` (`foreign_db`,`foreign_table`);

--
-- Indices de la tabla `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `u_savedsearches_username_dbname` (`username`,`db_name`,`search_name`);

--
-- Indices de la tabla `pma__table_coords`
--
ALTER TABLE `pma__table_coords`
  ADD PRIMARY KEY (`db_name`,`table_name`,`pdf_page_number`);

--
-- Indices de la tabla `pma__table_info`
--
ALTER TABLE `pma__table_info`
  ADD PRIMARY KEY (`db_name`,`table_name`);

--
-- Indices de la tabla `pma__table_uiprefs`
--
ALTER TABLE `pma__table_uiprefs`
  ADD PRIMARY KEY (`username`,`db_name`,`table_name`);

--
-- Indices de la tabla `pma__tracking`
--
ALTER TABLE `pma__tracking`
  ADD PRIMARY KEY (`db_name`,`table_name`,`version`);

--
-- Indices de la tabla `pma__userconfig`
--
ALTER TABLE `pma__userconfig`
  ADD PRIMARY KEY (`username`);

--
-- Indices de la tabla `pma__usergroups`
--
ALTER TABLE `pma__usergroups`
  ADD PRIMARY KEY (`usergroup`,`tab`,`allowed`);

--
-- Indices de la tabla `pma__users`
--
ALTER TABLE `pma__users`
  ADD PRIMARY KEY (`username`,`usergroup`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `pma__bookmark`
--
ALTER TABLE `pma__bookmark`
  MODIFY `id` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__column_info`
--
ALTER TABLE `pma__column_info`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__export_templates`
--
ALTER TABLE `pma__export_templates`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `pma__history`
--
ALTER TABLE `pma__history`
  MODIFY `id` bigint(20) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__pdf_pages`
--
ALTER TABLE `pma__pdf_pages`
  MODIFY `page_nr` int(10) UNSIGNED NOT NULL AUTO_INCREMENT;

--
-- AUTO_INCREMENT de la tabla `pma__savedsearches`
--
ALTER TABLE `pma__savedsearches`
  MODIFY `id` int(5) UNSIGNED NOT NULL AUTO_INCREMENT;
--
-- Base de datos: `test`
--
CREATE DATABASE IF NOT EXISTS `test` DEFAULT CHARACTER SET latin1 COLLATE latin1_swedish_ci;
USE `test`;
--
-- Base de datos: `tienda_jmunoz_db`
--
CREATE DATABASE IF NOT EXISTS `tienda_jmunoz_db` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_general_ci;
USE `tienda_jmunoz_db`;

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `categorias`
--

CREATE TABLE `categorias` (
  `id` int(11) NOT NULL,
  `nombre` varchar(50) NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `categorias`
--

INSERT INTO `categorias` (`id`, `nombre`) VALUES
(2, 'Maquillaje'),
(1, 'Mascotas'),
(3, 'Perfumes');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `detalle_pedido`
--

CREATE TABLE `detalle_pedido` (
  `id` int(11) NOT NULL,
  `pedido_id` int(11) NOT NULL,
  `producto_id` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL,
  `precio_unit` float NOT NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `detalle_pedido`
--

INSERT INTO `detalle_pedido` (`id`, `pedido_id`, `producto_id`, `cantidad`, `precio_unit`) VALUES
(1, 1, 5, 2, 200),
(2, 2, 6, 3, 200),
(3, 3, 1, 3, 50);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `pedidos`
--

CREATE TABLE `pedidos` (
  `id` int(11) NOT NULL,
  `usuario_id` int(11) NOT NULL,
  `estado` varchar(20) DEFAULT NULL,
  `fecha` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `pedidos`
--

INSERT INTO `pedidos` (`id`, `usuario_id`, `estado`, `fecha`) VALUES
(1, 3, 'pendiente', '2026-06-27 14:41:23'),
(2, 4, 'pendiente', '2026-06-27 14:48:22'),
(3, 6, 'pendiente', '2026-06-27 14:50:56');

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `productos`
--

CREATE TABLE `productos` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `stock` int(11) DEFAULT NULL,
  `precio` float NOT NULL,
  `categoria_id` int(11) DEFAULT NULL,
  `estado` tinyint(1) DEFAULT 1
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `productos`
--

INSERT INTO `productos` (`id`, `nombre`, `stock`, `precio`, `categoria_id`, `estado`) VALUES
(1, 'Mascara para pestañas', 100, 50, 2, 1),
(2, 'Rubor', 100, 30, 2, 1),
(3, 'Pelota', 10, 20, 1, 1),
(4, 'Collar', 15, 15, 1, 1),
(5, 'Lattafa yara', 18, 200, 3, 1),
(6, 'Perfume Khamrah Lattafa', 12, 200, 3, 1);

-- --------------------------------------------------------

--
-- Estructura de tabla para la tabla `usuario`
--

CREATE TABLE `usuario` (
  `id` int(11) NOT NULL,
  `nombre` varchar(100) NOT NULL,
  `apellido` varchar(100) NOT NULL,
  `correo` varchar(150) NOT NULL,
  `password` varchar(255) NOT NULL,
  `role` varchar(20) DEFAULT NULL,
  `estado` smallint(6) DEFAULT NULL,
  `created_at` datetime DEFAULT current_timestamp()
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

--
-- Volcado de datos para la tabla `usuario`
--

INSERT INTO `usuario` (`id`, `nombre`, `apellido`, `correo`, `password`, `role`, `estado`, `created_at`) VALUES
(3, 'Joan', 'Buitrago', 'Joanbui@gmail.com', '0129c0faa9308ae033110520eeaa69b6$f4c58842781613c94c38418a25e0a82b629723f2d87d469b93124a6b6a6ab5f4', 'administrador', 1, '2026-06-27 14:25:23'),
(4, 'Sofia', 'Cardona', 'sofi1234@gmail.com', 'c9e646620584bc424dae25b972a6af40$f9151c70a5c7523d9f3fb1acb7a40cb101e9d681374c52bed41841ec1db4e9ac', 'comprador', 2, '2026-06-27 14:29:30'),
(6, 'Camila', 'Velez', 'Camicamivelez@gmail.com', '68e5b4cc97a7b5b6d234250cf12f59cb$d28941538d2ff943f127f3cb832716bf1651b965a6489b8134d3ed01b2ed199f', 'comprador', 2, '2026-06-27 14:32:46'),
(7, 'camilo', 'Monterreal', 'camont@gmail.com', '6f1168af3e4126360cf52ff8225e1e84$76d9d7a09c5cfdb1ab5bb7bf985dd369885c47b65c6e97bd02bf3e36bdfcaf50', 'comprador', 1, '2026-06-27 15:43:07'),
(8, 'Steven', 'Camargo', 'Stevv50@gmail.com', 'e5cddc59022e61d0a8334a1457a658aa$224b71b330ab626368be1e07b4f1c0a76dc9b2790a61c092fb40bc66f2d0baee', 'administrador', 1, '2026-06-27 15:45:00'),
(9, 'Norman', 'Muñoz', 'Normun@gmail.com', 'e9f67a392d284d116f4626d0a655a040$a26086edb62f36e9ee28891f6d7cab2a021c2ebcb36994f029a1f3e5d3fd9024', 'vendedor', 1, '2026-06-27 15:46:07');

--
-- Índices para tablas volcadas
--

--
-- Indices de la tabla `categorias`
--
ALTER TABLE `categorias`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `ix_categorias_id` (`id`);

--
-- Indices de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD PRIMARY KEY (`id`),
  ADD KEY `pedido_id` (`pedido_id`),
  ADD KEY `producto_id` (`producto_id`);

--
-- Indices de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD PRIMARY KEY (`id`),
  ADD KEY `usuario_id` (`usuario_id`);

--
-- Indices de la tabla `productos`
--
ALTER TABLE `productos`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `nombre` (`nombre`),
  ADD KEY `categoria_id` (`categoria_id`);

--
-- Indices de la tabla `usuario`
--
ALTER TABLE `usuario`
  ADD PRIMARY KEY (`id`),
  ADD UNIQUE KEY `correo` (`correo`);

--
-- AUTO_INCREMENT de las tablas volcadas
--

--
-- AUTO_INCREMENT de la tabla `categorias`
--
ALTER TABLE `categorias`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=5;

--
-- AUTO_INCREMENT de la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `pedidos`
--
ALTER TABLE `pedidos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=4;

--
-- AUTO_INCREMENT de la tabla `productos`
--
ALTER TABLE `productos`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=7;

--
-- AUTO_INCREMENT de la tabla `usuario`
--
ALTER TABLE `usuario`
  MODIFY `id` int(11) NOT NULL AUTO_INCREMENT, AUTO_INCREMENT=10;

--
-- Restricciones para tablas volcadas
--

--
-- Filtros para la tabla `detalle_pedido`
--
ALTER TABLE `detalle_pedido`
  ADD CONSTRAINT `detalle_pedido_ibfk_1` FOREIGN KEY (`pedido_id`) REFERENCES `pedidos` (`id`),
  ADD CONSTRAINT `detalle_pedido_ibfk_2` FOREIGN KEY (`producto_id`) REFERENCES `productos` (`id`);

--
-- Filtros para la tabla `pedidos`
--
ALTER TABLE `pedidos`
  ADD CONSTRAINT `pedidos_ibfk_1` FOREIGN KEY (`usuario_id`) REFERENCES `usuario` (`id`);

--
-- Filtros para la tabla `productos`
--
ALTER TABLE `productos`
  ADD CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`categoria_id`) REFERENCES `categorias` (`id`);
COMMIT;

/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
