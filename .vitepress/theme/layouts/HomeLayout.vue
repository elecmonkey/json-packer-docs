<template>
  <div class="home-layout">
    <!-- 自定义主页内容 -->
    <div class="bg-white">
      <!-- 内容区域 -->
      <div class="pb-16 pt-16 min-h-[calc(100vh-200px)]">
        <div class="container mx-auto px-6 lg:px-8 h-full">
          <div class="grid xl:grid-cols-2 gap-8 xl:gap-12 items-center h-full">
            <!-- 左侧内容区 -->
            <div class="flex flex-col space-y-6 md:space-y-8 pt-0 pb-1 sm:pt-1 sm:pb-2 md:py-8 relative">
              <!-- 主标题区域 -->
              <div class="space-y-4 md:space-y-6">
                <!-- Badge：小屏幕居中，大屏幕左对齐 -->
                <div class="flex justify-center md:justify-start">
                  <div class="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
                    <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                    <span class="text-sm font-medium text-blue-700">高性能 JSON 压缩</span>
                  </div>
                </div>
                
                <!-- 桌面端：图标和文字水平布局 -->
                <div class="hidden md:flex items-center gap-6 mb-4">
                  <!-- 图标 -->
                  <div class="flex-shrink-0">
                    <img src="/favicon.svg" alt="JSON Packer" class="w-24 h-24 lg:w-32 lg:h-32" />
                  </div>
                  <!-- 文字内容 -->
                  <div class="space-y-4">
                    <h1 class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                     JSON Packer
                   </h1>
                    <p class="text-xl lg:text-2xl text-slate-600 leading-relaxed">
                     基于 Rust 的高性能 JSON 压缩库
                   </p>
                  </div>
                </div>

                <!-- 移动端：图标居中，文字在下方 -->
                <div class="md:hidden space-y-6 mb-4">
                  <!-- 图标居中 -->
                  <div class="flex justify-center">
                    <img src="/favicon.svg" alt="JSON Packer" class="w-32 h-32" />
                  </div>
                  <!-- 文字内容 -->
                  <div class="space-y-4 text-center">
                    <h1 class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
                     JSON Packer
                   </h1>
                    <p class="text-xl text-slate-600 leading-relaxed">
                     基于 Rust 的高性能 JSON 压缩库
                   </p>
                  </div>
                </div>
              </div>

              <!-- 特性亮点 -->
               <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                 <div class="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50">
                   <div class="text-2xl mb-2">🦀</div>
                   <h3 class="font-semibold text-slate-900 mb-1">Rust 核心</h3>
                   <p class="text-sm text-slate-600">内存安全 + 零成本抽象</p>
                 </div>
                 <div class="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50">
                   <div class="text-2xl mb-2">🗜️</div>
                   <h3 class="font-semibold text-slate-900 mb-1">智能压缩</h3>
                   <p class="text-sm text-slate-600">Huffman + 值池</p>
                 </div>
                 <div class="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50">
                   <div class="text-2xl mb-2">💻</div>
                   <h3 class="font-semibold text-slate-900 mb-1">三大平台</h3>
                   <p class="text-sm text-slate-600">Rust + Node + WASM</p>
                 </div>
               </div>

              <!-- 快速开始面板 -->
              <div class="bg-white rounded-lg border border-slate-200 shadow-lg overflow-hidden">
                <!-- 响应式布局：大屏幕左右布局，小屏幕上下布局 -->
                <div class="flex flex-col md:flex-row">
                  <!-- 主要内容区域 -->
                  <div class="flex-1">
                    <!-- 头部区域 -->
                    <div class="bg-slate-50 border-b border-slate-200 px-2 py-2">
                      <!-- 响应式布局容器 -->
                       <div class="flex flex-col sm:flex-row sm:items-stretch sm:justify-between gap-2">
                         <!-- 平台选项卡 -->
                         <div class="flex items-stretch gap-2 relative w-full sm:w-auto">
                           <!-- 滑动背景块 -->
                           <div 
                             class="absolute top-0 bottom-0 bg-slate-200 rounded transition-all duration-300 ease-out"
                             :style="getSliderStyle()"
                           ></div>
                           
                           <button 
                             @click="activeTab = 'rust'"
                             class="tab-button relative z-10 flex-1 sm:flex-none"
                             :class="[activeTab === 'rust' ? 'tab-active' : 'tab-inactive']"
                             ref="rustTab"
                           >
                             🦀 Rust
                           </button>
                           <button 
                             @click="activeTab = 'node'"
                             class="tab-button relative z-10 flex-1 sm:flex-none"
                             :class="[activeTab === 'node' ? 'tab-active' : 'tab-inactive']"
                             ref="nodeTab"
                           >
                             📦 Node
                           </button>
                           <button 
                             @click="activeTab = 'web'"
                             class="tab-button relative z-10 flex-1 sm:flex-none"
                             :class="[activeTab === 'web' ? 'tab-active' : 'tab-inactive']"
                             ref="webTab"
                           >
                             🌐 WASM
                           </button>
                         </div>
                         
                         <!-- 包管理器选择 (仅在非Rust时显示) -->
                         <div v-if="activeTab !== 'rust'" class="flex items-stretch gap-2 relative w-full sm:w-auto">
                           <!-- 滑动背景块 -->
                           <div 
                             class="absolute top-0 bottom-0 bg-slate-200 rounded transition-all duration-300 ease-out"
                             :style="getPkgSliderStyle()"
                           ></div>
                           
                           <button 
                             @click="packageManager = 'pnpm'"
                             class="pkg-button relative z-10 flex-1 sm:flex-none"
                             :class="[packageManager === 'pnpm' ? 'pkg-active' : 'pkg-inactive']"
                           >
                             pnpm
                           </button>
                           <button 
                             @click="packageManager = 'npm'"
                             class="pkg-button relative z-10 flex-1 sm:flex-none"
                             :class="[packageManager === 'npm' ? 'pkg-active' : 'pkg-inactive']"
                           >
                             npm
                           </button>
                           <button 
                             @click="packageManager = 'yarn'"
                             class="pkg-button relative z-10 flex-1 sm:flex-none"
                             :class="[packageManager === 'yarn' ? 'pkg-active' : 'pkg-inactive']"
                           >
                             yarn
                           </button>
                         </div>
                       </div>
                    </div>
                    
                    <!-- 代码区域 -->
                    <div class="relative p-2">
                      <div class="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-sm relative">
                        <div class="text-xs text-slate-500 mb-2 font-sans">Command</div>
                        <div class="flex items-center gap-2">
                          <span class="text-slate-400">$</span>
                          <code class="text-slate-700 font-medium">{{ getCommand() }}</code>
                        </div>
                        <button 
                          @click="copyCommand"
                          class="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors duration-200 rounded hover:bg-slate-100"
                          :title="copied ? '已复制!' : '复制命令'"
                        >
                          <CopyIcon :copied="copied" />
                        </button>
                      </div>
                    </div>
                  </div>

                  <!-- 分隔线：大屏幕时为竖线，小屏幕时为横线 -->
                  <div class="hidden md:block w-px bg-slate-200"></div>
                  <div class="block md:hidden h-px bg-slate-200"></div>

                  <!-- 文档按钮区域 -->
                  <a 
                    href="/guide/" 
                    class="group md:w-20 w-full h-16 md:h-auto flex flex-row md:flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300 no-underline"
                  >
                    <!-- 文档图标 -->
                    <svg class="w-5 h-5 md:w-6 md:h-6 md:mb-1 mr-2 md:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                    </svg>
                    <!-- 文档文字和箭头 -->
                      <div class="flex items-center gap-1">
                        <span class="text-sm font-medium md:hidden">查看文档</span>
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
                        </svg>
                      </div>
                  </a>
                </div>
              </div>
            </div>
            
            <!-- 右侧演示区 -->
            <div class="flex items-center justify-center py-8 lg:py-0">
              <div class="w-full">
                <ClientOnly>
                  <Demo />
                </ClientOnly>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick, onMounted } from 'vue'
