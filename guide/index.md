# 快速开始

欢迎使用 JSON Packer！这是一个基于 Rust 的高性能 JSON 压缩库，支持多个平台。

## 什么是 JSON Packer？

JSON Packer 是一个专为高性能 JSON 数据压缩而设计的库，采用 Rust 语言开发，提供了：

- 🦀 **Rust 核心**：内存安全 + 零成本抽象
- 🗜️ **智能压缩**：Huffman 键编码 + 字符串值池
- 💻 **多平台支持**：Rust + Node.js + WebAssembly

## 选择你的平台

 - [Rust 平台](../platform/rust)
 - [Node.js 平台](../platform/node)
 - [WebAssembly 平台](../platform/wasm)

## 核心特性

### 高性能压缩
- 使用 Huffman 编码优化 JSON 键的存储
- 可选择的字符串值池，减少重复数据

### 多平台支持
- **Rust Core**：核心可以直接被 Rust 程序使用
- **Node.js API**：通过 NAPI 绑定，无缝集成到 Node.js 项目
- **WebAssembly**：通过 wasm-pack 生成 WebAssembly 模块，在浏览器中运行，支持前端应用