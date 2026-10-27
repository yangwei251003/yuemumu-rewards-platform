import hero from './v3/campus-fpv.jpg';
import engineering from './v3/safe-workbench.jpg';
import project from './v3/campus-team.jpg';
import learning from './v3/theory-desk.jpg';
export const scenes={hero,fpv:hero,training:hero,engineering,learning,project,club:project,competition:hero};
export function activityScene(title:string,rule:string){
 if(rule==='MEETING'||/会议|社团|志愿/.test(title))return {image:scenes.club,label:'社团活动'};
 if(/装调|维修|调参|组装/.test(title))return {image:scenes.engineering,label:'工程实践'};
 if(/FPV|穿越/i.test(title))return {image:scenes.fpv,label:'FPV训练'};
 if(/理论|课程|学习/.test(title))return {image:scenes.learning,label:'技能学习'};
 if(/比赛|竞赛/.test(title))return {image:scenes.competition,label:'竞赛实践'};
 return {image:scenes.training,label:'飞行实践'};
}
