# Desarrollo y pruebas

Autor: Marco Pescador. Código original AGPL-3.0-only.

## Arquitectura

Interfaz HTML/CSS con JavaScript compilado mediante esbuild. `src/core.cjs` concentra coordenadas, rangos y comandos. Canvas transforma fotos y ofrece vista previa; ffmpeg.wasm 0.12.15 con core 0.12.10 realiza las exportaciones de vídeo en un worker. Se utiliza la versión de un hilo para evitar exigir SharedArrayBuffer o cabeceras de aislamiento. El WASM se divide en cuatro fragmentos binarios de hasta 8 MiB y se reconstruye en memoria sin alterar sus bytes. Todos los recursos se sirven localmente o desde el mismo origen.

Electron ofrece la ventana de escritorio con servidor HTTP de solo lectura en loopback, aislamiento de contexto, sandbox y sin Node en el contenido. Capacitor proporciona el APK, selector de archivos del WebView y Filesystem/Share para compartir resultados. El lanzador Web Portable es un programa mínimo de Python/Tk empaquetado con PyInstaller.

## Preparación

Node 24, pnpm 11.25.0 y Python 3.12 para distribución. Ejecuta `pnpm install --frozen-lockfile`, `pnpm exec electron --version` (el instalador de Electron puede requerir `node node_modules/electron/install.js`), `node scripts/assets.cjs`, `pnpm build:web` y `pnpm start`. El servidor de desarrollo escucha en 127.0.0.1:5186. `PORT` permite cambiarlo.

## Pruebas

1. `pnpm test`: mitades, conservación/eliminación, extremos, rangos inválidos, coordenadas pares, giro/recorte, audio opcional y parámetros de codificación.
2. Instala FFmpeg para desarrollo o `pip install --target .test-tools imageio-ffmpeg`. Ejecuta `python scripts/fixtures.py` para generar patrones y tono originales.
3. `pnpm exec playwright install chromium` y `pnpm test:browser`. Se comprueban píxeles del recorte girado, PNG/JPG/WebP, proporciones, deshacer, vídeo real, dimensiones y duraciones, audio decodificado con energía audible, unión de extremos, mitades, silencio, archivo sin audio, selección inválida, cancelación, móvil, uso sin conexión y ausencia de peticiones externas del editor. Las pruebas generan las capturas reales y `test-output/browser-report.json`.
4. `pnpm build:desktop` y `node tests/desktop.cjs ruta-al-ejecutable`: abre la aplicación empaquetada y exporta un tramo del clip con sonido. CI comprueba además el portable y el servidor Web Portable, la estructura del DEB/TAR y la firma del APK.
5. `python scripts/distribution.py check` valida la colección. `finalize artifacts` exige los nueve paquetes comunes, genera fuente del commit, documentación y sumas, y rechaza archivos de firma en la fuente.

## Android y publicación

`pnpm exec cap sync android` sincroniza el contenido compilado. Java 21, SDK 36 y el wrapper Gradle incluido construyen `assembleRelease`. La firma requiere `ANDROID_KEYSTORE` (PKCS12 base64) y `ANDROID_KEY_PASSWORD` en secretos de GitHub. El alias es `marco-editor`; `.signing/` queda excluida de Git y nunca se adjunta a una Release.

Las etiquetas `v*` activan `.github/workflows/release.yml`. Cada plataforma se compila y comprueba antes de publicar. El trabajo final publica una Release solo si pasan todas las dependencias y están todos los archivos. Compilar y comprobar un APK no equivale a probarlo en un teléfono físico. El sitio se publica desde el mismo contenido web compilado, con su fuente conservada en Sites.
