import { defineValaxyConfig } from 'valaxy'
import type { UserThemeConfig } from 'valaxy-theme-yun'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
  'i-ri-government-line',
  'i-ri-government-fill',
  'i-ri-database-2-line',
  'i-ri-database-2-fill',
]

/**
 * User Config
 */
export default defineValaxyConfig<UserThemeConfig>({
  // site config see site.config.ts

  theme: 'starter',

  themeConfig: {
    say: {
      enable: false,
      api: '',
      hitokoto: {
        enable: false,
        api: '',
      }
    },
    banner: {
      enable: true,
      title: '小海星的博客',
      cloud: {
        enable: true,
      },
    },

    pages: [
      // {
      //   name: 'WHU TotemDB Group',
      //   url: 'http://totemdb.whu.edu.cn/',
      //   icon: 'i-ri-government-line',
      //   color: '#002554',
      // },
      // {
      //   name: 'Sheng\'s Group',
      //   url: 'http://sheng.whu.edu.cn',
      //   icon: 'i-ri-database-2-fill',
      //   color: '#115740',
      // },
    ],

    footer: {
      since: 2019,
      beian: {
        enable: false,
        icp: '',
      },
    },
  },

  unocss: { safelist },
})
