---
title: 在 homebrew 里安装特定版本的程序包
date: 2026-01-14 18:02:07
categories:
tags:
 - homebrew
 - 教程
---

有些时候因为一些原因，我们需要在自己的设备上安装特定版本的程序，而 homebrew 在新版本中已经移除了对 switch 参数的支持，目前也不支持API 模式了。如果依赖程序本身没有提供特定版本的安装名（例如 python@2），要安装特定版本操作起来就很麻烦。所以这里把安装方式记录下来，方便其他朋友按照操作步骤更轻松实现。

<!-- more -->

## 背景 

其实做这件事情的原因是正在阅读[一本编程书](https://book.douban.com/subject/30348061/)，书上用到了特定版本的 lua（5.3.X），但是 brew 的版本已经更新到 5.4.X 了，在编译行为上有区别，导致二进制文件的格式不一致，如果继续使用 5.4.X 版本的 lua，则会导致后面的部分对不上，因此需要安装 5.3.X 的版本 lua。

## 1. 手动下载源码/二进制文件

在 lua 的[官网](https://lua.org/download.html)中，提供了源码和二进制文件，可以按需下载。我这里下载了源码，得到的目录结构如下：

``` 
.
├── Makefile
├── README
├── doc
│   ├── contents.html
│   ├── index.css
│   ├── logo.gif
│   ├── lua.1
│   ├── lua.css
│   ├── luac.1
│   ├── manual.css
│   ├── manual.html
│   ├── osi-certified-72x60.png
│   └── readme.html
└── src
    ├── Makefile
    ├── lapi.c
    ├── lapi.h
    ...
```

这里src 目录就是 lua 的源码， 提供了 Makefile 用来编译生成二进制文件。


## 2. 编译生成可执行文件

在下载的项目根路径使用 make 命令进行编译，生成可执行文件：

``` bash
make all test
```

### 2.1 bin 目录(可选)
运行之后可执行文件会存在于src 目录下，建议将可执行文件移动到 bin 目录下。

```
midir bin
mv src/lua bin/
mv src/luac bin/
```

## 3. 将项目移动到 homebrew 管理路径下（推荐）

``` bash
mkdir -p /opt/homebrew/Cellar/lua/5.3.6 # 创建指定版本目录
mv -r $PROJ_ROOT/* /opt/homebrew/Cellar/lua/5.3.6/ # 将所有文件移动到指定目录
```

## 4. 软链接可执行文件

最后一步是将可执行文件放到上下文中直接可以执行 `lua` 和 `luac` 命令。

``` bash
ln -s /opt/homebrew/Cellar/lua/5.3.6/bin/luac /opt/homebrew/bin/luac
ln -s /opt/homebrew/Cellar/lua/5.3.6/bin/lua /opt/homebrew/bin/lua
```

执行完成这些，重新启动一下终端就可以看到 5.3.6 版本的 lua 已经安装成功了🎉🎉🎉

![安装成功](https://p.ipic.vip/jqxr5a.png)

