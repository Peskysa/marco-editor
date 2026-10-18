# Manual de Marco Editor

Autor: Marco Pescador. Versión 1.0.0.

## Abrir

Pulsa **Abrir foto o vídeo** o arrastra un archivo a la vista previa. Se abre un único archivo cada vez. La sesión y los resultados previos se borran al abrir otro archivo o recargar; guarda las copias que quieras conservar antes de hacerlo. No se altera el original.

Acepta archivos de hasta 200 MB y 40 millones de píxeles. JPG, PNG y WebP son opciones recomendadas para fotos; MP4 con H.264 y WebM para vídeo. Otros formatos dependen de la decodificación del navegador/WebView. GIF se exporta como imagen fija. No se garantiza RAW, HEIC ni códecs profesionales.

## Recortar y orientar

Con la imagen completa, arrastra sobre la vista previa para dibujar el encuadre. Una vez reducido, arrastra dentro del marco para moverlo y desde la esquina inferior derecha para cambiar su tamaño. Puedes usar los campos de porcentajes, con teclado, o elegir una proporción. **Todo** recupera la imagen completa. **Girar** cambia la orientación 90°; **Reflejar** invierte horizontalmente. Al girar se restablece el encuadre para ajustarlo a la nueva orientación.

El recorte se aplica sobre la orientación que ves en pantalla. **Deshacer** recupera el encuadre o giro anterior, hasta 35 cambios. No deshace los tiempos, la elección de formato ni una descarga. **Restablecer** recupera la orientación y zona originales; en vídeo también recupera el tramo completo y el sonido.

## Fotos

Elige JPG, PNG o WebP y pulsa **Guardar copia**. La copia se muestra debajo; pulsa **Descargar copia** para guardarla. JPG utiliza fondo blanco en las zonas transparentes; PNG y WebP conservan transparencia. La compresión JPG/WebP se configura a calidad 94 %. Se dibujan los píxeles en un archivo nuevo sin copiar los metadatos EXIF, incluido GPS. No se conserva animación, capas, historial ni firmas del archivo original.

## Vídeo

Mueve el deslizador para revisar un instante o utiliza **Reproducir**. Escribe los segundos de **Inicio** y **Fin**, o pulsa el botón de marca para usar la posición actual. Deben estar dentro del vídeo y separados al menos 0,05 s.

- **Conservar este tramo:** guarda solo lo comprendido entre inicio y fin.
- **Quitar este tramo:** elimina la selección y une los extremos. Si la selección empieza o termina en un extremo, guarda el fragmento restante. No permite quitarlo todo.
- **Dividir por la mitad:** ignora las marcas e inicia una división en dos partes iguales del vídeo completo. Guarda ambas mitades por separado.

La salida es MP4, H.264/yuv420p a 30 fps con AAC si hay pista de audio. Se conserva el primer vídeo y la primera pista de audio; no se exportan subtítulos ni otras pistas. Puedes quitar el sonido. **1080p** limita el lado largo a 1920 píxeles, **720p** a 1280; un vídeo vertical conserva su orientación. La resolución original mantiene el tamaño, ajustado a píxeles pares para H.264. El corte se aproxima al fotograma más cercano; la duración puede diferir unas centésimas por audio y fotogramas. No existe corte sin pérdida: se recodifica.

El motor ocupa aproximadamente 32 MB y se carga al exportar. Mantén abierta la aplicación. La exportación trabaja en memoria y puede tardar varios minutos con archivos grandes. Cada fragmento tiene un tiempo máximo de 10 minutos de procesamiento. **Cancelar** detiene el trabajo y libera el motor. Puedes cambiar los ajustes y volver a guardar. Si falla, reduce la resolución o la duración. No es un editor de películas largas.

## Guardar en Android

Tras generar la copia, pulsa **Guardar o compartir**. Android abre su menú para escoger una aplicación o ubicación. La copia se escribe primero en la caché privada de Marco Editor. Si cierras el menú sin elegir un destino, no equivale a haber guardado el archivo. Las dos mitades se comparten por separado. El APK no está probado en teléfono físico; la compatibilidad depende del WebView instalado y la memoria disponible.

## Sin conexión

Escritorio y APK incluyen los recursos del motor. La web guarda recursos de la aplicación y los fragmentos del motor que ya se han usado; abre la web y realiza una exportación con conexión antes de necesitarla sin red. Si el sistema elimina la caché, hará falta cargarlos otra vez. El ZIP web debe servirse mediante HTTP local o HTTPS: abrir `index.html` directamente con `file://` no admite el motor de vídeo. El Web Portable levanta ese servidor local por ti.

## Ayuda

El botón **Cómo se usa** explica las operaciones dentro de la aplicación. Puedes comunicar incidencias en [GitHub](https://github.com/Peskysa/marco-editor/issues), indicando sistema, versión, formato y mensaje. Usa una muestra de prueba sin datos privados.
