'use strict';
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const {spawn,spawnSync}=require('node:child_process');const root=path.resolve(__dirname,'..'),shots=path.join(root,'docs/images'),output=path.join(root,'test-output');
fs.mkdirSync(shots,{recursive:true});fs.mkdirSync(output,{recursive:true});
const port='5196',url=process.env.APP_URL||`http://127.0.0.1:${port}/`;let server;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function start(){if(process.env.APP_URL)return;server=spawn(process.execPath,['scripts/serve.cjs'],{cwd:root,env:{...process.env,PORT:port},stdio:'pipe'});for(let i=0;i<50;i++){try{if((await fetch(url)).ok)return;}catch{}await sleep(100);}throw new Error('No arranca el servidor de pruebas.');}
async function numeric(page,id,value){await page.fill('#'+id,String(value));await page.locator('#'+id).press('Tab');}
async function exported(page,count=1){await page.click('#export');await page.waitForFunction(()=>!document.getElementById('export').disabled,null,{timeout:180000});assert.equal(await page.locator('.result-card').count(),count,await page.textContent('#status'));}
async function download(page,index,name){const [d]=await Promise.all([page.waitForEvent('download'),page.locator('.result-card a').nth(index).click()]);const dest=path.join(output,name);await d.saveAs(dest);return dest;}
async function metadata(page,index){return page.locator('.result-card video').nth(index).evaluate(async v=>{if(v.readyState<1)await new Promise((resolve,reject)=>{v.onloadedmetadata=resolve;v.onerror=reject;});return {width:v.videoWidth,height:v.videoHeight,duration:v.duration};});}
function checkMedia(file,audio=true){const ffmpeg=JSON.parse(fs.readFileSync(path.join(output,'ffmpeg.json'))).ffmpeg;const probe=spawnSync(ffmpeg,['-hide_banner','-i',file,'-f','null','-'],{encoding:'utf8'});assert.equal(probe.status,0,probe.stderr);assert.equal(probe.stderr.includes('Audio:'),audio);if(audio){const pcm=spawnSync(ffmpeg,['-v','error','-i',file,'-vn','-ac','1','-ar','8000','-f','s16le','-'],{maxBuffer:10000000});assert.equal(pcm.status,0);let energy=0;for(let i=0;i+1<pcm.stdout.length;i+=2){energy+=Math.pow(pcm.stdout.readInt16LE(i),2);}assert.ok(Math.sqrt(energy/(pcm.stdout.length/2))>100,'El sonido debe ser audible.');}}
(async()=>{await start();const browser=await chromium.launch({headless:true,channel:process.env.BROWSER_CHANNEL||undefined});const errors=[],external=[],report={};
try{
  const context=await browser.newContext({viewport:{width:1440,height:1100},acceptDownloads:true});const page=await context.newPage();page.on('pageerror',e=>errors.push(e.message));
  await context.route('**/*',route=>{const u=route.request().url();if(u.startsWith(url)||u.startsWith('blob:')||u.startsWith('data:'))return route.continue();external.push(u);return route.abort();});
  await page.goto(url);await page.waitForFunction(()=>document.getElementById('preview').width>0);await page.evaluate(()=>navigator.serviceWorker.ready);await page.reload();
  await page.screenshot({path:path.join(shots,'escritorio.png'),fullPage:true});
  const pixels=Buffer.alloc(200*100*3);for(let y=0;y<100;y++)for(let x=0;x<200;x++){const rgb=y<50?(x<100?[255,0,0]:[0,255,0]):(x<100?[0,0,255]:[255,255,0]);for(let c=0;c<3;c++)pixels[(y*200+x)*3+c]=rgb[c];}
  const fixture=path.join(root,'tests/fixtures/foto.png');await sharp(pixels,{raw:{width:200,height:100,channels:3}}).png().toFile(fixture);
  await page.setInputFiles('#file',fixture);await page.waitForFunction(()=>document.getElementById('filename').textContent==='foto.png');
  await page.click('#rotate-right');await numeric(page,'crop-w',50);await numeric(page,'crop-h',50);await page.selectOption('#format','image/png');await exported(page);
  let photo=await download(page,0,'rotada.png');const actual=await sharp(photo).raw().toBuffer({resolveWithObject:true});assert.equal(actual.info.width,50);assert.equal(actual.info.height,100);assert.deepEqual([...actual.data.subarray(0,3)],[0,0,255]);report.photoRotationCropPixels=true;
  await page.click('#undo');assert.match(await page.textContent('#output-size'),/50 × 200/);await page.click('#reset');await page.selectOption('#ratio','1');assert.match(await page.textContent('#output-size'),/100 × 100/);report.undoAndRatio=true;
  await page.selectOption('#format','image/jpeg');await exported(page);await download(page,0,'foto.jpg');assert.equal((await sharp(path.join(output,'foto.jpg')).metadata()).format,'jpeg');
  await page.selectOption('#format','image/webp');await exported(page);await download(page,0,'foto.webp');assert.equal((await sharp(path.join(output,'foto.webp')).metadata()).format,'webp');report.photoFormats=3;
  await page.setInputFiles('#file',path.join(root,'tests/fixtures/clip.mp4'));await page.waitForFunction(()=>document.getElementById('kind').textContent==='VÍDEO');
  await page.click('#rotate-right');await numeric(page,'crop-w',50);await numeric(page,'crop-h',50);await numeric(page,'start',1);await numeric(page,'end',3);await exported(page);
  let meta=await metadata(page,0);assert.equal(meta.width,120);assert.equal(meta.height,160);assert.ok(Math.abs(meta.duration-2)<.12,JSON.stringify(meta));let movie=await download(page,0,'tramo-girado.mp4');checkMedia(movie);report.videoCropRotateAudio=true;
  await page.screenshot({path:path.join(shots,'funcion.png'),fullPage:true});
  await page.click('#reset');await numeric(page,'start',2);await numeric(page,'end',4);await page.click('[data-mode="remove"]');await exported(page);meta=await metadata(page,0);assert.ok(Math.abs(meta.duration-4)<.16,JSON.stringify(meta));movie=await download(page,0,'sin-centro.mp4');checkMedia(movie);report.removeMiddleJoin=true;
  await page.click('[data-mode="half"]');await exported(page,2);for(let i=0;i<2;i++){meta=await metadata(page,i);assert.ok(Math.abs(meta.duration-3)<.12,JSON.stringify(meta));checkMedia(await download(page,i,`mitad-${i}.mp4`));}report.halves=true;
  await page.click('#reset');await page.check('#mute');await numeric(page,'end',1);await exported(page);checkMedia(await download(page,0,'sin-sonido.mp4'),false);report.mute=true;
  await page.setInputFiles('#file',path.join(root,'tests/fixtures/silent.mp4'));await page.waitForFunction(()=>document.getElementById('filename').textContent==='silent.mp4');await numeric(page,'end',1);await exported(page);checkMedia(await download(page,0,'sin-pista-audio.mp4'),false);report.silentSource=true;
  await numeric(page,'start',0);await numeric(page,'end',6);await page.click('[data-mode="remove"]');await exported(page,0);assert.match(await page.textContent('#status'),/quitar el vídeo entero/);report.invalidSelection=true;
  await page.click('[data-mode="keep"]');await page.click('#export');await page.click('#cancel');assert.match(await page.textContent('#summary'),/cancelada/);await numeric(page,'end',1);await exported(page);report.cancelAndRetry=true;
  await page.setViewportSize({width:390,height:844});assert.equal(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);await page.screenshot({path:path.join(shots,'movil.png'),fullPage:true});report.mobileLayout=true;
  // La aplicación y el motor usados deben continuar disponibles con la red cortada.
  await context.setOffline(true);await page.reload();await page.setInputFiles('#file',path.join(root,'tests/fixtures/clip.mp4'));await page.waitForFunction(()=>document.getElementById('kind').textContent==='VÍDEO');await numeric(page,'end',1);await exported(page);report.offlineVideo=true;await context.setOffline(false);
  assert.deepEqual(errors,[]);assert.deepEqual(external,[]);report.externalRequests=0;report.pageErrors=0;
  fs.writeFileSync(path.join(output,'browser-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
}finally{await browser.close();if(server)server.kill();}
})().catch(e=>{console.error(e);if(server)server.kill();process.exit(1);});
