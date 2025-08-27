import type { ThemeUserConfig } from 'valaxy-theme-sakura'
// import type { UserThemeConfig } from 'valaxy-theme-yun'
import { defineValaxyConfig } from 'valaxy'
import { addonWaline } from 'valaxy-addon-waline'
import { addonBangumi } from 'valaxy-addon-bangumi'
import { addonHitokoto } from 'valaxy-addon-hitokoto'
import { addonVercount } from 'valaxy-addon-vercount'

// add icons what you will need
const safelist = [
  'i-ri-home-line',
]

/**
 * User Config
 */
export default defineValaxyConfig<ThemeUserConfig>({
  // site config see site.config.ts

  theme: 'sakura',
  devtools: true,

  modules: {
      rss: {
        enable: true,
        fullText: false,
      },
    },

  themeConfig: {
    ui: {
      primary: '#686DBF',
      toggleDarkButton: {
        lightIcon: 'i-line-md-moon-alt-to-sunny-outline-loop-transition',
        darkIcon: 'i-line-md-sunny-outline-to-moon-loop-transition',
      },
      pinnedPost: {
        icon: 'i-fa-anchor',
      },
      postList: {
        icon: 'i-fa-envira',
      },
      scrollDown: {
        icon: 'i-fa-chevron-down',
      },
    },
    hero: {
      title: 'AKORIN\'s HOME',
      motto: 'You got to put the past behind you before you can move on.',
      urls: [
        'https://pic.akorin.icu/20250821235738973.webp',
        'https://pic.akorin.icu/20250822000048269.webp',
        'https://pic.akorin.icu/20250821235930749.webp',
        'https://pic.akorin.icu/20250822000224307.webp',
        'https://pic.akorin.icu/20250821234944713.webp',
        'https://pic.akorin.icu/20250821235633395.webp',
        'https://pic.akorin.icu/20250822000002560.webp',
        'https://pic.akorin.icu/20250822000430257.webp'

      ],
      randomUrls: true,
      fixedImg: true,
      typewriter: true,
      enableHitokoto: true,
      style: 'dim',
      waveTheme: 'horizontal',
    },
    // notice: {
    //   message: '<b>这是一个公告信息</br>',
    // },
    // pinnedPost: {
    //   text: 'START:DASH!!',
    //   entries: [
    //     {
    //       title: 'Docs',
    //       desc: '主题文档',
    //       link: 'https://sakura.valaxy.site',
    //       img: 'https://valaxy-theme-sakura.s3.bitiful.net/wallpaper-2025%2Fwallhaven-yxoejx.jpg',
    //     },
    //   ],
    // },
    pagination: {
      animation: true,
      infiniteScrollOptions: {
        preload: true,
      },
    },
    postList: {
      text: 'Blog',
      isImageReversed: true,
      // defaultImage: ['https://www.dmoe.cc/random.php?random', 'https://www.loliapi.com/acg/pc/?random'],
      defaultImage: ['https://www.dmoe.cc/random.php?random', 'https://img.xjh.me/random_img.php?random?type=bg&return=302'],
    },
    postFooter: {
      navigationMerge: true,
    },
    navbar: [
      {
        icon: 'i-fa-fort-awesome',
        locale: 'menu.home',
        link: '/',
      },
      {
        icon: 'i-line-md-folder-twotone',
        locale: 'menu.categories',
        link: '/categories',
      },
      {
        icon: 'i-fa-archive',
        locale: 'menu.archives',
        link: '/archives',
      },
      {
        icon: 'i-fa-film',
        text: '番剧',
        // locale: 'menu.anime',
        link: '/anime',
      },
      {
        icon: 'i-fa-edit',
        text: '留言板',
        link: '/comment',
      },
      {
        text: '友情链接',
        icon: 'i-fa-chain',
        link: '/links',
        items: [
          {
            text: 'GitHub',
            icon: 'i-line-md-github-twotone',
            link: 'https://github.com/WRXinYue/valaxy-theme-sakura',
          },
          {
            text: 'Discord',
            icon: 'i-line-md-discord-twotone',
            link: 'https://discord.gg/sGe4U4p4CK',
          },
          {
            text: 'Valaxy →',
            icon: 'i-ri-cloud-fill',
            link: 'https://github.com/YunYouJun/valaxy',
          },
        ],
      },
      {
        text: "AkoRin",
        icon: 'i-line-md-heart-twotone-half',
        link: "https://akorin.icu",
        target: '_blank',
      },
      {
        text: '关于',
        icon: 'i-fa-leaf',
        link: "https://akorin.icu",
        target: '_blank',
      },
      {
        text: 'RSS',
        icon: 'i-fa-feed',
        link: '/atom.xml',
        target: '_blank',
      },
    ],
    navbarOptions: {
      title: ['AkoRin\'s Home'],
      offset: 0,
      invert: ['home'],
      showMarker: false,
      autoHide: ['home'],
    },
    sidebar: [
      {
        icon: 'i-fa-fort-awesome',
        locale: 'menu.home',
        link: '/',
      },
      {
        icon: 'i-line-md-folder-twotone',
        locale: 'menu.categories',
        link: '/categories',
      },
      {
        icon: 'i-fa-archive',
        locale: 'menu.archives',
        link: '/archives',
      },
      {
        icon: 'i-fa-film',
        text: '番剧',
        // locale: 'menu.anime',
        link: '/anime',
      },
      {
        icon: 'i-fa-edit',
        text: '留言板',
        link: '/comment',
      },
      {
        text: '友情链接',
        icon: 'i-fa-chain',
        link: '/links',
        collapsed: false,
        items: [
          {
            text: 'GitHub',
            icon: 'i-line-md-github-twotone',
            link: 'https://github.com/WRXinYue/valaxy-theme-sakura',
          },
          {
            text: 'Discord',
            icon: 'i-line-md-discord-twotone',
            link: 'https://discord.gg/sGe4U4p4CK',
          },
          {
            text: 'Valaxy →',
            icon: 'i-ri-cloud-fill',
            link: 'https://github.com/YunYouJun/valaxy',
          },
        ],
      },
      {
        text: "AkoRin",
        icon: 'i-line-md-heart-twotone-half',
        link: "https://akorin.icu",
        target: '_blank',
      },
      {
        text: '关于',
        icon: 'i-fa-leaf',
        link: "https://akorin.icu",
        target: '_blank',
      },
      {
        text: 'RSS',
        icon: 'i-fa-feed',
        link: '/atom.xml',
        target: '_blank',
      },
    ],
    footer: {
      since: 2025,
      icon: {
        img: '/favicon-16x16.ico',
        animated: true,
        url: 'https://icp.gov.moe/?keyword=20252010',
        title: 'AkoRin',
      },
      powered: true,
      icp: '萌ICP备20252010号',
    },
    sidebarOptions: {
      position: 'left',
      enableOnDesktop: true,
    },
    
    tags: {
      rainbow: true,
    },
    scrollToTop: true,
    scrollIndicator: true,
    scrollLock: false,
  },
    // bg_image: {
    //   enable: true,
    //   url: 'https://pic.akorin.icu/bg-dark1.jpg',
    //   dark: 'https://pic.akorin.icu/bg-white1.png',
    //   opacity: 0.55,
  // },
  addons: [
      addonWaline({
        // Waline 配置项，参考 https://waline.js.org/reference/client/props.html
        serverURL: 'https://waline.akorin.icu',
        meta: ['nick', 'mail'],
        emoji: ['https://unpkg.com/@waline/emojis@1.1.0/tw-emoji'],
        login: 'force',
        texRenderer: true,
        dark: 'auto',
      }),
      addonBangumi({
        api: 'https://yi_xiao_jiu-bangumi.web.val.run',
        bilibiliUid: '335244948',
        bgmUid: '1060712',
        bgmEnabled: true,
        bilibiliEnabled: false
      }),
      addonVercount({
      api: 'cn'
      }),
      addonHitokoto({
        api: 'intl',
      }),
    ],
  unocss: { safelist },
  vite: {
    optimizeDeps: {
      include: [
        'd3',
        'lodash-es',
      ],
    },
  },
})