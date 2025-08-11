# Rust 平台

JSON Packer 的 Rust 核心库提供了轻量、可逆的 JSON 二进制压缩功能。

## 安装

```bash
cargo add json-packer
```

在 `Cargo.toml` 中添加依赖：

```toml
[dependencies]
json-packer = "0.1.0"
```

## API

### 核心函数

```rust
// 压缩 / 解压（字节）
pub fn compress_to_bytes(value: &serde_json::Value, opts: &CompressOptions) -> Result<Vec<u8>, Error>;
pub fn decompress_from_bytes(bytes: &[u8]) -> Result<serde_json::Value, Error>;

// 压缩 / 解压（Base64）
pub fn compress_to_base64(value: &serde_json::Value, opts: &CompressOptions) -> Result<String, Error>;
pub fn decompress_from_base64(s: &str) -> Result<serde_json::Value, Error>;
```

### 配置选项

```rust
#[derive(Clone, Debug)]
pub struct CompressOptions {
    pub enable_value_pool: bool,     // 是否启用字符串值池（默认 false）
    pub pool_min_repeats: u32,       // 计入值池的最小重复次数（默认 3）
    pub pool_min_string_len: usize,  // 计入值池的最小字符串长度（默认 8）
}
```

## 示例

### 基本压缩

```rust
use json_packer::{compress_to_base64, decompress_from_base64, CompressOptions};
use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let data = json!({
        "ok": true,
        "count": 42,
        "name": "Alice"
    });

    // 压缩
    let compressed = compress_to_base64(&data, &CompressOptions::default())?;
    println!("压缩结果: {}", compressed);

    // 解压
    let decompressed = decompress_from_base64(&compressed)?;
    assert_eq!(data, decompressed);
    
    println!("数据完整性验证通过！");
    Ok(())
}
```

### 启用字符串值池

```rust
use json_packer::{compress_to_bytes, decompress_from_bytes, CompressOptions};
use serde_json::json;

fn main() -> Result<(), Box<dyn std::error::Error>> {
    let options = CompressOptions {
        enable_value_pool: true,    // 启用字符串值池
        pool_min_repeats: 3,        // 最小重复次数
        pool_min_string_len: 8,     // 最小字符串长度
    };

    let data = json!({
        "items": [
            {"status": "connected", "message": "connected to server"},
            {"status": "connected", "message": "connected to server"},
            {"status": "connected", "message": "connected to server"}
        ]
    });

    // 压缩（启用值池会自动使用 v2 格式）
    let compressed = compress_to_bytes(&data, &options)?;
    
    // 解压
    let decompressed = decompress_from_bytes(&compressed)?;
    assert_eq!(data, decompressed);

    println!("原始大小: {} 字节", serde_json::to_string(&data)?.len());
    println!("压缩大小: {} 字节", compressed.len());
    println!("压缩率: {:.1}%", 
        (1.0 - compressed.len() as f64 / serde_json::to_string(&data)?.len() as f64) * 100.0);

    Ok(())
}
```