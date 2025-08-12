# 快速开始

欢迎使用 JSON Packer！这是一个基于 Rust 的高性能 JSON 压缩库，支持多个平台。

## 什么是 JSON Packer？

JSON Packer 是一个专为高性能 JSON 数据压缩而设计的库，采用 Rust 语言开发，提供了：

- 🦀 **Rust 核心**：内存安全 + 零成本抽象
- 🗜️ **智能压缩**：Huffman 键编码 + 字符串值池
- 💻 **多平台支持**：Rust + Node.js + WebAssembly

## 选择你的平台

 - [Rust 平台](./rust)
 - [Node.js 平台](./node)
 - [WebAssembly 平台](./wasm)

## 核心特性

### 高性能压缩
- 使用 Huffman 编码优化 JSON 键的存储
- 可选择的字符串值池，减少重复数据

### 多平台支持
- **Rust Core**：核心可以直接被 Rust 程序使用
- **Node.js API**：通过 NAPI 绑定，无缝集成到 Node.js 项目
- **WebAssembly**：通过 wasm-pack 生成 WebAssembly 模块，在浏览器中运行，支持前端应用

## 平台使用指南

### Rust

```bash
cargo add json-packer
```

或者在 `Cargo.toml` 中添加依赖：

```toml
[dependencies]
json-packer = "0.1.0"
```

#### API

```rust
use json_packer::{compress, decompress};

// 压缩
let json_str = r#"{"name": "Alice", "age": 30}"#;
let compressed = compress(json_str, &Default::default()).unwrap();

// 解压
let decompressed = decompress(&compressed).unwrap();
assert_eq!(json_str, decompressed);
```

#### 压缩选项

```rust
use json_packer::{compress, CompressOptions};

let options = CompressOptions {
    enable_value_pool: true,   // 启用字符串值池
    pool_min_repeats: 3,       // 字符串至少重复3次才进入池
    pool_min_string_len: 8,    // 字符串至少8个字符才考虑池化
};

let compressed = compress(json_str, &options).unwrap();
```

### Node.js

使用你喜欢的包管理器安装：

::: code-group

```bash [pnpm]
pnpm add json-packer-napi
```

```bash [npm]
npm install json-packer-napi
```

```bash [yarn]
yarn add json-packer-napi
```

:::

#### 要求

Node.js 16.0.0 或更高版本

#### 预编译二进制文件

提供以下平台的二进制预编译文件：
- Windows (x64)
- macOS (x64, arm64)
- Linux (x64, arm64)

#### API

```javascript
const { compress, decompress, CompressOptions } = require('json-packer-napi');

// 压缩
const jsonStr = '{"name": "Alice", "age": 30}';
const compressed = compress(jsonStr);

// 解压
const decompressed = decompress(compressed);
console.log(decompressed); // '{"name":"Alice","age":30}'

// 带选项压缩
const options = new CompressOptions();
options.enableValuePool = true;
options.poolMinRepeats = 3;
options.poolMinStringLength = 8;

const compressedWithOptions = compress(jsonStr, options);
```

### WebAssembly

对于浏览器环境，安装 WebAssembly 版本：

::: code-group

```bash [pnpm]
pnpm add json-packer-wasm
```

```bash [npm]
npm install json-packer-wasm
```

```bash [yarn]
yarn add json-packer-wasm
```

:::

#### 浏览器支持

需要支持 WebAssembly 和 ES Modules 规范。

#### API

##### 核心函数

```typescript
// 压缩为字节数组
export function compress_to_bytes(jsonString: string, options: Options): Uint8Array;

// 压缩为 Base64 字符串
export function compress_to_base64(jsonString: string, options: Options): string;

// 从字节数组解压
export function decompress_from_bytes(bytes: Uint8Array): string;

// 从 Base64 字符串解压
export function decompress_from_base64(base64: string): string;
```

##### 配置选项

```typescript
export class Options {
  constructor(
    enable_value_pool: boolean,
    pool_min_repeats: number,
    pool_min_string_len: number
  );
}
```

#### 示例

##### 浏览器（ES Modules）

```javascript
import init, { Options, compress_to_base64, decompress_from_base64 } from 'json-packer-wasm';

async function example() {
  // 初始化 WASM 模块
  await init();

  const data = { name: "Alice", age: 30, active: true };
  const jsonStr = JSON.stringify(data);

  // 创建压缩选项
  const options = new Options(false, 3, 8); // 不启用值池

  // 压缩
  const compressed = compress_to_base64(jsonStr, options);
  console.log('Compressed:', compressed);

  // 解压
  const decompressed = decompress_from_base64(compressed);
  const restored = JSON.parse(decompressed);
  console.log('Restored:', restored);
}

example();
```

##### 启用字符串值池

```javascript
import init, { Options, compress_to_bytes, decompress_from_bytes } from 'json-packer-wasm';

await init();

const data = {
  logs: [
    { level: "info", message: "server started successfully" },
    { level: "info", message: "server started successfully" },
    { level: "error", message: "connection timeout occurred" },
    { level: "error", message: "connection timeout occurred" }
  ]
};

// 启用值池：重复 2 次以上，长度 >= 6 的字符串进入值池
const options = new Options(true, 2, 6);

const compressed = compress_to_bytes(JSON.stringify(data), options);
const restored = JSON.parse(decompress_from_bytes(compressed));

console.log('Original size:', new TextEncoder().encode(JSON.stringify(data)).length);
console.log('Compressed size:', compressed.length);
```

#### 构建工具配置

如果你使用的是现代构建工具（如 Vite、Webpack 5+），通常不需要额外配置。

对于较老的构建工具，你可能需要添加 WebAssembly 支持：

##### Webpack 4
```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true
  }
};
```

##### Rollup
```javascript
// rollup.config.js
import { wasm } from '@rollup/plugin-wasm';

export default {
  plugins: [
    wasm()
  ]
};
```