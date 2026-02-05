
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

console.log("VascularSim: 正在启动应用...");

const rootElement = document.getElementById('root');
if (!rootElement) {
  console.error("VascularSim: 找不到 root 节点！");
  throw new Error("Could not find root element to mount to");
}

try {
  const root = ReactDOM.createRoot(rootElement);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
  console.log("VascularSim: React 挂载成功");
} catch (err) {
  console.error("VascularSim: 渲染出错", err);
}
