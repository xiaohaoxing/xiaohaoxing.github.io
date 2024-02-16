---
title: 创建hexo脚本
date: 2020-01-06 16:37:44
tags:
 - hexo
 - productivity
---

# 起因

本人创建`Hexo`脚本的痛点主要是2点：

1. 我用 vs code 的终端运行 hexo 命令和管理资源文件，用 Typora 撰写文章，因此每次不管是新建文章还是预览还是发布都需要来回切换，步骤较多挺麻烦的。
2. 博客源码的版本管理。之前写过好几篇博文，可是在一次装机的过程中忘记迁移，结果丢失了原始markdown的文章和配置文件，导致无法继续写下去了，只得重头开始!`QAQ`

<!-- more -->

# 脚本

基于以上2个原因，这里我创建了3个相关的脚本，还有一个麻烦一点正在实现中~
## 1. 新建文章
``` bash
cd ~/repos/blog-src
hexo new "{query}"
open source/_posts/{query}.md
```
核心是`hexo new xx`命令，创建了新md文件，并使用open命令使用默认方式（我设置的是Typora）打开该文件开始写文章。

## 2. 本地运行博客
``` bash
cd ~/repos/blog-src
hexo clean
hexo generate
hexo server -p {query}

open https://localhost:{query}
```
有点像git的提交和本地运行，就是用hexo的server本地运行命令,运行启动后需要打开浏览器访问本地地址。由于hexo server把当前的终端挂起了，因此需要将访问页面的命令换个地方启动，这里直接把启动Chrome，访问localhost:{query}的操作放在输入之后，虽然会暂时显示无法访问，但是由于Chrome开启了自动重载特性，所以起起来后还是能显示博客，就暂先这么实现了。

## 3. 发布博客
``` bash
cd ~/repos/blog-src
git add .
git commit -m "update"
git push
hexo g
hexo d
```
  发布博客需要先把项目的源码推到 github 上再执行部署，保证了源码和博客都得到同步。

## 4. 编辑博客
在完成上述几个脚本后进一步，需要实现一个对当前已有博文的编辑功能，目标是实现列出当前所有博文并选择其中一个打开编辑。
参考了一些别人写的 python 的 workflow，实现了简单的获取所有博文并列出的功能：
``` python
from os import listdir
from os.path import isfile, join
import sys
from workflow import Workflow3, ICON_INFO

reload(sys)
sys.setdefaultencoding('utf-8')
log = None

mypath = '/Users/haoxingxiao/repos/blog-src/source/_posts'
def main(wf):
    # 列出所有 markdown 文件
    md_files = [f for f in listdir(mypath) if isfile(join(mypath, f)) and f.endswith('.md')]
    # 展示在 workflow 的下拉列表中，arg 表示输出给后续流程的参数字符串
    for file in md_files :
        wf.add_item(
            file,
            mypath+ '/' +file,
            valid=True,
            icon=ICON_INFO,
            arg=mypath+ '/' + file
        )
    wf.send_feedback()


if __name__ == u"__main__":
    wf = Workflow3()
    log = wf.logger
    sys.exit(wf.run(main))
```
后续再追加上一个 `Run Script`把{query}传递进去打开该文件即可。

效果：

![blog-edit 实现效果](https://tva1.sinaimg.cn/large/007S8ZIlgy1gih01zia3qj30w20mkax9.jpg)

## base64 编码解码

  完成上述的几个 workflow 后，继续一鼓作气完成了 base64  编码解码的 workflow。还增加了新的特性：filter，通过 Notification 提示用户转换成功还是失败。
  还是用 python 的库执行核心的转换：

``` python 
import sys
import base64
query = "{query}"

sys.stdout.write(base64.b64decode(query))
```
代码很简单，这部分流程控制更重要，如下图：

workflow 流程图：

![base64解码](https://tva1.sinaimg.cn/large/007S8ZIlgy1gih1cgizuhj31830u0all.jpg)

在执行完编码和解码后，根据内容是否为空判断是否成功，并使用 Notification 提示用户结果~成功了还会自动复制到剪贴板中。

 ## 总结

使用 alfred 实现了博客文章的新增、编辑、本地运行和发布几个常用功能，对自己日常使用也非常有意义，而且对熟悉 workflow 库的语法也有帮助，后续可以进一步考虑把常用的一些工作流优化到 workflow~

e.p.:
 1. base64 的转换(Done)
