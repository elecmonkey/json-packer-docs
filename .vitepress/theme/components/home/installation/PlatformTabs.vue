<template>
  <AnimatedSlider :slider-style="sliderStyle">
    <button 
      @click="$emit('update:activeTab', 'rust')"
      class="tab-button relative z-10 flex-1 sm:flex-none"
      :class="[activeTab === 'rust' ? 'tab-active' : 'tab-inactive']"
      ref="rustTab"
    >
      🦀 Rust
    </button>
    <button 
      @click="$emit('update:activeTab', 'node')"
      class="tab-button relative z-10 flex-1 sm:flex-none"
      :class="[activeTab === 'node' ? 'tab-active' : 'tab-inactive']"
      ref="nodeTab"
    >
      📦 Node
    </button>
    <button 
      @click="$emit('update:activeTab', 'web')"
      class="tab-button relative z-10 flex-1 sm:flex-none"
      :class="[activeTab === 'web' ? 'tab-active' : 'tab-inactive']"
      ref="webTab"
    >
      🌐 WASM
    </button>
  </AnimatedSlider>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, onMounted } from 'vue'
import AnimatedSlider from '../../common/AnimatedSlider.vue'

interface Props {
  activeTab: 'rust' | 'node' | 'web'
}

interface Emits {
  (e: 'update:activeTab', value: 'rust' | 'node' | 'web'): void
}

const props = defineProps<Props>()
defineEmits<Emits>()

// 选项卡按钮的ref引用
const rustTab = ref<HTMLButtonElement>()
const nodeTab = ref<HTMLButtonElement>()
const webTab = ref<HTMLButtonElement>()

// 计算滑动背景块的位置和宽度
const sliderStyle = computed(() => {
  let left = '0px'
  let width = '0px'
  
  if (props.activeTab === 'rust' && rustTab.value) {
    left = '0px'
    width = `${rustTab.value.offsetWidth}px`
  } else if (props.activeTab === 'node' && nodeTab.value && rustTab.value) {
    left = `${rustTab.value.offsetWidth + 8}px` // 8px是gap-2的间距
    width = `${nodeTab.value.offsetWidth}px`
  } else if (props.activeTab === 'web' && webTab.value && rustTab.value && nodeTab.value) {
    left = `${rustTab.value.offsetWidth + nodeTab.value.offsetWidth + 16}px` // 16px是两个gap-2的间距
    width = `${webTab.value.offsetWidth}px`
  }
  
  return {
    left,
    width
  }
})
</script>

<style scoped>
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
</style>