'use strict';
const {app,BrowserWindow,session,Menu,dialog}=require('electron');
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
let server,origin;
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.bin':'application/octet-stream','.webmanifest':'application/manifest+json'};
app.whenReady().then(()=>{
  const root=path.resolve(__dirname,'../dist/web');
  server=http.createServer((req,res)=>{
    if(req.headers.host!==new URL(origin).host||!['GET','HEAD'].includes(req.method)){res.writeHead(403);return res.end();}
    let file;try{const p=decodeURIComponent(new URL(req.url,origin).pathname);file=path.resolve(root,'.'+(p.endsWith('/')?p+'index.html':p));}catch{res.writeHead(400);return res.end();}
    if(!file.startsWith(root+path.sep)){res.writeHead(403);return res.end();}
    fs.readFile(file,(error,data)=>{if(error){res.writeHead(404);return res.end();}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Content-Security-Policy':"default-src 'self' blob:; script-src 'self' 'wasm-unsafe-eval' blob:; worker-src 'self' blob:; style-src 'self' 'unsafe-inline'; img-src 'self' blob: data:; media-src 'self' blob:; connect-src 'self' blob:; object-src 'none'; base-uri 'self'; frame-ancestors 'none'"});res.end(req.method==='HEAD'?undefined:data);});
  });
  server.listen(0,'127.0.0.1',()=>{
    origin=`http://127.0.0.1:${server.address().port}`;
    const ses=session.defaultSession;ses.setPermissionRequestHandler((_w,_p,cb)=>cb(false));ses.setPermissionCheckHandler(()=>false);
    ses.webRequest.onBeforeRequest((details,callback)=>callback({cancel:!details.url.startsWith(origin+'/')&&!/^(blob:|data:)/.test(details.url)}));
    Menu.setApplicationMenu(null);
    const win=new BrowserWindow({width:1320,height:1000,minWidth:390,minHeight:600,title:'Marco Editor',icon:path.join(__dirname,'../assets/icon-512.png'),backgroundColor:'#f6f5f0',autoHideMenuBar:true,show:!process.argv.includes('--smoke'),webPreferences:{nodeIntegration:false,contextIsolation:true,sandbox:true,webSecurity:true}});
    win.webContents.setWindowOpenHandler(()=>({action:'deny'}));win.webContents.on('will-navigate',(e,url)=>{if(!url.startsWith(origin+'/'))e.preventDefault();});
    ses.on('will-download',async(_event,item)=>{const choice=await dialog.showSaveDialog(win,{title:'Guardar copia editada',defaultPath:path.join(app.getPath('downloads'),path.basename(item.getFilename()))});if(choice.canceled)item.cancel();else item.setSavePath(choice.filePath);});
    win.loadURL(origin+'/');
    if(process.argv.includes('--smoke')){
      win.webContents.once('did-finish-load',async()=>{try{const report=await win.webContents.executeJavaScript(`({title:document.title,ready:document.querySelector('#preview').width>0,worker:typeof Worker==='function',wasm:typeof WebAssembly==='object'})`);const dest=process.argv[process.argv.indexOf('--smoke')+1];fs.writeFileSync(dest,JSON.stringify(report));if(!report.ready)process.exitCode=1;app.quit();}catch{app.exit(1);}});
    }
  });
});
app.on('window-all-closed',()=>app.quit());app.on('will-quit',()=>{if(server)server.close();});
