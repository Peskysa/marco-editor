import core from './core.cjs';
import { FFmpeg } from '@ffmpeg/ffmpeg';
import { Capacitor } from '@capacitor/core';
import { Filesystem, Directory } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';
const $=id=>document.getElementById(id);
const full=()=>({x:0,y:0,w:100,h:100});
let file=null, source=null, sourceURL=null, isVideo=false, width=0,height=0,duration=0;
let edit={rotation:0,flipX:false,flipY:false,crop:full()}, mode='keep',history=[],busy=false,engine=null,operation=0,results=[],frame=0;
const clone=()=>structuredClone(edit);
const fmt=t=>`${Math.floor(t/60)}:${(t%60).toFixed(2).padStart(5,'0')}`;
const size=n=>`${(n/1048576).toFixed(1)} MB`;
const message=(text,error=false)=>{ $('status').textContent=text;$('status').style.color=error?'#a34f37':''; };
function remember(){history.push(clone());if(history.length>35)history.shift();$('undo').disabled=false;}
function invalidate(){if(!busy) $('summary').textContent='Cambios listos para guardar';}
function transformedSize(){return core.dimensions(width,height,edit.rotation);}
function renderSource(canvas,maxEdge=0,fill=false){
  const d=transformedSize(),scale=maxEdge?Math.min(1,maxEdge/Math.max(d.width,d.height)):1;
  canvas.width=Math.max(1,Math.round(d.width*scale));canvas.height=Math.max(1,Math.round(d.height*scale));
  const ctx=canvas.getContext('2d');if(fill){ctx.fillStyle='#fff';ctx.fillRect(0,0,canvas.width,canvas.height);}
  ctx.translate(canvas.width/2,canvas.height/2);ctx.scale(edit.flipX?-scale:scale,edit.flipY?-scale:scale);ctx.rotate(edit.rotation*Math.PI/180);
  ctx.drawImage(source,-width/2,-height/2,width,height);return canvas;
}
function draw(){
  if(!source)return;const d=transformedSize(),area=$('dropzone'),maxWidth=Math.max(100,area.clientWidth-(innerWidth<700?36:68));
  const maxHeight=innerWidth<700?330:390,scale=Math.min(maxWidth/d.width,maxHeight/d.height,1);
  $('stage').style.width=`${d.width*scale}px`;$('stage').style.height=`${d.height*scale}px`;
  renderSource($('preview'),Math.min(1600,Math.max(d.width*scale,d.height*scale)*devicePixelRatio));
  updateSelection();
}
function updateSelection(){
  const c=edit.crop,s=$('selection');s.style.inset='auto';Object.assign(s.style,{left:c.x+'%',top:c.y+'%',width:c.w+'%',height:c.h+'%'});
  for(const [key,id]of Object.entries({x:'crop-x',y:'crop-y',w:'crop-w',h:'crop-h'})){if(document.activeElement!==$(id))$(id).value=(+c[key].toFixed(1));}
  try{const d=transformedSize(),p=core.cropPixels(d.width,d.height,c,isVideo);$('output-size').textContent=`${p.width} × ${p.height} px`;}catch{$('output-size').textContent='Revisa el recorte';}
}
function ratio(){const v=$('ratio').value;const d=transformedSize();return v==='free'?0:v==='original'?d.width/d.height:Number(v);}
function fitRatio(c){const r=ratio();if(!r)return c;const d=transformedSize(),relative=r*d.height/d.width;
  c.h=c.w/relative;if(c.h>100-c.y){c.h=100-c.y;c.w=c.h*relative;}return c;
}
function cropChanged(event){remember();const c={x:Number($('crop-x').value),y:Number($('crop-y').value),w:Number($('crop-w').value),h:Number($('crop-h').value)};
  if(!Object.values(c).every(Number.isFinite)){message('Revisa los números del recorte.',true);return;}
  c.x=core.clamp(c.x,0,99);c.y=core.clamp(c.y,0,99);c.w=core.clamp(c.w,1,100-c.x);c.h=core.clamp(c.h,1,100-c.y);
  if(ratio()&&event?.target.id==='crop-h'){const d=transformedSize();c.w=Math.min(100-c.x,c.h*ratio()*d.height/d.width);}
  edit.crop=fitRatio(c);updateSelection();invalidate();
}
function turn(amount){if(busy)return;remember();edit.rotation=core.rotation(edit.rotation+amount);edit.crop=full();$('ratio').value='free';draw();invalidate();}
function reset(){if(busy)return;remember();edit={rotation:0,flipX:false,flipY:false,crop:full()};$('ratio').value='free';$('start').value=0;$('end').value=duration.toFixed(3);$('mute').checked=false;setMode('keep');draw();invalidate();}
function clearResults(){for(const r of results)URL.revokeObjectURL(r.url);results=[];$('result-list').replaceChildren();$('results').hidden=true;}
function configure(){
  edit={rotation:0,flipX:false,flipY:false,crop:full()};history=[];$('undo').disabled=true;$('ratio').value='free';$('kind').textContent=isVideo?'VÍDEO':'FOTO';$('file-icon').textContent=isVideo?'▷':'▧';
  document.querySelectorAll('.video-only').forEach(el=>el.hidden=!isVideo);document.querySelectorAll('.photo-only').forEach(el=>el.hidden=isVideo);$('format').hidden=isVideo;
  document.querySelector('label[for="format"]').textContent=isVideo?'Salida · MP4 (H.264 + AAC)':'Guardar como';
  $('timeline').hidden=!isVideo;$('start').value=0;$('start').max=duration;$('end').value=duration.toFixed(3);$('end').max=duration;$('scrub').max=duration||1;$('scrub').value=0;$('mute').checked=false;
  $('current-time').textContent=fmt(0);setMode('keep');clearResults();draw();$('summary').textContent=isVideo?'Vídeo listo para editar':'Foto lista para editar';
}
async function loadFile(next){
  if(busy||!next)return;const video=next.type.startsWith('video/')||/\.(mp4|mov|webm|mkv|avi|m4v)$/i.test(next.name);
  if(!video&&!next.type.startsWith('image/'))return message('Abre una foto JPG, PNG o WebP, o un vídeo MP4 o WebM.',true);
  if(next.size>200*1048576)return message('Este editor admite archivos de hasta 200 MB. Usa un fragmento más pequeño.',true);
  $('source-video').pause();cancelAnimationFrame(frame);const url=URL.createObjectURL(next);
  try{
    let item,w,h,len=0;
    if(video){
      const probe=document.createElement('video');probe.preload='metadata';probe.src=url;
      await new Promise((resolve,reject)=>{const timer=setTimeout(()=>reject(new Error('El vídeo tarda demasiado en abrirse.')),20000);probe.onloadeddata=()=>{clearTimeout(timer);resolve();};probe.onerror=()=>{clearTimeout(timer);reject(new Error('El navegador no puede previsualizar este formato. Prueba MP4 con H.264 o WebM.'));};});
      w=probe.videoWidth;h=probe.videoHeight;len=probe.duration;probe.removeAttribute('src');probe.load();
      if(!Number.isFinite(len)||len<.1)throw new Error('No se puede leer la duración de este vídeo.');
      item=$('source-video');item.src=url;await new Promise((resolve,reject)=>{item.onloadeddata=resolve;item.onerror=()=>reject(new Error('No se puede abrir el vídeo.'));});
      // Un vídeo oculto puede anunciar datos sin haber decodificado su primer fotograma.
      await new Promise(resolve=>{item.addEventListener('seeked',resolve,{once:true});item.currentTime=Math.min(.001,len/2);});
    }else{
      item=new Image();item.src=url;await item.decode();w=item.naturalWidth;h=item.naturalHeight;
      if(/gif/i.test(next.type))message('El GIF se guardará como una imagen fija.');
    }
    if(!w||!h||w*h>40000000)throw new Error('El archivo supera el límite de 40 millones de píxeles.');
    if(sourceURL)URL.revokeObjectURL(sourceURL);sourceURL=url;source=item;file=next;isVideo=video;width=w;height=h;duration=len;
    $('filename').textContent=next.name;$('filemeta').textContent=`${w} × ${h} px · ${size(next.size)}${video?' · '+fmt(len):''}`;
    configure();message(video?'Marca un tramo o elige dividir por la mitad. Guardarás un MP4 nuevo.':'Arrastra para elegir el recorte. Puedes girar y guardar cuando quieras.');
  }catch(error){URL.revokeObjectURL(url);message(error.message,true);}
  $('file').value='';
}
function setMode(value){mode=value;document.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('selected',b.dataset.mode===value));timeSummary();}
function timeSummary(){if(!duration)return;const a=Number($('start').value),b=Number($('end').value);$('range-highlight').style.marginLeft=`${100*a/duration}%`;$('range-highlight').style.width=`${Math.max(0,100*(b-a)/duration)}%`;
  try{const s=core.segments(duration,a,b,mode);$('time-summary').textContent=mode==='half'?`Dos archivos de ${fmt(duration/2)} cada uno.`:`Resultado: ${fmt(s.reduce((sum,[x,y])=>sum+y-x,0))}. ${mode==='remove'?'Se unirán los extremos que conserves.':'Se guardará solo el tramo marcado.'}`;}catch(error){$('time-summary').textContent=error.message;}
}
function animate(){if(!isVideo)return;draw();$('current-time').textContent=fmt(source.currentTime);$('scrub').value=source.currentTime;if(!source.paused)frame=requestAnimationFrame(animate);}
function setBusy(value){busy=value;document.body.classList.toggle('busy',value);$('open').disabled=value;$('export').disabled=value;$('cancel').hidden=!value;$('progress').hidden=!value;}
function progress(value,text){$('progress').value=core.clamp(value,0,100);if(text)message(text);}
async function addResult(blob,name,type){
  const url=URL.createObjectURL(blob),record={blob,name,url};results.push(record);
  const card=document.createElement('article');card.className='result-card';const preview=document.createElement(type==='video/mp4'?'video':'img');preview.src=url;
  if(type==='video/mp4'){preview.controls=true;preview.playsInline=true;preview.preload='metadata';}else preview.alt='Foto editada';
  const details=document.createElement('div');details.className='details';const title=document.createElement('strong');title.textContent=name;const info=document.createElement('p');info.textContent=`${size(blob.size)} · copia editada`;details.append(title,info);
  let action;
  if(Capacitor.isNativePlatform()){
    action=document.createElement('button');action.textContent='Guardar o compartir';action.addEventListener('click',async()=>{action.disabled=true;try{
      const base64=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result.split(',')[1]);reader.onerror=reject;reader.readAsDataURL(blob);});
      const saved=await Filesystem.writeFile({path:`exports/${Date.now()}-${name}`,data:base64,directory:Directory.Cache,recursive:true});
      await Share.share({title:name,files:[saved.uri],dialogTitle:'Guardar o compartir copia'});message('Copia preparada. Elige dónde guardarla en el menú de Android.');
    }catch(e){message('No se pudo compartir la copia: '+e.message,true);}finally{action.disabled=false;}});
  }else{action=document.createElement('a');action.href=url;action.download=name;action.textContent='↓ Descargar copia';}
  card.append(preview,details,action);$('result-list').append(card);$('results').hidden=false;
}
async function exportPhoto(){
  const mime=$('format').value,base=renderSource(document.createElement('canvas'),0,mime==='image/jpeg'),c=core.cropPixels(base.width,base.height,edit.crop);
  const result=document.createElement('canvas');result.width=c.width;result.height=c.height;result.getContext('2d').drawImage(base,c.x,c.y,c.width,c.height,0,0,c.width,c.height);
  const blob=await new Promise(resolve=>result.toBlob(resolve,mime,.94));base.width=1;result.width=1;if(!blob)throw new Error('No se pudo guardar la foto. Prueba con un recorte más pequeño.');
  if(blob.type!==mime)throw new Error('Tu navegador no puede guardar este formato. Elige PNG o JPG.');
  await addResult(blob,core.safeName(file?.name||'paisaje')+'-editada.'+({'image/jpeg':'jpg','image/png':'png','image/webp':'webp'}[mime]),mime);
}
async function loadEngine(token){
  progress(2,'Preparando el motor de vídeo (unos 32 MB, solo la primera vez)…');
  const ff=new FFmpeg();engine=ff;let recent=[];
  ff.on('log',({message:m})=>{recent.push(m);if(recent.length>20)recent.shift();});
  ff.on('progress',({progress:p})=>{if(token===operation)progress(30+60*core.clamp(p,0,1));});
  const manifest=await(await fetch('engine/manifest.json')).json(),parts=[];
  for(let i=0;i<manifest.parts.length;i++){const response=await fetch('engine/'+manifest.parts[i]);if(!response.ok)throw new Error('No se pudo cargar el motor. Comprueba la conexión y vuelve a intentarlo.');parts.push(await response.arrayBuffer());if(token!==operation)throw new Error('Cancelado');progress(3+20*(i+1)/manifest.parts.length);}
  const wasmURL=URL.createObjectURL(new Blob(parts,{type:'application/wasm'}));
  try{if(token!==operation)throw new Error('Cancelado');await ff.load({classWorkerURL:new URL('engine/ffmpeg/worker.js',location.href).href,coreURL:new URL('engine/ffmpeg-core.js',location.href).href,wasmURL});}finally{URL.revokeObjectURL(wasmURL);}
  ff.lastLog=()=>recent.join('\n');return ff;
}
async function exportVideo(token){
  const ranges=core.segments(duration,Number($('start').value),Number($('end').value),mode),filters=core.videoFilters(width,height,{...edit,maxEdge:$('resolution').value});
  const ff=await loadEngine(token);if(token!==operation)throw new Error('Cancelado');
  const ext=(file.name.match(/\.([a-zA-Z0-9]{1,8})$/)||[])[1]||'mp4',input='input.'+ext;
  progress(25,'Leyendo el vídeo en la memoria de tu dispositivo…');await ff.writeFile(input,new Uint8Array(await file.arrayBuffer()));
  for(let i=0;i<ranges.length;i++){
    if(token!==operation)throw new Error('Cancelado');const output=`part${i}.mp4`;message(`Exportando ${i+1} de ${ranges.length}. Mantén abierta la aplicación…`);
    const code=await ff.exec(core.videoCommand(input,output,ranges[i],filters,$('mute').checked),600000);
    if(code!==0)throw new Error('El motor no pudo exportar el vídeo. Prueba 720p, un tramo más corto u otro archivo.');
  }
  const outputs=[];
  if(mode==='remove'&&ranges.length===2){
    progress(92,'Uniendo los extremos del vídeo…');await ff.writeFile('list.txt',new TextEncoder().encode("file 'part0.mp4'\nfile 'part1.mp4'\n"));
    const code=await ff.exec(['-f','concat','-safe','0','-i','list.txt','-c','copy','-map_metadata','-1','-movflags','+faststart','joined.mp4'],600000);if(code!==0)throw new Error('No se pudieron unir los tramos.');outputs.push(['joined.mp4','-editado']);
  }else ranges.forEach((_,i)=>outputs.push([`part${i}.mp4`,mode==='half'?`-mitad-${i+1}`:'-editado']));
  for(const [out,suffix]of outputs){const data=await ff.readFile(out);if(token!==operation)throw new Error('Cancelado');await addResult(new Blob([data],{type:'video/mp4'}),core.safeName(file.name)+suffix+'.mp4','video/mp4');}
}
async function doExport(){if(busy)return;const token=++operation;clearResults();setBusy(true);$('source-video').pause();$('play').textContent='▶ Reproducir';
  try{if(isVideo)await exportVideo(token);else await exportPhoto();if(token!==operation)return;progress(100);$('summary').textContent=results.length===2?'Tus dos mitades están listas':'Tu copia está lista';message('Revisa la vista previa y pulsa Descargar copia para guardarla.');if(Capacitor.isNativePlatform())message('Revisa la vista previa y pulsa Guardar o compartir para elegir el destino.');}
  catch(error){if(token===operation){clearResults();$('summary').textContent='No se ha exportado';message(error.message||'No se pudo exportar el archivo.',true);}}
  finally{if(token===operation){if(engine){engine.terminate();engine=null;}setBusy(false);}}
}
function cancel(){if(!busy)return;operation++;if(engine){engine.terminate();engine=null;}clearResults();setBusy(false);$('summary').textContent='Exportación cancelada';message('Puedes ajustar el archivo y volver a guardar.');}
function demo(){const c=document.createElement('canvas');c.width=1400;c.height=950;const x=c.getContext('2d');let g=x.createLinearGradient(0,0,0,950);g.addColorStop(0,'#92a8a5');g.addColorStop(.53,'#d8c9a1');g.addColorStop(1,'#71856c');x.fillStyle=g;x.fillRect(0,0,1400,950);
  x.fillStyle='#eee0ac';x.beginPath();x.arc(1040,235,60,0,Math.PI*2);x.fill();
  const mountain=(points,color)=>{x.fillStyle=color;x.beginPath();x.moveTo(0,950);for(const [a,b]of points)x.lineTo(a,b);x.lineTo(1400,950);x.fill();};
  mountain([[0,560],[160,350],[310,500],[590,180],[850,505],[1050,290],[1400,620]],'#778e83');mountain([[0,720],[260,500],[430,640],[740,375],[950,600],[1190,440],[1400,700]],'#4f7061');
  mountain([[0,790],[280,650],[450,765],[720,615],[930,690],[1120,620],[1400,785]],'#365849');
  x.fillStyle='#b2bca0';x.beginPath();x.moveTo(795,665);x.bezierCurveTo(700,790,1120,840,930,950);x.lineTo(630,950);x.bezierCurveTo(850,810,620,780,795,665);x.fill();
  for(let i=0;i<38;i++){const a=i*47%1420,b=785+(i*31%160),s=13+(i*7%32);x.fillStyle=i%2?'#294e3f':'#224a3b';x.beginPath();x.moveTo(a,b-s*2);x.lineTo(a-s,b+s);x.lineTo(a+s,b+s);x.fill();}
  source=c;width=c.width;height=c.height;configure();$('summary').textContent='Listo para un pequeño cambio';}
