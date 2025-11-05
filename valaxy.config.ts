import { defineTheme, defineValaxyConfig } from 'valaxy'
import { ThemeConfig } from "valaxy-theme-starter";
import { VitePWA } from 'vite-plugin-pwa'
import { addonWaline } from 'valaxy-addon-waline'

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
export default defineValaxyConfig<ThemeConfig>({
  // site config see site.config.ts
  theme: 'yun',
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
      enable: false,
      title: '小海星的博客',
      cloud: {
        enable: true,
      },
    },

    pages: [],

    footer: {
      since: 2019,
      beian: {
        enable: false,
        icp: '',
      },
    },
  },
  vite: {
    plugins: [VitePWA()]
  },
  unocss: { safelist },

  addons: [
    addonWaline({
      serverURL: 'https://blog-comment-rosy.vercel.app/'
    })
  ]
})
