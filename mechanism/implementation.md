# 原理

json-packer 是一个高效的JSON二进制压缩库，它通过多种优化技术实现了无损压缩，同时保证了压缩结果的确定性。本文档详细介绍其核心原理和技术实现。

## 核心架构

json-packer 采用分层架构设计，包含以下核心模块：

- **编码器（encode.rs）**：负责将 JSON 数据压缩为二进制格式
- **解码器（decode.rs）**：负责从二进制数据还原 JSON
- **霍夫曼编码（huffman.rs）**：对 JSON 对象键进行压缩
- **字符串池（pool.rs）**：对重复字符串值进行去重
- **位流处理（bitstream.rs）**：高效的位级读写操作
- **变长整数（varint.rs）**：紧凑的整数编码
- **类型系统（types.rs）**：定义 JSON 值类型标签

## 数据格式设计

### 整体结构

压缩后的二进制数据采用以下格式：

```
[包头] [字典表] [值池区] [数据区]
```

#### 包头结构

包头位于数据开始位置，包含格式识别和版本信息：

```rust
// header.rs:3
pub const MAGIC: [u8; 4] = *b"JCPR"; // 文件标识
pub const VERSION_V1: u8 = 0x01;      // v1格式（无值池）
pub const VERSION_V2: u8 = 0x02;      // v2格式（启用值池）
```

包头格式：`MAGIC(4字节) + VERSION(1字节) + DICT_LEN(变长) + POOL_LEN(变长)`

#### 字典表

字典表存储所有 JSON 对象键及其频率统计，用于构建霍夫曼编码树：

```rust
// dict.rs:37
pub fn write_dictionary(writer: &mut BitWriter, freq_map: &HashMap<String, u64>) {
    varint::write_uleb128(writer, freq_map.len() as u64);
    // 按字典序排序，确保确定性输出
    let mut sorted_keys: Vec<_> = freq_map.iter().collect();
    sorted_keys.sort_by(|a, b| a.0.cmp(b.0));
    
    for (key, &freq) in sorted_keys {
        // 键长度 + 键内容 + 键频率
        varint::write_uleb128(writer, key.len() as u64);
        writer.write_bytes(key.as_bytes());
        varint::write_uleb128(writer, freq);
    }
}
```

#### 值池区（v2格式）

值池区存储重复的字符串值，用于去重压缩：

```rust
// pool.rs:55
pub fn write_string_pool(writer: &mut BitWriter, pool: &StringPool) {
    for s in &pool.entries {
        writer.write_bits(tag::STRING as u64, 3);
        let bytes = s.as_bytes();
        varint::write_uleb128(writer, bytes.len() as u64);
        writer.write_bytes(bytes);
    }
}
```

#### 数据区

数据区存储实际的 JSON 值，使用类型标签和相应的编码格式。

## 类型编码系统

### 类型标签

json-packer 使用 3 位类型标签来标识 JSON 值类型：

```rust
// types.rs:3-11
pub mod tag {
    pub const NULL: u8 = 0b000;       // null
    pub const BOOL_FALSE: u8 = 0b001; // false
    pub const BOOL_TRUE: u8 = 0b010;  // true
    pub const INT: u8 = 0b011;        // 整数
    pub const FLOAT: u8 = 0b100;      // 浮点数
    pub const STRING: u8 = 0b101;     // 字符串
    pub const OBJECT: u8 = 0b110;     // 对象
    pub const ARRAY: u8 = 0b111;      // 数组
}
```

### 数值编码

#### 整数编码

整数类型在类型标签后增加 1 位符号标识：

```rust
// encode.rs:12-29
Value::Number(n) => {
    if let Some(i) = n.as_i64() {
        writer.write_bits(tag::INT as u64, 3);
        writer.write_bits(0, 1); // is_unsigned = 0
        varint::write_sleb128(writer, i);
    } else if let Some(u) = n.as_u64() {
        writer.write_bits(tag::INT as u64, 3);
        writer.write_bits(1, 1); // is_unsigned = 1
        varint::write_uleb128(writer, u);
    }
}
```

