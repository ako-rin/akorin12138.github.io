<script setup lang="ts">
import BuiltInMermaid from 'valaxy/client/components/builtin/ValaxyMermaid.vue'
import { ref, onMounted } from 'vue'
import Panzoom from '@panzoom/panzoom'

const props = defineProps<{
  code: string
  scale?: number
  theme?: string
}>()

const containerRef = ref<HTMLElement>()
const wrapperRef = ref<HTMLElement>()

onMounted(() => {
  if (containerRef.value && wrapperRef.value) {
    // 监听内层实际缩放元素的 Panzoom
    const panzoom = Panzoom(containerRef.value, {
      maxScale: 10,
      minScale: 0.1
    })

    // 绑定外层容器响应鼠标事件，并阻止页面滚动
    wrapperRef.value.addEventListener('wheel', (e: WheelEvent) => {
      if (!e.ctrlKey && !e.metaKey) return
      e.preventDefault()
      panzoom.zoomWithWheel(e)
    })

    wrapperRef.value.addEventListener('dblclick', () => {
      panzoom.reset()
    })
  }
})
</script>

<template>
  <!-- 直接把提示加在 title 上，鼠标悬停时系统自带提示 -->
  <div class="mermaid-zoom-wrapper" ref="wrapperRef" title="按住 Ctrl + 鼠标滚轮缩放 / 左键拖拽 / 双击重置">
    <div class="mermaid-inner-container" ref="containerRef">
      <!-- 传递全部属性给原版组件 -->
      <BuiltInMermaid v-bind="props" />
    </div>
  </div>
</template>

<style scoped>
.mermaid-zoom-wrapper {
  position: relative;
  width: 100%;
  /* 移除极小的固定高度，让内容撑开但也给个合适的下限 */
  min-height: 100%;
  overflow: hidden;
  border: 1px solid var(--va-c-divider, #e5e7eb);
  border-radius: 8px;
  margin: 1.5rem 0;
  background-color: var(--va-c-bg-soft, #f9f9f9);
  cursor: grab;
}

.mermaid-zoom-wrapper:active {
  cursor: grabbing;
}

.mermaid-inner-container {
  width: 100%;
  height: auto; /* 让高度自适应 */
  display: flex;
  justify-content: center;
  align-items: center;
  /* 移除死板的 padding，让原图有更多空间 */
  padding: 0;
}

/* 穿透修改 Valaxy 原生渲染出的 ShadowRoot 内部排版 */
.mermaid-inner-container :deep(*) {
  width: 100%;
  height: auto;
}
.mermaid-inner-container :deep(svg) {
  width: 100% !important;
  height: auto !important;
  max-width: 100%;
}
</style>
