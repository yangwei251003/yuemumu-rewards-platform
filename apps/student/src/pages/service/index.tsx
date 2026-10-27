import {useRouter} from '@tarojs/taro';
import {Text} from '@tarojs/components';
import StudentShell from '../../components/StudentShell';
import {usePageCommand,goBack,navigate,type Section} from '../../session';
import {CommandFeedback,Ledger,Privacy,RewardDetail} from '../../views/AccountRewards';
import Activities from '../../components/Activities';
import Projects from '../../components/Projects';
import Learning from '../../components/Learning';
import Orders from '../../components/Orders';
import Commerce,{QualityReturns,Wishes} from '../../components/Commerce';
import {PassiveEligibility} from '../../components/Meetings';
import Membership from '../../components/Membership';
import Governance from '../../components/Governance';
import PointAdjustments from '../../components/PointAdjustments';
import Conversion from '../../components/Conversion';
const sections=['活动','项目','技能','订单','奖励','账本','隐私说明','预约与专项','质量退货','奖励心愿','待结算','入社申请','通知与申诉','积分核对','转化核查'];
function Service({section,id,tab,focus}:{section:Section;id?:string;tab?:string;focus?:string}){
 const state=usePageCommand();if(!state.user)return null;
 const props={...state,user:state.user,initialTarget:{id,tab,focus},openTarget:(targetId:string,targetTab?:string)=>void navigate(section,{id:targetId,tab:targetTab}),onBack:()=>void goBack()};
 return <><CommandFeedback error={state.error} busy={state.busy}/>{section==='活动'&&<Activities {...props} initialActivityId={id}/>}{section==='项目'&&<Projects {...props}/>}{section==='技能'&&<Learning {...props}/>}{section==='订单'&&<Orders {...props} onReturns={()=>void navigate('质量退货')}/>}{section==='奖励'&&(id?<RewardDetail id={id}/>:<Text>请选择一份奖励。</Text>)}{section==='账本'&&<Ledger/>}{section==='隐私说明'&&<Privacy/>}{section==='预约与专项'&&<Commerce {...props}/>}{section==='质量退货'&&<QualityReturns {...props}/>}{section==='奖励心愿'&&<Wishes {...props}/>}{section==='待结算'&&<PassiveEligibility {...props}/>}{section==='入社申请'&&<Membership {...props}/>}{section==='通知与申诉'&&<Governance {...props} onExpired={state.clear}/>}{section==='积分核对'&&<PointAdjustments {...props}/>}{section==='转化核查'&&<Conversion {...props}/>}</>;
}
function decoded(value:string|undefined){if(!value)return value;try{return decodeURIComponent(value);}catch{return undefined;}}
export default function ServicePage(){const router=useRouter();const params=Object.fromEntries(Object.entries(router.params).map(([key,value])=>[key,decoded(value)]));const section=sections.includes(params.section||'')?params.section as Section:'发现';return <StudentShell section={section} detail>{section==='发现'?<Text>此入口已更新，请从底部导航查找。</Text>:<Service section={section} id={params.id} tab={params.tab} focus={params.focus}/>}</StudentShell>;}