- **有符号整数**：使用 SLEB128 变长编码
- **无符号整数**：使用 ULEB128 变长编码

#### 浮点数编码

浮点数直接使用 IEEE 754 双精度格式：

```rust
// encode.rs:23-27
else if let Some(f) = n.as_f64() {
    if !f.is_finite() { return Err(Error::IllegalFloat); }
    writer.write_bits(tag::FLOAT as u64, 3);
    writer.write_bits(f.to_bits(), 64);
}
```

### 字符串编码

字符串编码支持两种模式：

#### v1 格式（直接编码）

```rust
// encode.rs:31-36
Value::String(s) => {
    writer.write_bits(tag::STRING as u64, 3);
    let bytes = s.as_bytes();
    varint::write_uleb128(writer, bytes.len() as u64);
    writer.write_bytes(bytes);
}
```

#### v2 格式（支持池引用）

```rust
// encode.rs:95-119
if let Some(pool) = string_pool {
    if let Some(&id) = pool.index.get(s) {
        writer.write_bits(tag::STRING as u64, 3);
        writer.write_bits(1, 1); // is_pool_ref
        varint::write_uleb128(writer, id);
        return Ok(());
    }
}
// 非引用路径
writer.write_bits(tag::STRING as u64, 3);
writer.write_bits(0, 1); // is_pool_ref
// ... 写入字符串内容
```

## 霍夫曼编码优化

### Canonical霍夫曼编码

json-packer 对 JSON 对象键使用 Canonical 霍夫曼编码，确保相同输入产生相同的编码结果：

```rust
// huffman.rs:51-92
pub fn from_frequencies(freq_map: &HashMap<String, u64>) -> Result<Self, Error> {
    // 1. 按字典序排序符号，确保确定性
    let mut symbols: Vec<(String, u64)> = freq_map.iter()
        .map(|(k, &f)| (k.clone(), f))
        .collect();
    symbols.sort_by(|a, b| a.0.cmp(&b.0));

    // 2. 构建霍夫曼树，计算码长
    let code_lengths = build_code_lengths(&symbols);

    // 3. Canonical编码：按(码长, 字典序)排序
    let mut by_len: Vec<(usize, &str)> = symbols.iter()
        .enumerate()
        .map(|(i, (k, _))| (code_lengths[i], k.as_str()))
        .collect();
    by_len.sort_by(|a, b| a.0.cmp(&b.0).then(a.1.cmp(b.1)));

    // 4. 分配码字
    let mut next_code = vec![0u32; max_len + 1];
    let mut code: u32 = 0;
    for bits in 1..=max_len {
        code = (code + bl_count[bits - 1] as u32) << 1;
        next_code[bits] = code;
    }
}
```

### 编码特点

- **确定性**：相同的键频率分布总是产生相同的编码
- **最优性**：基于频率统计的最优前缀编码
- **LSB优先**：编码位序采用低位优先，便于位流操作

## 字符串池机制

### 池化策略

字符串池机制通过统计字符串值的重复频率，将符合条件的字符串提取到池中：

```rust
// pool.rs:25-53
pub fn collect_string_pool(root: &Value, cfg: PoolConfig) -> StringPool {
    let mut counter: HashMap<String, u32> = HashMap::new();
    // 遍历所有字符串值
    walk(root, &mut counter);

    // 筛选条件：频次 >= min_repeats && 长度 >= min_string_len
    let mut candidates: Vec<(String, u32)> = counter.into_iter()
        .filter(|(s, c)| *c >= cfg.min_repeats && s.len() >= cfg.min_string_len)
        .collect();
    
    // 排序：频次降序，字典序升序（确保确定性）
    candidates.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
}
```

### 池化配置

```rust
// pool.rs:15-23
#[derive(Debug, Clone, Copy)]
pub struct PoolConfig {
    pub min_repeats: u32,      // 最小重复次数（默认3）
    pub min_string_len: usize, // 最小字符串长度（默认8）
}
```

## 位流处理机制

