---
title: GitLab CI 搭建指南
date: 2020-10-26 22:59:58
tags:
 - 教程
 - 技术
---

# 起因

  事情的起因也是来自工作中跟我们日常密切相关，而又没有机会接触到的东西：CI。项目脚手架自带了 CI 脚本，只需要稍作修改就可以直接使用；GitLab 上的项目的 CI 配合也不需要我们管，直接使用`Public Runner`就行了。时间长了自然就对这方面比较感兴趣，想知道其中的原理。正好搭建了服务器，部署好了 GitLab，于是说干就干，开始着手做自己的 GitLab CI 配置。

<!-- more -->
# 过程

## CI 脚本
  已经知道了在项目上执行的东西，包括推代码、打 tag 都会导致 CI 的自动执行，而什么情况执行什么 CI 的 stage 就由项目根目录下的.gitlab-ci.yml 文件决定。因此找到一个项目的 CI 文件看看是怎么写的：

``` yml
image: xxxxxx:maven-openjdk8-onbuild

stages:
  - build
  - release

test:
  stage: build
  script:
    - rm -rf test_target/* && mkdir -p test_target && mvn -U clean package -Dmaven.test.skip=true -P test
    - cp -a oms-web/target/oms-web.jar test_target/ROOT.jar
    - chmod +x ./test_target/ROOT.jar
    - cp -rf ./.dockerignore ./test_target && cp -rf ./Dockerfile ./test_target
  environment: test
  only:
    - /^neo-java-test-.*$/
  except:
    - branches
  artifacts:
    paths:
     - test_target/*
    untracked: false
    
neo-image-upload:
  stage: release
  image: xxxxx:docker19.06-base-image
  script:
    - mi_env=$(echo $CI_COMMIT_TAG | awk -F '-' '{print $3}')
    - cd ./$mi_env'_target'
    - docker login hub.pf.xiaomi.com -u $HUBUSER -p $HUBPASS
    - docker build . -t  xxxxxx.xxx.xxx/$(echo $CI_COMMIT_TAG | awk -F '-' '{print $2"-"$3}'):$CI_COMMIT_TAG
    - docker push xxxxxxxxx.xxx.xxx]、/$(echo $CI_COMMIT_TAG | awk -F '-' '{print $2"-"$3}'):$CI_COMMIT_TAG
  environment:
    name: neo
  only:
    - /^neo-.*$/
  except:
    - branches
...
```

  首先上来是先定义CI 需要的基本 docker 镜像，不管你 CI 的目的是什么，最终都是要执行一段代码，这部分代码一定需要个环境去执行的，这个环境就是来自于声明的镜像类型。下面是定义了 2 个执行阶段：build 和 release。在 gitlab 平台上 CI 的过程状态图可以知道：这里是定义了他们执行的先后顺序：需要先构建好项目的产出可执行包，再推送到指定的容器中供启动。下面 2 部分则是定义了具体的 stage 的条件和执行的内容。stage：指定为哪个执行阶段。image：指定该阶段使用的镜像。script：该阶段执行的代码，一般为 shell 脚本。only：指定该阶段执行的触发条件，一般为分支或 tag 名。

  根据上面的 ci 脚本，我定义一个最简单的 CI 脚本：

``` shell
image: docker:dind

stages:
  - stage1
  - stage2

stage-first:
  stage: stage1
  script:
    - echo 'I am first executed!'
  only:
    - master
  artifacts:
    paths:
      - prod_target/*


stage-second:
  stage: stage2
  script:
    - echo 'I am second executed!'
  only:
    - master
```

  定义了 2 个阶段，分别打印字符串。

## CI Runner

  完成上面的 CI 脚本后我迫不及待的将分支合到 master 并推送到远程，期望他能立刻执行出结果。可是 GitLab 上显示的CI 状态为：Pending：No Runner available for pipeline。表明没有可以用来执行CI 的 Runner。那么就需要查找跟 Runner 相关的信息。得知：Runner 是支持多节点的独立部署的服务，在机器上启动 Runner **管理服务**后**注册**一个新的 Runner，将其**绑定**到对应的 GitLab 上（可以绑定为一个 GitLab 库公用或者一个指定 repository 专用）就可以用来执行 CI 了。

  ### 安装 gitlab-runner

  此时我就去找 Runner 的安装了。我直接运行：

