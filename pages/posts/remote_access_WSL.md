---
title: 远程访问WSL
date: 2023-11-29 22:09:46
categories:
tags:
 - 技术
 - windows
---

实验室的个人主机此前部署的Ubuntu系统因故启动异常，由于出现问题太过于频繁了，考虑到 WSL 已经发展相对成熟了，因此决定转移到 windows 阵地，用 WSL 替代部分需要用到的 Linux 系统的功能，同时也熟悉熟悉一些 Windows 的新功能。

<!-- more -->

## 目标

因为服务器部署在学院内网，因此目标是通过内网可以 SSH 同时访问 Windows 主机和 WSL 虚拟机。同时使用反向代理实现公网访问部分 WSL 的功能。


## 步骤

### 1. 安装 Windows
### 2. 安装 Windows 常用工具，这里列举一下：


 * Clash For Windows(得自己想办法下载了🤔)
 * [VS Code](https://code.visualstudio.com)
 * [Edge](https://www.microsoft.com/zh-cn/edge/download)
 * [Free Download Manager](https://www.freedownloadmanager.org/zh/download.htm)
 * [Jetbrains Toolbox](https://www.jetbrains.com/toolbox-app/)
 * [Microsoft Office](https://www.office.com)
 * [Tabby Terminal](https://github.com/Eugeny/tabby/releases)
 * [git](https://gitforwindows.org)
 * (未完待续)

### 3. 安装和启动 WSL

在 Windows Powershell 中输入 WSL，会自动开始下载和安装默认的 WSL 版本（默认为Ubuntu22.04 + WSL Version 2）

### 4. WSL 中安装基础工具

``` bash
sudo apt update && sudo apt upgrade -y
sudo apt install openssh-server
sudo apt install python3
sudo apt install python3-pip
sudo apt install nodejs
sudo apt install
```


### 5. 使用 distrod 启用系统的 systemd 功能

参考： https://www.zhihu.com/question/535145130/answer/2630721037

### 6. 启动SSH


``` bash
sudo systemctl enable ssh
sudo systemctl start ssh
sudo systemctl status ssh
```

### 7. 编写 FRPC 的服务

参考：https://xiaohaoxing.github.io/2023/04/14/%E9%83%A8%E7%BD%B2-FRP-%E5%8F%8D%E5%90%91%E4%BB%A3%E7%90%86%E6%B5%81%E7%A8%8B/

  将WSL内的 22 端口映射到公网上。

### 8. WSL 内网访问

查看 WSL 的 IP

``` bash
ifconfig
```

Windows 自带内网端口映射工具，将 WSL 内的 22 端口映射到 Windows 主机的 222 端口上：


``` shell
netsh interface portproxy add v4tov4 listenaddress=0.0.0.0 listenport=222 connectaddress=172.21.191.181 connectport=22
```

在 Windows 上查看 IP 并访问 22 端口(Windows)和 222 端口(WSL)

``` shell
ipconfig
```


## 总结

通过上述的步骤，实现了在内网访问 Windows 和 WSL 以及外网访问 WSL。
