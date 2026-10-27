import Taro from '@tarojs/taro';

// This boundary keeps browser/WeChat services out of the shared business screens.
export const platform={
 sessionTransport:process.env.TARO_ENV==='weapp'?'bearer' as const:'cookie' as const,
 nativeScan:process.env.TARO_ENV==='weapp',
 privateEvidenceUpload:true,
 subscriptionNotifications:false,
};
export async function scanCode():Promise<string>{
 if(!platform.nativeScan)throw new Error('当前H5使用手动输入码。');
 const result=await Taro.scanCode({onlyFromCamera:true,scanType:['qrCode']});
 return result.result.trim();
}
