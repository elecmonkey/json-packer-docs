import { computed } from 'vue'
import { useData } from 'vitepress'

// 主页文本配置
const homeTexts = {
  en: {
    badge: 'High-performance JSON compression',
    title: 'JSON Packer',
    subtitle: 'JSON compression library built with Rust',
    features: {
      rust: {
        title: 'Rust Core',
        desc: 'Memory safety'
      },
      compression: {
        title: 'Smart Compression',
        desc: 'Huffman + Value Pool'
      },
      platforms: {
        title: 'Multi-platform',
        desc: 'Rust + Node + WASM'
      }
    },
    installation: {
      quickStart: 'Quick Start',
      platforms: {
        rust: '🦀 Rust',
        node: '📦 Node',
        web: '🌐 WASM'
      }
    },
    demo: {
      title: 'Playground',
      subtitle: 'Experience the WebAssembly version in your browser',
      inputLabel: 'Original JSON Data',
      outputLabel: 'Compression Result',
      inputPlaceholder: 'Enter your JSON data...',
      outputPlaceholder: 'Compression result will be displayed here...',
      valuePool: 'String Value Pool',
      repeatCount: 'Repeat count:',
      minLength: 'Min length:',
      compressionRatio: 'Compression Ratio',
      originalSize: 'bytes',
      binarySize: 'bytes',
      base64Size: 'Base64',
      decompress: 'Decompress',
      copy: 'Copy',
      error: 'Please enter valid JSON data',
      decompressError: 'Decompression failed, please check input data'
    }
  },
  zh: {
    badge: '高性能 JSON 压缩',
    title: 'JSON Packer',
    subtitle: '基于 Rust 的高性能 JSON 压缩库',
    features: {
      rust: {
        title: 'Rust 核心',
        desc: '内存安全 + 零成本抽象'
      },
      compression: {
        title: '智能压缩',
        desc: 'Huffman + 值池'
      },
      platforms: {
        title: '三大平台',
        desc: 'Rust + Node + WASM'
      }
    },
    installation: {
      quickStart: '快速开始',
      platforms: {
        rust: '🦀 Rust',
        node: '📦 Node',
        web: '🌐 WASM'
      }
    },
    demo: {
      title: 'Playground',
      subtitle: '在浏览器中体验 WebAssembly 版本',
      inputLabel: '原始 JSON 数据',
      outputLabel: '压缩结果',
      inputPlaceholder: '输入您的JSON数据...',
      outputPlaceholder: '压缩结果将显示在这里...',
      valuePool: '字符串值池',
      repeatCount: '重复次数:',
      minLength: '最小长度:',
      compressionRatio: '压缩率',
      originalSize: '字节',
      binarySize: '字节',
      base64Size: 'Base64',
      decompress: '解压缩',
      copy: '复制',
      error: '请输入有效的JSON数据',
      decompressError: '解压缩失败，请检查输入数据'
    }
  }
} as const

export function useI18n() {
  const { site } = useData()
  
  const locale = computed(() => {
    // 从 VitePress 的 site 数据中获取当前语言
    const lang = site.value.lang
    return lang === 'zh-CN' ? 'zh' : 'en'
  })
  
  const t = computed(() => homeTexts[locale.value])
  
  return {
    locale,
    t
  }
}
