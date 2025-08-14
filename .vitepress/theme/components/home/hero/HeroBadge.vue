<template>
  <div class="flex justify-center md:justify-start">
    <div class="inline-flex items-center gap-3 px-4 py-2 bg-blue-50 rounded-full border border-blue-100">
      <div class="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
      <span class="text-sm font-medium text-blue-700">{{ t.badge }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

// Hero Badge 组件 - 顶部标识
const { t } = useI18n()
</script>