import Demo from '../components/Demo.vue'
import CopyIcon from '../components/CopyIcon.vue'

// 响应式数据
const activeTab = ref('rust')
const packageManager = ref('pnpm')
const copied = ref(false)

// 选项卡按钮的ref引用
const rustTab = ref<HTMLButtonElement>()
const nodeTab = ref<HTMLButtonElement>()
const webTab = ref<HTMLButtonElement>()

// 获取当前选项卡对应的命令
const getCommand = () => {
  if (activeTab.value === 'rust') {
    return 'cargo add json-packer'
  }
  
  const packageName = activeTab.value === 'node' ? 'json-packer-napi' : 'json-packer-wasm'
  const commands = {
    pnpm: `pnpm add ${packageName}`,
    npm: `npm install ${packageName}`,
    yarn: `yarn add ${packageName}`
  }
  return commands[packageManager.value]
}

// 复制命令到剪贴板
const copyCommand = async () => {
  try {
    await navigator.clipboard.writeText(getCommand())
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
  } catch (err) {
    console.error('复制失败:', err)
  }
}

// 计算滑动背景块的位置和宽度
const getSliderStyle = () => {
  let left = '0px'
  let width = '0px'
  
  if (activeTab.value === 'rust' && rustTab.value) {
    left = '0px'
    width = `${rustTab.value.offsetWidth}px`
  } else if (activeTab.value === 'node' && nodeTab.value && rustTab.value) {
    left = `${rustTab.value.offsetWidth + 8}px` // 8px是gap-2的间距
    width = `${nodeTab.value.offsetWidth}px`
  } else if (activeTab.value === 'web' && webTab.value && rustTab.value && nodeTab.value) {
    left = `${rustTab.value.offsetWidth + nodeTab.value.offsetWidth + 16}px` // 16px是两个gap-2的间距
    width = `${webTab.value.offsetWidth}px`
  }
  
  return {
    left,
    width
  }
}

