---
title: 部署 FRP 反向代理流程
date: 2023-04-14 18:28:32
cover: https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230414192401048.png
categories:
tags:
 - frp
 - 教程
---

  最近有好几个机器都要用反向代理能力将内网的机器映射出来，做多了就成了机械操作，这里把具体操作流程写下来，方便自己也方便大家参考。

- 从0.52版本开始，FRP 将配置文件的格式从ini更新到了toml，配置方法有一些变化，需要注意。

# 前置条件

 * 有公网 IP 的机器一台
 * 需要映射的机器 N 台

# 服务端流程

  首先在有公网 IP 的机器上部署服务端（server），供其他的机器连接。

1. 下载 FRP 的最新版本

``` bash
wget https://github.com/fatedier/frp/releases/download/v0.54.0/frp_0.54.0_linux_amd64.tar.gz
```

2. 解压并放到任意你方便记忆的目录

``` bash
# 解压
tar -zxvf frp_0.54.0_linux_amd64.tar.gz
# 进入文件夹
cd frp_0.54.0_linux_amd64
# 创建文件夹
sudo mkdir /usr/lib/frp
# 链接服务端程序
sudo ln -s frps /usr/lib/frp/
# 链接服务端配置
sudo ln -s frps.toml /usr/lib/frp/
```

3. 前往配置服务端

``` bash
sudo vim /usr/lib/frp/frps.toml
```


``` toml

bindAddr = "0.0.0.0"
# 其他的端口也行，与下面客户端配置保持一致即可
bindPort = 7001
auth.method = "token"
auth.token = "[YOUR_TOKEN]"

webServer.addr = "0.0.0.0"
webServer.port = 8080
webServer.user = "[YOUR_USERNAME]"
webServer.password = "[YOUR_PASSWORD]"

enablePrometheus = true

log.to = "/var/log/frps.log"
log.level = "info"
log.maxDays = 7
```

4. 编写服务端程序的系统服务

``` bash
# 这里是/usr/lib/...，用户级别的系统服务
sudo vim /usr/lib/systemd/system/frps.service
```


``` ini
[Unit]
Description=Frp Server Service
After=network.target

[Service]
Type=simple
User=nobody
Restart=on-failure
RestartSec=5s
ExecStart=/usr/lib/frp/frps -c /usr/lib/frp/frps.toml

[Install]
WantedBy=multi-user.target
```

5. 使用系统服务的方式启动服务端程序 & 启用开机自动启动

``` bash
systemctl start frps
systemctl enable frps
```

6. 在浏览器上输入 `[IP]:8080` 进入控制台（账号密码在第三步配置文件配置的），查看服务是否正常启动了。如果出现界面则表示服务端已经正常启动了~🎉

![image-20230414185831869](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230414185831869.png)



#  客户端流程

客户端流程基本同上，不同的地方会标识出来。在内网环境的设备上执行以下操作：

1. 下载 FRP 的最新版本

``` bash
wget https://github.com/fatedier/frp/releases/download/v0.54.0/frp_0.54.0_linux_amd64.tar.gz
```

2. 解压并放到任意你方便记忆的目录

>  ⚠️  <span style="color:red">移动客户端程序和配置！</span>

``` bash
# 解压
tar -zxvf frp_0.54.0_linux_amd64.tar.gz
# 进入文件夹
cd frp_0.54.0_linux_amd64
# 创建文件夹
sudo mkdir /usr/lib/frp
# 移动客户端程序
sudo ln -s frpc /usr/lib/frp/
# 移动客户端配置
sudo ln -s frpc.toml /usr/lib/frp/
```

3. 前往配置客户端

>  ⚠️  <span style="color:red">配置客户端的配置文件，有所不同！</span>

``` bash
sudo vim /usr/lib/frp/frpc.toml
```

``` toml
serverAddr = "[YOUR_PUBLIC_IP_ADDRESS]"
serverPort = 7001
auth.method="token"
# 在上面服务端配置的 token
auth.token="[YOUR_SERVER_CONFIG_TOKEN]"

[[proxies]]
# 这是你在服务端管理界面上看到的名称，可以任意起名。
name = "4090-ssh"
type = "tcp"
localIP = "127.0.0.1"
localPort = 22
# 映射到公网IP的端口
remotePort = 10022
```

4. 编写客户端端程序的系统服务

``` bash
sudo vim /usr/lib/systemd/system/frpc.service
```

``` ini
[Unit]
Description=Frp Client Service
After=network.target

[Service]
Type=simple
User=nobody
Restart=on-failure
RestartSec=5s
ExecStart=/usr/lib/frp/frpc -c /usr/lib/frp/frpc.toml

[Install]
WantedBy=multi-user.target
```

5. 使用系统服务的方式启动服务端程序 & 启用开机自启

``` bash
systemctl start frpc
systemctl enable frpc
```

6. 在控制台刷新一下查看 proxy，如果出现新条目则表示启动成功了！🎉

![image-20230414192401048](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230414192401048.png)


# Q&A

如果启动出现问题也不用紧张，系统服务虽然当场不会显示错误日志，不过可以通过 `journalctl -u frpc` 命令查看对应的日志从而排查错误。
