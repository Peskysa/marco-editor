# Instalación

Descargas oficiales: [Releases de Marco Editor](https://github.com/Peskysa/marco-editor/releases/latest). Comprueba las sumas con `Get-FileHash archivo -Algorithm SHA256` en PowerShell o `sha256sum archivo` en Linux.

## Windows x64

Windows 10/11 de 64 bits. Ejecuta `Marco-Editor-Windows-Instalador.exe` para instalar en tu cuenta, o abre `Marco-Editor-Portable.exe` sin instalación. Ambos incluyen el motor y su propia ventana. Los EXE no llevan firma comercial; respeta la política de ejecución de tu equipo. La autorización del propietario no modifica los permisos del sistema.

`Marco-Editor-Web-Portable.exe` es un lanzador alternativo: abre la interfaz en el navegador instalado y sirve los recursos desde `127.0.0.1` en un puerto libre. Mantén su ventana abierta mientras editas. No instala Python ni abre el servidor a la red local.

## Linux amd64

Ubuntu 22.04 o posterior y otras distribuciones compatibles con Electron 44, con escritorio gráfico. Instala `Marco-Editor-Linux-amd64.deb` con tu gestor de paquetes. Como alternativa, extrae `Marco-Editor-Linux-Portable.tar.gz` y ejecuta `marco-editor` desde la carpeta conservando todos sus archivos. El TAR incluye las bibliotecas de Electron pero puede requerir las dependencias gráficas del sistema. Ejecuta como usuario normal.

## Web

Abre [Marco Editor](https://marco-editor.peskysa.chatgpt.site) en un navegador moderno con Canvas, WebAssembly, módulos JavaScript y workers. Chrome/Edge/Firefox recientes; Safari 17 o posterior como referencia técnica, sin comprobación realizada en Safari físico. Para alojar el ZIP, extrae todo y sirve por HTTPS; para usarlo localmente con herramientas de desarrollo, `python -m http.server --bind 127.0.0.1 8080` en la carpeta extraída y abre el puerto 8080. El ZIP contiene el motor, no requiere CDN. No abras el HTML con `file://`.

Puedes instalar la web como aplicación cuando el navegador ofrezca esa opción. La disponibilidad sin conexión depende de la caché; consulta el manual.

## Android

Android 7.0 o posterior, con Android System WebView actualizado. Descarga `Marco-Editor-Android.apk`, autoriza la instalación de esa descarga y abre el APK. Tiene firma estable propia de este proyecto; conserva la clave para futuras actualizaciones. No está publicado en Google Play ni verificado en teléfono físico. No solicita acceso global a tus fotos: el selector te permite elegir un archivo y el menú de Android guardar la copia.

## Desinstalar

Windows y Linux: usa el sistema de desinstalación; los portables se eliminan quitando su carpeta. Android: desinstala desde Ajustes. Web: elimina los datos del sitio y, si corresponde, la aplicación instalada. Las copias guardadas fuera del programa permanecen en el destino que hayas elegido.
