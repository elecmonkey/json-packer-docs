# Command Line Tool

JSON Packer's command-line tool for high-performance JSON compression and decompression.

## Installation

Build from source in the `core-cli` directory:

```bash
cd core-cli
cargo build --release
```

## Basic Usage

### JSON Compression

```bash
# Compress to Base64 format
json-packer-cli compress data.json

# Compress to file
json-packer-cli compress data.json compressed.jcp

# Enable string value pool optimization
json-packer-cli compress --enable-pool data.json

# Show compression statistics
json-packer-cli compress --stats data.json
```

### Decompression

```bash
# Decompress Base64 format
json-packer-cli decompress compressed.jcp

# Pretty print output
json-packer-cli decompress --pretty compressed.jcp

# Decompress to file
json-packer-cli decompress compressed.jcp restored.json
```

### File Information

```bash
# Basic information
json-packer-cli info compressed.jcp

# Detailed information
json-packer-cli info --detailed compressed.jcp
```

### Batch Processing

```bash
# Batch compress JSON files
json-packer-cli batch compress "*.json"

# Batch compress with value pool and recursive processing
json-packer-cli batch compress --enable-pool --recursive "data/"

# Batch decompress
json-packer-cli batch decompress "*.jcp" --output-dir results/
```

## Command Reference

### `compress` Command
Compress JSON files or data.

**Options:**
- `--format <FORMAT>`: Output format [base64|bytes] (default: base64)
- `--enable-pool`: Enable string value pool (v2 format)
- `--pool-min-repeats <NUM>`: Minimum repetitions for value pool (default: 3)
- `--pool-min-string-len <LEN>`: Minimum string length for value pool (default: 8)
- `--pretty`: Pretty print output (Base64 format only)
- `--stats`: Show compression statistics

### `decompress` Command
Decompress JSON data.

**Options:**
- `--format <FORMAT>`: Input format [auto|base64|bytes] (default: auto)
- `--pretty`: Pretty print JSON output
- `--compact`: Compact JSON output

### `info` Command
View compressed file information.

**Options:**
- `--format <FORMAT>`: Input format [auto|base64|bytes] (default: auto)
- `--detailed`: Show detailed information

### `batch` Command
Process multiple files in batch.

**Options:**
- `--output-dir <DIR>`: Output directory
- `--output-suffix <SUFFIX>`: Output file suffix (default: .jcp)
- `--parallel <NUM>`: Number of parallel processes (default: CPU cores)
- `--recursive`: Process subdirectories recursively
- `--enable-pool`: Enable string value pool

### Global Options

- `-v, --verbose`: Show verbose output
- `-q, --quiet`: Quiet mode
- `-h, --help`: Show help information
- `-V, --version`: Show version information

## Examples

### Basic Compression and Decompression
```bash
# Create test JSON
echo '{"name": "John", "age": 30, "city": "New York"}' > test.json

# Compress
json-packer-cli compress test.json compressed.jcp

# View information
json-packer-cli info compressed.jcp

# Decompress
json-packer-cli decompress compressed.jcp restored.json

# Verify
diff test.json restored.json
```

### Enable Value Pool Optimization
```bash
# For large JSON files with repeated strings
json-packer-cli compress --enable-pool --stats large_data.json
```

### Batch Processing
```bash
# Batch compress all JSON files in current directory
json-packer-cli batch compress "*.json" --output-dir compressed/

# Recursive batch compression
json-packer-cli batch compress --recursive "data/" --enable-pool
```

## Exit Codes

- 0: Success
- 2: IO error
- 3: JSON parsing error  
- 4: Compression/decompression error
- 5: Invalid format
- 6: File not found
- 7: Invalid command line arguments
- 8: Batch processing error

## Development

```bash
# Run in development mode
cargo run -- compress test.json

# Run tests
cargo test

# Check code
cargo check
cargo clippy
```