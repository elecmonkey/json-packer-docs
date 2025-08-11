<template>
  <div class="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-lg">
    <!-- 标题区域 - 减小空白 -->
    <div class="bg-gradient-to-r from-blue-50 to-indigo-50 px-6 py-3 border-b border-slate-200">
      <p class="text-lg font-bold text-slate-800">Playground</p>
      <p class="text-sm text-slate-600 mt-1">在浏览器中体验 WebAssembly 版本</p>
    </div>
    
    <!-- 压缩选项面板 -->
    <div class="bg-gradient-to-r from-slate-50 to-blue-50 px-6 py-3 border-b border-slate-200">
      <div class="flex flex-wrap items-center gap-6">
        <div class="flex items-center gap-3">
          <label for="enable-value-pool" class="relative inline-flex items-center cursor-pointer">
            <input 
              id="enable-value-pool"
              name="enableValuePool"
              type="checkbox" 
              v-model="enableValuePool" 
              @change="handleCompress" 
              class="sr-only peer">
            <div class="relative w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
            <span class="ml-3 text-sm font-medium text-slate-700">字符串值池</span>
          </label>
        </div>
        
        <div v-if="enableValuePool" class="flex items-center gap-4">
          <div class="flex items-center gap-2">
            <label for="pool-min-repeats" class="text-sm text-slate-600">重复次数:</label>
            <input 
              id="pool-min-repeats"
              name="poolMinRepeats"
              type="number" 
              v-model="poolMinRepeats" 
              min="1" 
              @input="handleCompress" 
              class="w-16 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all duration-200">
          </div>
          <div class="flex items-center gap-2">
            <label for="pool-min-string-len" class="text-sm text-slate-600">最小长度:</label>
            <input 
              id="pool-min-string-len"
              name="poolMinStringLen"
              type="number" 
              v-model="poolMinStringLen" 
              min="1" 
              @input="handleCompress"
              class="w-16 px-3 py-2 text-sm border border-slate-300 rounded-lg bg-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all duration-200">
          </div>
        </div>
      </div>
    </div>

    <!-- 主要内容区域 - 左右布局 -->
    <div class="grid lg:grid-cols-2 gap-0">
      <!-- 左侧：输入区域 -->
      <div class="p-6 lg:border-r border-slate-200">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="input-json" class="font-medium text-sm text-slate-700">原始 JSON 数据</label>
            <div class="flex flex-wrap items-center gap-2">
              <span class="text-xs text-slate-500 bg-slate-100 px-2 py-1 rounded whitespace-nowrap">{{ originalSize }} 字节</span>
            </div>
          </div>
          <textarea 
            id="input-json"
            name="inputJson"
            v-model="inputJson" 
            placeholder="输入您的JSON数据..."
            class="w-full h-48 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
            @input="handleCompress"
          ></textarea>
        </div>
      </div>

      <!-- 右侧：输出区域 -->
      <div class="p-6">
        <div class="flex flex-col gap-4">
          <div class="flex flex-col gap-2">
            <label for="compressed-data" class="font-medium text-sm text-slate-700">压缩结果</label>
            <div class="flex flex-wrap items-center gap-2 text-xs text-slate-500">
              <span class="bg-slate-100 px-2 py-1 rounded whitespace-nowrap">{{ binarySize }} 字节 / Base64 {{ base64Size }} 字节</span>
              <!-- <span class="bg-slate-100 px-2 py-1 rounded whitespace-nowrap">Base64:  字节</span> -->
            </div>
          </div>
          <textarea 
            id="compressed-data"
            name="compressedData"
            v-model="compressedData" 
            placeholder="压缩结果将显示在这里..."
            class="w-full h-48 px-4 py-3 border border-slate-300 rounded-lg bg-slate-50 text-slate-700 font-mono text-sm leading-relaxed resize-none focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 focus:bg-white transition-all duration-200 shadow-sm"
            @input="handleDecompress"
          ></textarea>
        </div>
      </div>
    </div>

    <!-- 压缩率显示 - 单独一行 -->
    <div class="px-6 py-4 bg-slate-50 border-t border-slate-200">
      <div class="flex justify-center items-center gap-4">
        <div v-if="compressionRatio !== null && !hasError" class="inline-flex items-center gap-2 px-6 py-3 bg-green-50 border border-green-200 rounded-lg">
          <svg class="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"></path>
          </svg>
          <span class="text-sm font-semibold text-green-700">压缩率: {{ compressionRatio }}% </span>
        </div>
        <div v-else-if="hasError" class="inline-flex items-center gap-2 px-6 py-3 bg-red-50 border border-red-200 rounded-lg">
          <svg class="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm font-semibold text-red-700">{{ errorMessage }}</span>
        </div>
        
        <!-- 用时显示 -->
        <div v-if="compressTime !== null || decompressTime !== null" class="inline-flex items-center gap-2 px-6 py-3 bg-blue-50 border border-blue-200 rounded-lg">
          <svg class="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
          </svg>
          <span class="text-sm font-semibold text-blue-700">
            <span v-if="compressTime !== null">压缩用时: {{ compressTime.toFixed(2) }}ms</span>
            <span v-if="decompressTime !== null">解压用时: {{ decompressTime.toFixed(2) }}ms</span>
          </span>
        </div>
      </div>
      <div class="text-xs text-slate-400 mt-3 flex justify-center">
              <p>💡 压缩率按二进制大小计算，Base64 编码会有约 33% 的大小膨胀</p>
            </div>
    </div>


  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from 'vue'

