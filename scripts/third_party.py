"""Conserva avisos y fuentes del motor. No lee ni imprime credenciales."""
from pathlib import Path
import concurrent.futures, hashlib, io, json, re, shutil, tarfile, urllib.parse, urllib.request, zipfile
ROOT=Path(__file__).resolve().parents[1]
DATE='2025-01-07T10:13:14Z'
HEADERS={'User-Agent':'Marco-Editor-source-distribution','Accept':'application/vnd.github+json'}
def read(url):
    with urllib.request.urlopen(urllib.request.Request(url,headers=HEADERS),timeout=120) as response:return response.read()
def revision(repo,ref='main',historical=False):
    url='https://api.github.com/repos/'+repo+'/commits?'+urllib.parse.urlencode({'sha':ref,'per_page':1,**({'until':DATE} if historical else {})})
    result=json.loads(read(url));return result[0]['sha']
def main():
    folder=ROOT/'licenses/ffmpeg-core';folder.mkdir(parents=True,exist_ok=True)
    manifest=folder/'sources.json'
    if manifest.exists():sources=json.loads(manifest.read_text())
    else:
        core=revision('ffmpegwasm/ffmpeg.wasm','main',True)
        docker=read(f'https://raw.githubusercontent.com/ffmpegwasm/ffmpeg.wasm/{core}/Dockerfile').decode()
        (folder/'Dockerfile.upstream').write_text(docker,encoding='utf-8')
        sources=[{'name':'ffmpeg.wasm','repo':'ffmpegwasm/ffmpeg.wasm','ref':core,'revision':core}]
        env=dict(re.findall(r'ENV (\w+)=(\S+)',docker))
        for repo,var in re.findall(r'https://github.com/([\w.-]+/[\w.-]+)\.git#\$(\w+)',docker):
            ref=env[var];sources.append({'name':repo.split('/')[-1],'repo':repo,'ref':ref,'revision':revision(repo,ref,True)})
        if not any(s['name']=='zimg' for s in sources):sources.append({'name':'zimg','repo':'sekrit-twc/zimg','ref':'release-3.0.5','revision':revision('sekrit-twc/zimg','release-3.0.5',True)})
        # SDL2 se enlaza desde el port de Emscripten 3.1.40, fijado por el Dockerfile.
        sources.append({'name':'SDL','repo':'libsdl-org/SDL','ref':'release-2.0.22','revision':revision('libsdl-org/SDL','release-2.0.22')})
        for item in sources:item['url']=f"https://codeload.github.com/{item['repo']}/tar.gz/{item['revision']}"
        manifest.write_text(json.dumps(sources,indent=2)+'\n',encoding='utf-8')
    staging=ROOT/'dist/third-party-sources';staging.mkdir(parents=True,exist_ok=True)
    def fetch(item):
        dest=staging/(item['name']+'-'+item['revision'][:12]+'.tar.gz')
        if not dest.exists():dest.write_bytes(read(item['url']))
        data=dest.read_bytes();digest=hashlib.sha256(data).hexdigest()
        if item.get('sha256') and item['sha256']!=digest:raise RuntimeError('Fuente modificada: '+item['name'])
        item['sha256']=digest
        licdir=folder/item['name'];licdir.mkdir(exist_ok=True)
        with tarfile.open(fileobj=io.BytesIO(data),mode='r:gz') as archive:
            for member in archive.getmembers():
                relative=member.name.split('/',1)[-1];name=relative.split('/')[-1]
                if member.isfile() and '/' not in relative and re.match(r'^(COPYING|LICENSE|LICENCE|COPYRIGHT|AUTHORS)',name,re.I):
                    (licdir/name).write_bytes(archive.extractfile(member).read())
        print('Fuentes y avisos: '+item['name'],flush=True)
    with concurrent.futures.ThreadPoolExecutor(max_workers=4) as pool:list(pool.map(fetch,sources))
    manifest.write_text(json.dumps(sources,indent=2)+'\n',encoding='utf-8')
    intro='# Fuentes del motor multimedia\n\nEl binario sin modificar es @ffmpeg/core 0.12.10 (GPL-2.0-or-later, opción GPLv3). Su publicación npm es del 7 de enero de 2025 y no declara gitHead. Se conservan la revisión upstream disponible en esa fecha, su Dockerfile, y las revisiones de sus dependencias en esa fecha; no se afirma una reconstrucción bit a bit del binario npm. Las fuentes y scripts originales se adjuntan a cada Release en Marco-Editor-Terceros-Source.zip. El archivo sources.json fija URL, revisión y SHA-256.\n\nLas licencias completas se conservan en las subcarpetas. FFmpeg se construye con --enable-gpl. Incluye x264, x265 y el resto de bibliotecas declaradas en Dockerfile.upstream. Emscripten 3.1.40 es la herramienta de compilación y proporciona SDL2; se facilita su fuente correspondiente. El wrapper JavaScript 0.12.15 tiene licencia MIT.\n\n'
    (folder/'SOURCES.md').write_text(intro+'\n'.join(f"- **{i['name']}**: [{i['repo']} @ {i['revision']}]({i['url']})" for i in sources)+'\n',encoding='utf-8')
    for package in ['@capacitor/core','@capacitor/android','@capacitor/cli','@capacitor/filesystem','@capacitor/share','electron','esbuild','electron-builder','sharp','playwright']:
        source=ROOT/'node_modules'/package
        target=ROOT/'licenses'/package.replace('@','').replace('/','-');target.mkdir(exist_ok=True)
        for name in ['LICENSE','LICENSE.txt','LICENSE.md','NOTICE']:
            if (source/name).exists():shutil.copy2(source/name,target/name)
    wrapper=ROOT/'licenses/ffmpeg-wrapper';wrapper.mkdir(exist_ok=True)
    shutil.copy2(folder/'ffmpeg.wasm/LICENSE',wrapper/'LICENSE')
    with zipfile.ZipFile(ROOT/'dist/Marco-Editor-Terceros-Source.zip','w',zipfile.ZIP_STORED) as z:
        for file in staging.iterdir():z.write(file,'sources/'+file.name)
        for file in folder.rglob('*'):
            if file.is_file():z.write(file,'inventory/'+str(file.relative_to(folder)))
    print('Fuentes de terceros preparadas y sumas verificadas.')
if __name__=='__main__':main()
