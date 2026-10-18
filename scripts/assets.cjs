'use strict';
const fs=require('node:fs'),path=require('node:path'),sharp=require('sharp');
const root=path.resolve(__dirname,'..'),dir=path.join(root,'assets');fs.mkdirSync(dir,{recursive:true});
const icon=`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><rect width="512" height="512" rx="108" fill="#294e41"/><path d="M140 95v257c0 23 18 41 41 41h237M95 140h257c23 0 41 18 41 41v237" fill="none" stroke="#dce6bc" stroke-width="34" stroke-linecap="round"/><path d="M223 218l94 55-94 55z" fill="#dce6bc"/><circle cx="294" cy="188" r="20" fill="#cc975e"/></svg>`;
fs.writeFileSync(path.join(dir,'icon.svg'),icon);
const banner=`<svg xmlns="http://www.w3.org/2000/svg" width="1440" height="400" viewBox="0 0 1440 400"><rect width="1440" height="400" fill="#f0f2e8"/><path d="M1050 400l150-290 240 290" fill="#c8d4bb"/><path d="M900 400l180-210 170 210" fill="#91a383"/><path d="M1140 110h220v220m-290-70V70h220" fill="none" stroke="#294e41" stroke-width="8"/><circle cx="1285" cy="130" r="25" fill="#c99763"/><text x="88" y="100" font-family="Arial,sans-serif" font-size="17" fill="#768965" letter-spacing="5">COLECCIÓN MARCO PESCADOR</text><text x="80" y="210" font-family="Arial,sans-serif" font-size="84" fill="#294e41">Marco Editor</text><text x="85" y="270" font-family="Arial,sans-serif" font-size="27" fill="#71816a">Fotos y vídeos. Justo como los quieres.</text><text x="85" y="340" font-family="Arial,sans-serif" font-size="18" fill="#71816a">Linux · Windows · Portable · Web · Android</text></svg>`;
fs.writeFileSync(path.join(dir,'banner.svg'),banner);
(async()=>{for(const size of [192,512])await sharp(Buffer.from(icon)).resize(size,size).png().toFile(path.join(dir,`icon-${size}.png`));
  for(const [density,size]of Object.entries({mdpi:48,hdpi:72,xhdpi:96,xxhdpi:144,xxxhdpi:192})){
    const target=path.join(root,'android/app/src/main/res',`mipmap-${density}`);if(!fs.existsSync(target))continue;
    for(const name of ['ic_launcher.png','ic_launcher_round.png'])await sharp(Buffer.from(icon)).resize(size,size).png().toFile(path.join(target,name));
    await sharp(Buffer.from(icon)).resize(size,size).extend({top:Math.round(size*.625),bottom:Math.round(size*.625),left:Math.round(size*.625),right:Math.round(size*.625),background:'#294e41'}).png().toFile(path.join(target,'ic_launcher_foreground.png'));
  }
  const res=path.join(root,'android/app/src/main/res');if(fs.existsSync(res)){
    for(const entry of fs.readdirSync(res)){const target=path.join(res,entry,'splash.png');if(fs.existsSync(target))await sharp(Buffer.from(icon)).resize(160,160).extend({top:432,bottom:432,left:432,right:432,background:'#f6f5f0'}).png().toFile(target);}
    fs.writeFileSync(path.join(res,'values/ic_launcher_background.xml'),'<resources><color name="ic_launcher_background">#294e41</color></resources>\n');
  }
  console.log('Icono y banner originales generados.');})();
