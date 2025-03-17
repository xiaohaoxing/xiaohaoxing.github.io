---
layout: post
title: macOS配置mongoDB支持事务
date: 2025-03-17 21:06:00
---

# 背景

在 macOS 中使用 homebrew 安装 mongoDB 很方便，`brew install mongodb-community` 即可快速安装好 mongoDB 并使用,但是默认安装的版本是 stand alone 的,在使用事务相关特性时会出现错误:

<!-- more -->
``` bash
MongoServerError: Transaction numbers are only allowed on a replica set member or mongos...
```

需要将本地部署的 mongoDB 改为 replica，集群模式才能正常使用事务。

# 步骤

## 1. 停止本地的 mongoDB 服务

``` bash
brew services stop mongodb-community
```

## 2. 修改 brew 安装的 mongoDB 配置文件

``` bash
sudo vim /opt/homebrew/etc/mongod.conf
```

``` conf
systemLog:
  destination: file
  path: /opt/homebrew/var/log/mongodb/mongo.log
  logAppend: true
storage:
  dbPath: /opt/homebrew/var/mongodb
net:
  bindIp: localhost  # this line
  ipv6: true
replication:
  replSetName: "rs0" # and this line
```

保存并退出

## 3. 重新启动 mongoDB 服务

``` bash
brew services start mongodb-community
```

## 4. 验证结果

在[官方 APP](https://www.mongodb.com/try/download/atlascli)中就可以清晰看到我们部署的服务已经变成了 replica 的模式:

![](https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/blog/%E6%88%AA%E5%B1%8F2025-03-17%2021.14.08.png)