import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "JSON Packer",
  description: "基于 Rust 的高性能 JSON 压缩库",
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon-simple.svg' }],
    ['meta', { name: 'keywords', content: 'JSON, 压缩, Rust, 高性能, WebAssembly, Node.js, Web' }],
    ['meta', { property: 'og:title', content: 'JSON Packer - 基于 Rust 的高性能 JSON 压缩库' }],
    ['meta', { property: 'og:description', content: '基于 Rust 的高性能 JSON 压缩库' }],
    ['meta', { property: 'og:image', content: '/favicon.svg' }]
  ],
  appearance: false, // 禁用夜间模式
  themeConfig: {
    // https://vitepress.dev/reference/default-theme-config
    logo: '/favicon-simple.svg',
    nav: [
      { text: '首页', link: '/' },
      { 
        text: '快速开始',
        items: [
          { text: '介绍', link: '/guide/' },
          { text: 'Rust Core', link: '/guide/rust' },
          { text: 'Node API', link: '/guide/node' },
          { text: 'WebAssembly', link: '/guide/wasm' }
        ]
      },
      { 
        text: '工作原理',
        items: [
          { text: '介绍', link: '/mechanism/' },
          { text: '压缩原理', link: '/mechanism/principles' },
          { text: '二进制格式', link: '/mechanism/binary-format' },
          { text: '具体实现', link: '/mechanism/implementation' }
        ]
      },
      { text: '作者 Blog', link: 'https://www.elecmonkey.com', target: '_blank' }
    ],

    sidebar: {
      '/guide/': [
        {
          text: '快速开始',
          items: [
            { text: '介绍', link: '/guide/' },
            { text: 'Rust Core', link: '/guide/rust' },
            { text: 'Node API', link: '/guide/node' },
            { text: 'WebAssembly', link: '/guide/wasm' }
          ]
        }
      ],
      '/mechanism/': [
        {
          text: '工作原理',
          items: [
            { text: '介绍', link: '/mechanism/' },
            { text: '压缩原理', link: '/mechanism/principles' },
            { text: '二进制格式', link: '/mechanism/binary-format' },
            { text: '具体实现', link: '/mechanism/implementation' }
          ]
        }
      ]
    },

    socialLinks: [
      { icon: 'github', link: 'https://github.com/elecmonkey/json-packer' }
    ],

    footer: {
      message: '基于 MIT 许可证发布',
      copyright: 'Copyright © 2025 Elecmonkey'
    }
  }
})