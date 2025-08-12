<template>
  <div class="relative p-2">
    <div class="bg-slate-50 border border-slate-200 rounded p-3 font-mono text-sm relative">
      <div class="text-xs text-slate-500 mb-2 font-sans">Command</div>
      <div class="flex items-center gap-2">
        <span class="text-slate-400">$</span>
        <code class="text-slate-700 font-medium">{{ command }}</code>
      </div>
      <button 
        @click="handleCopy"
        class="absolute top-2 right-2 p-1.5 text-slate-400 hover:text-slate-600 transition-colors duration-200 rounded hover:bg-slate-100"
        :title="copied ? '已复制!' : '复制命令'"
      >
        <CopyIcon :copied="copied" />
      </button>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import CopyIcon from '../../common/CopyIcon.vue'

interface Props {
  command: string
}

interface Emits {
  (e: 'copy', command: string): void
}

const props = defineProps<Props>()
const emit = defineEmits<Emits>()

const copied = ref(false)

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(props.command)
    copied.value = true
    setTimeout(() => {
      copied.value = false
    }, 2000)
    emit('copy', props.command)
  } catch (err) {
    console.error('复制失败:', err)
  }
}
</script>