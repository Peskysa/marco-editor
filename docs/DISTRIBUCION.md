# Distribución y verificaciones

Repositorio y descargas públicos. La web alojada mantiene acceso privado del propietario, pendiente de autorización para abrirla a todos. Autor: Marco Pescador. Versión 1.0.0. Fuente original AGPL-3.0-only. [Estado comprobado](ESTADO.md).

La Release contiene estos nueve paquetes comunes y `SHA256SUMS.txt`:

1. `Marco-Editor-Windows-Instalador.exe`
2. `Marco-Editor-Portable.exe`
3. `Marco-Editor-Web-Portable.exe`
4. `Marco-Editor-Linux-amd64.deb`
5. `Marco-Editor-Linux-Portable.tar.gz`
6. `Marco-Editor-Web.zip`
7. `Marco-Editor-Android.apk`
8. `Marco-Editor-Documentacion.zip`
9. `Marco-Editor-Source.zip`

Además: `Marco-Editor-Terceros-Source.zip`, fuentes de las bibliotecas del motor multimedia. Las sumas SHA-256 cubren todos los adjuntos. La fuente se obtiene con `git archive HEAD` del commit que compila el flujo.

## Qué se comprueba

- **Web:** pruebas funcionales de exportación de fotos y vídeo con audio, corte, unión, mitades, cancelación, vista móvil y modo sin conexión. El ZIP contiene los cuatro fragmentos del motor y sus avisos.
- **Windows:** compilación propia del instalador y portable; prueba de exportación dentro de la aplicación empaquetada y arranque del portable. El Web Portable se consulta por HTTP y debe rechazar POST.
- **Linux:** compilación propia de DEB y TAR.GZ; exportación real en la aplicación empaquetada bajo pantalla virtual y revisión de contenidos de ambos paquetes.
- **Android:** compilación de publicación y verificación criptográfica mediante apksigner; contenido web y recursos incluidos. **No verificado en teléfono físico.**
- **Publicación:** solo se publica si pasan todos los trabajos y existe el conjunto completo de archivos. El estado actual se consulta en Actions y Releases; la presencia de estas instrucciones no demuestra por sí sola que una ejecución haya terminado.

Compilado, probado funcionalmente y publicado son estados diferentes. La firma Android es propia del proyecto; Windows carece de firma comercial. Los portables mantienen los permisos y políticas del sistema. El APK no está publicado en Google Play. La modalidad web depende de los códecs del navegador y puede requerir conexión inicial para obtener los recursos que falten en caché.
