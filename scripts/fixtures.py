"""Genera material de prueba original, con vídeo cambiante y tono audible."""
from pathlib import Path
import json, os, shutil, subprocess, sys
root=Path(__file__).resolve().parents[1]
ffmpeg=os.environ.get('FFMPEG') or shutil.which('ffmpeg')
if not ffmpeg:
    try:
        import imageio_ffmpeg
        ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
    except ImportError:pass
if not ffmpeg:
    sys.path.insert(0,str(root/'.test-tools'))
    import imageio_ffmpeg
    ffmpeg=imageio_ffmpeg.get_ffmpeg_exe()
folder=root/'tests/fixtures';folder.mkdir(parents=True,exist_ok=True)
common=[ffmpeg,'-hide_banner','-loglevel','error','-y','-f','lavfi','-i','testsrc2=size=320x240:rate=30:duration=6']
subprocess.run(common+['-f','lavfi','-i','sine=frequency=440:sample_rate=44100:duration=6','-c:v','libx264','-pix_fmt','yuv420p','-c:a','aac','-shortest',str(folder/'clip.mp4')],check=True)
subprocess.run(common+['-an','-c:v','libx264','-pix_fmt','yuv420p',str(folder/'silent.mp4')],check=True)
(root/'test-output').mkdir(exist_ok=True)
(root/'test-output/ffmpeg.json').write_text(json.dumps({'ffmpeg':str(ffmpeg)}))
print('Pruebas: clips originales de 6 segundos, con y sin sonido.')
