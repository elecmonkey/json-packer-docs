# How it Works

Welcome to the JSON Packer how-it-works section.

## Content Overview

- [Compression Principles](./principles) - Introduces how JSON Packer utilizes various compression techniques to reduce JSON data size
- [Binary Format](./binary-format) - Detailed description of JSON Packer's binary data format specification  
- [Implementation Details](./implementation) - In-depth analysis of JSON Packer's code implementation details

## Design Philosophy

JSON Packer's core design philosophy is to maximize compression ratio and processing performance while ensuring lossless compression. It analyzes the characteristics of JSON data and uses multiple compression techniques to reduce storage space:

1. **Type Tags** - Remove JSON syntax redundancy
2. **Huffman Encoding** - Compress repeated key names
3. **Variable-length Integer Encoding** - Optimize number storage
4. **String Pool** - Remove duplicate values