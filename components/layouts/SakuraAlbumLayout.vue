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

const activeSectionIndex = ref<number | null>(null)
const activeSection = computed(() => {
  if (activeSectionIndex.value === null) return null
  return sections.value[activeSectionIndex.value]
})

function openAlbum(index: number) {
  activeSectionIndex.value = index
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeAlbum() {
  activeSectionIndex.value = null
  if (galleryInstance) {
    galleryInstance.destroy(true)
    galleryInstance = null
    galleryInited = false
  }
}

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
  // 首次不自动初始化 gallery，需要等打开相册
  // initGalleryIfReady()
  
  // 轮询兜底
  if (!sections.value.length) {
    let tries = 0
    const timer = setInterval(() => {
      tries++
      parseData()
      if (sections.value.length) {
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

// 监听 activeSection 变化来初始化 gallery
watch(activeSection, async (val) => {
  if (val) {
    await nextTick()
    initGalleryIfReady()
    await nextTick()
    setupLazyLoad()
  } else {
    // 退出相册时销毁
    if (galleryInstance) {
       galleryInstance.destroy(true)
       galleryInstance = null
       galleryInited = false
    }
  }
})

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
  if (!activeSection.value) return // 仅在有激活相册时初始化
  if (!galleryRef.value) return
  
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
          <div class="sakura-album-layout">
            
            <!-- 新设计的潮流标题 -->
            <div class="page-header-neo" v-if="!activeSection"> <!-- 仅在列表模式或顶层显示，进入详情后可选择隐藏或保留，这里保留但在详情页可能会显得重复，不过用户没说详情页主要标题的问题，先保留 -->
               <div class="header-inner">
                 <div class="neo-subtitle">VISUAL COLLECTION</div>
                 <h1 class="neo-title" data-text="影像集">影像集</h1>
                 <div class="neo-deco-bar">
                    <span class="bar-segment"></span>
                    <span class="bar-id">REC-2026</span>
                 </div>
               </div>
            </div>

            <!-- 模式1: 专辑列表模式 -->
            <transition name="fade-slide" mode="out-in">
              <div v-if="!activeSection && sections.length" key="list" class="album-list-container">
                <div class="album-grid">
                  <div 
                    v-for="(section, idx) in sections" 
                    :key="idx"
                    class="album-folder group"
                    @click="openAlbum(idx)"
                  >
                    <!-- 封面图 -->
                    <div class="folder-cover-wrapper">
                      <div class="folder-cover-inner">
                        <img 
                          v-if="section.photos && section.photos[0]" 
                          :src="section.photos[0].thumb || section.photos[0].src" 
                          class="folder-cover-img"
                          loading="lazy"
                        />
                        <div v-else class="folder-empty-placeholder">N/A</div>
                      </div>
                      <!-- 装饰元素 -->
                      <div class="folder-deco-line"></div>
                      <div class="folder-deco-tag">LAYER {{ idx + 1 }}</div>
                    </div>
                    
                    <!-- 专辑信息 -->
                    <div class="folder-info">
                      <h3 class="folder-title">{{ section.title || 'UNTITLED' }}</h3>
                      <div class="folder-meta">
                        <span class="count">{{ section.photos?.length || 0 }} ITEMS</span>
                        <span class="divider">/</span>
                        <span class="desc">{{ section.desc || 'NO DESCRIPTION' }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模式2: 详情模式 -->
              <div v-else-if="activeSection" key="detail" class="album-detail-container" ref="galleryRef">
                <!-- 导航栏 -->
                <div class="detail-nav">
                  <button class="back-btn" @click="closeAlbum">
                    <span class="icon">←</span> BACK
                  </button>
                  <div class="nav-title">{{ activeSection.title || 'ALBUM' }}</div>
                </div>

                <div class="detail-header">
                  <h2 class="detail-title-lg">
                    {{ activeSection.title || 'UNTITLED' }}
                    <span class="detail-index">#{{ String(activeSectionIndex! + 1).padStart(2, '0') }}</span>
                  </h2>
                  <div class="detail-desc" v-if="activeSection.desc">{{ activeSection.desc }}</div>
                </div>

                <!-- 瀑布流/Masonry -->
                <div 
                  class="album-masonry" 
                  data-lg="true"
                  :style="{ 
                    '--album-columns': activeSection.columns || defaultColumns, 
                    '--album-gap': defaultGap 
                  }"
                >
                  <a
                    v-for="(p, i) in activeSection.photos"
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
                
                <!-- 底部返回 -->
                <div class="detail-footer">
                   <button class="back-btn-lg" @click="closeAlbum">CLOSE ALBUM</button>
                </div>
              </div>

              <!-- 模式3: 空态 -->
              <div v-else key="empty" class="album-empty" style="padding:4rem;text-align:center;color:var(--sakura-text-3);">
                <div style="font-size: 2rem; opacity: 0.3; font-weight: bold;">EMPTY GALLERY</div>
              </div>
            </transition>
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

/* 动画 Transition */
.fade-slide-enter-active,
.fade-slide-leave-active {
  transition: all 0.4s cubic-bezier(0.2, 0.8, 0.2, 1);
}
.fade-slide-enter-from,
.fade-slide-leave-to {
  opacity: 0;
  transform: translateY(20px);
}

/* --- Album List Mode --- */
.album-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 40px;
  padding: 2rem 0;
}

.album-folder {
  cursor: pointer;
  position: relative;
  transition: transform 0.3s ease;
  
  &:hover {
    transform: translateY(-5px);
  }
}

.folder-cover-wrapper {
  position: relative;
  aspect-ratio: 4/3;
  margin-bottom: 1.5rem;
  /* 文件夹独特造型 */
  border-radius: 4px;
  background: var(--sakura-c-bg-soft);
  box-shadow: 10px 10px 0 var(--sakura-text-3); /* 偏移实色阴影，复古风 */
  transition: box-shadow 0.3s ease;
  overflow: hidden;
  border: 2px solid var(--sakura-text-1);
}

.album-folder:hover .folder-cover-wrapper {
  box-shadow: 15px 15px 0 var(--sakura-c-brand); /* 悬停变色 */
}

.folder-cover-inner {
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.folder-cover-img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(100%);
  transition: all 0.5s ease;
}
.album-folder:hover .folder-cover-img {
  filter: grayscale(0);
  transform: scale(1.1);
}

.folder-deco-tag {
  position: absolute;
  top: 0;
  right: 0;
  background: var(--sakura-text-1);
  color: var(--sakura-c-bg);
  font-size: 0.7rem;
  font-weight: bold;
  padding: 2px 8px;
  font-family: monospace;
}

/* --- Folder Info --- */
.folder-title {
  font-size: 1.6rem;
  font-weight: 900;
  margin: 0 0 0.5rem 0;
  text-transform: uppercase;
  color: var(--sakura-text-1);
}
.folder-meta {
  font-family: monospace;
  font-size: 0.85rem;
  color: var(--sakura-text-2);
  display: flex;
  gap: 0.5rem;
  align-items: center;
}
.folder-meta .divider { opacity: 0.3; }

/* --- Detail Mode --- */
.detail-nav {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 1px solid rgba(0,0,0,0.1);
  padding-bottom: 1rem;
}

.back-btn {
  background: none;
  border: 1px solid var(--sakura-text-1);
  padding: 6px 16px;
  cursor: pointer;
  font-weight: bold;
  font-size: 0.9rem;
  transition: all 0.2s;
  border-radius: 2px;
  
  &:hover {
    background: var(--sakura-text-1);
    color: var(--sakura-c-bg);
  }
}

.nav-title {
  font-weight: bold;
  opacity: 0.5;
  text-transform: uppercase;
  font-size: 0.8rem;
  letter-spacing: 2px;
}

.detail-header {
  margin-bottom: 3rem;
  text-align: center;
}
.detail-title-lg {
  font-size: 3.5rem;
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
  letter-spacing: -2px;
  color: var(--sakura-text-1);
}
.detail-index {
  font-size: 1rem;
  vertical-align: super;
  opacity: 0.4;
  margin-left: 5px;
  letter-spacing: 0;
}
.detail-desc {
  margin-top: 1rem;
  font-family: sans-serif;
  opacity: 0.7;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}
.detail-footer {
  margin-top: 4rem;
  text-align: center;
  opacity: 0.5;
  &:hover { opacity: 1; }
}
.back-btn-lg {
  background: none;
  border: none;
  border-bottom: 2px solid currentColor;
  padding: 5px 0;
  cursor: pointer;
  font-weight: bold;
  font-size: 1.2rem;
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

/* =========================================
   New Avant-garde Header & Global Overrides
   ========================================= */

/* 新标题区域 */
.page-header-neo {
  text-align: center;
  margin: 1rem 0 3rem;
  padding-bottom: 2rem;
  font-family: 'Courier New', Courier, monospace;
  position: relative;
  z-index: 5;
}

.neo-subtitle {
  font-size: 0.7rem;
  letter-spacing: 0.8em;
  color: var(--sakura-c-brand);
  margin-bottom: 0.8rem;
  font-weight: 900;
  text-transform: uppercase;
  opacity: 0.8;
}

.neo-title {
  font-size: 4rem;
  font-weight: 900;
  margin: 0;
  line-height: 1.1;
  color: var(--sakura-text-1);
  letter-spacing: -2px;
  position: relative;
  /* 错位阴影 */
  text-shadow: 4px 4px 0px rgba(0,0,0,0.1);
  transition: all 0.3s;
  
  &:hover {
    letter-spacing: 0px;
    color: var(--sakura-c-brand);
  }
}

.neo-deco-bar {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  opacity: 0.4;
}
.bar-segment {
  width: 40px;
  height: 3px;
  background: currentColor;
}
.bar-id {
  font-size: 0.6rem;
  letter-spacing: 0.1em;
}

/* 限制全局评论组件宽度 */
:global(.valaxy-comment), :global(#valaxy-comment) {
  max-width: 860px !important;
  margin: 0 auto !important;
  padding: 0 1rem;
}

/* 尝试隐藏默认页面标题 (通常在SakuraPage中) */
/* 隐藏原来的 { 影像集 } */
:global(.valaxy-page-title),
:global(.sakura-doc-title) {
  display: none !important;
}

/* 针对特定可能的 Sakura 主题标题结构 */
:global(h1.text-4xl.font-bold.mb-4.text-center) {
  display: none !important; /* 暴力隐藏可能的 Tailwind 类名标题 */
}
</style>