### LSB优先位序

json-packer 采用 LSB（最低位优先）的位序处理：

```rust
// bitstream.rs:15-36
pub fn write_bits(&mut self, mut value: u64, mut n_bits: u32) {
    while n_bits > 0 {
        let take = (64 - self.bit_len as u32).min(n_bits);
        let mask = if take == 64 { u64::MAX } else { (1u64 << take) - 1 };
        let chunk = value & mask;
        self.bit_bucket |= chunk << self.bit_len; // 低位优先填充
        self.bit_len += take as u8;
        value >>= take;
        n_bits -= take;

        // 满8位就写入字节
        while self.bit_len >= 8 {
            self.buffer.push((self.bit_bucket & 0xFF) as u8);
            self.bit_bucket >>= 8;
            self.bit_len -= 8;
        }
    }
}
```

### 优势

- **高效缓冲**：使用64位缓冲区减少内存操作
- **位对齐**：自动处理位边界对齐
- **流式处理**：支持流式读写，内存占用可控

## 变长整数编码

### ULEB128/SLEB128

json-packer 使用 LEB128 格式编码整数：

```rust
// varint.rs:3-12
pub fn write_uleb128(writer: &mut BitWriter, mut value: u64) {
    loop {
        let mut byte = (value & 0x7F) as u8;
        value >>= 7;
        if value != 0 { byte |= 0x80; } // 续传位
        writer.write_byte(byte);
        if value == 0 { break; }
    }
}
```

### 编码效率

- **紧凑性**：小整数占用更少字节
- **无符号/有符号**：分别优化处理
- **标准格式**：兼容通用 LEB128 标准

## 确定性保证

### 排序策略

为确保相同输入产生相同输出，json-packer 在关键环节采用确定性排序：

1. **字典键排序**：按字典序排序 (`dict.rs:42`)
2. **霍夫曼符号排序**：按字典序排序 (`huffman.rs:26`)
3. **字符串池排序**：频次降序 + 字典序升序 (`pool.rs:44`)

### 构建过程确定性

霍夫曼树构建使用确定性合并策略：

```rust
// huffman.rs:156-159
impl Ord for OrdNode {
    fn cmp(&self, other: &Self) -> Ordering {
        // 频率小的优先，其次最小符号索引优先
        other.0.freq.cmp(&self.0.freq).then(other.0.min_sym_idx.cmp(&self.0.min_sym_idx))
    }
}
```

## 性能优化

### 内存管理

- **预分配容量**：根据元素数量预分配 `Vec` 容量
- **零拷贝设计**：字符串处理避免不必要的复制
- **位操作优化**：使用位运算替代除法/取模

### 编码效率

- **类型标签压缩**：仅用3位表示8种JSON类型
- **变长编码**：整数长度根据值大小动态调整
- **霍夫曼压缩**：对象键根据频率优化编码长度

## 错误处理

json-packer 定义了完整的错误类型系统：

```rust
// error.rs
pub enum Error {
    BadMagic,                    // 文件头标识错误
    BadVersion,                  // 版本不支持
    BitstreamOutOfBounds,        // 位流越界
    VarintError,                 // 变长整数错误
    IllegalFloat,                // 非法浮点数（NaN/Inf）
    HuffmanError,                // 霍夫曼编码错误
    PoolMissing,                 // 值池缺失
    PoolIdOutOfRange,            // 池ID越界
    // ...
}
```

## 版本兼容性

### v1格式（基础压缩）

- 无字符串值池
- 支持霍夫曼键压缩
- 兼容性最佳

### v2格式（增强压缩）

- 启用字符串值池
- 更高的压缩率
- 向后兼容v1解码

压缩选项控制：

```rust
// encode.rs:55-64
#[derive(Debug, Clone)]
pub struct CompressOptions {
    pub enable_value_pool: bool,     // 启用值池（自动使用v2格式）
    pub pool_min_repeats: u32,       // 池化最小重复次数
    pub pool_min_string_len: usize,  // 池化最小字符串长度
}
```