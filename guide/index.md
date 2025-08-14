# Quick Start

Welcome to JSON Packer! This is a high-performance JSON compression library built with Rust, supporting multiple platforms.

## What is JSON Packer?

JSON Packer is a library designed specifically for high-performance JSON data compression, developed in Rust, providing:

- 🦀 **Rust Core**: Memory safety + zero-cost abstractions
- 🗜️ **Smart Compression**: Huffman key encoding + string value pooling
- 💻 **Multi-platform Support**: Rust + Node.js + WebAssembly

## Choose Your Platform

 - [Rust Platform](./rust)
 - [Node.js Platform](./node)
 - [WebAssembly Platform](./wasm)

## Core Features

### High-performance Compression
- Uses Huffman encoding to optimize JSON key storage
- Optional string value pooling to reduce duplicate data

### Multi-platform Support
- **Rust Core**: Can be directly used by Rust programs
- **Node.js API**: Seamlessly integrated into Node.js projects through NAPI bindings
- **WebAssembly**: Generated through wasm-pack for browser execution, supporting frontend applications