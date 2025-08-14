<template>
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-lg">
      <div class="text-2xl mb-2">🦀</div>
      <h3 class="font-semibold text-slate-900 mb-1">{{ t.features.rust.title }}</h3>
      <p class="text-sm text-slate-600">{{ t.features.rust.desc }}</p>
    </div>
    <div class="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-lg">
      <div class="text-2xl mb-2">🗜️</div>
      <h3 class="font-semibold text-slate-900 mb-1">{{ t.features.compression.title }}</h3>
      <p class="text-sm text-slate-600">{{ t.features.compression.desc }}</p>
    </div>
    <div class="p-4 rounded-2xl bg-white/60 backdrop-blur-sm border border-slate-200/50 shadow-lg">
      <div class="text-2xl mb-2">💻</div>
      <h3 class="font-semibold text-slate-900 mb-1">{{ t.features.platforms.title }}</h3>
      <p class="text-sm text-slate-600">{{ t.features.platforms.desc }}</p>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

// Feature Cards 组件 - 特性卡片展示
const { t } = useI18n()
</script>