---
title: 解决国内 OpenStreetMap 地图无法显示的问题
date: 2023-04-11 00:53:21
cover: https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230411011953614.png
categories:
tags:
 - 教程
---

今天去开会，了解到师弟那边项目遇到了一个问题：OpenStreetMap 的地图组件在国内网络环境则加载不出来。本着助人为乐的精神，我主动承担了帮助解决这个问题的任务。

<!-- more -->



## ❓问题复现

网站地址： [http://sheng.whu.edu.cn/spadas/](http://sheng.whu.edu.cn/spadas/), 在打开该地址后，可以看到地图上的标注可以加载，但是底图没有出来。像这样子：

![image-20230411010153737](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230411010153737.png)

在打开 F12 网络情况后发现，和其他的地图加载方式一样，OpenStreetMap 也是使用了地图分块图层的方式加载的，每个区块都是单独在域名下 `a.tile.openstreetmap.org` 去获取的。而这个域名通过 ping 发现在国内网络是无法访问的：

![image-20230411010620924](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230411010620924.png)

最终就会导致所有图层的图像获取失败，地图显示空白：

![image-20230411010646445](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230411010646445.png)



## 👌 解决方案

确认了问题，下面就是去找对应的解决方案。因为已经定位到是域名的问题，那么接下来就直奔主题，去找 OpenStreetMap 的 CDN 加速方案。经过一番搜寻，最终发现 OpenStreetMap [官网](https://wiki.openstreetmap.org/wiki/Raster_tile_providers) 列举出了所有图层数据的服务提供商（免费/商用）域名地址，url 结构大部分为 `https://{s}.tile.[DOMAIN]/{z}/{x}/{y}.png`，这和上面的访问失败的结构完全一致，可以断定就是修改这个 URL 即可替换掉图像的获取地址，确保地图的正确加载。

接下来在项目前端代码里搜索 `openstreetmap.org`该域名，很容易找到了对应的配置项：![image-20230411011425496](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230411011425496.png)

最后把这个 url 模板在网站上找一个访问速度快的地址替换掉，地图不加载的问题就解决了🎉

![image-20230411011821681](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/image-20230411011821681.png)
