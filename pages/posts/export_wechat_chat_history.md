---
title: 导出微信聊天记录
date: 2022-11-15 09:53:36
updated: 2022-11-15 09:53:36
tags:
 - 教程
---

## 背景

  女朋友论文需要引用微信群的聊天记录作为数据分析，因此有导出指定群聊的消息记录的需求。相信有很多重度依赖微信的朋友也有导出微信聊天记录的需求，因此这里过程特做一个记录，希望对大家有帮助~

<!-- more -->

## 相关工具

  主要使用的工具为 [wxbackup](http://wxbackup.imxfd.com/)，微信聊天记录导出神器。

## 步骤

1. 连接手机（仅限 iOS）到电脑，建议使用 Mac，虽然上述工具有 windows 客户端，但是在后续导出过程中出现报错导致无法进行下去，还是 MacOS 上比较稳定。

2. 打开 iTunes（老版本是一个独立的 App，新版本 MacOS 已经整合进 Finder 了，直接在 Finder 侧边栏找到对应的设备即可）。

3. 在 iTunes 中操作备份到本机，如图

![备份指引](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/%E5%A4%87%E4%BB%BD%E6%8C%87%E5%BC%95.png)
 > 如果和我情况一样， Mac 空间有限，无法备份到本机，也是有解决办法的，详见下面补充部分说明。

4. 导出完成后，打开上面下载的微信导出工具 wxbackup，启动时会自动检测备份位置的，如果没有找到备份会提示你手动指定目录，这种情况可以指定 `~/Library/Application Support/MobileSync/Backup` 目录试试。

 > 貌似是 MacOS 版本更新导致的，旧版本的目录是在 `~/Library/Application Support/Apple/MobileSync/Backup` 下。

5.  如果成功检测到备份，工具会自动提取出所有的聊天记录展示为列表，这里就可以选择自己想要导出的群或者单聊选择输出位置直接导出了。

6.  导出的格式为静态网页，打开文件夹后打开 index.html 文件即可预览聊天界面，跟真实的微信聊天界面非常相似（悼念下 web 版微信）。

7. 如果有后续数据处理和数据分析需求的，所有的消息数据是以一个 js 大对象格式存储在 `js/message.js` 里的，可以编写一点简单的 JavaScript 代码来处理一下，比如转换成 csv 或者 excel 这样子。这里不多做介绍了。


## 如果 Mac 空间不足无法备份怎么办？

  这里也是有办法的~在网上找到了另一款神器 [iMazing](https://imazing.com/)，支持将手机直接备份到外部空间上，下载并打开 iMazing，点击备份，即可自行选择备份位置，换到 U 盘或者移动硬盘即可。

![iMazing](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/iMazing.png)
