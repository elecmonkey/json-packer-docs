<template>
  <div class="copy-icon-wrapper">
    <!-- 未复制状态：更常见的复制图标 -->
    <svg 
      v-if="!copied" 
      class="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="9" y="9" width="13" height="13" rx="2" ry="2" stroke-width="2"/>
      <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" stroke-width="2"/>
    </svg>
    
    <!-- 已复制状态：勾选图标 -->
    <svg 
      v-else 
      class="w-4 h-4" 
      fill="none" 
      stroke="currentColor" 
      viewBox="0 0 24 24"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path 
        stroke-linecap="round" 
        stroke-linejoin="round" 
        stroke-width="2" 
        d="M5 13l4 4L19 7"
      />
    </svg>
  </div>
</template>

<script setup lang="ts">
interface Props {
  copied?: boolean
}

withDefaults(defineProps<Props>(), {
  copied: false
})
</script>

<style scoped>
.copy-icon-wrapper {
  @apply inline-flex items-center justify-center;
}
</style>