let gesture=null;
$('stage').addEventListener('pointerdown',e=>{if(busy||e.button>0)return;remember();const b=$('stage').getBoundingClientRect(),x=(e.clientX-b.left)/b.width*100,y=(e.clientY-b.top)/b.height*100;const isFull=edit.crop.w>99.9&&edit.crop.h>99.9;gesture={id:e.pointerId,x,y,c:structuredClone(edit.crop),kind:e.target.closest('.resize')?'resize':e.target.closest('#selection')&&!isFull?'move':'new'};$('stage').setPointerCapture(e.pointerId);e.preventDefault();});
$('stage').addEventListener('pointermove',e=>{if(!gesture)return;const b=$('stage').getBoundingClientRect(),x=core.clamp((e.clientX-b.left)/b.width*100,0,100),y=core.clamp((e.clientY-b.top)/b.height*100,0,100),g=gesture;let c;
  if(g.kind==='move')c={...g.c,x:core.clamp(g.c.x+x-g.x,0,100-g.c.w),y:core.clamp(g.c.y+y-g.y,0,100-g.c.h)};
  else if(g.kind==='resize')c=fitRatio({...g.c,w:core.clamp(g.c.w+x-g.x,1,100-g.c.x),h:core.clamp(g.c.h+y-g.y,1,100-g.c.y)});
  else c=fitRatio({x:Math.min(x,g.x),y:Math.min(y,g.y),w:Math.max(1,Math.abs(x-g.x)),h:Math.max(1,Math.abs(y-g.y))});
  edit.crop=c;updateSelection();invalidate();});
