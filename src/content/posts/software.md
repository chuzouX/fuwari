---
title: '自用软件合集！'
draft: false
description: '常用软件使用教程及其安装包整理归档'
category: 科技
pinned: true
image: '../assets/images/d2953201ebb73d7d5e945ee9546f393e.jpg'
tags: 
- 软件
- 逆向
- 合集
published: 2025-09-01
---

# 自用软件/站点合集！（持续更新）

## 免责声明

<font color=red>本站所有的软件均来自网络，逆向教程仅用于学习和交流，请在软件下载24小时内删除</font>

## 软件/站点目录

**本文章所含软件教程均来自本站**
**如需查看单个软件 可以在本站找到原文**

- [Typora](#typora)
- [IDM](#idm)

## Typora

### 介绍

一款 Markdown 编辑器和阅读器

**官方售价**：89元 / 3台设备 / 免费升级

**支持平台**：Mac、Windows、Linux

### 下载

下载链接：[请点击此处](https://typora.io/releases/all)

推荐下载版本1.10.8

### 白嫖教程

本软件使用**明文校验**的方式进行正版验证

#### （一）、下载并安装*

下载链接：[https://typora.io/releases/all](https://typora.io/releases/all)（选择1.10.8）

<font color=red>亲测在1.11.*版本加入了js校验 更改文件就会闪退</font>

#### （二）、修改文件*
在安装位置中进入如下路径

此处是安装路径 \typora\resources\page-dist\static\js

找到**LicenseIndex.xxxxxxxxxxx.chunk**文件并用文本/代码编辑软件打开

将

> e.hasActivated="true"==e.hasActivated,

替换为

> e.hasActivated="true"=="true",

![image-20250901193229349](../assets/images/image-20250901193229349.png)

#### （三）、更改注册表

<font color=red>如果忽略此步可能会导致软件闪退</font>

Win+R键输入**regedit**打开注册表

![image-20250901192912535](../assets/images/image-20250901192912535.png)

输入或找到如下路径

> 计算机\HKEY_CURRENT_USER\Software\Typora

右键此项打开权限页面

![image-20250901193346921](../assets/images/image-20250901193346921.png)

将Administrators右侧权限改为拒绝 保存并应用即可

<font color=red>此时打开软件已经变为已激活状态</font>

#### （四）、关闭软件每次启动时的已激活弹窗

打开编辑如下文件

> Typora\resources\page-dist\static\js\0.99879679.chunk.js

将

 ``` javascript
 var div = document.createElement('div');
 
 div.id = 'myOverlay';
 
 div.style.position = 'fixed';
 div.style.top = '0';
 div.style.left = '0';
 div.style.width = '100vw'; 
 div.style.height = '100vh';
 div.style.backgroundColor = 'rgb(54,59,64)'; 
 div.style.zIndex = '9999'; 
 
 document.body.appendChild(div);
 
 setTimeout(function () {
  var overlay = document.getElementById('myOverlay');
  if (overlay) {
      overlay.remove(); 
  }
 
  document.querySelector('.default-btn.secondary-btn').click(); 
 
 }, 360);
 ```

插入到第一行注释和(this.xxxxxxxxxx)中间

![image-20250901193808675](../assets/images/image-20250901193808675.png)

#### （五）、去除软件左下角未激活提示

打开编辑如下文件

> Typora\resources\locales\zh-Hans.lproj\Panel.json 

将

> "UNREGISTERED":"未激活"

替换为

> "UNREGISTERED":"已激活"

## IDM

### 介绍

IDM是一款功能强大的下载管理软件，它可以帮助用户加速下载速度、恢复中断的下载、管理下载任务以及组织文件。IDM支持HTTP、FTP、HTTPS、HTTP2等协议，并能与大多数浏览器集成，提供无缝的下载体验。

**官方售价**：83.95元/年（单台）185元/永久（单台）
69.95元/年（两台每台）140元/永久（两台每台）

**支持平台**：Windows

### 下载

下载链接：[请点击此处](https://www.internetdownloadmanager.com/download.html)

### 白嫖教程

本软件使用以下项目进行破解

::github{repo="lstprjct/IDM-Activation-Script"}

#### （一）、下载并安装*

下载链接：[https://www.internetdownloadmanager.com/download.html](https://www.internetdownloadmanager.com/download.html)

下载完安装包后 一路确定即可安装成功

打开关于我们发现版本显示**未注册**

![image-20250922165817564](../assets/images/image-20250922165817564.png)

#### （二）、下载破解脚本*

下载链接：[https://github.com/lstprjct/IDM-Activation-Script/releases](https://github.com/lstprjct/IDM-Activation-Script/releases)

选择最新版本的补丁下载

![image-20250922170143311](../assets/images/image-20250922170143311.png)

#### （三）、使用破解补丁*

将下载到的文件解压到文件根目录

![image-20250922170626571](../assets/images/image-20250922170626571.png)

运行**IAS.cmd**脚本

![image-20250922170732731](../assets/images/image-20250922170732731.png)

**输入1进入激活模式** 根据提示进行确定操作

![image-20250922170844475](../assets/images/image-20250922170844475.png)

#### （四）、检查IDM是否已被激活

**再次打开关于页面 查看是否被激活**

![image-20250922171236178](../assets/images/image-20250922171236178.png)

看到序列号就说明已经被完美激活

**根据实测 此激活版本可正常更新 但非常不建议这么做**

## 温馨提示

<font color=red>没事别更新！没事别更新！没事别更新！</font>
