# Binary Data Format

This document describes in detail the binary data format of json-packer and how it represents JSON's tree-like hierarchical structure.

## Overall Data Layout

The binary format of json-packer adopts the following overall layout:

```
┌─────────────┬─────────────┬─────────────┬─────────────┐
│   Header    │ Dictionary  │String Pool  │    Data     │
│  (Header)   │(Dictionary) │(String Pool)│   (Data)    │
└─────────────┴─────────────┴─────────────┴─────────────┘
```

### Header

```
MAGIC(4 bytes) + VERSION(1 byte) + DICT_LEN(variable) + POOL_LEN(variable)
```

- **MAGIC**: `0x4A 0x43 0x50 0x52` ("JCPR")
- **VERSION**: `0x01` (v1 format) or `0x02` (v2 format)
- **DICT_LEN**: Number of keys in dictionary table (ULEB128 encoded)
- **POOL_LEN**: Number of entries in string pool (ULEB128 encoded, 0 for v1 format)

### Dictionary

Stores all JSON object keys and their frequencies for building Huffman encoding:

```
KEY_COUNT(variable) + [KEY_ENTRY1] + [KEY_ENTRY2] + ...
```

Each KEY_ENTRY format:
```
KEY_LEN(variable) + KEY_BYTES + FREQ(variable)
```

### String Pool - v2 format only

Stores repeated string values:

```
[POOL_ENTRY1] + [POOL_ENTRY2] + ...
```

Each POOL_ENTRY format:
```
STRING_TAG(3 bits) + STR_LEN(variable) + STR_BYTES
```

### Data Section

Stores actual JSON values using recursive tree-like structure representation.

## Binary Representation of JSON Tree Structure

### Basic Principle

JSON's tree structure is represented through **recursive encoding**. Each JSON value starts with a 3-bit type tag, followed by corresponding data according to the type.

### Type Tags (3 bits)

```
000 → null
001 → false  
010 → true
011 → integer
100 → float
101 → string
110 → object
111 → array
```

### Encoding Format for Each Type

#### 1. Simple Values

```
null:  [000]
false: [001] 
true:  [010]
```

#### 2. Integer

```
[011] + IS_UNSIGNED(1 bit) + VALUE(variable)
```

- IS_UNSIGNED=0: Signed integer, using SLEB128 encoding
- IS_UNSIGNED=1: Unsigned integer, using ULEB128 encoding

#### 3. Float

```
[100] + IEEE754_BITS(64 bits)
```

#### 4. String

**v1 format:**
```
[101] + LENGTH(variable) + UTF8_BYTES
```

**v2 format:**
```
[101] + IS_POOL_REF(1 bit) + DATA
```

- IS_POOL_REF=0: `LENGTH(variable) + UTF8_BYTES`
- IS_POOL_REF=1: `POOL_ID(variable)`

#### 5. Array

```
[111] + COUNT(variable) + ELEMENT1 + ELEMENT2 + ...
```

Each ELEMENT is a complete recursively encoded JSON value.

#### 6. Object

```
[110] + COUNT(variable) + (KEY1 + VALUE1) + (KEY2 + VALUE2) + ...
```

- KEY: Huffman encoded key name
- VALUE: Recursively encoded JSON value

## Specific Examples

### Example 1: Simple Object

**Original JSON:**
```json
{"name": "Alice", "age": 25}
```

**Encoding process:**

1. **Dictionary table construction:**
   - "name": frequency 1
   - "age": frequency 1
   - Huffman encoding: "age"→`0`, "name"→`1`

2. **Data section encoding:**
```
[110]           # Object tag
[10]            # Object has 2 key-value pairs (ULEB128: 2 = 0x02 = 0b00000010)
[0]             # Huffman encoding of "age"
[011][1][11001] # Integer 25: tag+unsigned+ULEB128(25)
[1]             # Huffman encoding of "name"  
[101][101][Alice...] # String "Alice": tag+length 5+UTF8 bytes
```

### Example 2: Nested Structure

**Original JSON:**
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

**Encoded tree structure:**

