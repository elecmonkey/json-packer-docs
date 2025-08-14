# Implementation

json-packer is an efficient JSON binary compression library that achieves lossless compression through various optimization techniques while ensuring deterministic compression results. This document details its core principles and technical implementation.

## Core Architecture

json-packer adopts a layered architecture design, including the following core modules:

- **Encoder (encode.rs)**: Responsible for compressing JSON data into binary format
- **Decoder (decode.rs)**: Responsible for restoring JSON from binary data
- **Huffman Encoding (huffman.rs)**: Compresses JSON object keys
- **String Pool (pool.rs)**: Deduplicates repeated string values
- **Bitstream Processing (bitstream.rs)**: Efficient bit-level read/write operations
- **Variable-Length Integer (varint.rs)**: Compact integer encoding
- **Type System (types.rs)**: Defines JSON value type tags

## Data Format Design

### Overall Structure

The compressed binary data adopts the following format:

```
[Header] [Dictionary] [String Pool] [Data Section]
```

#### Header Structure

The header is located at the beginning of the data and contains format identification and version information:

```rust
// header.rs:3
pub const MAGIC: [u8; 4] = *b"JCPR"; // File identifier
pub const VERSION_V1: u8 = 0x01;      // v1 format (no value pool)
pub const VERSION_V2: u8 = 0x02;      // v2 format (enable value pool)
```

Header format: `MAGIC(4 bytes) + VERSION(1 byte) + DICT_LEN(variable) + POOL_LEN(variable)`

#### Dictionary Table

The dictionary table stores all JSON object keys and their frequency statistics for building Huffman encoding tree:

```rust
// dict.rs:37
pub fn write_dictionary(writer: &mut BitWriter, freq_map: &HashMap<String, u64>) {
    varint::write_uleb128(writer, freq_map.len() as u64);
    // Sort by lexicographical order to ensure deterministic output
    let mut sorted_keys: Vec<_> = freq_map.iter().collect();
    sorted_keys.sort_by(|a, b| a.0.cmp(b.0));
    
    for (key, &freq) in sorted_keys {
        // Key length + key content + key frequency
        varint::write_uleb128(writer, key.len() as u64);
        writer.write_bytes(key.as_bytes());
        varint::write_uleb128(writer, freq);
    }
}
```

#### String Pool (v2 format)

The string pool stores repeated string values for deduplication compression:

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

#### Data Section

The data section stores actual JSON values using type tags and corresponding encoding formats.

## Type Encoding System

### Type Tags

json-packer uses 3-bit type tags to identify JSON value types:

```rust
// types.rs:3-11
pub mod tag {
    pub const NULL: u8 = 0b000;       // null
    pub const BOOL_FALSE: u8 = 0b001; // false
    pub const BOOL_TRUE: u8 = 0b010;  // true
    pub const INT: u8 = 0b011;        // integer
    pub const FLOAT: u8 = 0b100;      // float
    pub const STRING: u8 = 0b101;     // string
    pub const OBJECT: u8 = 0b110;     // object
    pub const ARRAY: u8 = 0b111;      // array
}
```

### Numeric Encoding

#### Integer Encoding

Integer type adds 1-bit sign identifier after the type tag:

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

- **Signed integer**: Uses SLEB128 variable-length encoding
- **Unsigned integer**: Uses ULEB128 variable-length encoding

#### Float Encoding

Floats directly use IEEE 754 double precision format:

```rust
// encode.rs:23-27
else if let Some(f) = n.as_f64() {
    if !f.is_finite() { return Err(Error::IllegalFloat); }
    writer.write_bits(tag::FLOAT as u64, 3);
    writer.write_bits(f.to_bits(), 64);
}
```

### String Encoding

String encoding supports two modes:

#### v1 Format (Direct Encoding)

```rust
// encode.rs:31-36
Value::String(s) => {
    writer.write_bits(tag::STRING as u64, 3);
    let bytes = s.as_bytes();
    varint::write_uleb128(writer, bytes.len() as u64);
    writer.write_bytes(bytes);
}
```

