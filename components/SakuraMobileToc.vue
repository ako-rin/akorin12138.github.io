<script setup lang="ts">
import { ref, watchEffect, onMounted, onUnmounted, computed } from 'vue'
import { useOutline, useFrontmatter } from 'valaxy'
import { useMediaQuery } from '@vueuse/core'
import { useRoute } from 'vue-router'

// 可配置：按钮图标（未展开 / 展开）、是否显示阅读进度环
const props = withDefaults(defineProps<{
  icon?: string
  activeIcon?: string
  showProgress?: boolean
}>(), {
  icon: 'i-line-md-list-3',
  activeIcon: 'i-line-md-close-small',
  showProgress: true,
})

// 获取当前页面的标题（headers）
const { headers, handleClick } = useOutline()

// 是否为移动端（与 aside 逻辑互补：小于 960px 视为移动）
const isMobile = useMediaQuery('(max-width: 959px)')

// 仅文章页显示：判断 layout 或路径
const frontmatter = useFrontmatter()
const route = useRoute()
const isPost = computed(() => frontmatter.value?.layout === 'post' || route.path.startsWith('/posts/'))

// 浮动按钮 & 面板显隐
const open = ref(false)
const hasHeaders = ref(false)

// 阅读进度（0-100）
const progress = ref(0)
function updateProgress() {
  if (!props.showProgress) return
  const scrollTop = window.scrollY
  const doc = document.documentElement
  const scrollHeight = doc.scrollHeight - window.innerHeight
  const p = scrollHeight > 0 ? (scrollTop / scrollHeight) * 100 : 0
  progress.value = Math.min(100, Math.max(0, p))
}

watchEffect(() => {
  hasHeaders.value = !!headers.value?.length
  if (!isMobile.value) {
    open.value = false
  }
})

function toggle() {
  if (!hasHeaders.value)
    return
  open.value = !open.value
}

function close() {
  open.value = false
}

// 禁用滚动（可选）
onMounted(() => {
  const lockScroll = () => {
    if (open.value) {
      document.documentElement.style.overflow = 'hidden'
    }
    else {
      document.documentElement.style.overflow = ''
    }
  }
  watchEffect(lockScroll)
  window.addEventListener('scroll', updateProgress, { passive: true })
  updateProgress()
})
onUnmounted(() => {
  document.documentElement.style.overflow = ''
  window.removeEventListener('scroll', updateProgress)
})

// 简单的当前标题高亮（IntersectionObserver）
const activeHash = ref<string>('')
let observer: IntersectionObserver | null = null

function initObserver() {
  if (observer) {
    observer.disconnect()
    observer = null
  }
  if (!isMobile.value)
    return

  const headings = Array.from(document.querySelectorAll('.markdown-body h1, .markdown-body h2, .markdown-body h3, .markdown-body h4, .markdown-body h5, .markdown-body h6')) as HTMLElement[]
  if (!headings.length)
    return

  observer = new IntersectionObserver((entries) => {
    // 选取最接近顶部且可见的 heading
    const visible = entries.filter(e => e.isIntersecting)
    if (visible.length) {
      // 取 y 最小者
      const topMost = visible.sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top)[0]
      const id = (topMost.target as HTMLElement).id
      if (id) activeHash.value = `#${decodeURIComponent(id)}`
    }
  }, {
    rootMargin: '0px 0px -70% 0px', // 提前高亮
    threshold: [0, 1.0],
  })

  headings.forEach(h => observer!.observe(h))
}

onMounted(() => {
  setTimeout(initObserver, 0)
})

onUnmounted(() => {
  observer?.disconnect()
})

function onItemClick(e: MouseEvent) {
  handleClick(e)
  close()
}

</script>

<template>
  <!-- 浮动按钮：仅移动端且存在目录时显示 -->
  <button
    v-if="isMobile && hasHeaders && isPost"
    class="sakura-mobile-toc-btn"
    type="button"
    aria-label="目录"
    :class="{ open }"
    :style="props.showProgress ? { '--toc-progress': progress + '%' } : undefined"
    @click="toggle"
  >
    <span class="inner">
      <span class="toc-icon" :class="open ? props.activeIcon : props.icon" />
    </span>
    <span class="visually-hidden">TOC</span>
  </button>

  <!-- 遮罩 -->
  <transition name="fade">
    <div v-if="open" class="sakura-mobile-toc-mask" role="button" tabindex="-1" aria-label="关闭目录" @click.self="close" />
  </transition>

  <!-- 侧滑面板 -->
  <transition name="slide">
    <aside
      v-if="open"
      class="sakura-mobile-toc-panel"
      aria-label="文章目录"
    >
      <header class="panel-header">
        <span class="title">目录</span>
        <button class="close" type="button" aria-label="关闭" @click="close">×</button>
      </header>
      <nav class="panel-body" aria-labelledby="mobile-toc-label">
        <ul class="toc-root">
          <template v-for="item in headers" :key="item.link">
            <li class="toc-item">
              <RouterLink
                :to="item.link"
                class="toc-link"
                :class="{ active: activeHash === item.link }"
                :href="item.link"
                @click="onItemClick"
              >{{ item.title }}</RouterLink>
              <ul v-if="item.children?.length" class="toc-sub">
                <li v-for="child in item.children" :key="child.link" class="toc-item">
                  <RouterLink
                    :to="child.link"
                    class="toc-link"
                    :class="{ active: activeHash === child.link }"
                    :href="child.link"
                    @click="onItemClick"
                  >{{ child.title }}</RouterLink>
                  <ul v-if="child.children?.length" class="toc-sub">
                    <li v-for="g in child.children" :key="g.link" class="toc-item">
                      <RouterLink
                        :to="g.link"
                        class="toc-link"
                        :class="{ active: activeHash === g.link }"
                        :href="g.link"
                        @click="onItemClick"
                      >{{ g.title }}</RouterLink>
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </template>
        </ul>
      </nav>
    </aside>
  </transition>
