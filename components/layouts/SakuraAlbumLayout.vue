<script setup lang="ts">
import { computed, onMounted, ref, watch, watchEffect, nextTick } from 'vue'
import { useFrontmatter } from 'valaxy'
import { useRoute } from 'vue-router'
import lightGallery from 'lightgallery'
// 独立使用时需手动引入样式（之前插件已自动注入）
import 'lightgallery/css/lightgallery.css'
import 'lightgallery/css/lg-zoom.css'
import 'lightgallery/css/lg-thumbnail.css'
// 过渡动画样式（官方放大/淡入等效果）
import 'lightgallery/css/lg-transitions.css'
// 可选择插件，若不需要可移除
import lgZoom from 'lightgallery/plugins/zoom'
import lgThumbnail from 'lightgallery/plugins/thumbnail'
// frontmatter 可定义:
// photos: [ { src: string; alt?: string; thumb?: string } ]
// title/description 仍由页面控制
const frontmatter = useFrontmatter<any>()
const route = useRoute()

interface PhotoItem { src: string; alt?: string; thumb?: string }
interface AlbumSection {
  title?: string
  desc?: string
  columns?: number
  photos: PhotoItem[]
}

const sections = ref<AlbumSection[]>([])
// 兼容旧版 photos 平铺模式的计算属性，用于判断是否隐藏 body
const hasPhotos = computed(() => sections.value.some(s => s.photos && s.photos.length > 0))
const hideBody = computed(() => !!frontmatter.value?.hideBody && hasPhotos.value)

// 全局默认列数
const defaultColumns = computed(() => Number(frontmatter.value?.columns) || 3) // 默认为3列
const defaultGap = computed(() => frontmatter.value?.gap || '20px')

const galleryRef = ref<HTMLElement | null>(null)
let galleryInited = false
let isInitializing = false
let galleryInstance: any = null
let io: IntersectionObserver | null = null

onMounted(() => {
  if (typeof window === 'undefined') return
  
  // 兼容逻辑：优先读取 albums，其次读取 photos
  const parseData = () => {
    const fmAny: any = frontmatter.value || (route.meta as any)?.frontmatter
    // 情况1: albums 数组
    if (fmAny?.albums && Array.isArray(fmAny.albums)) {
      sections.value = fmAny.albums
    }
    // 情况2: photos 数组 (兼容旧版)
    else if (fmAny?.photos && Array.isArray(fmAny.photos)) {
      sections.value = [{ photos: fmAny.photos }]
    }
  }

  parseData()
  initGalleryIfReady()
  
  // 轮询兜底
  if (!sections.value.length) {
    let tries = 0
    const timer = setInterval(() => {
      tries++
      parseData()
      if (sections.value.length) {
        initGalleryIfReady()
        clearInterval(timer)
      }
      if (tries >= 10) clearInterval(timer)
    }, 100)
  }
})

// 监听数据变化
watch(() => [frontmatter.value, route.meta], () => {
  const fmAny: any = frontmatter.value || (route.meta as any)?.frontmatter
  if (fmAny?.albums && Array.isArray(fmAny.albums)) {
    sections.value = fmAny.albums
  } else if (fmAny?.photos && Array.isArray(fmAny.photos)) {
    sections.value = [{ photos: fmAny.photos }]
  }
}, { deep: true })

watch(() => sections.value, async (val) => {
  if (val.length && !galleryInited) {
    await nextTick()
    initGalleryIfReady()
    await nextTick()
    setupLazyLoad()
  }
}, { deep: true })

// 兜底：如果用户在初始化前就点击图片，阻止默认跳转并立即初始化+打开对应索引
watch(galleryRef, (el) => {
  if (!el) return
  el.addEventListener('click', (e) => {
    const target = (e.target as HTMLElement)?.closest('a.album-item') as HTMLAnchorElement | null
    if (!target) return
    if (!galleryInited) {
      e.preventDefault()
      initGalleryIfReady()
      // 计算索引并打开
      if (galleryInstance) {
        const anchors = Array.from(el.querySelectorAll('a.album-item'))
        const index = anchors.indexOf(target)
        // 延迟一个 tick，确保 lightGallery 内部准备好
        requestAnimationFrame(() => {
          try { galleryInstance.openGallery(index >= 0 ? index : 0) } catch {}
        })
      }
    }
  }, { passive: false })
}, { immediate: true })



