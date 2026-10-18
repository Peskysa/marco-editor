'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),out=path.join(root,'dist/web');fs.mkdirSync(out,{recursive:true});
for(const file of ['index.html','styles.css','sw.js','manifest.webmanifest'])fs.copyFileSync(path.join(root,'src',file),path.join(out,file));
require('esbuild').buildSync({entryPoints:[path.join(root,'src/app.js')],bundle:true,format:'esm',platform:'browser',target:['chrome110','firefox115','safari17'],outfile:path.join(out,'app.js'),minify:true,legalComments:'eof'});
fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
fs.mkdirSync(path.join(out,'engine/ffmpeg'),{recursive:true});
const wrapper=path.dirname(require.resolve('@ffmpeg/ffmpeg/worker'));
for(const file of fs.readdirSync(wrapper).filter(n=>n.endsWith('.js')))fs.copyFileSync(path.join(wrapper,file),path.join(out,'engine/ffmpeg',file));
const wasm=fs.readFileSync(require.resolve('@ffmpeg/core/wasm'));const core=path.join(path.dirname(require.resolve('@ffmpeg/core')),'../esm/ffmpeg-core.js');
fs.copyFileSync(core,path.join(out,'engine/ffmpeg-core.js'));
const parts=[];for(let offset=0;offset<wasm.length;offset+=8*1024*1024){const name=`core-${parts.length}.bin`;fs.writeFileSync(path.join(out,'engine',name),wasm.subarray(offset,offset+8*1024*1024));parts.push(name);}
fs.writeFileSync(path.join(out,'engine/manifest.json'),JSON.stringify({version:'0.12.10',size:wasm.length,sha256:crypto.createHash('sha256').update(wasm).digest('hex'),parts}));
for(const name of ['LICENSE','NOTICE','THIRD_PARTY.md'])if(fs.existsSync(path.join(root,name)))fs.copyFileSync(path.join(root,name),path.join(out,name));
if(fs.existsSync(path.join(root,'licenses')))fs.cpSync(path.join(root,'licenses'),path.join(out,'licenses'),{recursive:true});
if(fs.existsSync(path.join(root,'docs/MANUAL.md')))fs.copyFileSync(path.join(root,'docs/MANUAL.md'),path.join(out,'MANUAL.md'));
console.log(`Web compilada. Motor local: ${wasm.length} bytes en ${parts.length} fragmentos.`);
