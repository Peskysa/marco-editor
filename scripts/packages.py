"""Comprueba contenidos de los paquetes, además de las pruebas de exportación."""
from pathlib import Path
import hashlib, json, subprocess, sys, tarfile, zipfile
ROOT=Path(__file__).resolve().parents[1]
def web():
    folder=ROOT/'dist/web';manifest=json.loads((folder/'engine/manifest.json').read_text())
    data=b''.join((folder/'engine'/name).read_bytes() for name in manifest['parts'])
    assert len(data)==manifest['size'] and hashlib.sha256(data).hexdigest()==manifest['sha256']
    for name in ['app.js','index.html','LICENSE','NOTICE','THIRD_PARTY.md','assets/icon-512.png','engine/ffmpeg/worker.js']:assert (folder/name).stat().st_size>0,name
    target=ROOT/'dist/Marco-Editor-Web.zip'
    with zipfile.ZipFile(target,'w',zipfile.ZIP_DEFLATED) as z:
        for file in folder.rglob('*'):
            if file.is_file():z.write(file,file.relative_to(folder))
    with zipfile.ZipFile(target) as z:assert z.testzip() is None
    print('ZIP web: contenidos y reconstrucción SHA-256 del motor correctos.')
def desktop():
    folder=ROOT/'dist/desktop'
    if sys.platform=='win32':
        for name in ['Marco-Editor-Windows-Instalador.exe','Marco-Editor-Portable.exe','Marco-Editor-Web-Portable.exe']:
            file=folder/name;assert file.stat().st_size>1000000 and file.open('rb').read(2)==b'MZ',name
    else:
        deb=folder/'Marco-Editor-Linux-amd64.deb';assert deb.stat().st_size>1000000
        listing=subprocess.check_output(['dpkg-deb','-c',str(deb)],text=True);assert 'app.asar' in listing and 'marco-editor' in listing
        with tarfile.open(folder/'Marco-Editor-Linux-Portable.tar.gz') as archive:
            assert any(n.endswith('/app.asar') for n in archive.getnames())
    print('Paquetes de escritorio: formato y contenidos correctos.')
def android():
    with zipfile.ZipFile(ROOT/'dist/Marco-Editor-Android.apk') as archive:
        names=archive.namelist();assert archive.testzip() is None
        for name in ['assets/public/index.html','assets/public/app.js','assets/public/engine/manifest.json','classes.dex','AndroidManifest.xml']:assert name in names,name
        manifest=json.loads(archive.read('assets/public/engine/manifest.json'))
        wasm=b''.join(archive.read('assets/public/engine/'+name) for name in manifest['parts'])
        assert hashlib.sha256(wasm).hexdigest()==manifest['sha256']
    print('APK: código Android, interfaz y motor íntegro incluidos. La firma se verifica con apksigner.')
if __name__=='__main__':{'web':web,'desktop':desktop,'android':android}[sys.argv[1]]()
