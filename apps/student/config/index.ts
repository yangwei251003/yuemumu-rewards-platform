import {defineConfig} from '@tarojs/cli';
const apiBase=process.env.TARO_APP_API_BASE;if(process.env.TARO_ENV==='weapp'&&(!apiBase||!/^https?:\/\//.test(apiBase)))throw new Error('微信构建必须显式设置 TARO_APP_API_BASE');
export default defineConfig({
 defineConstants:{'process.env.TARO_APP_API_BASE':JSON.stringify(apiBase||'')},
 projectName:'yuemumu-student',date:'2026-09-06',designWidth:750,deviceRatio:{750:1},
 sourceRoot:'src',outputRoot:process.env.TARO_ENV==='weapp'?'dist-weapp':'dist',framework:'react',compiler:{type:'vite',vitePlugins:[{name:'ymm-taro-legacy-sass-compat',config:()=>({css:{preprocessorOptions:{scss:{api:'legacy'},sass:{api:'legacy'}}}})}]},
 plugins:['@tarojs/plugin-platform-h5','@tarojs/plugin-platform-weapp'],
 mini:{imageUrlLoaderOption:{limit:false,name:(file:string)=>'assets/'+file.split(/[\\/]/).pop()}},h5:{publicPath:'/',router:{mode:'browser'},imageUrlLoaderOption:{limit:false},postcss:{url:{enable:false}}}
});
