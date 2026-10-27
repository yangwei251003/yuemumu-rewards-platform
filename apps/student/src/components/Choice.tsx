import {useEffect,useState,type ReactNode} from 'react';
import {createPortal} from 'react-dom';
import {View,Text,Button,Picker,ScrollView} from '@tarojs/components';
type Props={mode:'selector';range:string[];value:number;disabled?:boolean;onChange:(event:{detail:{value:string|number}})=>void;children:ReactNode};
export default function Choice(props:Props){
 const [open,setOpen]=useState(false);
 useEffect(()=>{if(process.env.TARO_ENV!=='h5'||!open)return;const page=document.querySelector<HTMLElement>('.taro_page_show');const previous=document.body.style.overflow,pageOverflow=page?.style.overflow;document.body.style.overflow='hidden';if(page)page.style.overflow='hidden';return()=>{document.body.style.overflow=previous;if(page)page.style.overflow=pageOverflow??'';};},[open]);
 useEffect(()=>{if(props.disabled)setOpen(false);},[props.disabled]);
 if(process.env.TARO_ENV==='weapp')return <Picker {...props}/>;
 return <><Button className='selector-trigger' disabled={props.disabled?true:undefined} onClick={()=>setOpen(true)} aria-haspopup='dialog'>{props.children}</Button>{open&&createPortal(<View className='selection-mask' onClick={()=>setOpen(false)}><View className='selection-dialog' role='dialog' aria-modal aria-label='选择选项' onClick={e=>e.stopPropagation()}><View className='section-heading'><Text className='section-title'>请选择</Text><Button className='text-button' onClick={()=>setOpen(false)}>关闭选择</Button></View><ScrollView scrollY className='selection-options'>{props.range.map((label,index)=><Button key={index} className={'selection-option '+(props.value===index?'selected':'')} onClick={()=>{props.onChange({detail:{value:String(index)}});setOpen(false);}}><Text>{label}</Text>{props.value===index&&<Text>已选</Text>}</Button>)}</ScrollView></View></View>,document.body)}</>;
}
