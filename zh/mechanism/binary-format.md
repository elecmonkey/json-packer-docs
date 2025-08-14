# 二进制数据格式

本文档详细介绍 json-packer 的二进制数据格式，以及它如何表示 JSON 的树状层级结构。

## 整体数据布局

json-packer 的二进制格式采用以下整体布局：

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   包头区     │   字典表     │   值池区     │   数据区     │
│  (Header)   │(Dictionary) │(String Pool)│   (Data)    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### 包头区 (Header)

```
MAGIC(4字节) + VERSION(1字节) + DICT_LEN(变长) + POOL_LEN(变长)
```

- **MAGIC**: `0x4A 0x43 0x50 0x52` ("JCPR")
- **VERSION**: `0x01` (v1格式) 或 `0x02` (v2格式)
- **DICT_LEN**: 字典表中键的数量 (ULEB128编码)
- **POOL_LEN**: 字符串池中条目数量 (ULEB128编码，v1格式时为0)

### 字典表 (Dictionary)

存储所有 JSON 对象键及其频率，用于构建霍夫曼编码：

```
KEY_COUNT(变长) + [KEY_ENTRY1] + [KEY_ENTRY2] + ...
```

每个 KEY_ENTRY 格式：
```
KEY_LEN(变长) + KEY_BYTES + FREQ(变长)
```

### 值池区 (String Pool) - 仅v2格式

存储重复的字符串值：

```
[POOL_ENTRY1] + [POOL_ENTRY2] + ...
```

每个 POOL_ENTRY 格式：
```
STRING_TAG(3位) + STR_LEN(变长) + STR_BYTES
```

### 数据区 (Data)

存储实际的 JSON 值，使用递归的树状结构表示。

## JSON 树状结构的二进制表示

### 基本原理

JSON 的树状结构通过**递归编码**来表示。每个 JSON 值都以一个 3 位的类型标签开始，然后根据类型跟随相应的数据。

### 类型标签 (3位)

```
000 → null
001 → false  
010 → true
011 → 整数
100 → 浮点数
101 → 字符串
110 → 对象
111 → 数组
```

### 各类型的编码格式

#### 1. 简单值

```
null:  [000]
false: [001] 
true:  [010]
```

#### 2. 整数

```
[011] + IS_UNSIGNED(1位) + VALUE(变长)
```

- IS_UNSIGNED=0: 有符号整数，使用 SLEB128 编码
- IS_UNSIGNED=1: 无符号整数，使用 ULEB128 编码

#### 3. 浮点数

```
[100] + IEEE754_BITS(64位)
```

#### 4. 字符串

**v1 格式:**
```
[101] + LENGTH(变长) + UTF8_BYTES
```

**v2 格式:**
```
[101] + IS_POOL_REF(1位) + DATA
```

- IS_POOL_REF=0: `LENGTH(变长) + UTF8_BYTES`
- IS_POOL_REF=1: `POOL_ID(变长)`

#### 5. 数组

```
[111] + COUNT(变长) + ELEMENT1 + ELEMENT2 + ...
```

每个 ELEMENT 都是完整的递归编码的 JSON 值。

#### 6. 对象

```
[110] + COUNT(变长) + (KEY1 + VALUE1) + (KEY2 + VALUE2) + ...
```

- KEY: 霍夫曼编码的键名
- VALUE: 递归编码的 JSON 值

## 具体示例

### 示例 1: 简单对象

**原始 JSON:**
```json
{"name": "Alice", "age": 25}
```

**编码过程:**

1. **字典表构建:**
   - "name": 频率 1
   - "age": 频率 1
   - 霍夫曼编码: "age"→`0`, "name"→`1`

2. **数据区编码:**
```
[110]           # 对象标签
[10]            # 对象有2个键值对 (ULEB128: 2 = 0x02 = 0b00000010)
[0]             # "age" 的霍夫曼编码
[011][1][11001] # 整数25: 标签+无符号+ULEB128(25)
[1]             # "name" 的霍夫曼编码  
[101][101][Alice...] # 字符串"Alice": 标签+长度5+UTF8字节
```

### 示例 2: 嵌套结构

**原始 JSON:**
```json
{
  "user": {
    "name": "Bob",
    "profile": {
      "age": 30
    }
  },
  "active": true
}
```

**编码后的树状结构:**

