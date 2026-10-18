# Componentes de terceros

Autor del programa y gráficos originales: Marco Pescador. No es el autor de sus dependencias.

| Componente | Versión | Licencia y uso |
| --- | --- | --- |
| @ffmpeg/ffmpeg | 0.12.15 | MIT. Control del motor WebAssembly. |
| @ffmpeg/core | 0.12.10 | GPL-2.0-or-later, distribuido conforme a GPLv3. Motor multimedia sin modificar; el fraccionado binario se revierte sin alterar bytes. |
| FFmpeg, x264, x265 y bibliotecas del motor | Las del Dockerfile de ffmpeg.wasm v0.12.10 | GPL, LGPL y licencias permisivas. Inventario y fuentes en `licenses/ffmpeg-core/`. |
| Capacitor core, Android, CLI | 8.5.3 | MIT. Contenedor Android y herramientas de construcción. |
| Capacitor Filesystem / Share | 8.1.5 / 8.0.3 | MIT. Guardado temporal y menú para compartir en Android. |
| Electron | 44.7.0 | MIT y licencias de Chromium/Node. El paquete de escritorio conserva `LICENSE.electron.txt` y `LICENSES.chromium.html`. |
| esbuild / electron-builder | 0.27.3 / 26.15.3 | MIT. Herramientas de compilación. |
| Sharp / Playwright | 0.34.5 / 1.64.1 | Apache-2.0. Generación de iconos y pruebas; no se usan para editar los archivos del usuario. |
| Python / PyInstaller | 3.12 (CI) / 6.22.3 | PSF / GPL con excepción de distribución de ejecutables. Solo lanzador Web Portable. |

La aplicación utiliza el motor como obra combinada bajo las condiciones compatibles de GPLv3 y AGPLv3; el código original permanece AGPL-3.0-only. El motor mantiene su licencia GPL y el resto de componentes mantienen las suyas. La compatibilidad no permite eliminar avisos ni atribuir componentes ajenos al autor de la aplicación.

Los paquetes conservan los textos de licencia. El código fuente original se distribuye en `Marco-Editor-Source.zip`, del mismo commit que los binarios. Las fuentes de terceros y sus instrucciones se facilitan en `Marco-Editor-Terceros-Source.zip`, junto a los enlaces del inventario. No se incluyen SDK, compiladores, cachés ni claves en el código fuente original.

El material audiovisual de las pruebas se genera desde cero con patrones geométricos y un tono, mediante `scripts/fixtures.py`. La ilustración de montaña del ejemplo se dibuja en el propio código de Marco Editor. No hay fotografías, vídeos ni fuentes tipográficas descargadas de terceros.
