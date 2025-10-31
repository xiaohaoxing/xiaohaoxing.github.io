---
layout: post
title: 5分钟实现一键文本识别工具
date: 2024-10-25 16:26:37
updated: 2024-10-25 16:26:37
tags:
  - 技术
  - 快捷指令
---

# 背景

女朋友跟我吐槽了她购买的 iText 截图 OCR 工具不好用，每次使用都会闪退：

![](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/blog/%E6%88%AA%E5%B1%8F2024-10-25%2016.34.40.png)

近期使用工具链愈发得心应手，正好今天手上的工作处理得差不多，于是开始找找有没有比较好用的工具。

偶然间看到一个谈论的帖子说：macOS 的快捷指令有一个“从图像中提取文本”的操作指令，加上本人非常喜欢玩快捷指令，于是决定自己做一个 OCR 的工具，试试难度，没想到 5 分钟就搞定了~

# 内容

步骤非常简单，如图：

![](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/blog/%E6%88%AA%E5%B1%8F2024-11-06%2019.36.46.png)

核心是“从`截图`中提取文本”这一步，是这一切能快速实现的重要原因。

 > 最后记得在设置中给这个快捷指令设置一个全局快捷键~毕竟快速才是使用快捷指令的主要目的，如果要打开 app 手动执行流程就失去意义了。

# 后续计划

1. 将该快捷指令作为一个产品推荐给更多的人。
2. macOS 的底层同样支持使用[编程手段](https://developer.apple.com/documentation/vision/recognizing-text-in-images)实现OCR，计划开发一款 macOS App实现该功能。