</template>

<style scoped lang="scss">
.sakura-mobile-toc-btn {
  --toc-progress: 0%;
  position: fixed;
  right: 16px;
  bottom: 56px; // 调低位置，离底部更近
  z-index: 1000;
  width: 50px; // 缩小整体尺寸
  height: 50px;
  padding: 4px; // 进度环留白随尺寸缩小
  border: none;
  border-radius: 50%;
  cursor: pointer;
  background:
    conic-gradient(var(--sakura-color-primary) var(--toc-progress), var(--va-c-bg-soft, #e5e5e5) 0) border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 14px rgba(0,0,0,0.18), 0 0 0 1px rgba(255,255,255,0.3) inset;
  transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .3s, background .4s;
  &:active { transform: scale(.9); }
  &.open { transform: rotate(135deg) scale(1.05); }
  .inner {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    background: var(--sakura-color-primary);
    display: flex;
    align-items: center;
    justify-content: center;
    color: #fff;
  font-size: 20px; // 图标随按钮缩小
    position: relative;
    overflow: hidden;
  }
  .toc-icon { transition: transform .45s, opacity .3s; }
  &.open .toc-icon { transform: rotate(-135deg); }
}

.visually-hidden { position: absolute; width:1px; height:1px; padding:0; margin:-1px; overflow:hidden; clip:rect(0 0 0 0); clip-path:inset(50%); border:0; }

.sakura-mobile-toc-mask {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.38);
  backdrop-filter: blur(2px);
  z-index: 998;
}

.sakura-mobile-toc-panel {
  position: fixed;
  top: 0;
  right: 0;
  height: 100vh;
  width: min(80%, 320px);
  background: var(--va-c-bg, #fff);
  box-shadow: -4px 0 18px rgba(0,0,0,0.15);
  z-index: 999;
  display: flex;
  flex-direction: column;
  font-size: 14px;
  text-align: left; /* 确保面板内文字左对齐 */
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  font-weight: 600;
  background: var(--va-c-bg-soft, #fafafa);
  border-bottom: 1px solid var(--va-c-divider, #e5e5e5);
  .close {
    font-size: 24px;
    line-height: 1;
    border: none;
    background: transparent;
    cursor: pointer;
    color: var(--va-c-text-2, #666);
  }
}

.panel-body {
  flex: 1;
  overflow-y: auto;
  padding: 8px 12px 32px;
  -webkit-overflow-scrolling: touch;
  text-align: left; /* 强制 body 内文字左对齐 */
}


/* 层级结构样式增强 */
.toc-root, .toc-sub { list-style: none; margin: 0; padding: 0; }
.toc-root { padding-left: 0; }
.toc-sub { position: relative; padding-left: 14px; margin: 2px 0 4px; border-left: 1.5px solid var(--va-c-divider, #e2e2e2); }
.toc-sub .toc-sub { border-color: var(--va-c-divider, #ececec); }

.toc-item { margin: 0; position: relative; }
.toc-sub > .toc-item::before {
  content: '';
  position: absolute;
  left: -7px;
  top: 13px;
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: var(--va-c-divider, #d0d0d0);
  transform: translateY(-50%);
}
.toc-sub > .toc-item:hover::before, .toc-sub > .toc-item .toc-link.active + .toc-sub > .toc-item::before { background: var(--sakura-color-primary); }

/* 字体层级 */
.toc-root > .toc-item > .toc-link { font-weight: 600; font-size: 14px; }
.toc-sub > .toc-item > .toc-link { font-size: 13px; font-weight: 500; }
.toc-sub .toc-sub > .toc-item > .toc-link { font-size: 12.5px; opacity: .92; }
.toc-sub .toc-sub .toc-sub > .toc-item > .toc-link { font-size: 12px; opacity: .85; }

.toc-link {
  display: block;
  padding: 6px 4px;
  color: var(--va-c-text-1, #333);
  text-decoration: none;
  border-radius: 6px;
  line-height: 1.3;
  max-width: 100%;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  transition: background .2s, color .2s;
  text-align: left; /* 链接文本左对齐 */
  &.active { color: var(--sakura-color-primary); background: var(--va-c-bg-alt, #f5f5f5); }
  &:hover { background: var(--va-c-bg-alt, #f5f5f5); }
}

// 动画
.fade-enter-active, .fade-leave-active { transition: opacity .25s; }
.fade-enter-from, .fade-leave-to { opacity: 0; }

.slide-enter-active, .slide-leave-active { transition: transform .28s cubic-bezier(.4,0,.2,1); }
.slide-enter-from, .slide-leave-to { transform: translateX(100%); }
</style>