function initGalleryIfReady() {
  if (galleryInited || isInitializing) return
  if (!galleryRef.value) return
  if (!hasPhotos.value) return
  
  isInitializing = true
  try {
    // 销毁旧实例
    if (galleryInstance) {
      galleryInstance.destroy(true)
      galleryInstance = null
    }
  
    // 延迟一帧，确保 v-for 渲染完毕
    requestAnimationFrame(() => {
      if (!galleryRef.value) {
        isInitializing = false
        return
      }
      galleryInstance = lightGallery(galleryRef.value as HTMLElement, {
        selector: '.album-item', // 明确选择器
        plugins: [lgZoom, lgThumbnail],
        speed: 400,
        licenseKey: '0000-0000-000-0000',
        mode: 'lg-fade',
        download: true,
        zoom: true,
        thumbnail: true,
        allowMediaOverlap: false,
        mobileSettings: {
          controls: true,
          showCloseIcon: true,
          download: true,
          rotate: false,
        },
      })
      galleryInited = true
      isInitializing = false
      console.log('[album] lightGallery initialized')
    })
  }
  catch (e) {
    console.warn('[album] init lightGallery failed', e)
    isInitializing = false
  }
}

function setupLazyLoad() {
  if (!galleryRef.value) return
  // 释放旧 observer
  if (io) {
    io.disconnect()
    io = null
  }
  // 若浏览器不支持，直接标记已加载
  if (typeof window === 'undefined' || !('IntersectionObserver' in window)) {
    galleryRef.value.querySelectorAll('img[data-full]')
      .forEach((img: any) => upgradeToFull(img))
    return
  }
  io = new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (entry.isIntersecting) {
        const img = entry.target as HTMLImageElement
        upgradeToFull(img)
        io?.unobserve(img)
      }
    }
  }, { rootMargin: '200px 0px 200px 0px', threshold: 0.01 })

  galleryRef.value.querySelectorAll('img[data-full]')
    .forEach(img => io!.observe(img))
}

function upgradeToFull(img: HTMLImageElement) {
  const full = img.getAttribute('data-full')
  if (!full) return
  if (img.getAttribute('data-loaded') === '1') return
  // 如果已经是 full 也直接去除模糊
  if (img.src !== full) {
    const onLoad = () => {
      img.classList.add('is-loaded')
      img.setAttribute('data-loaded', '1')
      img.removeEventListener('load', onLoad)
    }
    img.addEventListener('load', onLoad)
    img.src = full
  }
  else {
    img.classList.add('is-loaded')
    img.setAttribute('data-loaded', '1')
  }
}
</script>

<template>
  <SakuraPage :class="{ 'album-hide-body': hideBody }">
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content-after>
          <div class="sakura-album-layout" ref="galleryRef">
            <template v-if="sections.length">
              <div 
                v-for="(section, sIndex) in sections" 
                :key="sIndex" 
                class="album-section"
              >
                <!-- 潮流标题头：如果有标题或描述 -->
                <div v-if="section.title || section.desc" class="album-header">
                  <div class="header-decoration">
                    <span class="cross">Access:</span>
                    <span class="line"></span>
                  </div>
                  <div class="header-main">
                    <h2 class="section-title">
                      <span class="title-text">{{ section.title || 'UNTITLED' }}</span>
                      <span class="title-index">NO.{{ String(sIndex + 1).padStart(2, '0') }}</span>
                    </h2>
                    <div class="section-meta" v-if="section.desc">
                      <span class="meta-tag">/// RECORD</span>
                      <span class="meta-desc">{{ section.desc }}</span>
                    </div>
                  </div>
                </div>

                <!-- 瀑布流容器 -->
                <div 
                  class="album-masonry" 
                  data-lg="true"
                  :style="{ 
                    '--album-columns': section.columns || defaultColumns, 
                    '--album-gap': defaultGap 
                  }"
                >
                  <a
                    v-for="(p, i) in section.photos"
                    :key="p.src"
                    class="album-item group"
                    :href="p.src"
                    :data-sub-html="p.alt || ''"
                    :style="{ '--delay': `${i * 0.05}s` }"
                  >
                    <div class="album-img-wrapper">
                      <img
                        :src="p.thumb || p.src"
                        :data-full="p.src"
                        :alt="p.alt || p.src"
                        loading="lazy"
                        class="album-img"
                        :class="{ 'has-thumb': !!p.thumb }"
                      >
                      <div v-if="p.alt" class="album-info">
                        <span class="album-text">{{ p.alt }}</span>
                      </div>
                    </div>
                  </a>
                </div>
              </div>
            </template>
            <div v-else class="album-empty" style="padding:4rem;text-align:center;color:var(--sakura-text-3);">
              <div style="font-size: 2rem; opacity: 0.3; font-weight: bold;">EMPTY GALLERY</div>
            </div>
          </div>
        </template>
      </component>
    </RouterView>
  </SakuraPage>
</template>

<style scoped lang="scss">
.sakura-album-layout {
  padding: 1rem 1rem 5rem;
  max-width: 1400px;
  margin: 0 auto;
}

.album-section {
  margin-bottom: 6rem;
}

/* 潮流表头设计：Acid / Brutalist 风格 */
.album-header {
  margin-bottom: 2.5rem;
  font-family: 'Courier New', Courier, monospace; /* 机械感字体 */
  position: relative;
}

