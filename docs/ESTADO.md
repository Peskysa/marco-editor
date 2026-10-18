# Estado comprobado — 18 de octubre de 2026

La versión pública [v1.0.0](https://github.com/Peskysa/marco-editor/releases/tag/v1.0.0) corresponde al commit `f073419f711d33c798ca8686821f0e18f5c0a79c`. El código y todas sus descargas son públicos.

- [Actions](https://github.com/Peskysa/marco-editor/actions/runs/39160786193): web, Windows, Linux, Android y publicación completados correctamente.
- Nueve paquetes comunes, fuentes de terceros y SHA256SUMS.txt: once adjuntos. Se han descargado y verificado las diez sumas de paquetes, sus tamaños, los hashes del servidor y el acceso anónimo a las once descargas.
- El contenido del ZIP fuente se ha comparado archivo a archivo con el commit de compilación. No incluye credenciales ni la carpeta de firma.
- Exportación real de MP4 dentro de los paquetes Windows y Linux: 320 × 240, duración 1 s, sin errores. Portable Windows y Web Portable comprobados.
- Web: seis pruebas de lógica y comprobaciones funcionales de fotos y vídeo, con sonido decodificado, primer fotograma, recorte, giro, tramos, unión, mitades, silencio, cancelación, pantalla móvil simulada y uso sin conexión.
- Android: APK de publicación compilado, firma propia verificada y contenidos íntegros. **No verificado en teléfono físico** ni publicado en Google Play.
- En el equipo local de desarrollo, Device Guard impidió ejecutar el EXE modificado sin firma comercial. La prueba Windows se realizó correctamente en el equipo de compilación de GitHub. No se cambió la política de seguridad del equipo local.

La [web alojada](https://marco-editor.peskysa.chatgpt.site) está desplegada para el propietario. La revisión automática no autorizó cambiar su audiencia a pública porque la autorización permanente se refiere expresamente a GitHub. Se ha solicitado autorización específica al propietario. Las referencias anteriores de esta versión a web pública describen la distribución web descargable; el acceso al alojamiento se mantiene privado hasta su autorización.

Esta nota actualiza la documentación después de la compilación. Los binarios y su archivo fuente siguen correspondiendo al commit de v1.0.0 indicado arriba.
