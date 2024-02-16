import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: 'https://xiaohaoxing.github.io',
  lang: 'zh-CN',
  title: '小海星的博客',
  author: {
    name: '小海星',
    avatar: 'https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/header.jpg',
    status: {
      emoji: '❤️',
      message: 'Academic & Coding'
    }
  },
  favicon: 'https://xiaohaoxing-1257815318.cos.ap-chengdu.myqcloud.com/favicon.ico',
  subtitle: 'Welcome to visit',
  description: '肖皓星的个人博客',

  social: [
    {
      name: 'RSS',
      link: '/atom.xml',
      icon: 'i-ri-rss-line',
      color: 'orange',
    },
    {
      name: 'GitHub',
      link: 'https://github.com/xiaohaoxing',
      icon: 'i-ri-github-line',
      color: '#6e5494',
    },
    {
      name: '哔哩哔哩',
      link: 'https://space.bilibili.com/10875559',
      icon: 'i-ri-bilibili-line',
      color: '#FF8EB3',
    },
    {
      name: 'E-Mail',
      link: 'mailto:xiaohaoxing@outlook.com',
      icon: 'i-ri-mail-line',
      color: '#blue',
    }
  ],

  search: {
    enable: true,
  },

  statistics: {
    enable: true,
    readTime: {
      /**
       * 阅读速度
       */
      speed: {
        cn: 300,
        en: 200,
      },
    },
  },

  comment: {
    enable: true
  },
})
