import { useEffect, useMemo, useRef, useState } from "react";

/**
 * ImageUploader — selector de imágenes desde el computador o el celular.
 *
 * - En computador: botón "Elegir archivo" + arrastrar y soltar.
 * - En celular: el mismo input abre galería, archivos o cámara; además hay
 *   un botón aparte que abre la cámara directamente (capture="environment").
 *
 * El componente NO sube nada por su cuenta: solo entrega el File elegido al
 * componente padre (onChange) y muestra la vista previa. Así el padre decide
 * cuándo subirlo (por ejemplo, después de crear el producto).
 *
 * Props:
 *   value        File | null            archivo actualmente seleccionado
 *   onChange     (file | null) => void  se llama al elegir o quitar imagen
 *   previewUrl   string                 imagen ya guardada (modo edición)
 *   label        string                 texto del encabezado
 *   maxMB        number                 tamaño máximo (por defecto 8 MB)
 *   disabled     boolean
 */

const TIPOS_PERMITIDOS = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
  "image/avif",
];

function formatearTamano(bytes) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function ImageUploader({
  value = null,
  onChange,
  previewUrl = null,
  label = "Imagen",
  ayuda = "Puedes subir una foto desde tu computador o tu celular.",
  maxMB = 8,
  disabled = false,
}) {
  const inputRef = useRef(null);
  const camaraRef = useRef(null);
  const [error, setError] = useState("");
  const [arrastrando, setArrastrando] = useState(false);

  // Vista previa local del archivo elegido, sin subirlo todavía al servidor.
  const preview = useMemo(() => (value ? URL.createObjectURL(value) : null), [value]);

  // Libera la memoria del blob cuando se cambia o se quita la imagen.
  useEffect(() => {
    if (!preview) return undefined;
    return () => URL.revokeObjectURL(preview);
  }, [preview]);

  const validarYEnviar = (archivo) => {
    setError("");
    if (!archivo) return;

    if (!TIPOS_PERMITIDOS.includes((archivo.type || "").toLowerCase())) {
      setError("Formato no permitido. Usa una imagen JPG, PNG, WEBP, GIF o AVIF.");
      return;
    }
    if (archivo.size > maxMB * 1024 * 1024) {
      setError(
        `La imagen pesa ${formatearTamano(archivo.size)} y el máximo es ${maxMB} MB. ` +
          "Intenta con una foto de menor resolución."
      );
      return;
    }
    onChange?.(archivo);
  };

  const handleInput = (e) => {
    validarYEnviar(e.target.files?.[0]);
    // Se limpia para poder volver a elegir el mismo archivo si se quitó.
    e.target.value = "";
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setArrastrando(false);
    if (disabled) return;
    validarYEnviar(e.dataTransfer.files?.[0]);
  };

  const quitar = () => {
    setError("");
    onChange?.(null);
  };

  const imagenMostrada = preview || previewUrl;

  return (
    <div className="img-uploader">
      {label && <span className="img-uploader-label">{label}</span>}

      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/gif,image/avif"
        onChange={handleInput}
        hidden
        disabled={disabled}
      />
      {/* En celular este input abre la cámara trasera directamente */}
      <input
        ref={camaraRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleInput}
        hidden
        disabled={disabled}
      />

      {imagenMostrada ? (
        <div className="img-uploader-preview">
          <img src={imagenMostrada} alt="Vista previa de la imagen seleccionada" />
          <div className="img-uploader-preview-info">
            <span className="img-uploader-nombre">
              {value ? value.name : "Imagen guardada"}
            </span>
            {value && (
              <span className="img-uploader-peso">{formatearTamano(value.size)}</span>
            )}
            <div className="img-uploader-preview-acciones">
              <button
                type="button"
                className="img-uploader-btn"
                onClick={() => inputRef.current?.click()}
                disabled={disabled}
              >
                Cambiar
              </button>
              <button
                type="button"
                className="img-uploader-btn img-uploader-btn--quitar"
                onClick={quitar}
                disabled={disabled}
              >
                Quitar
              </button>
            </div>
          </div>
        </div>
      ) : (
        <div
          className={`img-uploader-drop${arrastrando ? " arrastrando" : ""}${
            disabled ? " deshabilitado" : ""
          }`}
          onClick={() => !disabled && inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            if (!disabled) setArrastrando(true);
          }}
          onDragLeave={() => setArrastrando(false)}
          onDrop={handleDrop}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              inputRef.current?.click();
            }
          }}
        >
          <span className="img-uploader-icono" aria-hidden="true">
            🖼️
          </span>
          <p className="img-uploader-titulo">Arrastra una foto o haz clic para elegirla</p>
          <p className="img-uploader-ayuda">{ayuda}</p>
          <div className="img-uploader-botones">
            <button
              type="button"
              className="img-uploader-btn img-uploader-btn--principal"
              onClick={(e) => {
                e.stopPropagation();
                inputRef.current?.click();
              }}
              disabled={disabled}
            >
              Elegir archivo
            </button>
            <button
              type="button"
              className="img-uploader-btn"
              onClick={(e) => {
                e.stopPropagation();
                camaraRef.current?.click();
              }}
              disabled={disabled}
            >
              Tomar foto
            </button>
          </div>
          <p className="img-uploader-formatos">
            JPG, PNG, WEBP, GIF o AVIF · máximo {maxMB} MB
          </p>
        </div>
      )}

      {error && <p className="img-uploader-error">{error}</p>}
    </div>
  );
}
