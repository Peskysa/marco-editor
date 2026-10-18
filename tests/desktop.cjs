const {_electron:electron}=require('playwright'),assert=require('node:assert/strict'),path=require('node:path'),fs=require('node:fs');
(async()=>{
  const root=path.resolve(__dirname,'..'),errors=[];const instance=await electron.launch({executablePath:path.resolve(process.argv[2]),args:[],timeout:60000});
  try{const page=await instance.firstWindow();page.on('pageerror',e=>errors.push(e.message));await page.waitForFunction(()=>document.getElementById('preview')?.width>0);
    await page.setInputFiles('#file',path.join(root,'tests/fixtures/clip.mp4'));await page.waitForFunction(()=>document.getElementById('kind').textContent==='VÍDEO');
    await page.fill('#end','1');await page.locator('#end').press('Tab');await page.click('#export');await page.waitForFunction(()=>!document.getElementById('export').disabled,null,{timeout:180000});
    assert.equal(await page.locator('.result-card').count(),1,await page.textContent('#status'));
    const video=await page.locator('.result-card video').evaluate(async v=>{if(v.readyState<1)await new Promise(r=>v.onloadedmetadata=r);return {width:v.videoWidth,height:v.videoHeight,duration:v.duration};});
    assert.equal(video.width,320);assert.equal(video.height,240);assert.ok(Math.abs(video.duration-1)<.12);assert.deepEqual(errors,[]);
    const report={packaged:true,exportedMp4:true,video,errors};fs.mkdirSync(path.join(root,'test-output'),{recursive:true});fs.writeFileSync(path.join(root,'test-output/desktop-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
  }finally{await instance.close();}
})().catch(e=>{console.error(e);process.exit(1);});