```
ROOT_OBJECT [110]
├── COUNT: 2
├── KEY: "active" (霍夫曼编码)
├── VALUE: true [010]
├── KEY: "user" (霍夫曼编码)  
└── VALUE: NESTED_OBJECT [110]
    ├── COUNT: 2
    ├── KEY: "name" (霍夫曼编码)
    ├── VALUE: "Bob" [101][3][B][o][b]
    ├── KEY: "profile" (霍夫曼编码)
    └── VALUE: DEEP_OBJECT [110]
        ├── COUNT: 1
        ├── KEY: "age" (霍夫曼编码)
        └── VALUE: 30 [011][1][11110]
```

### 示例 3: 数组结构

**原始 JSON:**
```json
[1, "hello", null, {"x": 5}]
```

**编码结构:**
```
ARRAY [111]
├── COUNT: 4
├── ELEMENT1: 1 [011][1][1]
├── ELEMENT2: "hello" [101][5][h][e][l][l][o]  
├── ELEMENT3: null [000]
└── ELEMENT4: OBJECT [110]
    ├── COUNT: 1
    ├── KEY: "x" (霍夫曼编码)
    └── VALUE: 5 [011][1][101]
```

## 递归解析过程

### 编码过程

1. **预处理阶段:**
   - 遍历整个 JSON 树，统计所有对象键的频率
   - 构建霍夫曼编码表
   - (v2格式) 统计字符串值，构建字符串池

2. **写入阶段:**
   - 写入包头、字典表、值池
   - 从根节点开始递归编码：
     ```rust
     fn encode_value(value: &Value, writer: &mut BitWriter, huffman: &HuffmanCodec) {
         match value {
             Value::Object(map) => {
                 writer.write_bits(tag::OBJECT, 3);
                 writer.write_uleb128(map.len());
                 for (key, val) in map {
                     huffman.write_key_code(key, writer);
                     encode_value(val, writer, huffman); // 递归!
                 }
             }
             Value::Array(arr) => {
                 writer.write_bits(tag::ARRAY, 3);
                 writer.write_uleb128(arr.len());
                 for item in arr {
                     encode_value(item, writer, huffman); // 递归!
                 }
             }
             // ... 其他类型
         }
     }
     ```

### 解码过程

1. **初始化阶段:**
   - 读取包头，获取版本和长度信息
   - 读取字典表，重建霍夫曼编码表
   - (v2格式) 读取字符串池

2. **解析阶段:**
   - 从根节点开始递归解析：
     ```rust
     fn decode_value(reader: &mut BitReader, huffman: &HuffmanCodec) -> Value {
         let tag = reader.read_bits(3);
         match tag {
             tag::OBJECT => {
                 let count = reader.read_uleb128();
                 let mut map = Map::new();
                 for _ in 0..count {
                     let key = huffman.decode_key(reader);
                     let val = decode_value(reader, huffman); // 递归!
                     map.insert(key, val);
                 }
                 Value::Object(map)
             }
             tag::ARRAY => {
                 let count = reader.read_uleb128();
                 let mut arr = Vec::new();
                 for _ in 0..count {
                     arr.push(decode_value(reader, huffman)); // 递归!
                 }
                 Value::Array(arr)
             }
             // ... 其他类型
         }
     }
     ```

## 树状结构的保持机制

### 1. 深度优先遍历

编码和解码都采用深度优先的顺序，确保树状结构的完整性：

```
原始树:        编码顺序:       解码顺序:
  A             1. A           1. 读到A(对象)
 / \            2. B           2. 读到B(字符串)  
B   C           3. C           3. 读到C(数组)
   /|\          4. D           4. 读到D(数字)
  D E F         5. E           5. 读到E(数字)
                6. F           6. 读到F(数字)
```

### 2. 长度前缀

对于容器类型（对象、数组），总是先写入元素数量，这样解码器知道需要读取多少个子元素：

```
对象编码: [对象标签] [键值对数量] [键值对1] [键值对2] ...
数组编码: [数组标签] [元素数量] [元素1] [元素2] ...
```

### 3. 递归边界

每个值的编码都是自包含的，递归有明确的边界：
- 简单值（null、布尔、数字、字符串）：没有子节点，递归终止
- 容器值（对象、数组）：有明确的子元素数量，递归有界

### 4. 位流同步

使用位流确保编码和解码的同步：
- 编码器按顺序写入位流
- 解码器按相同顺序读取位流
- 变长编码确保边界清晰