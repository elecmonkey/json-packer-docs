<template>
  <AnimatedSlider :slider-style="sliderStyle">
    <button 
      @click="$emit('update:packageManager', 'pnpm')"
      class="pkg-button relative z-10 flex-1 sm:flex-none"
      :class="[packageManager === 'pnpm' ? 'pkg-active' : 'pkg-inactive']"
    >
      pnpm
    </button>
    <button 
      @click="$emit('update:packageManager', 'npm')"
      class="pkg-button relative z-10 flex-1 sm:flex-none"
      :class="[packageManager === 'npm' ? 'pkg-active' : 'pkg-inactive']"
    >
      npm
    </button>
    <button 
      @click="$emit('update:packageManager', 'yarn')"
      class="pkg-button relative z-10 flex-1 sm:flex-none"
      :class="[packageManager === 'yarn' ? 'pkg-active' : 'pkg-inactive']"
    >
      yarn
    </button>
  </AnimatedSlider>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import AnimatedSlider from '../../common/AnimatedSlider.vue'

interface Props {
  packageManager: 'pnpm' | 'npm' | 'yarn'
}

interface Emits {
  (e: 'update:packageManager', value: 'pnpm' | 'npm' | 'yarn'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 计算包管理器滑动背景块的位置和宽度
const sliderStyle = computed(() => {
  const buttonWidth = 'calc(33.333% - 5.33px)' // 考虑gap-2的间距
  let left = '0px'
  
  if (props.packageManager === 'pnpm') {
    left = '0px'
  } else if (props.packageManager === 'npm') {
    left = 'calc(33.333% + 2.67px)'
  } else if (props.packageManager === 'yarn') {
    left = 'calc(66.666% + 5.33px)'
  }
  
  return {
    left,
    width: buttonWidth
  }
})
</script>

<style scoped>
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