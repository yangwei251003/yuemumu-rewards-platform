import fs from 'node:fs';
import {createHash} from 'node:crypto';
import SwaggerParser from '@apidevtools/swagger-parser';
import openapiTS,{astToString} from 'openapi-typescript';
async function main(){
 const source=fs.readFileSync('packages/contracts/openapi.json','utf8');
 await SwaggerParser.validate(JSON.parse(source));
 const generated=astToString(await openapiTS(JSON.parse(source)));
 const c=JSON.parse(source) as {paths:Record<string,Record<string,{operationId:string;'x-capability-status':string}>>};
 const ops:Record<string,{method:string;path:string;capability:string}>={};
 for(const [path,methods]of Object.entries(c.paths))for(const [method,op]of Object.entries(methods))if(op.operationId)ops[op.operationId]={method:method.toUpperCase(),path,capability:op['x-capability-status']};
 const files={'packages/sdk/src/generated.ts':generated,'packages/sdk/src/operations.ts':'// Generated from OpenAPI; do not edit.\nexport const operations = '+JSON.stringify(ops,null,2)+' as const;\n','packages/contracts/sha256.txt':createHash('sha256').update(source).digest('hex')+'\n'};
 for(const [path,content]of Object.entries(files)){
  if(process.argv.includes('--check')){if(!fs.existsSync(path)||fs.readFileSync(path,'utf8')!==content)throw new Error('Contract drift: '+path);}
  else{fs.mkdirSync(path.slice(0,path.lastIndexOf('/')),{recursive:true});fs.writeFileSync(path,content);}
 }
 console.log('PASS OpenAPI validation + generated DTO/operation/contract hash '+(process.argv.includes('--check')?'drift check':'generation'));
}
main().catch(e=>{console.error(e);process.exitCode=1;});