#### v2 Format (Support Pool Reference)

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
// Non-reference path
writer.write_bits(tag::STRING as u64, 3);
writer.write_bits(0, 1); // is_pool_ref
// ... write string content
```

## Huffman Encoding Optimization

### Canonical Huffman Encoding

json-packer uses Canonical Huffman encoding for JSON object keys to ensure the same input produces the same encoding result:

```rust
// huffman.rs:51-92
pub fn from_frequencies(freq_map: &HashMap<String, u64>) -> Result<Self, Error> {
    // 1. Sort symbols by lexicographical order to ensure determinism
    let mut symbols: Vec<(String, u64)> = freq_map.iter()
        .map(|(k, &f)| (k.clone(), f))
        .collect();
    symbols.sort_by(|a, b| a.0.cmp(&b.0));

    // 2. Build Huffman tree and calculate code lengths
    let code_lengths = build_code_lengths(&symbols);

    // 3. Canonical encoding: sort by (code length, lexicographical order)
    let mut by_len: Vec<(usize, &str)> = symbols.iter()
        .enumerate()
        .map(|(i, (k, _))| (code_lengths[i], k.as_str()))
        .collect();
    by_len.sort_by(|a, b| a.0.cmp(&b.0).then(a.1.cmp(b.1)));

    // 4. Assign codewords
    let mut next_code = vec![0u32; max_len + 1];
    let mut code: u32 = 0;
    for bits in 1..=max_len {
        code = (code + bl_count[bits - 1] as u32) << 1;
        next_code[bits] = code;
    }
}
```

### Encoding Characteristics

- **Determinism**: The same key frequency distribution always produces the same encoding
- **Optimality**: Optimal prefix encoding based on frequency statistics
- **LSB First**: Encoding bit order uses least significant bit first for bitstream operations

## String Pool Mechanism

### Pooling Strategy

The string pool mechanism counts repetition frequency of string values and extracts qualified strings into the pool:

```rust
// pool.rs:25-53
pub fn collect_string_pool(root: &Value, cfg: PoolConfig) -> StringPool {
    let mut counter: HashMap<String, u32> = HashMap::new();
    // Traverse all string values
    walk(root, &mut counter);

    // Filter conditions: frequency >= min_repeats && length >= min_string_len
    let mut candidates: Vec<(String, u32)> = counter.into_iter()
        .filter(|(s, c)| *c >= cfg.min_repeats && s.len() >= cfg.min_string_len)
        .collect();
    
    // Sort: frequency descending, lexicographical ascending (ensure determinism)
    candidates.sort_by(|a, b| b.1.cmp(&a.1).then(a.0.cmp(&b.0)));
}
```

### Pooling Configuration

```rust
// pool.rs:15-23
#[derive(Debug, Clone, Copy)]
pub struct PoolConfig {
    pub min_repeats: u32,      // Minimum repetition count (default 3)
    pub min_string_len: usize, // Minimum string length (default 8)
}
```

## Bitstream Processing Mechanism

### LSB First Bit Order

json-packer adopts LSB (Least Significant Bit first) bit order processing:

```rust
// bitstream.rs:15-36
pub fn write_bits(&mut self, mut value: u64, mut n_bits: u32) {
    while n_bits > 0 {
        let take = (64 - self.bit_len as u32).min(n_bits);
        let mask = if take == 64 { u64::MAX } else { (1u64 << take) - 1 };
        let chunk = value & mask;
        self.bit_bucket |= chunk << self.bit_len; // LSB first filling
        self.bit_len += take as u8;
        value >>= take;
        n_bits -= take;

        // Write byte when 8 bits are full
        while self.bit_len >= 8 {
            self.buffer.push((self.bit_bucket & 0xFF) as u8);
            self.bit_bucket >>= 8;
            self.bit_len -= 8;
        }
    }
}
```

### Advantages

- **Efficient buffering**: Use 64-bit buffer to reduce memory operations
- **Bit alignment**: Automatically handle bit boundary alignment
- **Streaming processing**: Support streaming read/write with controllable memory usage

## Variable-Length Integer Encoding

### ULEB128/SLEB128

json-packer uses LEB128 format to encode integers:

```rust
// varint.rs:3-12
pub fn write_uleb128(writer: &mut BitWriter, mut value: u64) {
    loop {
        let mut byte = (value & 0x7F) as u8;
        value >>= 7;
        if value != 0 { byte |= 0x80; } // Continuation bit
        writer.write_byte(byte);
        if value == 0 { break; }
    }
}
```

### Encoding Efficiency

- **Compactness**: Small integers occupy fewer bytes
- **Unsigned/signed**: Separate optimization handling
- **Standard format**: Compatible with universal LEB128 standard

## Determinism Guarantee

### Sorting Strategy

To ensure the same input produces the same output, json-packer adopts deterministic sorting in key operations:

1. **Dictionary key sorting**: Sort by lexicographical order (`dict.rs:42`)
2. **Huffman symbol sorting**: Sort by lexicographical order (`huffman.rs:26`)
3. **String pool sorting**: Frequency descending + lexicographical ascending (`pool.rs:44`)

### Build Process Determinism

Huffman tree construction uses deterministic merge strategy:

```rust
// huffman.rs:156-159
impl Ord for OrdNode {
    fn cmp(&self, other: &Self) -> Ordering {
        // Lower frequency first, then minimum symbol index first
        other.0.freq.cmp(&self.0.freq).then(other.0.min_sym_idx.cmp(&self.0.min_sym_idx))
    }
}
```

## Performance Optimization

### Memory Management

- **Pre-allocate capacity**: Pre-allocate `Vec` capacity based on element count
- **Zero-copy design**: String processing avoids unnecessary copying
- **Bit operation optimization**: Use bitwise operations instead of division/modulo

### Encoding Efficiency

- **Type tag compression**: Only use 3 bits to represent 8 JSON types
- **Variable-length encoding**: Integer length dynamically adjusts based on value size
- **Huffman compression**: Object keys optimize encoding length based on frequency

## Error Handling

json-packer defines a complete error type system:

```rust
// error.rs
pub enum Error {
    BadMagic,                    // File header identifier error
    BadVersion,                  // Version not supported
    BitstreamOutOfBounds,        // Bitstream out of bounds
    VarintError,                 // Variable-length integer error
    IllegalFloat,                // Illegal float (NaN/Inf)
    HuffmanError,                // Huffman encoding error
    PoolMissing,                 // Value pool missing
    PoolIdOutOfRange,            // Pool ID out of range
    // ...
}
```

## Version Compatibility

### v1 Format (Basic Compression)

- No string value pool
- Support Huffman key compression
- Best compatibility

### v2 Format (Enhanced Compression)

- Enable string value pool
- Higher compression ratio
- Backward compatible with v1 decoding

Compression options control:

```rust
// encode.rs:55-64
#[derive(Debug, Clone)]
pub struct CompressOptions {
    pub enable_value_pool: bool,     // Enable value pool (automatically use v2 format)
    pub pool_min_repeats: u32,       // Pool minimum repetition count
    pub pool_min_string_len: usize,  // Pool minimum string length
}
```