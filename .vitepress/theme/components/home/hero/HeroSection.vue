<template>
  <div>
    <!-- 桌面端：图标和文字水平布局 -->
    <div class="hidden md:flex items-center gap-3 mb-4">
      <!-- 图标 -->
      <div class="flex-shrink-0">
        <img src="/favicon.svg" alt="JSON Packer" class="w-24 h-24 lg:w-32 lg:h-32" />
      </div>
      <!-- 文字内容 -->
      <div class="space-y-4">
        <h1 class="bg-gradient-to-r from-slate-900 via-blue-900 to-slate-900 bg-clip-text text-transparent">
          {{ t.title }}
        </h1>
        <p class="text-xl lg:text-2xl text-slate-600 leading-relaxed">
          {{ t.subtitle }}
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
          {{ t.title }}
        </h1>
        <p class="text-xl text-slate-600 leading-relaxed">
          {{ t.subtitle }}
        </p>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useI18n } from '../../../composables/useI18n'

// Hero Section 组件 - 主标题和图标区域
const { t } = useI18n()
</script>