// 深度比较函数
function deepEqual(a: any, b: any): boolean {
  if (a === b) return true; // 处理引用相等 & 基本类型相等

  if (typeof a !== typeof b) return false;
  if (a && b && typeof a === 'object') {
    const keysA = Object.keys(a);
    const keysB = Object.keys(b);
    if (keysA.length !== keysB.length) return false;

    for (const key of keysA) {
      if (!keysB.includes(key)) return false;
      if (!deepEqual(a[key], b[key])) return false;
    }
    return true;
  }

  // 处理 NaN
  return Number.isNaN(a) && Number.isNaN(b);
}

// 响应式数据
const inputJson = ref(`{
  "users": [
    {
      "id": "user_001",
      "name": "张三",
      "email": "zhangsan@company.com",
      "role": "Administrator",
      "department": "Technology",
      "status": "Active",
      "city": "Shanghai",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Premium",
      "account_type": "Business"
    },
    {
      "id": "user_002",
      "name": "李四",
      "email": "lisi@company.com",
      "role": "Administrator",
      "department": "Technology",
      "status": "Active",
      "city": "Shanghai",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Premium",
      "account_type": "Business"
    },
    {
      "id": "user_003",
      "name": "王五",
      "email": "wangwu@company.com",
      "role": "Manager",
      "department": "Technology",
      "status": "Active",
      "city": "Shanghai",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Premium",
      "account_type": "Business"
    },
    {
      "id": "user_004",
      "name": "赵六",
      "email": "zhaoliu@company.com",
      "role": "Developer",
      "department": "Technology",
      "status": "Active",
      "city": "Beijing",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Standard",
      "account_type": "Business"
    },
    {
      "id": "user_005",
      "name": "孙七",
      "email": "sunqi@company.com",
      "role": "Developer",
      "department": "Technology",
      "status": "Active",
      "city": "Beijing",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Standard",
      "account_type": "Business"
    },
    {
      "id": "user_006",
      "name": "周八",
      "email": "zhouba@company.com",
      "role": "Designer",
      "department": "Design",
      "status": "Active",
      "city": "Shenzhen",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Premium",
      "account_type": "Business"
    },
    {
      "id": "user_007",
      "name": "吴九",
      "email": "wujiu@company.com",
      "role": "Designer",
      "department": "Design",
      "status": "Inactive",
      "city": "Guangzhou",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Basic",
      "account_type": "Personal"
    },
    {
      "id": "user_008",
      "name": "郑十",
      "email": "zhengshi@company.com",
      "role": "Analyst",
      "department": "Marketing",
      "status": "Active",
      "city": "Shanghai",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "language": "Chinese",
      "currency": "CNY",
      "subscription": "Premium",
      "account_type": "Business"
    }
  ],
  "metadata": {
    "total_users": 8,
    "active_users": 7,
    "inactive_users": 1,
    "last_updated": "2024-01-15T14:30:00+08:00",
    "api_version": "v1.2",
    "organization": {
      "name": "Tech Company Ltd",
      "country": "China",
      "timezone": "Asia/Shanghai",
      "currency": "CNY"
    }
  }
}`)

const compressedData = ref('')
const compressedBytes = ref<Uint8Array | null>(null)
const decompressedData = ref('')
const enableValuePool = ref(true)
const poolMinRepeats = ref(3)
const poolMinStringLen = ref(4)
const wasmInitialized = ref(false)
const hasError = ref(false)
const errorMessage = ref('')
const poolValues = ref<string[]>([])
const compressTime = ref<number | null>(null)
const decompressTime = ref<number | null>(null)

// WASM 模块引用
let wasmModule: any = null

// 计算属性
const originalSize = computed(() => {
  return new TextEncoder().encode(inputJson.value).length
})

const binarySize = computed(() => {
  return compressedBytes.value ? compressedBytes.value.length : 0
})

const base64Size = computed(() => {
  return compressedData.value ? new TextEncoder().encode(compressedData.value).length : 0
})