// 计算包管理器滑动背景块的位置和宽度
const getPkgSliderStyle = () => {
  const buttonWidth = 'calc(33.333% - 5.33px)' // 考虑gap-2的间距
  let left = '0px'
  
  if (packageManager.value === 'pnpm') {
    left = '0px'
  } else if (packageManager.value === 'npm') {
    left = 'calc(33.333% + 2.67px)'
  } else if (packageManager.value === 'yarn') {
    left = 'calc(66.666% + 5.33px)'
  }
  
  return {
    left,
    width: buttonWidth
  }
}
</script>

<style scoped>
.home-layout {
  /* 确保布局占满全屏，不受任何容器限制 */
  width: 100vw;
  margin: 0;
  padding: 0;
  position: relative;
  left: 50%;
  right: 50%;
  margin-left: -50vw;
  margin-right: -50vw;
}

/* 选项卡基础样式 */
.tab-button {
  padding: 8px 12px !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  transition: color 0.3s ease !important;
  border: none !important;
  cursor: pointer !important;
  background: transparent !important;
  justify-content: center !important;
  white-space: nowrap !important;
  min-width: 0 !important;
}

/* 选项卡激活状态 */
.tab-active {
  color: #0f172a !important;
}

/* 选项卡非激活状态 */
.tab-inactive {
  color: #475569 !important;
}

.tab-inactive:hover {
  color: #0f172a !important;
}

/* 包管理器按钮基础样式 */
.pkg-button {
  padding: 8px 16px !important;
  border-radius: 6px !important;
  display: flex !important;
  align-items: center !important;
  font-size: 13px !important;
  font-weight: 500 !important;
  transition: color 0.3s ease !important;
  border: none !important;
  cursor: pointer !important;
  background: transparent !important;
  flex: 1 !important;
  justify-content: center !important;
  white-space: nowrap !important;
  min-width: 0 !important;
}

/* 包管理器激活状态 */
.pkg-active {
  color: #0f172a !important;
}

/* 包管理器非激活状态 */
.pkg-inactive {
  color: #475569 !important;
}

.pkg-inactive:hover {
  color: #0f172a !important;
}


</style>