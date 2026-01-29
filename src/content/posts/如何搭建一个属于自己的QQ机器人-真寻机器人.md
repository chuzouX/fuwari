---
title: '如何搭建一个属于自己的QQ机器人[真寻机器人]'
draft: false
description: 'QQ机器人[真寻机器人]搭建教程'
category: 机器人
image: 'https://pic.imgdb.cn/item/631188f416f2c2beb1d683cb.jpg'
tags:
- 科技
- go-cqhttp
- nonebot2
- 真寻机器人
- QQ机器人
published: 2022-09-01
---
# 如何搭建一个QQ机器人【真寻机器人】

## 目录

- [安装go-cqhttp](#go-cqhttp)
- [安装Postgresql数据库](#Postgresql)
- [安装真寻bot](#zhenxun_bot)
- [Linux下持久化运行](#Linux下持久化运行)(Windows用户请跳过)
- [安装使用WebUi](#安装使用WebUi)(可选)

---

## <a id="go-cqhttp" style="color: black">安装go-cqhttp</a>

### 什么是go-cqhttp

>go-cqhttp 是什么？
>使用OneBot协议实现的无头QQ，接受消息发往后端处理

> **<font style="color:red">你也可以理解为QQ客户端</font>**

### 如何安装go-cqhttp

1. 从[Mrs4s / go-cqhttp (opens new window)](https://github.com/Mrs4s/go-cqhttp)的Release中下载与你系统对应的最新版本

   由于github属于半墙状态，所以下载会比较慢，您可以选择耐心等待，也可以安装[fastgithub(opens new window)](https://github.com/dotnetcore/fastgithub/releases)来提升你的下载速度

2. 将你下载好的文件存放到任意一个文件夹

   Windows：

   ​		直接双击文件运行

   ![image-20220901132909606](https://pic.imgdb.cn/item/6311866f16f2c2beb1d4f4f0.png)

   ​		点击确定后，使用安全启动脚本启动即可

   ![image-20220901134320063](https://pic.imgdb.cn/item/631186e516f2c2beb1d5273a.png)

   Linux：

   ​		下载您对应的压缩包后使用`tar -zxvf 文件名称.tar.gz`

   ![image-20220901134620628](https://pic.imgdb.cn/item/6311870116f2c2beb1d532fd.png)

   ​		解压完毕后请检查此目录下是否存在名为`go-cqhttp`的文件

   ![image-20220901134807141](https://pic.imgdb.cn/item/6311871816f2c2beb1d53c79.png)

   ​		若并没有此文件请再次尝试以上步骤，若有此文件，请使用`./go-cqhttp`命令启动

3. 首次运行会让你选择通信方式，选择 `3` (反向 Websocket 通信)，会生成一个配置文件**config.yml**

   ![image-20220901135020294](https://pic.imgdb.cn/item/6311872716f2c2beb1d54294.png)

4. 打开**config.yml**文件，将uin修改为bot账号

   ![image-20220901135209163](https://pic.imgdb.cn/item/6311873a16f2c2beb1d54ba7.png)

5. 在**config.yml**文件中将
   `universal: ws://your_websocket_universal.server`
   修改为
   `universal: ws://127.0.0.1:8080/onebot/v11/ws/`

   ![image-20220901135314391](https://pic.imgdb.cn/item/6311874c16f2c2beb1d55810.png)

6. 重启go-cqhttp后登录即可

   

   > 因真寻机器人项目使用了语音文件等，该音频需要依赖ffmpeg
   >
   > ```
   > Ubuntu：
   >     sudo apt install -y ffmpeg
   > ```

   > 没有 ws-reverse 怎么办？
   > 第二步的配置文件选错了，删除**config.yml**重新生成即可

## <a id="Postgresql" style="color: black">安装Postgresql数据库</a>

### Windows

1. 在[Postgresql下载页面 (opens new window)](https://www.enterprisedb.com/downloads/postgres-postgresql-downloads)下载对应系统的Postgresql安装程序
2. 选择安装路径，一路next，中途会让你设置以下postgres用户的密码
3. 在安装目录下找到pgAdmin，使用pgAdmin连接数据库，创建连接，新建数据库即可

### Linux (以Ubuntu为例)

1. 安装Postgresql

   ```
    sudo apt update
    sudo apt install postgresql postgresql-contrib
   ```
   
2. 创建数据库和用户
   ```
    sudo su - postgres  # 切换用户
    psql
          #  用户名↓                # 密码↓
    CREATE USER uname WITH PASSWORD 'zhenxun'; # 创建用户
            # 数据库名称↓       所有者↓
    CREATE DATABASE testdb OWNER uname;   # 创建数据库
   ```
   > 到这一步数据库已经可以正常使用了！以下步骤主要用于外网可以连接入服务器数据库，可以等需要的时候再配置。

3. 编辑数据库配置文件（路径请已自己的为准）
   - 打开数据库配置文件
     ```  
     vim /etc/postgresql/12/main/postgresql.conf
     ```
   - 找到 listen_addresses: '*' 取消前面的 # 注释，使用:wq保存退出
     > 建议公网ip同时修改 Port
     
   - 打开 **pg_hba.conf**
     ```
       vim /etc/postgresql/12/main/pg_hba.conf
     ```
   - 在最下添加或修改后，使用:wq保存退出
     ```
       # 允许任意用户从任意机器上以密码方式访问数据库
       host    all             all             0.0.0.0/0               md5
     ```
4. 重启数据库
     ```
      sudo systemctl restart postgresql
     ```

## <a id="zhenxun_bot" style="color: black">安装真寻bot</a>

> 版本警告
>
> 真寻Bot需要python环境为 **<font style="color: red">python3.8</font>** 或 **<font style="color: red">python3.8</font>**

### 开始部署

1. 从 [HibiKier / zhenxun_bot (opens new window)](https://github.com/HibiKier/zhenxun_bot)clone代码 或 直接下载 [压缩包 (opens new window)](https://github.com/HibiKier/zhenxun_bot/archive/refs/heads/main.zip)解压

2. 安装依赖包

   ```shell
   pip3 install poetry     # 使用poetry管理python包
   poetry install          # 安装依赖
   
   poetry shell            # 进入虚拟环境
   
   ## playwright 需要安装额外的系统环境，在命令行输入以下
   playwright install chromium
   
   # 该命令在win下无需输入
   playwright install-deps chromium
   ```

3. 设置超级用户，打开 .env.dev 文件，在SUPERUSERS中添加自己的QQ

   ```text
   SUPERUSERS=["123456789"]
   ```

4. 打开 configs/config.py 填写数据库数据

   ```python
   # 数据库（必要）
   # 如果填写了bind就不需要再填写后面的字段了#）
   # 示例："bind": "postgresql://user:password@127.0.0.1:5432/database"
   bind: str = ""  # 数据库连接链接
   sql_name: str = "postgresql"
   user: str = ""  # 数据用户名
   password: str = ""  # 数据库密码
   address: str = ""  # 数据库地址
   port: str = ""  # 数据库端口
   database: str = ""  # 数据库名称
   
   ############################################################
   ### 如果你是与教程一模一样的命令代码，且数据库也在该服务器上 ###
   ############################################################
   # 可以直接复制以下配置
   bind: str = ""  # 数据库连接链接
   sql_name: str = "postgresql"
   user: str = "uname"
   password: str = "zhenxun"
   address: str = "127.0.0.1"
   port: str = "5432"
   database: str = "testdb"
   ```

5. 启动真寻，会在 configs 和 data/configs 目录下生成各种配置文件

   ```text
   python3 bot.py
   # or
   python bot.py
   ```
6. 打开 configs/config.yaml，里面包含的是各种插件的配置项，填写完毕后重启真寻Bot

## <a id="Linux下持久化运行" style="color: black">Linux下持久化运行</a>

**恭喜！经历困难之后到了最后一步，那就是持久化运行 0v<**

> 本节教程为Linux持久化运行教程，Windows可直接跳过

> 教程中使用的是较为简单的Screen，如果你有其他工具的使用经验，可以跳过本节。

### 即刻开始（以Ubuntu为例）

1. 安装screen

   ```text
   sudo apt install screen
   ```

2. 创建会话

   ```text
   screen -S zhenxun
   ```

3. 进入真寻目录

   ```text
   cd 真寻的存放真寻机器人的目录
   ```

4. 启动！

   ```text
   poetry shell    # 进入虚拟环境
   python3 bot.py
   ```

### 如果退出或关闭后

> 使用以下命令恢复会话
>
> ```text
> screen -r zhenxun
> ```

## <a id="安装使用WebUi" style="color: black">安装使用WebUi</a>

**<font style="font-size: 22px">这一步并不是必须的！只是为了可视化方便管理，并且webUi也还未完善</font>**

> 因为真寻机器人的web项目直接使用vue run的，所以该教程也以vue run为主，其他方式如nginx可略过

> 别忘了打开服务器端口，默认是8081，修改端口在vue.config.js文件中！

### 开始安装

####  安装nodejs

略（百度很多教程，演示的环境是Nodejs14）

####  安装yarn

```text
npm install -g yarn
```
####  安装vue-cli

```text
yarn global add @vue/cli
```

####  获取项目

点击 [WebUi (opens new window)](https://codeload.github.com/HibiKier/zhenxun_bot_webui/zip/refs/heads/main)下载项目压缩包
or

```text
git clone https://github.com/HibiKier/zhenxun_bot_webui.git
```
如果比较慢的话可以尝试以下代码
```text
git clone https://gitclone.com/github.com/HibiKier/zhenxun_bot_webui.git
```
####  安装依赖

```text
yarn
```
####  开始运行

```text
yarn run serve
```
### 配置账号密码

在`您的真寻bot存放目录/configs/config.yaml`文件中配置项设置账号密码

```yaml
web-ui:
  # web-ui
  # USERNAME: 前端管理用户名
  # PASSWORD: 前端管理密码
  USERNAME: admin
  PASSWORD: 
```
>必须要设置账号密码，否则无法登陆！

---

<font style="color: red">本文章是对原项目文档的补充和说明，有很多部分是转载的原文档，并非纯原创</font>

原文档地址：<https://hibikier.github.io/zhenxun_bot/docs/installation_doc/>