``` bash
sudo apt-get install gitlab-runner
```

  安装成功，**但是**此时执行再执行：

``` bash
sudo gitlab-runner register
```

  想注册一个 Runner 并绑定到我的 GitLab 上发现总是失败。

  ### Runner 的坑

  经过一番搜索，知道了 GitLab 和 Runner 的版本有约束：8.X 版本的 GitLab 只支持 1.X 版本的 Runner 服务，而 apt 自动安装的为 13.X 版本的了，无法兼容。于是就需要开始搜索互联网上的 1.X 版本的 Runner 安装程序。

  * Runner 的 RELEASE：没有 1.X 版本。

  * Runner 的 Tag 列表：有 1.X 版本的 tag 但是没有 artifacts 产物。

  * 各大镜像站：只有 10.X 开始版本的 Runner 安装程序。

  看似已经山穷水尽了。忽然灵光一现：你虽然可以删除 RELEASE 的旧版本，但是你打版本 tag 的那次 CI 一定有输出到的路径，我就去追溯你那个生成 artifact 的路径不就可以了？果然，被我找到了导出到 AWS 的[文件](https://gitlab-ci-multi-runner-downloads.s3.amazonaws.com/v1.11.5/deb/gitlab-ci-multi-runner_i386.deb)~

![CI product](https://tva1.sinaimg.cn/large/0081Kckwgy1gk38mj082jj31uh0u0h8v.jpg)


  找到了安装文件后就是顺利的安装过程~直接用命令说明吧：

``` bash
scp ~/Downloads/gitlab-ci-multi-runner_i386.deb haoxingxiao@XXX.XXX.XXX.XXX:~/

ssh XXX.XXX.XXX.XXX

sudo dpkg -i gitlab-ci-multi-runner_i386.deb

sudo gitlab-runner register
(gitlab url)
> http://XXXXXXXX.XXX.XXX/ci/    // 注意这里需要提供 /ci 路径
(token)
> XXXXXXXXXXXXXX
(runner name)
> tencent-cloud-runner
(tags)
> tencent,common
(allow untagged task?)
> true
(choose type:docker,shell & etc.?)
> docker
```

## 执行 CI

  配置好 Runner 后就可以在 GitLab 上看到创建成功的 Runner 了:

![Runners](https://tva1.sinaimg.cn/large/0081Kckwgy1gk38uzcm7sj31ye0u0dlr.jpg)

  这里我已经把租的阿里云服务器和腾讯云的服务器都配置上去了，构成了多个节点的 Runner 集群，当 CI 任务进入后会自动寻找空闲的 Runner 去执行。其实同一个容器绑定多个 Runner 也可以，不过负载就都在一台容器上了。

  而刚才 Pending 的 CI 也开始执行了。学习了一下 CI 脚本的语法和知识，最终运行的结果如下图：

![stages](https://tva1.sinaimg.cn/large/0081Kckwgy1gk38xonz62j32140kcdhu.jpg)

![stage1](https://tva1.sinaimg.cn/large/0081Kckwgy1gk38yei629j31i80pqtdh.jpg)

  最终达到了搭建自己的自动化 CI 的环境~也利用了开源免费的 [badge 服务](https://shields.io/category/build) 给项目的 README 增加了一个构建 CI 状态的徽章：

![badge](https://tva1.sinaimg.cn/large/0081Kckwgy1gk393be6hqj318u0d4mzd.jpg)

  方便直观在项目主页查看状态。

# 后续

  经过搭建 GitLab 和搭建 GitLab CI 2 步之后，下一步有好几个想要做的东西：

  1. Git Talk 服务
  2. 创建 Feishu SDK 项目，部署飞书通知的服务，并接入 CI，实现主动推送构建结果到飞书客户端。
  3. 进一步配置 Blog，目前 Blog 弄的比较仓促，很多信息和配置还没加上去。

  今天就先写这么多吧~难得有摸鱼的机会弄自己的东西，希望还能一直保持这种热情做下去！:sunny:
