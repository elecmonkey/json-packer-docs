# Principles

json-packer is a JSON compression library whose core idea is to reduce storage space by analyzing the characteristics of JSON data and using multiple compression techniques. This document explains how it works from a principles perspective.

## Why JSON Can Be Compressed

JSON data has several obvious characteristics that create opportunities for compression:

1. **Repeated key names**: In complex JSON data, the same object keys appear repeatedly in large quantities
2. **Redundant type information**: JSON's text format contains a lot of syntax characters like quotes, colons, commas, etc.
3. **Repeated string values**: Certain string values appear repeatedly in the data
4. **Inefficient number representation**: Numbers in JSON are stored in text form, taking up more space

## Compression Strategies

### 1. Type Tags: Remove Syntax Redundancy

JSON's text format requires many syntax characters to distinguish different types:

```json
{
  "name": "Alice",
  "age": 25,
  "active": true,
  "data": null
}
```

In this example, quotes, colons, commas, braces, and other characters take up a considerable proportion of space, but don't actually carry the information of the data itself.

json-packer's solution is to assign a 3-bit binary tag for each JSON type:
- null → 000
- false → 001  
- true → 010
- integer → 011
- float → 100
- string → 101
- object → 110
- array → 111

This way, type information that originally required multiple characters now only needs 3 binary bits.

### 2. Huffman Encoding: Compress Repeated Key Names

Consider this JSON data:

```json
[
  {"name": "Alice", "age": 25, "city": "Beijing"},
  {"name": "Bob", "age": 30, "city": "Shanghai"},
  {"name": "Carol", "age": 28, "city": "Beijing"}
]
```

In this data, the three keys "name", "age", and "city" each appear 3 times. If stored conventionally, these strings would need to be saved completely each time.

The idea of Huffman encoding is: **keys with high frequency use shorter codes, keys with low frequency use longer codes**.

Specific process:
1. **Count frequency**: Traverse the entire JSON and count the number of occurrences of each key
2. **Build Huffman tree**: Build a binary tree based on frequency, with high-frequency keys closer to the root node
3. **Assign codes**: The path of the tree is the code, left subtree is 0, right subtree is 1

For example, in the above case:
- "name", "age", "city" each appear 3 times and might be assigned 1-2 bit short codes
- If there are other keys that appear only once, they would be assigned longer codes

This way, keys that originally needed 4-5 bytes might now only need 1-2 binary bits.

### 3. Variable-Length Integer Encoding: Compress Numbers

Numbers stored in text form in JSON are very inefficient. For example, the number `123` requires 3 bytes in JSON, but in binary only needs 1 byte to represent the range 0-255.

json-packer uses LEB128 (Little Endian Base 128) encoding:
- **Small numbers use fewer bytes**: 0-127 only needs 1 byte, 128-16383 needs 2 bytes
- **Large numbers automatically expand**: Dynamically decide how many bytes to use based on number size
- **Distinguish signed and unsigned**: Positive integers and negative integers use different encoding strategies

### 4. String Pool: Deduplicate Values

In some JSON data, there are many repeated string values:

```json
[
  {"status": "connected", "message": "Successfully connected to server"},
  {"status": "connected", "message": "Successfully connected to server"},
  {"status": "disconnected", "message": "Connection lost"},
  {"status": "connected", "message": "Successfully connected to server"}
]
```

Storing these repeated strings completely each time would cause great waste.

The idea of string pool is:
1. **Collect repeated strings**: Find strings in the data that appear repeatedly and are long enough
2. **Establish index mapping**: Extract these strings into a "pool" and assign each an ID
3. **References replace content**: Store ID references in original positions instead of complete strings

For example, "Successfully connected to server", this 30-byte string, might only need 1 byte ID to reference.

## Theoretical Optimum of Huffman Encoding

Theoretically, the benefit calculation of Huffman encoding should consider the length of the original string. The optimal Huffman encoding should be built based on the product of frequency and original length, because:

1. Compression benefit of a key = original length × occurrence count - encoding length × occurrence count
2. Therefore, we should prioritize assigning the shortest encoding to keys with the largest "original length × occurrence count" value

For example, if there is a key "extraLongKeyName" that appears 2 times, and "key" appears 3 times:
- "extraLongKeyName" has a theoretical benefit weight of 16 × 2 = 32
- "key" has a theoretical benefit weight of 3 × 3 = 9

According to theoretical optimum, we should prioritize assigning shorter encoding to "extraLongKeyName" because it can bring greater total benefit.

But in practice we found that for most JSON data scenarios, simple Huffman encoding based on frequency can already achieve good compression results. This is mainly due to the following reasons:

### 1. Characteristics of JSON Key Names

**Key names are usually short and similar in length**: Most JSON key names are 3-15 characters long, with little difference. Even with the theoretical optimal scheme, the difference in encoding lengths assigned to long and short keys is not significant.

**High-frequency keys are often short keys themselves**: Common keys like "id", "name", "type" are both high-frequency and short keys, so the simple frequency-based scheme is close to the theoretical optimal scheme.

### 2. Implementation Complexity and Performance Considerations

The theoretical optimal scheme requires additional calculation and storage of length information for each key, increasing algorithm complexity and encoding time. Since the difference is not significant in most scenarios, it was not introduced in the final design.


## Why String Pool is Designed as Optional

String pool is not always beneficial, it depends on the characteristics of the data:

### 1. Data Characteristics Determine Benefits

**Beneficial scenarios**:
- Log data: Large amounts of repeated status codes and error messages
- Configuration data: Repeated paths, URLs, identifiers
- Database exports: Repeated categories, tags, descriptions

**Unfavorable scenarios**:
- User-generated content: Comments, messages, etc., with low repetition
- Time series data: Mainly numbers with fewer strings
- Small data volumes: The overhead of building a string pool may be greater than the benefits

### 2. Performance Trade-offs

**Cost of enabling string pool**:
- Need to traverse the entire data twice (first time for statistics, second time for compression)
- Need extra memory to store string pool and index mapping
- Compression and decompression speed will be slower

**Advantages of disabling string pool**:
- Only need to traverse data once
- Less memory usage
- Faster processing speed
- Simpler code logic

### 3. Flexibility Considerations

Different application scenarios have different requirements for compression ratio and performance:

- **Real-time communication**: Latency sensitive, might choose v1 format for faster processing speed
- **Data storage**: Space sensitive, might choose v2 format for higher compression ratio
- **Batch processing**: Can tolerate higher processing time, tends to choose v2 format
- **Embedded devices**: Memory constrained, might choose v1 format

### 4. Adaptive Strategy

json-packer allows users to configure based on data characteristics:

```rust
CompressOptions {
    enable_value_pool: true,      // Whether to enable string pool
    pool_min_repeats: 3,          // Must repeat at least 3 times to join pool
    pool_min_string_len: 8,       // Must be at least 8 bytes long to consider
}
```

This design allows users to tune based on actual data:
- If data contains mostly short strings, can increase `pool_min_string_len`
- If memory is constrained, can increase `pool_min_repeats` to reduce pool size
- If certain there are no repeated strings, directly disable `enable_value_pool`

## Bit-Level Optimization

To squeeze out the last compression space, json-packer performs optimization at the bit level:

### 1. Compact Bit Packing
- Type tags only use 3 bits, not wasting an entire byte
- Boolean values use 1 bit instead of an entire byte
- Multiple small pieces of information can be packed in the same byte

### 2. Byte Alignment Processing
- Perform byte alignment when needed to avoid read errors
- Smart bit buffer management to reduce memory allocation

## Deterministic Design

To ensure the same input always produces the same output, json-packer uses deterministic strategies in all sorting operations:

1. **Key statistics sorting**: Sort by lexicographical order instead of relying on hash table's random order
2. **Huffman tree construction**: When frequencies are equal, decide priority by symbol order
3. **String pool sorting**: First by frequency descending, then by lexicographical order ascending

Benefits of this design:
- Easy to debug and test
- Support incremental updates and difference comparison
- Improve cache hit rate