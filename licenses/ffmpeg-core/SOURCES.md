# Fuentes del motor multimedia

El binario sin modificar es @ffmpeg/core 0.12.10 (GPL-2.0-or-later, opción GPLv3). Su publicación npm es del 7 de enero de 2025 y no declara gitHead. Se conservan la revisión upstream disponible en esa fecha, su Dockerfile, y las revisiones de sus dependencias en esa fecha; no se afirma una reconstrucción bit a bit del binario npm. Las fuentes y scripts originales se adjuntan a cada Release en Marco-Editor-Terceros-Source.zip. El archivo sources.json fija URL, revisión y SHA-256.

Las licencias completas se conservan en las subcarpetas. FFmpeg se construye con --enable-gpl. Incluye x264, x265 y el resto de bibliotecas declaradas en Dockerfile.upstream. Emscripten 3.1.40 es la herramienta de compilación y proporciona SDL2; se facilita su fuente correspondiente. El wrapper JavaScript 0.12.15 tiene licencia MIT.

- **ffmpeg.wasm**: [ffmpegwasm/ffmpeg.wasm @ 71aa99d37c02a7b4c435275ca9ef50e612f6efa1](https://codeload.github.com/ffmpegwasm/ffmpeg.wasm/tar.gz/71aa99d37c02a7b4c435275ca9ef50e612f6efa1)
- **x264**: [ffmpegwasm/x264 @ 33cac6b77d5b9259c552156013a817ab23119612](https://codeload.github.com/ffmpegwasm/x264/tar.gz/33cac6b77d5b9259c552156013a817ab23119612)
- **x265**: [ffmpegwasm/x265 @ 2bb5520e9596f361bf0ed81b3b8da0d7fd999069](https://codeload.github.com/ffmpegwasm/x265/tar.gz/2bb5520e9596f361bf0ed81b3b8da0d7fd999069)
- **libvpx**: [ffmpegwasm/libvpx @ 10b9492dcf05b652e2e4b370e205bd605d421972](https://codeload.github.com/ffmpegwasm/libvpx/tar.gz/10b9492dcf05b652e2e4b370e205bd605d421972)
- **lame**: [ffmpegwasm/lame @ 2badea1974ae36cb8312afe99cff1e6b3b5decee](https://codeload.github.com/ffmpegwasm/lame/tar.gz/2badea1974ae36cb8312afe99cff1e6b3b5decee)
- **Ogg**: [ffmpegwasm/Ogg @ bada45718453ac27b56773ae663f7e65112f6a6e](https://codeload.github.com/ffmpegwasm/Ogg/tar.gz/bada45718453ac27b56773ae663f7e65112f6a6e)
- **theora**: [ffmpegwasm/theora @ 7ffd8b2ecfc2d93ae5e16028e7528e609266bfbf](https://codeload.github.com/ffmpegwasm/theora/tar.gz/7ffd8b2ecfc2d93ae5e16028e7528e609266bfbf)
- **opus**: [ffmpegwasm/opus @ e85ed7726db5d677c9c0677298ea0cb9c65bdd23](https://codeload.github.com/ffmpegwasm/opus/tar.gz/e85ed7726db5d677c9c0677298ea0cb9c65bdd23)
- **vorbis**: [ffmpegwasm/vorbis @ 7798164043197d7e33f02de4353ce2aa5b248225](https://codeload.github.com/ffmpegwasm/vorbis/tar.gz/7798164043197d7e33f02de4353ce2aa5b248225)
- **zlib**: [ffmpegwasm/zlib @ cacf7f1d4e3d44d871b605da3b647f07d718623f](https://codeload.github.com/ffmpegwasm/zlib/tar.gz/cacf7f1d4e3d44d871b605da3b647f07d718623f)
- **libwebp**: [ffmpegwasm/libwebp @ ca332209cb5567c9b249c86788cb2dbf8847e760](https://codeload.github.com/ffmpegwasm/libwebp/tar.gz/ca332209cb5567c9b249c86788cb2dbf8847e760)
- **freetype2**: [ffmpegwasm/freetype2 @ 6a2b3e4007e794bfc6c91030d0ed987f925164a8](https://codeload.github.com/ffmpegwasm/freetype2/tar.gz/6a2b3e4007e794bfc6c91030d0ed987f925164a8)
- **fribidi**: [fribidi/fribidi @ f9e8e71a6fbf4a4619481284c9f484d10e559995](https://codeload.github.com/fribidi/fribidi/tar.gz/f9e8e71a6fbf4a4619481284c9f484d10e559995)
- **harfbuzz**: [harfbuzz/harfbuzz @ 4a1d891c6317d2c83e5f3c2607ec5f5ccedffcde](https://codeload.github.com/harfbuzz/harfbuzz/tar.gz/4a1d891c6317d2c83e5f3c2607ec5f5ccedffcde)
- **libass**: [libass/libass @ d149636f502f5774ae1a8fb4c554b122674393b2](https://codeload.github.com/libass/libass/tar.gz/d149636f502f5774ae1a8fb4c554b122674393b2)
- **FFmpeg**: [FFmpeg/FFmpeg @ 4729204c17f756e186d622060088371d10b34f7e](https://codeload.github.com/FFmpeg/FFmpeg/tar.gz/4729204c17f756e186d622060088371d10b34f7e)
- **zimg**: [sekrit-twc/zimg @ e5b0de6bebbcbc66732ed5afaafef6b2c7dfef87](https://codeload.github.com/sekrit-twc/zimg/tar.gz/e5b0de6bebbcbc66732ed5afaafef6b2c7dfef87)
- **SDL**: [libsdl-org/SDL @ 53dea9830964eee8b5c2a7ee0a65d6e268dc78a1](https://codeload.github.com/libsdl-org/SDL/tar.gz/53dea9830964eee8b5c2a7ee0a65d6e268dc78a1)
