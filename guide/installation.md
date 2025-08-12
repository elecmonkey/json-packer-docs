# 安装

根据你的项目平台，选择相应的安装方法。

## Rust

```bash
cargo add json-packer
```

或者在 `Cargo.toml` 中添加依赖：

```toml
[dependencies]
json-packer = "0.1.0"
```

## Node.js

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

### 要求

Node.js 16.0.0 或更高版本

### 预编译二进制文件

提供以下平台的二进制预编译文件：
- Windows (x64)
- macOS (x64, arm64)
- Linux (x64, arm64)

## WebAssembly

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

### 浏览器支持

需要支持 WebAssembly 和 ES Modules 规范。

### 构建工具配置

如果你使用的是现代构建工具（如 Vite、Webpack 5+），通常不需要额外配置。

对于较老的构建工具，你可能需要添加 WebAssembly 支持：

#### Webpack 4
```javascript
// webpack.config.js
module.exports = {
  experiments: {
    asyncWebAssembly: true
  }
};
```

#### Rollup
```javascript
// rollup.config.js
import { wasm } from '@rollup/plugin-wasm';

export default {
  plugins: [
    wasm()
  ]
};
```