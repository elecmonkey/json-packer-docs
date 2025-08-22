import { defineConfig } from 'vitepress'
import tailwindcss from '@tailwindcss/vite'

// https://vitepress.dev/reference/site-config
export default defineConfig({
  title: "JSON Packer",
  description: "High-performance JSON compression library built with Rust",
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: '/favicon-simple.svg' }],
    ['meta', { name: 'keywords', content: 'JSON, compression, Rust, high-performance, WebAssembly, Node.js, Web' }],
    ['meta', { property: 'og:title', content: 'JSON Packer - High-performance JSON compression library built with Rust' }],
    ['meta', { property: 'og:description', content: 'High-performance JSON compression library built with Rust' }],
    ['meta', { property: 'og:image', content: '/favicon.svg' }]
  ],
  appearance: false, // 禁用夜间模式
  
  locales: {
    root: {
      label: 'English',
      lang: 'en',
      title: 'JSON Packer',
      description: 'High-performance JSON compression library built with Rust',
      themeConfig: {
        // https://vitepress.dev/reference/default-theme-config
        logo: '/favicon-simple.svg',
        nav: [
          { text: 'Home', link: '/' },
          { 
            text: 'Quick Start',
            items: [
              { text: 'About JSON Packer', link: '/guide/' },
              { text: 'Rust Core', link: '/guide/rust' },
              { text: 'Node API', link: '/guide/node' },
              { text: 'WebAssembly', link: '/guide/wasm' },
              { text: 'CLI Tool', link: '/guide/cli' }
            ]
          },
          { 
            text: 'How it Works',
            items: [
              { text: 'Introduction', link: '/mechanism/' },
              { text: 'Compression Principles', link: '/mechanism/principles' },
              { text: 'Binary Format', link: '/mechanism/binary-format' },
              { text: 'Implementation', link: '/mechanism/implementation' }
            ]
          },
          { text: 'Author Blog', link: 'https://www.elecmonkey.com', target: '_blank' }
        ],

        sidebar: {
          '/guide/': [
            {
              text: 'Quick Start',
              items: [
                { text: 'About JSON Packer', link: '/guide/' },
                { text: 'Rust Core', link: '/guide/rust' },
                { text: 'Node API', link: '/guide/node' },
                { text: 'WebAssembly', link: '/guide/wasm' },
                { text: 'CLI Tool', link: '/guide/cli' }
              ]
            }
          ],
          '/mechanism/': [
            {
              text: 'How it Works',
              items: [
                { text: 'Introduction', link: '/mechanism/' },
                { text: 'Compression Principles', link: '/mechanism/principles' },
                { text: 'Binary Format', link: '/mechanism/binary-format' },
                { text: 'Implementation', link: '/mechanism/implementation' }
              ]
            }
          ]
        },

        socialLinks: [
          { icon: 'github', link: 'https://github.com/elecmonkey/json-packer' }
        ],

        footer: {
          message: 'Released under the MIT License',
          copyright: 'Copyright © 2025 Elecmonkey'
        }
      }
    },
    zh: {
      label: '简体中文',
      lang: 'zh-CN',
      title: 'JSON Packer',
      description: '基于 Rust 的高性能 JSON 压缩库',
      themeConfig: {
        logo: '/favicon-simple.svg',
        nav: [
          { text: '首页', link: '/zh/' },
          { 
            text: '快速开始',
            items: [
              { text: '关于 JSON Packer', link: '/zh/guide/' },
              { text: 'Rust Core', link: '/zh/guide/rust' },
              { text: 'Node API', link: '/zh/guide/node' },
              { text: 'WebAssembly', link: '/zh/guide/wasm' },
              { text: '命令行工具', link: '/zh/guide/cli' }
            ]
          },
          { 
            text: '工作原理',
            items: [
              { text: '介绍', link: '/zh/mechanism/' },
              { text: '压缩原理', link: '/zh/mechanism/principles' },
              { text: '二进制格式', link: '/zh/mechanism/binary-format' },
              { text: '具体实现', link: '/zh/mechanism/implementation' }
            ]
          },
          { text: '作者 Blog', link: 'https://www.elecmonkey.com', target: '_blank' }
        ],

        sidebar: {
          '/zh/guide/': [
            {
              text: '快速开始',
              items: [
                { text: '关于 JSON Packer', link: '/zh/guide/' },
                { text: 'Rust Core', link: '/zh/guide/rust' },
                { text: 'Node API', link: '/zh/guide/node' },
                { text: 'WebAssembly', link: '/zh/guide/wasm' },
                { text: '命令行工具', link: '/zh/guide/cli' }
              ]
            }
          ],
          '/zh/mechanism/': [
            {
              text: '工作原理',
              items: [
                { text: '介绍', link: '/zh/mechanism/' },
                { text: '压缩原理', link: '/zh/mechanism/principles' },
                { text: '二进制格式', link: '/zh/mechanism/binary-format' },
                { text: '具体实现', link: '/zh/mechanism/implementation' }
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
    }
  }
})