```
ROOT_OBJECT [110]
├── COUNT: 2
├── KEY: "active" (Huffman encoded)
├── VALUE: true [010]
├── KEY: "user" (Huffman encoded)  
└── VALUE: NESTED_OBJECT [110]
    ├── COUNT: 2
    ├── KEY: "name" (Huffman encoded)
    ├── VALUE: "Bob" [101][3][B][o][b]
    ├── KEY: "profile" (Huffman encoded)
    └── VALUE: DEEP_OBJECT [110]
        ├── COUNT: 1
        ├── KEY: "age" (Huffman encoded)
        └── VALUE: 30 [011][1][11110]
```

### Example 3: Array Structure

**Original JSON:**
```json
[1, "hello", null, {"x": 5}]
```

**Encoded structure:**
```
ARRAY [111]
├── COUNT: 4
├── ELEMENT1: 1 [011][1][1]
├── ELEMENT2: "hello" [101][5][h][e][l][l][o]  
├── ELEMENT3: null [000]
└── ELEMENT4: OBJECT [110]
    ├── COUNT: 1
    ├── KEY: "x" (Huffman encoded)
    └── VALUE: 5 [011][1][101]
```

## Recursive Parsing Process

### Encoding Process

1. **Preprocessing stage:**
   - Traverse the entire JSON tree and count frequencies of all object keys
   - Build Huffman encoding table
   - (v2 format) Count string values and build string pool

2. **Writing stage:**
   - Write header, dictionary table, value pool
   - Start recursive encoding from root node:
     ```rust
     fn encode_value(value: &Value, writer: &mut BitWriter, huffman: &HuffmanCodec) {
         match value {
             Value::Object(map) => {
                 writer.write_bits(tag::OBJECT, 3);
                 writer.write_uleb128(map.len());
                 for (key, val) in map {
                     huffman.write_key_code(key, writer);
                     encode_value(val, writer, huffman); // Recursive!
                 }
             }
             Value::Array(arr) => {
                 writer.write_bits(tag::ARRAY, 3);
                 writer.write_uleb128(arr.len());
                 for item in arr {
                     encode_value(item, writer, huffman); // Recursive!
                 }
             }
             // ... other types
         }
     }
     ```

### Decoding Process

1. **Initialization stage:**
   - Read header to get version and length information
   - Read dictionary table and rebuild Huffman encoding table
   - (v2 format) Read string pool

2. **Parsing stage:**
   - Start recursive parsing from root node:
     ```rust
     fn decode_value(reader: &mut BitReader, huffman: &HuffmanCodec) -> Value {
         let tag = reader.read_bits(3);
         match tag {
             tag::OBJECT => {
                 let count = reader.read_uleb128();
                 let mut map = Map::new();
                 for _ in 0..count {
                     let key = huffman.decode_key(reader);
                     let val = decode_value(reader, huffman); // Recursive!
                     map.insert(key, val);
                 }
                 Value::Object(map)
             }
             tag::ARRAY => {
                 let count = reader.read_uleb128();
                 let mut arr = Vec::new();
                 for _ in 0..count {
                     arr.push(decode_value(reader, huffman)); // Recursive!
                 }
                 Value::Array(arr)
             }
             // ... other types
         }
     }
     ```

## Tree Structure Preservation Mechanism

### 1. Depth-First Traversal

Both encoding and decoding use depth-first order to ensure tree structure integrity:

```
Original tree:  Encoding order:  Decoding order:
  A             1. A             1. Read A(object)
 / \            2. B             2. Read B(string)  
B   C           3. C             3. Read C(array)
   /|\          4. D             4. Read D(number)
  D E F         5. E             5. Read E(number)
                6. F             6. Read F(number)
```

### 2. Length Prefix

For container types (objects, arrays), always write the number of elements first, so the decoder knows how many child elements to read:

```
Object encoding: [object tag] [key-value pair count] [key-value pair 1] [key-value pair 2] ...
Array encoding: [array tag] [element count] [element 1] [element 2] ...
```

### 3. Recursive Boundaries

Each value's encoding is self-contained with clear recursive boundaries:
- Simple values (null, boolean, number, string): No child nodes, recursion terminates
- Container values (object, array): Clear number of child elements, recursion is bounded

### 4. Bitstream Synchronization

Use bitstream to ensure synchronization between encoding and decoding:
- Encoder writes to bitstream in order
- Decoder reads from bitstream in the same order
- Variable-length encoding ensures clear boundaries