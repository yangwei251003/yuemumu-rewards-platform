import React from 'react';
import {Alert,Button} from 'antd';
export default class RouteBoundary extends React.Component<{children:React.ReactNode},{failed:boolean}> {
 state={failed:false};
 static getDerivedStateFromError(){return {failed:true};}
 render(){return this.state.failed?<section className="panel"><Alert showIcon type="error" message="工作页面未能载入" description="请确认网络和本地服务正常后，重新载入页面。已提交记录以服务端为准。"/><Button onClick={()=>window.location.reload()}>重新载入页面</Button></section>:this.props.children;}
}
