import http from 'node:http';import fs from 'node:fs';import path from 'node:path';
const c=JSON.parse(fs.readFileSync('.runtime/config.json','utf8'));
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json','.png':'image/png','.svg':'image/svg+xml','.woff2':'font/woff2','.ico':'image/x-icon'};
const server=http.createServer((req,res)=>{
 const host=req.headers.host;if(![`127.0.0.1:${c.gatewayPort}`,`localhost:${c.gatewayPort}`].includes(host)){res.writeHead(403).end('Host rejected');return;}
 let pathname;try{pathname=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
 if(pathname==='/api/v1'||pathname.startsWith('/api/v1/')){
  const proxy=http.request({hostname:'127.0.0.1',port:c.apiPort,path:pathname==='/api/v1/'||pathname==='/api/v1'?'/api/v1/health':req.url,method:req.method,headers:req.headers},upstream=>{res.writeHead(upstream.statusCode,upstream.headers);upstream.pipe(res);});
  proxy.on('error',()=>{res.writeHead(503,{'Content-Type':'application/json'}).end(JSON.stringify({code:'API_UNAVAILABLE',message:'本地 API 未启动',requestId:'gateway'}));});req.pipe(proxy);return;
 }
 if(pathname.startsWith('/api/')){res.writeHead(404,{'Content-Type':'application/json'}).end(JSON.stringify({code:'NOT_FOUND',message:'接口不存在',requestId:'gateway'}));return;}
 if(/^\/(uploads|private-files|\.runtime)(\/|$)/.test(pathname)){res.writeHead(404).end('Not found');return;}
 if(req.method!=='GET'&&req.method!=='HEAD'){res.writeHead(405).end();return;}
 if(pathname==='/admin'){res.writeHead(308,{Location:'/admin/'}).end();return;}
 const admin=pathname.startsWith('/admin/');const root=path.resolve(admin?'apps/ops/dist':'apps/student/dist');
 const relative=admin?pathname.slice('/admin/'.length):pathname.slice(1);let file=path.resolve(root,relative||'index.html');
 if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 if(!fs.existsSync(file)||!fs.statSync(file).isFile()){
  if(path.extname(relative)){res.writeHead(404).end('Asset not found');return;}
  file=path.join(root,'index.html');
 }
 if(!fs.existsSync(file)){res.writeHead(503).end('Build clients first');return;}
 res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','X-Content-Type-Options':'nosniff','Referrer-Policy':'same-origin','Cache-Control':path.extname(file)==='.html'?'no-cache':'public, max-age=3600'});
 if(req.method==='HEAD'){res.end();return;}fs.createReadStream(file).pipe(res);
});server.listen(c.gatewayPort,'127.0.0.1',()=>console.log(`Built-client gateway http://127.0.0.1:${c.gatewayPort}`));
