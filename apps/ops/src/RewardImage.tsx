import React from 'react';
import type {Schemas} from '@ymm/sdk';
import {artwork} from './assets';
type Reward=Schemas['Reward'];
export const kindLabels={physical:'实物奖品',service:'服务体验',application:'专项申请'};
export function RewardImage({reward, large = false}: {reward: Reward; large?: boolean}) {
 const src = artwork[`${reward.id}-main`];
 return <div className={large ? 'reward-visual large' : 'reward-visual'}>{src ? <img src={src} alt={`${reward.name}，示意图／模拟奖品`} loading="lazy"/> : <span>示意图待补充</span>}{large && <span className="image-label">示意图 / 模拟奖品</span>}</div>;
}
