<template>
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
            <PlatformTabs v-model:active-tab="activeTab" />
            
            <!-- 包管理器选择 (仅在非Rust时显示) -->
            <PackageSelector 
              v-if="activeTab !== 'rust'" 
              v-model:package-manager="packageManager" 
            />
          </div>
        </div>
        
        <!-- 代码区域 -->
        <CommandDisplay :command="currentCommand" @copy="handleCopy" />
      </div>

      <!-- 分隔线：大屏幕时为竖线，小屏幕时为横线 -->
      <div class="hidden md:block w-px bg-slate-200"></div>
      <div class="block md:hidden h-px bg-slate-200"></div>

      <!-- 文档按钮区域 -->
      <a 
        :href="locale === 'zh' ? '/zh/guide/' : '/guide/'" 
        class="group md:w-32 w-full h-16 md:h-auto flex flex-row md:flex-col items-center justify-center bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-all duration-300 no-underline"
      >
        <!-- 文档图标 -->
        <svg class="w-5 h-5 md:w-6 md:h-6 md:mb-1 mr-2 md:mr-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
        </svg>
        <!-- 文档文字和箭头 -->
        <div class="flex flex-row md:flex-col items-center gap-1 md:gap-0">
          <span class="text-sm font-medium">{{ t.installation.quickStart }}</span>
          <svg class="w-4 h-4 md:mt-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 7l5 5m0 0l-5 5m5-5H6"></path>
          </svg>
        </div>
      </a>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import { useI18n } from '../../../composables/useI18n'
import PlatformTabs from './PlatformTabs.vue'
import PackageSelector from './PackageSelector.vue'
import CommandDisplay from './CommandDisplay.vue'

// 使用 i18n
const { t, locale } = useI18n()

// 响应式数据
const activeTab = ref<'rust' | 'node' | 'web'>('rust')
const packageManager = ref<'pnpm' | 'npm' | 'yarn'>('pnpm')

// 获取当前选项卡对应的命令
const currentCommand = computed(() => {
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
})

// 处理复制事件
const handleCopy = (command: string) => {
  console.log('命令已复制:', command)
}
</script>