import './App.css';
import React, { useState, useEffect } from 'react';
import { bitable, UIBuilder } from "@base-open/web-api";
import callback from './runUIBuilder';
import Config from "./config";

export default function App() {
  const [data, setData] = useState({ t: new Date() });
  useEffect(() => {
    UIBuilder.getInstance('#container', { bitable, callback });
  }, []);
  //监听多维表格选择变化
  useEffect(() => {
    const asyncListen = async () => {
      //监听点击
      const offSel = bitable.base.onSelectionChange((event) => {
        // offSel(); // 取消监听所选数据表变化
        setData({ t: new Date() });
        UIBuilder.getInstance('#container', { bitable, callback });
      })
    }
    asyncListen();
  }, []);
  return (
    <div id='container'></div>
  );
}