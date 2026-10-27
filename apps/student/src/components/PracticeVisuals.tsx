import {Image,Text,View} from '@tarojs/components';
import {artwork} from '../assets';
export function SceneCover({src,label}:{src:string;label:string}){
 return <View className='v3-cover'><Image src={src} mode='aspectFill' lazyLoad aria-label={label+'，AI场景示意'}/><Text>AI 场景示意 · {label}</Text></View>;
}
/** Four contractual project stages, not estimated task completion. */
export function StageProgress({completed}:{completed:number}){
 return <View className='v3-stage-progress' aria-label={'已独立验收 '+completed+' / 4 阶段'}>{[1,2,3,4].map(stage=><View key={stage} className={stage<=completed?'complete':stage===completed+1?'current':''}><Text>{stage<=completed?'✓':'0'+stage}</Text><Text>阶段 {stage}</Text><Text>{stage<=completed?'已验收':stage===completed+1?'下一阶段':'尚未开始'}</Text></View>)}</View>;
}
export function EmptyNotice({title,detail}:{title:string;detail:string}){
 return <View className='panel empty'><Image className='artwork' src={artwork['empty-1']} mode='aspectFit' lazyLoad aria-label='暂无记录示意'/><Text className='section-title'>{title}</Text><Text className='hint'>{detail}</Text></View>;
}