const compressionRatio = computed(() => {
  if (originalSize.value === 0 || binarySize.value === 0) return null
  return Math.round((1 - binarySize.value / originalSize.value) * 100)
})

const isValid = computed(() => {
  if (!decompressedData.value || !inputJson.value) return false
  try {
    const original = JSON.parse(inputJson.value)
    const decompressed = JSON.parse(decompressedData.value)
    return deepEqual(original, decompressed)
  } catch {
    return false
  }
})

const poolIndexes = computed(() => {
  return poolValues.value.map((_, index) => index).join('\n')
})

const poolContent = computed(() => {
  return poolValues.value.join('\n')
})

// 初始化 WASM
onMounted(async () => {
  try {
    // 动态导入 WASM 模块，使用更兼容的方式
    const wasmModuleImport = await import('json-packer-wasm')
    wasmModule = wasmModuleImport
    
    // 初始化 WASM，检查是否有默认导出函数
    if (typeof wasmModule.default === 'function') {
      await wasmModule.default()
    }
    
    wasmInitialized.value = true
    
    // 等待一个微任务，确保 WASM 完全初始化
    await nextTick()
    
    // 预热 WASM 模块，但不计时
    try {
      const warmupOptions = new wasmModule.Options(true, 3, 4)
      wasmModule.compress_to_base64('{"warmup": true}', warmupOptions)
    } catch (warmupError) {
      console.warn('WASM 预热失败:', warmupError)
    }
    
    // 现在进行真正的初始压缩
    handleCompress()
  } catch (error) {
    console.error('WASM 初始化失败:', error)
    // 添加更详细的错误信息
    console.error('错误详情:', error.message)
  }
})

// 处理压缩
const handleCompress = () => {
  if (!wasmInitialized.value || !wasmModule) return
  
  try {
    // 验证 JSON 格式
    JSON.parse(inputJson.value)
    
    // 重置错误状态
    hasError.value = false
    errorMessage.value = ''
    
    // 开始计时
    const startTime = performance.now()
    
    // 创建压缩选项
    const options = new wasmModule.Options(
      enableValuePool.value,
      poolMinRepeats.value,
      poolMinStringLen.value
    )
    
    // 压缩为二进制和 Base64
    const compressedBinary = wasmModule.compress_to_bytes(inputJson.value, options)
    const compressed = wasmModule.compress_to_base64(inputJson.value, options)
    
    // 结束计时
    const endTime = performance.now()
    compressTime.value = endTime - startTime
    decompressTime.value = null // 清除解压缩时间，只显示最新操作时间
    
    compressedBytes.value = compressedBinary
    compressedData.value = compressed
    
    // 解压验证
    const decompressed = wasmModule.decompress_from_base64(compressed)
    decompressedData.value = decompressed
    
    // 获取池值（如果启用）
    if (enableValuePool.value) {
      try {
        // 这里需要根据实际的 WASM API 来获取池值
        // 暂时使用模拟数据
        poolValues.value = ['Shanghai', 'China', 'reading', 'swimming', 'coding']
      } catch (poolError) {
        console.warn('获取池值失败:', poolError)
        poolValues.value = []
      }
    } else {
      poolValues.value = []
    }
    
  } catch (error) {
    console.error('压缩失败:', error)
    hasError.value = true
    errorMessage.value = '压缩失败: JSON 格式无效'
    compressedData.value = ''
    compressedBytes.value = null
    decompressedData.value = ''
    poolValues.value = []
    compressTime.value = null
  }
}

// 处理解压缩（当用户修改压缩结果时）
const handleDecompress = () => {
  if (!wasmInitialized.value || !wasmModule || !compressedData.value) return
  
  try {
    // 重置错误状态
    hasError.value = false
    errorMessage.value = ''
    
    // 开始计时
    const startTime = performance.now()
    
    // 尝试解压缩
    const decompressed = wasmModule.decompress_from_base64(compressedData.value)
    
    // 结束计时
    const endTime = performance.now()
    decompressTime.value = endTime - startTime
    compressTime.value = null // 清除压缩时间，只显示最新操作时间
    
    decompressedData.value = decompressed
    
    // 验证解压结果是否为有效 JSON
    JSON.parse(decompressed)
    
    // 自动更新左边输入框
    inputJson.value = decompressed
    
    // 重新计算压缩字节数（从 base64 解码）
    const binaryData = Uint8Array.from(atob(compressedData.value), c => c.charCodeAt(0))
    compressedBytes.value = binaryData
    
  } catch (error) {
    console.error('解压缩失败:', error)
    hasError.value = true
    errorMessage.value = '解压缩失败: 压缩数据无效'
    decompressedData.value = ''
    compressedBytes.value = null
    decompressTime.value = null
  }
}
</script>