for(const ev of ['pointerup','pointercancel'])$('stage').addEventListener(ev,()=>gesture=null);
$('open').onclick=()=>$('file').click();$('file').onchange=e=>loadFile(e.target.files[0]);
for(const ev of ['dragover','dragenter'])$('dropzone').addEventListener(ev,e=>{e.preventDefault();$('dropzone').classList.add('dragging');});
$('dropzone').addEventListener('dragleave',()=>$('dropzone').classList.remove('dragging'));$('dropzone').addEventListener('drop',e=>{e.preventDefault();$('dropzone').classList.remove('dragging');loadFile(e.dataTransfer.files[0]);});
$('rotate').onclick=$('rotate-right').onclick=()=>turn(90);$('rotate-left').onclick=()=>turn(-90);$('flip').onclick=()=>{remember();edit.flipX=!edit.flipX;draw();invalidate();};
$('crop-tool').onclick=()=>$('ratio').focus();$('reset').onclick=reset;$('undo').onclick=()=>{if(!history.length||busy)return;edit=history.pop();$('ratio').value='free';$('undo').disabled=!history.length;draw();invalidate();};
for(const id of ['crop-x','crop-y','crop-w','crop-h'])$(id).onchange=cropChanged;
$('ratio').onchange=()=>{remember();edit.crop=fitRatio(full());edit.crop.x=(100-edit.crop.w)/2;edit.crop.y=(100-edit.crop.h)/2;updateSelection();invalidate();};
$('full-crop').onclick=()=>{remember();edit.crop=full();$('ratio').value='free';updateSelection();invalidate();};
$('source-video').addEventListener('seeked',()=>{draw();$('current-time').textContent=fmt($('source-video').currentTime);});
$('source-video').addEventListener('ended',()=>{$('play').textContent='▶ Reproducir';});
$('play').onclick=async()=>{if(!isVideo)return;if(source.paused){try{await source.play();$('play').textContent='Ⅱ Pausar';animate();}catch{message('No se puede reproducir este vídeo.',true);}}else{source.pause();$('play').textContent='▶ Reproducir';}};
$('scrub').oninput=()=>{if(isVideo){source.currentTime=Number($('scrub').value);$('current-time').textContent=fmt(source.currentTime);}};
for(const id of ['start','end'])$(id).oninput=timeSummary;
$('mark-start').onclick=()=>{$('start').value=source.currentTime.toFixed(2);timeSummary();};$('mark-end').onclick=()=>{$('end').value=source.currentTime.toFixed(2);timeSummary();};
document.querySelectorAll('[data-mode]').forEach(b=>b.onclick=()=>setMode(b.dataset.mode));
$('export').onclick=doExport;$('cancel').onclick=cancel;
const help=`<h2>Un pequeño cambio, en tres pasos.</h2><ol><li><b>Abre una foto o un vídeo.</b> Usa el botón de arriba o arrastra el archivo sobre la vista previa.</li><li><b>Elige el encuadre.</b> Arrastra la esquina inferior derecha para reducir el marco; arrastra dentro para moverlo. También puedes introducir porcentajes, elegir una proporción, girar 90° o reflejar.</li><li><b>Guarda una copia.</b> Revisa el resultado y descárgalo. En Android, usa Guardar o compartir.</li></ol><p><b>Vídeo:</b> marca inicio y fin en segundos o mueve la posición y usa los botones de marca. Conserva un tramo, quítalo y une los extremos, o divide en dos archivos iguales. Cada mitad se guarda por separado. El corte se ajusta al fotograma más cercano (salida de 30 fps).</p><p><b>Formatos:</b> fotos JPG, PNG, WebP y los que abra tu navegador; GIF se guarda como imagen fija. Vídeos que pueda previsualizar el navegador, normalmente MP4/H.264 y WebM. Salida MP4, con sonido salvo que marques quitarlo.</p><p><b>Límites:</b> 200 MB por archivo y 40 millones de píxeles. El vídeo usa memoria y puede tardar; deja abierta la aplicación. En móvil, convienen clips cortos y salida 720p. Los metadatos EXIF de las fotos no se conservan. No hay edición multipista, filtros ni unión de archivos diferentes.</p><p><a href="https://github.com/Peskysa/marco-editor/blob/main/docs/MANUAL.md" target="_blank" rel="noopener">Manual completo ↗</a></p>`;
function info(html){$('dialog-content').innerHTML=html;$('info-dialog').showModal();}
$('help').onclick=()=>info(help);$('privacy').onclick=()=>info('<h2>Tus archivos, en tu dispositivo.</h2><p>Las fotos y vídeos se procesan en la memoria de tu navegador. No se suben al alojamiento ni se envían a terceros. No hay cuentas, analítica, anuncios ni telemetría añadida por Marco Editor.</p><p>El alojamiento recibe las peticiones necesarias para servir la aplicación y sus recursos. El motor de vídeo se descarga desde el mismo sitio (unos 32 MB). La aplicación puede guardar una copia de sus recursos para funcionar sin conexión. Los archivos elegidos y las copias editadas no se guardan en esa caché.</p><p>Al cerrar o recargar, se pierde la sesión de edición. En Android, las copias que compartes se escriben en la caché privada de la aplicación; puedes vaciarla desde los ajustes del sistema. El destino que elijas al compartir aplica su propia privacidad.</p><p><a href="https://github.com/Peskysa/marco-editor/blob/main/docs/PRIVACIDAD.md" target="_blank" rel="noopener">Leer privacidad ↗</a></p>');
$('close-dialog').onclick=()=>$('info-dialog').close();$('info-dialog').addEventListener('click',e=>{if(e.target===$('info-dialog'))$('info-dialog').close();});
window.addEventListener('resize',draw);window.addEventListener('beforeunload',()=>{if(engine)engine.terminate();});
demo();if('serviceWorker'in navigator&&!Capacitor.isNativePlatform())navigator.serviceWorker.register('sw.js').catch(()=>{});
