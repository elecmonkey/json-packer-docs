<template>
  <div class="flex items-stretch gap-2 relative w-full sm:w-auto">
    <!-- 滑动背景块 -->
    <div 
      class="absolute top-0 bottom-0 bg-slate-200 rounded transition-all duration-300 ease-out"
      :style="sliderStyle"
    ></div>
    
    <slot />
  </div>
</template>

<script setup lang="ts">
interface Props {
  sliderStyle: {
    left: string
    width: string
  }
}

defineProps<Props>()
</script>