.header-decoration {
  display: flex;
  align-items: center;
  color: var(--sakura-text-3);
  font-size: 0.75rem;
  letter-spacing: 0.1em;
  margin-bottom: 0.5rem;
  opacity: 0.6;
}
.header-decoration .line {
  flex: 1;
  height: 1px;
  background: currentColor;
  margin-left: 1rem;
  opacity: 0.3;
}

.header-main {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  flex-wrap: wrap;
  gap: 1rem;
  padding-bottom: 1rem;
  border-bottom: 2px solid var(--sakura-text-1);
}

.section-title {
  margin: 0;
  font-size: 3rem;
  line-height: 1;
  font-weight: 900;
  letter-spacing: -1px;
  color: var(--sakura-text-1);
  display: flex;
  align-items: flex-start;
  gap: 1rem;
}

.title-index {
  font-size: 0.8rem;
  font-weight: normal;
  border: 1px solid currentColor;
  padding: 2px 6px;
  border-radius: 100px;
  vertical-align: top;
  margin-top: 5px;
  opacity: 0.5;
}

.section-meta {
  text-align: right;
  font-size: 0.85rem;
  color: var(--sakura-text-2);
  max-width: 300px;
}
.meta-tag {
  display: block;
  font-weight: bold;
  font-size: 0.7rem;
  opacity: 0.5;
  margin-bottom: 2px;
}

/* Masonry 布局 (复用之前逻辑，微调参数) */
.album-masonry {
  column-count: var(--album-columns, 3); /* 默认3列 */
  column-gap: 20px;
}
.album-item {
  break-inside: avoid;
  margin-bottom: 20px;
  width: 100%;
  display: block;
  position: relative;
  opacity: 0;
  transform: translateY(40px);
  animation: entrance 0.8s cubic-bezier(0.2, 0.8, 0.2, 1) forwards;
  animation-delay: var(--delay, 0s);
  perspective: 1000px;
  z-index: 1;
  transition: z-index 0s 0.3s;
  
  &:hover {
    z-index: 10;
    transition: z-index 0s 0s;
  }
}

.album-img-wrapper {
  position: relative;
  overflow: hidden;
  border-radius: 0; 
  transition: all 0.5s cubic-bezier(0.19, 1, 0.22, 1);
  background: #f0f0f0;
}
/* 几何裁切：更温和一点，防止过于夸张 */
.album-item:nth-child(odd) .album-img-wrapper { border-radius: 16px 2px 16px 2px; }
.album-item:nth-child(even) .album-img-wrapper { border-radius: 2px 16px 2px 16px; }

.album-img {
  width: 100%;
  display: block;
  object-fit: cover;
  /* 潮流滤镜：略微降低饱和度，提高对比度 */
  filter: saturate(0.8) contrast(1.1);
  transform: scale(1.02);
  transition: all 0.6s ease;
}

.album-item:hover .album-img-wrapper {
  border-radius: 4px; /* 悬停变方，复古科技感 */
  box-shadow: 5px 5px 0px var(--sakura-text-2); /* 实体阴影 */
  transform: translateY(-4px) translateX(-2px);
}
.album-item:hover .album-img {
  filter: saturate(1.2) contrast(1);
  transform: scale(1);
}

/* 遮罩 */
.album-info {
  position: absolute;
  top: 10px;
  left: 10px;
  padding: 4px 8px;
  background: var(--sakura-c-bg);
  border: 1px solid var(--sakura-text-1);
  color: var(--sakura-text-1);
  font-size: 0.75rem;
  font-weight: bold;
  opacity: 0;
  transform: translateY(-10px);
  transition: all 0.3s ease;
  pointer-events: none;
  z-index: 2;
  box-shadow: 2px 2px 0 rgba(0,0,0,0.1);
}

.album-item:hover .album-info {
  opacity: 1;
  transform: translateY(0);
}

@keyframes entrance {
  from { opacity: 0; transform: translateY(60px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) { 
  .album-masonry { column-count: 3 !important; } 
  .section-title { font-size: 2.2rem; }
}
@media (max-width: 800px) { 
  .album-masonry { column-count: 2 !important; } 
  .album-header { margin-bottom: 1.5rem; }
  .section-title { font-size: 1.8rem; }
}
@media (max-width: 520px) { 
  .album-masonry { column-count: 1 !important; } 
  .header-main { flex-direction: column; align-items: flex-start; gap: 0.5rem; }
  .section-meta { text-align: left; max-width: 100%; border-left: 2px solid var(--sakura-c-brand); padding-left: 0.8rem; margin-top: 0.5rem; }
  
  /* 移动端减弱特效，保持可用性 */
  .album-img { filter: grayscale(0); }
  .album-item:nth-child(n) .album-img-wrapper { border-radius: 12px; }
  .album-info { display: none; } /* 移动端可选择不显示遮罩，或保持常驻 */
}

.album-hide-body .sakura-page-content > :first-child .prose { display: none; }
</style>
