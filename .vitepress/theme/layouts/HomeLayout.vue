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
                <HeroBadge />
                
                <!-- 主标题和图标 -->
                <HeroSection />
              </div>

              <!-- 特性亮点 -->
              <FeatureCards />

              <!-- 快速开始面板 -->
              <InstallationPanel />
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
import Demo from '../components/Demo.vue'
import HeroBadge from '../components/home/hero/HeroBadge.vue'
import HeroSection from '../components/home/hero/HeroSection.vue'
import FeatureCards from '../components/home/hero/FeatureCards.vue'
import InstallationPanel from '../components/home/installation/InstallationPanel.vue'
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
</style>