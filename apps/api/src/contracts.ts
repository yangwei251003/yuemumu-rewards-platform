import fs from 'node:fs';
import Ajv,{type ValidateFunction} from 'ajv';
import addFormats from 'ajv-formats';
import {sha} from '../../../packages/domain/src/ledger';
interface Parameter {in:string;name:string;required?:boolean;schema:Record<string,unknown>;$ref?:string;}
export interface Operation {operationId:string;'x-capability-status':string;'x-audience':string;parameters?:Parameter[];requestBody?:{content:{'application/json':{schema:object}}};responses:Record<string,{content?:{'application/json':{schema:object}}}>;}
const source=fs.readFileSync('packages/contracts/openapi.json','utf8');
export const contract=JSON.parse(source) as {info:{version:string};paths:Record<string,Record<string,Operation>>;components:{parameters:Record<string,Parameter>}};
export const contractHash=sha(source);
const ajv=new Ajv({strict:false,allErrors:true});addFormats(ajv);ajv.addSchema(contract,'urn:ymm:contract');
function externalRefs(value:object):object{return JSON.parse(JSON.stringify(value).replaceAll('"#/components/','"urn:ymm:contract#/components/'));}
export const compile=(schema:object)=>ajv.compile(externalRefs(schema));
export const validators=new Map<string,{body?:ValidateFunction;response:ValidateFunction}>();
for(const methods of Object.values(contract.paths))for(const op of Object.values(methods))if(op.operationId)validators.set(op.operationId,{body:op.requestBody?compile(op.requestBody.content['application/json'].schema):undefined,response:compile(op.responses['200'].content!['application/json'].schema)});
export function matchOperation(method:string,path:string){
 for(const [pattern,methods]of Object.entries(contract.paths)){
  const match=new RegExp('^'+pattern.replace(/\{[^}]+\}/g,'([^/]+)')+'/?$').exec(path);
  const op=methods[method.toLowerCase()];if(match&&op){const keys=[...pattern.matchAll(/\{([^}]+)\}/g)].map(m=>m[1]);return {op,params:Object.fromEntries(keys.map((k,i)=>[k,decodeURIComponent(match[i+1])]))};}
 }
 return null;
}
