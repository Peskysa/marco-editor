'use strict';
const clamp = (value,min,max) => Math.min(max,Math.max(min,value));
function finite(value,name) { const n=Number(value); if(!Number.isFinite(n)) throw new Error(`${name}: introduce un número válido.`); return n; }
function rotation(value) { return ((Math.round(finite(value,'Giro')/90)*90)%360+360)%360; }
function dimensions(w,h,turn=0) { return rotation(turn)%180 ? {width:h,height:w} : {width:w,height:h}; }
function cropPixels(width,height,crop,even=false) {
  width=Math.floor(finite(width,'Anchura'));height=Math.floor(finite(height,'Altura'));
  if(width<2||height<2) throw new Error('La imagen es demasiado pequeña.');
  const step=even?2:1;
  const round=n=>Math.floor(n/step)*step;
  const x=round(clamp(finite(crop.x,'Izquierda'),0,99)*width/100);
  const y=round(clamp(finite(crop.y,'Arriba'),0,99)*height/100);
  const w=round(Math.min(width-x,finite(crop.w,'Anchura del recorte')*width/100));
  const h=round(Math.min(height-y,finite(crop.h,'Altura del recorte')*height/100));
  if(w<step||h<step) throw new Error('El recorte es demasiado pequeño.');
  return {x,y,width:w,height:h};
}
function segments(duration,start,end,mode) {
  duration=finite(duration,'Duración');start=finite(start,'Inicio');end=finite(end,'Fin');
  if(duration<.1) throw new Error('El vídeo debe durar al menos 0,1 segundos.');
  if(mode==='half') return [[0,duration/2],[duration/2,duration]];
  if(start<0||end>duration+.001||end-start<.05) throw new Error('Elige un inicio y un fin dentro del vídeo, separados al menos 0,05 s.');
  end=Math.min(end,duration);
  if(mode==='keep')return [[start,end]];
  if(mode!=='remove')throw new Error('Operación desconocida.');
  const result=[];if(start>=.05)result.push([0,start]);if(duration-end>=.05)result.push([end,duration]);
  if(!result.length)throw new Error('No puedes quitar el vídeo entero. Selecciona un tramo más corto.');
  return result;
}
function videoFilters(width,height,edit) {
  const turn=rotation(edit.rotation), out=[];
  if(turn===90)out.push('transpose=1');if(turn===180)out.push('hflip','vflip');if(turn===270)out.push('transpose=2');
  if(edit.flipX)out.push('hflip');if(edit.flipY)out.push('vflip');
  const d=dimensions(width,height,turn), c=cropPixels(d.width,d.height,edit.crop,true);
  out.push(`crop=${c.width}:${c.height}:${c.x}:${c.y}`);
  const max=Number(edit.maxEdge)||0;
  if(max>0&&Math.max(c.width,c.height)>max)out.push(`scale=${Math.max(2,Math.floor(c.width*max/Math.max(c.width,c.height)/2)*2)}:${Math.max(2,Math.floor(c.height*max/Math.max(c.width,c.height)/2)*2)}`);
  out.push('setsar=1');return out.join(',');
}
function videoCommand(input,output,range,filters,mute=false) {
  const args=['-i',input,'-ss',range[0].toFixed(6),'-t',(range[1]-range[0]).toFixed(6),'-map','0:v:0'];
  if(!mute)args.push('-map','0:a:0?');
  args.push('-vf',filters,'-sn','-dn','-map_metadata','-1','-c:v','libx264','-preset','ultrafast','-crf','21','-pix_fmt','yuv420p','-r','30');
  if(mute)args.push('-an');else args.push('-c:a','aac','-b:a','160k');
  args.push('-movflags','+faststart',output);return args;
}
function safeName(name) {return (name.replace(/\.[^.]+$/,'').replace(/[^\p{L}\p{N} _-]/gu,'_').slice(0,80)||'archivo');}
module.exports={clamp,rotation,dimensions,cropPixels,segments,videoFilters,videoCommand,safeName};
