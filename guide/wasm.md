# WebAssembly 平台

JSON Packer 提供了高性能的 WebAssembly 绑定，适用于浏览器和 Node.js 环境。

## 版本更新 (v0.1.1)

- **体积优化**：WASM 包体积从 165KB 优化至 112KB，减小 32.1%。胶水 JavaScript 代码启用了压缩。

## 安装

```bash
npm install json-packer-wasm
# 或
yarn add json-packer-wasm
# 或
pnpm add json-packer-wasm
```

## API

### 核心函数

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

### 配置选项

```typescript
export class Options {
  constructor(
    enable_value_pool: boolean,
    pool_min_repeats: number,
    pool_min_string_len: number
  );
}
```

## 示例

### 浏览器（ES Modules）

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

### 启用字符串值池

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