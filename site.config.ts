import { defineSiteConfig } from 'valaxy'

export default defineSiteConfig({
  url: "https://yurin.cc",
  lang: "zh-CN",
  title: "摇曳风铃",
  subtitle: "列车定会驶向下一站 那么舞台呢 我们呢",

  mediumZoom: { enable: true },

  favicon: "https://pic.yurin.cc/ea25b70c1c0052ec8753d73e5fdda243.webp",
  author: {
    name: "yurin",
    avatar: "https://pic.yurin.cc/80fef497e168ad8b23051a1c550d119e.webp",
    status: {
      emoji: "🍡",
    },
  },
  description: "写写笔记",
  social: [
    {
      name: "RSS",
      link: "/atom.xml",
      icon: "i-ri-rss-line",
      color: "#ffdd94ff",
    },
    {
      name: "GitHub",
      link: "https://github.com/ako-rin",
      icon: "i-ri-github-line",
      color: "#b2b2ffff",
    },
    {
      name: "E-Mail",
      link: "mailto:yurin@yurin.cc",
      icon: "i-ri-mail-line",
      color: "#89ffe4ff",
    },
    // {
    //   name: 'Travelling',
    //   link: 'https://www.travellings.cn/go.html',
    //   icon: 'i-ri-train-line',
    //   color: 'var(--va-c-text)',
    // },
  ],

  search: {
    enable: true,
    type: "fuse",
  },
  fuse: {
    options: {
      keys: ["title", "tags", "categories", "excerpt", "content", "Bangumi"],
      /**
       * @default 0.6
       * @see https://www.fusejs.io/api/options.html#threshold
       * 设置匹配阈值，越低越精确
       */
      threshold: 0.6,
      /**
       * @default false
       * @see https://www.fusejs.io/api/options.html#ignoreLocation
       * 忽略位置
       * 这对于搜索文档全文内容有用，若无需全文搜索，则无需设置此项
       */
      ignoreLocation: true,
    },
  },
  comment: {
    enable: true,
  },
  sponsor: {
    enable: true,
    description: "谢谢你的喜欢",
  },
  statistics: {
    enable: true,
    readTime: {
      speed: {
        cn: 300,
        en: 200,
      },
    },
  },
  encrypt: {
    // 开启加密，默认关闭
    enable: true,
    // algorithm
    // iv
    // salt
  },
  vanillaLazyload: {
    enable: true,
  },
});
