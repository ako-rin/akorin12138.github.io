<script setup lang="ts">
import { computed } from 'vue'
import { useRoute } from 'vue-router'
import type { PostFrontMatter } from 'valaxy'
import type { SakuraImageCardProps } from './types'

const props = defineProps<{
  fm: PostFrontMatter
  imageCard?: SakuraImageCardProps
}>()

// Valaxy 是 SPA 路由切换；给 header 一个随路由变化的 key，避免 cover 复用不更新
const route = useRoute()
const headerKey = computed(() => route.fullPath)
</script>

<template>
  <SakuraPageHeader :key="headerKey" :fm="props.fm" class="sakura-post-header" :image-card="props.imageCard">
    <SakuraPostHeaderMeta :fm="props.fm" />
  </SakuraPageHeader>
</template>

<style lang="scss">
.sakura-post-header {
  .has-cover {
    height: 400px;
    position: relative;
  }

  /* 背景淡化/压暗，保证浅色图也能看清文字 */
  .has-cover::before {
    content: '';
    position: absolute;
    inset: 0;
    background: rgba(0, 0, 0, 0.35);
    pointer-events: none;
    z-index: 0;
  }

  .has-cover .sakura-header-container {
    position: relative;
    z-index: 1;
  }
}
</style>
