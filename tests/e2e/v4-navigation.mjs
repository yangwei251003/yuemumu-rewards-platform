// Navigate through the actual V4 controls; legacy business assertions stay in their original tests.
export async function studentNav(page,label){
 const main=['发现','我的实践','奖励','我的'].includes(label)?label:'我的';
 await page.locator('.nav-item').filter({has:page.getByText(main,{exact:true})}).click();
 if(label==='成长'){await page.getByText('展开或收起钱包状态',{exact:true}).count();const toggle=page.getByRole('button',{name:'展开或收起钱包状态',exact:true});if(await toggle.getAttribute('aria-expanded')!=='true')await toggle.click();}
 else if(main!==label)await page.locator('.profile-link').filter({has:page.getByText(label,{exact:true})}).click();
}
