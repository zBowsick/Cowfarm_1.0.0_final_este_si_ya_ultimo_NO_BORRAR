import { jsPDF } from "jspdf";

function formatoMoneda(valor) {
  return `$${Number(valor || 0).toLocaleString("es-CO")}`;
}

function formatoFecha(valor) {
  if (!valor) return "—";
  try {
    return new Date(valor).toLocaleString("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  } catch {
    return valor;
  }
}

// Fecha corta SIN hora, para columnas angostas de tablas en PDF (evita que
// el texto se monte sobre la siguiente columna, cosa que sí pasaba al
// recortar formatoFecha con split(",") porque el separador varía).
// Formato solo numérico: dd/mm/aaaa (opcionalmente con hora).
function formatoFechaCorta(valor, conHora = false) {
  if (!valor) return "—";
  try {
    const fecha = new Date(valor);
    const base = fecha.toLocaleDateString("es-CO", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    if (!conHora) return base;
    const hora = fecha.toLocaleTimeString("es-CO", { hour: "2-digit", minute: "2-digit" });
    return `${base} ${hora}`;
  } catch {
    return valor;
  }
}

// Carga la imagen del logo desde /public y la convierte a base64 (dataURL),
// que es el formato que jsPDF necesita para poder incrustarla en el PDF.
// Se cachea en módulo para no repetir el fetch cada vez que se genera un PDF.
let logoDataUrlCache = null;
async function cargarLogoDataUrl() {
  if (logoDataUrlCache) return logoDataUrlCache;
  try {
    const respuesta = await fetch("/images/logo-1.png");
    const blob = await respuesta.blob();
    logoDataUrlCache = await new Promise((resolve, reject) => {
      const lector = new FileReader();
      lector.onload = () => resolve(lector.result);
      lector.onerror = reject;
      lector.readAsDataURL(blob);
    });
    return logoDataUrlCache;
  } catch {
    return null; // si falla, el PDF se genera igual, sin logo
  }
}

/**
 * Construye (sin descargar) el documento jsPDF con el recibo/factura de un pedido.
 * `pedido` debe venir con `detalles` (con `producto` embebido) y opcionalmente `pagos`.
 * `comprador` es el objeto de usuario del comprador (nombre, email, etc.).
 * Devuelve la instancia de jsPDF para poder previsualizarla (bloburl) o guardarla.
 * Es async porque necesita cargar el logo antes de dibujar el encabezado.
 */
export async function crearFacturaPDF(pedido, comprador) {
  const logoDataUrl = await cargarLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margenX = 48;
  let y = 60;

  // --- Logo (arriba a la izquierda), manteniendo su proporción real (198x153) ---
  const logoAncho = 42;
  const logoAlto = (logoAncho * 153) / 198;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margenX, y - 28, logoAncho, logoAlto);
  }
  const textoX = logoDataUrl ? margenX + logoAncho + 10 : margenX;

  // --- Encabezado ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(1, 34, 27); // #01221b, verde CowFarm
  doc.text("CowFarm", textoX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 100, 96);
  doc.text("Sistema agrícola para campesinos colombianos", textoX, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(1, 34, 27);
  doc.text(`Recibo de compra #${pedido.id}`, 595 - margenX, y, { align: "right" });

  y += 45;
  doc.setDrawColor(220, 226, 224);
  doc.line(margenX, y, 595 - margenX, y);
  y += 25;

  // --- Datos del pedido / comprador ---
  doc.setFontSize(11);
  doc.setTextColor(30, 40, 38);
  const nombreComprador = comprador
    ? `${comprador.nombre || ""} ${comprador.apellido || ""}`.trim()
    : `Usuario #${pedido.comprador_id}`;

  const filasInfo = [
    ["Fecha del pedido", formatoFecha(pedido.fecha_pedido)],
    ["Comprador", nombreComprador || `Usuario #${pedido.comprador_id}`],
    ["Email", comprador?.email || "—"],
    ["Estado del pedido", pedido.estado],
  ];
  filasInfo.forEach(([etiqueta, valor]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${etiqueta}:`, margenX, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(valor), margenX + 140, y);
    y += 18;
  });

  y += 15;

  // --- Tabla de productos ---
  doc.setFont("helvetica", "bold");
  doc.setFillColor(1, 34, 27);
  doc.setTextColor(255, 255, 255);
  doc.rect(margenX, y, 595 - margenX * 2, 22, "F");
  doc.text("Producto", margenX + 8, y + 15);
  doc.text("Cant.", margenX + 300, y + 15);
  doc.text("Precio unit.", margenX + 360, y + 15);
  doc.text("Subtotal", 595 - margenX - 8, y + 15, { align: "right" });
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 40, 38);
  const detalles = pedido.detalles || [];
  detalles.forEach((d, i) => {
    if (y > 750) {
      doc.addPage();
      y = 60;
    }
    const filaAlterna = i % 2 === 1;
    if (filaAlterna) {
      doc.setFillColor(246, 249, 248);
      doc.rect(margenX, y, 595 - margenX * 2, 20, "F");
    }
    const nombreProducto = d.producto?.nombre || `Producto #${d.producto_id}`;
    doc.text(nombreProducto.length > 40 ? `${nombreProducto.slice(0, 40)}...` : nombreProducto, margenX + 8, y + 14);
    doc.text(String(d.cantidad), margenX + 300, y + 14);
    doc.text(formatoMoneda(d.precio_unitario), margenX + 360, y + 14);
    doc.text(formatoMoneda(d.subtotal), 595 - margenX - 8, y + 14, { align: "right" });
    y += 20;
  });

  y += 10;
  doc.setDrawColor(220, 226, 224);
  doc.line(margenX, y, 595 - margenX, y);
  y += 25;

  // --- Total ---
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Total pagado", margenX, y);
  doc.text(formatoMoneda(pedido.total), 595 - margenX, y, { align: "right" });
  y += 30;

  // --- Pagos (si hay) ---
  const pagos = pedido.pagos || [];
  if (pagos.length > 0) {
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.text("Pagos registrados", margenX, y);
    y += 16;
    doc.setFont("helvetica", "normal");
    pagos.forEach((p) => {
      doc.text(
        `• ${p.metodo_pago} — ${formatoMoneda(p.monto)} — ${p.estado} (${formatoFecha(p.fecha_pago)})`,
        margenX,
        y
      );
      y += 16;
    });
  }

  // --- Pie de página ---
  doc.setFontSize(9);
  doc.setTextColor(140, 150, 146);
  doc.text(
    "Este recibo fue generado automáticamente por CowFarm y no requiere firma.",
    margenX,
    800
  );

  return doc;
}

/**
 * Genera y descarga directamente el PDF del recibo (compatibilidad con
 * llamadas antiguas que no necesitan previsualización).
 */
export async function generarFacturaPDF(pedido, comprador) {
  const doc = await crearFacturaPDF(pedido, comprador);
  doc.save(`cowfarm-recibo-pedido-${pedido.id}.pdf`);
  return doc;
}

/**
 * Construye (sin descargar) el PDF del reporte de ventas de un vendedor:
 * ganancias agrupadas por producto, totales generales y el detalle de cada
 * venta, todo dentro del periodo indicado.
 *
 * `ventas` es la lista plana ya filtrada por periodo, con la forma
 * { ventaId, pedidoId, fecha, producto, cantidad, subtotal }.
 * `periodo` es opcional: { desde, hasta } en formato de fecha legible.
 */
export async function crearReporteVentasPDF(ventas, vendedor, periodo) {
  const logoDataUrl = await cargarLogoDataUrl();
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  const margenX = 48;
  const anchoUtil = 595 - margenX * 2;
  let y = 60;

  const nuevaPagina = () => {
    doc.addPage();
    y = 60;
  };

  // --- Logo + encabezado ---
  const logoAncho = 42;
  const logoAlto = (logoAncho * 153) / 198;
  if (logoDataUrl) {
    doc.addImage(logoDataUrl, "PNG", margenX, y - 28, logoAncho, logoAlto);
  }
  const textoX = logoDataUrl ? margenX + logoAncho + 10 : margenX;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(20);
  doc.setTextColor(1, 34, 27);
  doc.text("CowFarm", textoX, y);

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(90, 100, 96);
  doc.text("Sistema agrícola para campesinos colombianos", textoX, y + 16);

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);
  doc.setTextColor(1, 34, 27);
  doc.text("Reporte de ventas", 595 - margenX, y, { align: "right" });

  y += 45;
  doc.setDrawColor(220, 226, 224);
  doc.line(margenX, y, 595 - margenX, y);
  y += 25;

  // --- Datos del vendedor y periodo ---
  doc.setFontSize(11);
  doc.setTextColor(30, 40, 38);
  const nombreVendedor = vendedor
    ? `${vendedor.nombre || ""} ${vendedor.apellido || ""}`.trim()
    : "—";
  const textoPeriodo =
    periodo?.desde || periodo?.hasta
      ? `${periodo?.desde ? formatoFechaCorta(periodo.desde) : "el inicio"} — ${
          periodo?.hasta ? formatoFechaCorta(periodo.hasta) : "hoy"
        }`
      : "Todo el historial";

  [
    ["Vendedor", nombreVendedor || "—"],
    ["Periodo", textoPeriodo],
    ["Generado el", formatoFechaCorta(new Date(), true)],
  ].forEach(([etiqueta, valor]) => {
    doc.setFont("helvetica", "bold");
    doc.text(`${etiqueta}:`, margenX, y);
    doc.setFont("helvetica", "normal");
    doc.text(String(valor), margenX + 110, y);
    y += 18;
  });

  y += 15;

  // --- Totales generales ---
  const totalVendido = ventas.reduce((acc, v) => acc + Number(v.subtotal || 0), 0);
  const unidadesVendidas = ventas.reduce((acc, v) => acc + Number(v.cantidad || 0), 0);

  doc.setFillColor(1, 34, 27);
  doc.setTextColor(255, 255, 255);
  doc.rect(margenX, y, anchoUtil / 2 - 6, 44, "F");
  doc.rect(margenX + anchoUtil / 2 + 6, y, anchoUtil / 2 - 6, 44, "F");
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text("TOTAL VENDIDO", margenX + 12, y + 16);
  doc.text("UNIDADES VENDIDAS", margenX + anchoUtil / 2 + 18, y + 16);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(15);
  doc.text(formatoMoneda(totalVendido), margenX + 12, y + 34);
  doc.text(String(unidadesVendidas), margenX + anchoUtil / 2 + 18, y + 34);
  y += 65;

  // --- Ganancias por producto ---
  const porProducto = new Map();
  ventas.forEach((v) => {
    const actual = porProducto.get(v.producto) || { cantidad: 0, total: 0 };
    actual.cantidad += Number(v.cantidad || 0);
    actual.total += Number(v.subtotal || 0);
    porProducto.set(v.producto, actual);
  });
  const filasProducto = Array.from(porProducto.entries()).sort((a, b) => b[1].total - a[1].total);

  doc.setTextColor(1, 34, 27);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.text("Ganancias por producto", margenX, y);
  y += 18;

  doc.setFillColor(1, 34, 27);
  doc.setTextColor(255, 255, 255);
  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.rect(margenX, y, anchoUtil, 22, "F");
  doc.text("Producto", margenX + 8, y + 15);
  doc.text("Unidades", margenX + 320, y + 15);
  doc.text("Ganancia", 595 - margenX - 8, y + 15, { align: "right" });
  y += 22;

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 40, 38);
  filasProducto.forEach(([nombre, datos], i) => {
    if (y > 740) nuevaPagina();
    if (i % 2 === 1) {
      doc.setFillColor(246, 249, 248);
      doc.rect(margenX, y, anchoUtil, 20, "F");
    }
    doc.text(nombre.length > 42 ? `${nombre.slice(0, 42)}...` : nombre, margenX + 8, y + 14);
    doc.text(String(datos.cantidad), margenX + 320, y + 14);
    doc.text(formatoMoneda(datos.total), 595 - margenX - 8, y + 14, { align: "right" });
    y += 20;
  });
  if (filasProducto.length === 0) {
    doc.text("No hay ventas registradas en este periodo.", margenX + 8, y + 14);
    y += 20;
  }

  y += 30;

  // --- Detalle de todas las ventas del periodo ---
  if (y > 700) nuevaPagina();
  doc.setFont("helvetica", "bold");
  doc.setFontSize(13);
  doc.setTextColor(1, 34, 27);
  doc.text("Detalle de ventas", margenX, y);
  y += 18;

  const columnas = [
    { titulo: "Venta", x: 8 },
    { titulo: "Pedido", x: 70 },
    { titulo: "Producto", x: 135 },
    { titulo: "Cant.", x: 335 },
    { titulo: "Fecha", x: 380 },
  ];
  const dibujarCabeceraDetalle = () => {
    doc.setFillColor(1, 34, 27);
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(10);
    doc.rect(margenX, y, anchoUtil, 22, "F");
    columnas.forEach((c) => doc.text(c.titulo, margenX + c.x, y + 15));
    doc.text("Subtotal", 595 - margenX - 8, y + 15, { align: "right" });
    y += 22;
  };
  dibujarCabeceraDetalle();

  doc.setFont("helvetica", "normal");
  doc.setTextColor(30, 40, 38);
  ventas.forEach((v, i) => {
    if (y > 750) {
      nuevaPagina();
      dibujarCabeceraDetalle();
    }
    if (i % 2 === 1) {
      doc.setFillColor(246, 249, 248);
      doc.rect(margenX, y, anchoUtil, 20, "F");
    }
    const nombreProducto = v.producto || "—";
    doc.text(`#${v.ventaId}`, margenX + 8, y + 14);
    doc.text(`#${v.pedidoId}`, margenX + 70, y + 14);
    doc.text(
      nombreProducto.length > 22 ? `${nombreProducto.slice(0, 22)}...` : nombreProducto,
      margenX + 135,
      y + 14
    );
    doc.text(String(v.cantidad), margenX + 335, y + 14);
    doc.text(formatoFechaCorta(v.fecha), margenX + 380, y + 14);
    doc.text(formatoMoneda(v.subtotal), 595 - margenX - 8, y + 14, { align: "right" });
    y += 20;
  });

  // --- Pie de página ---
  doc.setFontSize(9);
  doc.setTextColor(140, 150, 146);
  doc.text("Este reporte fue generado automáticamente por CowFarm.", margenX, 800);

  return doc;
}

/**
 * Genera y descarga directamente el PDF del reporte de ventas.
 */
export async function generarReporteVentasPDF(ventas, vendedor, periodo) {
  const doc = await crearReporteVentasPDF(ventas, vendedor, periodo);
  doc.save(`cowfarm-reporte-ventas-${Date.now()}.pdf`);
  return doc;
}
