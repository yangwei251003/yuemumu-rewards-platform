import {Image,Text,View} from '@tarojs/components';
import {visual} from '../assets/visual';

export function BrandHeader(){
 return <View className='masthead'><View><Text className='brand'>粤木木<Text className='brand-dot'> / </Text>木能量</Text><Text className='eyebrow'>竞野穿越机俱乐部 · 成长平台</Text></View><View className='club-brand'><Image src={visual.club} mode='aspectFit' aria-label='竞野穿越机俱乐部提供的 Logo'/></View></View>;
}
export function BrandFooter(){
 return <View className='footer'><Image className='school-brand' src={visual.school} mode='aspectFit' aria-label='广州科技职业技术大学 Logo'/><Text>人工智能与大数据学院</Text><Text>木能量、成长里程与技能资格独立记录</Text></View>;
}
