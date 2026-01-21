<script setup lang="ts">
import { computed, onMounted, ref, watch, nextTick } from 'vue'
import { useFrontmatter } from 'valaxy'
import { useRoute, useRouter } from 'vue-router'
import { useWindowSize } from '@vueuse/core'
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
const router = useRouter()

interface PhotoItem { src: string; alt?: string; thumb?: string }
interface AlbumSection {
  title?: string
  desc?: string
  columns?: number
  photos: PhotoItem[]
  path?: string      // Link to album page
  cover?: string     // Cover image for folder
  date?: string | Date
}

const sections = ref<AlbumSection[]>([])
// 兼容旧版 photos 平铺模式的计算属性，用于判断是否隐藏 body
const hasPhotos = computed(() => sections.value.some(s => s.photos && s.photos.length > 0))
const hideBody = computed(() => !!frontmatter.value?.hideBody && hasPhotos.value)

// Check for Custom Split View (Note mode)
const isSplitView = computed(() => {
  // Only enable split view if we are in a single album context and have a note
  return activeSection.value && !!frontmatter.value?.note
})
const noteContent = computed(() => frontmatter.value?.note || '')
const albumDate = computed(() => {
  const d = frontmatter.value?.date
  if (!d) return ''
  try { return new Date(d).toLocaleDateString('zh-CN', { year: 'numeric', month: 'long', day: 'numeric' }) }
  catch { return '' }
})

// 全局默认列数
const defaultColumns = computed(() => Number(frontmatter.value?.columns) || 3) // 默认为3列
const defaultGap = computed(() => frontmatter.value?.gap || '20px')

// JavaScript Masonry Logic for Lazy Load Optimization
const { width: windowWidth } = useWindowSize()
const currentColumns = computed(() => {
  // 响应式断点优先级最高
  if (windowWidth.value <= 520) return 1  // 手机端：1列
  if (windowWidth.value <= 800) return 2  // 平板端：2列
  
  // 电脑端：根据配置或默认3列
  if (isSplitView.value) return 3 // Split view fixed to 3 on desktop
  return activeSection.value?.columns || defaultColumns.value
})

const masonryGroups = computed(() => {
  const groups: PhotoItem[][] = Array.from({ length: currentColumns.value }, () => [])
  const photos = activeSection.value?.photos || []
  if (photos.length === 0) return []
  
  photos.forEach((photo, index) => {
    // Round-robin distribution
    const colIndex = index % currentColumns.value
    groups[colIndex].push(photo)
  })
  return groups
})

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

// Check if we are in a leaf page (single album mode)
const isSingleAlbumPage = computed(() => {
  // If we have 1 section and it has no path (meaning it's loaded from current page's photos)
  // And it's NOT an explicit 'albums' list mode with just 1 item (logic #1)
  // Actually simpler: if frontmatter has `photos` but not `albums`, it's a leaf.
  const fmAny: any = frontmatter.value
  return !!(fmAny?.photos && Array.isArray(fmAny.photos) && !fmAny.albums)
})

// 计算当前相册在全局所有相册中的真实索引
const globalAlbumIndex = computed(() => {
  if (!isSingleAlbumPage.value) {
    // 非单相册模式，直接返回 activeSectionIndex
    return activeSectionIndex.value
  }
  
  // 单相册模式：在所有相册路由中找到当前页面的位置
  const allRoutes = router.getRoutes()
  const albumRoutes = allRoutes
    .filter(r => 
      r.path.startsWith('/albums/') && 
      r.path !== '/albums/' &&
      r.meta.frontmatter && 
      (r.meta.frontmatter as any).layout === 'album'
    )
    .sort((a, b) => {
      // 按日期排序（与列表页逻辑一致）
      const dateA = (a.meta.frontmatter as any)?.date || ''
      const dateB = (b.meta.frontmatter as any)?.date || ''
      return new Date(dateB).getTime() - new Date(dateA).getTime()
    })
  
  const currentPath = route.path
  const idx = albumRoutes.findIndex(r => r.path === currentPath)
  return idx >= 0 ? idx : 0
})

function openAlbum(index: number) {
  const section = sections.value[index]
  // Navigate if it's a link
  if (section.path) {
    router.push(section.path)
    return
  }
  activeSectionIndex.value = index
  window.scrollTo({ top: 0, behavior: 'smooth' })
}

function closeAlbum() {
  // If we are on a single album page, "Back" means go to parent gallery
  if (isSingleAlbumPage.value) {
    router.push('/album')
  } else {
    activeSectionIndex.value = null
    if (galleryInstance) {
      galleryInstance.destroy(true)
      galleryInstance = null
      galleryInited = false
    }
  }
}

const formatDate = (date: string | Date | undefined) => {
  if (!date) return ''
  const d = new Date(date)
  if (isNaN(d.getTime())) return ''
  const year = d.getFullYear()
  const month = String(d.getMonth() + 1).padStart(2, '0')
  return `${year}.${month}`
}

const parseData = () => {
  const fmAny: any = frontmatter.value || (route.meta as any)?.frontmatter
  
  // 情况1: albums 数组 (明确手动指定的列表)
  if (fmAny?.albums && Array.isArray(fmAny.albums)) {
    sections.value = fmAny.albums
    activeSectionIndex.value = null
  }
  // 情况2: photos 数组 (单相册详情页)
  else if (fmAny?.photos && Array.isArray(fmAny.photos)) {
    sections.value = [{ 
      photos: fmAny.photos,
      title: fmAny.title,
      desc: fmAny.desc,
    }]
    // 强制直接打开，跳过列表页
    activeSectionIndex.value = 0
  }
  // 情况3: 自动扫描 /pages/albums/ 下的页面
  else {
    const allRoutes = router.getRoutes()
    const albumRoutes = allRoutes.filter(r => 
      r.path.startsWith('/albums/') && 
      r.path !== '/albums/' && // 排除自身或其他索引
      r.meta.frontmatter && 
      (r.meta.frontmatter as any).layout === 'album'
    )

    if (albumRoutes.length > 0) {
      sections.value = albumRoutes.map(r => {
        const fm = r.meta.frontmatter as any
        return {
          title: fm.title,
          desc: fm.desc || fm.subtitle,
          cover: fm.cover || (fm.photos?.[0]?.src),
          photos: fm.photos || [],
          path: r.path,
          date: fm.date
        }
      })
      activeSectionIndex.value = null
    }
  }
}

onMounted(() => {
  if (typeof window === 'undefined') return
  
  parseData()
  
  // 轮询兜底 (Valaxy 有时 frontmatter 延迟加载)
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

// 监听路由/数据变化，确保在导航时重新解析状态
watch(() => [frontmatter.value, route.path], () => {
    parseData()
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
  el.addEventListener('click', async (e) => {
    const target = (e.target as HTMLElement)?.closest('a.album-item') as HTMLAnchorElement | null
    if (!target) return
    if (!galleryInited) {
      e.preventDefault()
      e.stopImmediatePropagation()
      await initGalleryIfReady()

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
  }, { passive: false, capture: true })
}, { immediate: true })



function initGalleryIfReady(): Promise<void> {
  return new Promise((resolve) => {
    if (galleryInited) {
      resolve()
      return
    }
    // 如果正在初始化，轮询等待
    if (isInitializing) {
      const waitTimer = setInterval(() => {
        if (!isInitializing) {
          clearInterval(waitTimer)
          resolve()
        }
      }, 50)
      return
    }

    if (!activeSection.value) { // 仅在有激活相册时初始化
      resolve()
      return 
    }
    if (!galleryRef.value) {
      resolve()
      return
    }
    
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
          resolve()
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
        resolve()
      })
    }
    catch (e) {
      console.warn('[album] init lightGallery failed', e)
      isInitializing = false
      resolve()
    }
  })
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
  <SakuraPage class="sakura-album-page" :class="{ 'album-hide-body': hideBody }">
    <!-- 隐藏原主题的详情页标题 -->
    <template #header>
      <div class="hidden-header" style="display:none;"></div>
    </template>

    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content-after>
          <div class="sakura-album-layout">
            
            <!-- 新设计的潮流标题: 仅在索引页显示 -->
            <div class="page-header-neo" v-if="!activeSection && !isSingleAlbumPage">
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
                          v-if="section.cover || (section.photos && section.photos[0])"
                          :src="section.cover || section.photos[0].src" 
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
                        <span v-if="section.date" class="divider">/</span>
                        <span v-if="section.date" class="date">{{ formatDate(section.date) }}</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- 模式2: 详情模式 -->
              <div v-else-if="activeSection" key="detail" class="album-detail-container" ref="galleryRef">
                
                <!-- Sub-Mode A: Split View (Note Mode) -->
                <div v-if="isSplitView" class="split-view-container">
                    <div class="split-header">
                       <div class="header-left">
                          <h1 class="split-title">{{ activeSection.title }}<span class="split-index">#{{ String((globalAlbumIndex ?? 0) + 1).padStart(2, '0') }}</span></h1>
                          <div class="split-meta-group">
                             <div class="split-date" v-if="albumDate">{{ albumDate }}</div>
                             <div class="split-desc" v-if="activeSection.desc">{{ activeSection.desc }}</div>
                          </div>
                       </div>
                       
                       <div class="header-line-wrapper">
                         <div class="header-line"></div>
                       </div>
                       
                       <div class="header-right">
                          <div class="note-text">{{ noteContent }}</div>
                       </div>
                    </div>
                </div>

                <!-- Sub-Mode B: Standard Header (Masonry Mode) -->
                <template v-else>
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
                      <span class="detail-index">#{{ String((globalAlbumIndex ?? 0) + 1).padStart(2, '0') }}</span>
                    </h2>
                    <div class="detail-desc" v-if="activeSection.desc">{{ activeSection.desc }}</div>
                  </div>
                </template>

                <!-- Shared Photo Grid (JS-Driven Masonry) -->
                <div 
                  class="album-masonry" 
                  :class="{ 'split-grid-mode': isSplitView }"
                  data-lg="true"
                  :style="{ '--album-gap': defaultGap }"
                >
                  <div 
                    v-for="(group, colIndex) in masonryGroups" 
                    :key="colIndex" 
                    class="masonry-col"
                  >
                    <a
                      v-for="(p, i) in group"
                      :key="p.src"
                      class="album-item group"
                      :href="p.src"
                      :data-sub-html="p.alt || '&nbsp;'"
                      :style="{ '--delay': `${(i + colIndex) * 0.05}s` }"
                    >
                      <div class="album-img-wrapper">
                        <img
                          :src="p.thumb || p.src"
                          :data-full="p.src"
                          :alt="p.alt || '   '"
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
                
                <!-- 底部返回 (Bottom Flow Button) -->
                <div class="detail-footer">
                   <button class="back-btn-lg" @click="closeAlbum">CLOSE ALBUM</button>
                </div>

                <!-- 浮动返回按钮 (Floating FAB) -->
                <!-- 仅在进入详情页时显示，且不与顶部返回冲突 -->
                <SakuraAlbumBack 
                  v-if="activeSection" 
                  @click="closeAlbum" 
                />
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
  /* box-shadow: 15px 15px 0 var(--sakura-c-brand); */
  /* 改为灰色阴影，避免夜间模式过亮或颜色冲突 */
  box-shadow: 15px 15px 0 rgba(128, 128, 128, 0.4); 
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
  font-size: 4.5rem;
  font-weight: 900;
  margin: 0;
  line-height: 0.9;
  letter-spacing: -3px;
  color: var(--sakura-text-1);
  font-family: 'Impact', 'Arial Black', sans-serif;
  text-transform: uppercase;
  font-style: italic;
  transform: skewX(-10deg);
  transform-origin: 50% 50%;
  text-shadow: 4px 4px 0px rgba(128,128,128, 0.3);
  animation: slideInLeft 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}
.detail-index {
  font-size: 1rem;
  vertical-align: super;
  opacity: 0.4;
  margin-left: 8px;
  letter-spacing: 0;
  font-style: normal;
  transform: skewX(10deg);
  display: inline-block;
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
/* Js-Driven Masonry */
.album-masonry {
  display: flex !important;
  align-items: flex-start;
  gap: 20px; /* Force sync with defaultGap */
  width: 100%;
  margin: 0 auto;
}
.masonry-col {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 20px;
  min-width: 0;
}
.album-item {
  /* break-inside: avoid; */
  margin-bottom: 0px; /* Use gap */
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
  
  /* 去除超链接默认的下划线/边框 */
  border-bottom: none !important;
  text-decoration: none !important;
  
  &:hover {
    z-index: 10;
    transition: z-index 0s 0s;
    border-bottom: none !important; /* 确保悬停时也不出现 */
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
.masonry-col:nth-child(odd) .album-item:nth-child(odd) .album-img-wrapper { border-radius: 16px 2px 16px 2px; }
.masonry-col:nth-child(odd) .album-item:nth-child(even) .album-img-wrapper { border-radius: 2px 16px 2px 16px; }
.masonry-col:nth-child(even) .album-item:nth-child(odd) .album-img-wrapper { border-radius: 2px 16px 2px 16px; }
.masonry-col:nth-child(even) .album-item:nth-child(even) .album-img-wrapper { border-radius: 16px 2px 16px 2px; }

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
  /* box-shadow: 5px 5px 0px var(--sakura-text-2); */
  box-shadow: 5px 5px 0px rgba(128, 128, 128, 0.4); /* 改为统一的灰色阴影 */
  transform: translateY(-4px) translateX(-2px);
}
.album-item:hover .album-img {
  filter: saturate(1.2) contrast(1);
  transform: scale(1);
}

/* 遮罩 - Modern Art Label Design */
.album-info {
  position: absolute;
  bottom: 0;
  left: 0; 
  width: 100%;
  
  /* Reset box model from previous Glassmorphism */
  background: transparent;
  backdrop-filter: none;
  border: none;
  box-shadow: none;
  border-radius: 0;
  
  padding: 10px;
  pointer-events: none;
  z-index: 2;
  
  display: flex;
  align-items: flex-end;
  
  /* Gradient overlay for readability */
  background: linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
}

.album-text {
  /* Minimalist Text Style */
  color: #fff;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', sans-serif;
  font-weight: 600;
  font-size: 0.9rem;
  letter-spacing: 1px;
  text-shadow: 0 1px 4px rgba(0,0,0,0.5);
  
  /* Decorative Line */
  border-left: 3px solid #fff;
  padding-left: 8px;
  margin-left: 5px;
  margin-bottom: 5px;
  
  /* Animation from bottom */
  transform: translateY(10px);
  transition: transform 0.4s cubic-bezier(0.19, 1, 0.22, 1);
}

.album-item:hover .album-info {
  opacity: 1;
}
.album-item:hover .album-text {
  transform: translateY(0);
}

@keyframes entrance {
  from { opacity: 0; transform: translateY(60px); }
  to { opacity: 1; transform: translateY(0); }
}

@media (max-width: 1100px) { 
  /* .album-masonry { column-count: 3 !important; } */
  .section-title { font-size: 2.2rem; }
}
@media (max-width: 800px) { 
  /* .album-masonry { column-count: 2 !important; } */
  .album-header { margin-bottom: 1.5rem; }
  .section-title { font-size: 1.8rem; }
}
@media (max-width: 520px) { 
  /* .album-masonry { column-count: 1 !important; } */
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
  margin: 6rem 0 3rem; /* 增加顶部间距，避免贴近导航栏 */
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

/* 评论组件宽度强行修正 */
:global(.sakura-album-page .sakura-comment),
:global(.sakura-album-page .valaxy-comment),
:global(.sakura-album-page #valaxy-comment),
:global(.sakura-album-page .comment-container) {
  max-width: 860px !important;
  margin-left: auto !important;
  margin-right: auto !important;
  width: 100% !important;
  box-sizing: border-box;
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

/* =========================================
   Split View Note Mode Sub-layout
   ========================================= */

.split-view-container {
  width: 100%;
  margin-bottom: 2rem;
  animation: slideInUp 0.6s ease-out;
}

.split-header {
  max-width: 1000px;
  /* 增加顶部间距 (8rem)，防止被顶部导航栏遮挡 */
  margin: 8rem auto 3rem;
  
  display: grid;
  /* 调整比例 */
  grid-template-columns: 0.7fr auto 1.1fr;
  gap: 3rem;
  
  align-items: stretch; 
  
  text-align: left;
  border-bottom: 1px solid rgba(128,128,128,0.1);
  padding-bottom: 2.5rem;
}

.header-left {
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: flex-end; 
  padding-top: 0.2rem;
  padding-right: 0; 
  text-align: right; 
}

/* 竖线容器 */
.header-line-wrapper {
  display: flex;
  justify-content: center;
  position: relative;
}
.header-line {
  width: 2px;
  background: var(--sakura-text-1);
  opacity: 0.6; 
}

.header-right {
  padding-top: 0.8rem;
  animation: fadeInRight 0.8s ease-out 0.2s backwards;
}

.split-title {
  font-size: 4.5rem; 
  font-weight: 900;
  line-height: 0.9;
  /* 增加标题下方的间距，让它独立出来 */
  margin: 0 0 2.5rem 0; 
  color: var(--sakura-text-1);
  letter-spacing: -3px;
  font-family: 'Impact', 'Arial Black', sans-serif; 
  text-transform: uppercase;
  
  font-style: italic;
  transform: skewX(-10deg);
  transform-origin: 100% 50%;
  text-shadow: 4px 4px 0px rgba(128,128,128, 0.3);
  
  animation: slideInLeft 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) forwards;
}

.split-index {
  font-size: 1rem;
  vertical-align: super;
  opacity: 0.4;
  margin-left: 8px;
  letter-spacing: 0;
  font-style: normal;
  transform: skewX(10deg); /* 抵消父元素的倾斜 */
  display: inline-block;
}

/* 新的信息组合容器 */
.split-meta-group {
  display: flex;
  flex-direction: column;
  align-items: flex-end;
  gap: 0.5rem; /* 统一行间距 */
  
  /* 右侧装饰线，增加设计感 */
  border-right: 3px solid var(--sakura-c-brand);
  padding-right: 1.2rem;
  
  animation: slideInLeftNoSkew 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28) 0.1s backwards;
}

.split-date {
  /* 更现代的无衬线字体 */
  font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
  font-size: 1.2rem; /* 加大 */
  font-weight: 700;  /* 加粗 */
  font-style: italic;
  color: var(--sakura-text-1); 
  margin: 0;
  opacity: 0.9;
  line-height: 1;
}

.split-desc {
  font-size: 1rem;
  color: var(--sakura-text-2);
  margin: 0;
  padding: 0;
  background: none;
  font-weight: 500;
  font-style: italic;
  letter-spacing: 1px;
  font-family: sans-serif;
  text-transform: uppercase;
  transform: none; /* 取消倾斜，保持稳重 */
}

/* 右侧文本美化 */
.note-text {
  font-family: 'Georgia', 'Times New Roman', serif;
  font-size: 1.1rem;
  line-height: 1.8;
  color: var(--sakura-text-1);
  white-space: pre-wrap;
  text-align: left;
  opacity: 0.9;
}
/* 移除首字下沉 */

/* 动效 Keyframes */
@keyframes slideInLeft {
  from { opacity: 0; transform: translateX(-30px) skewX(-10deg); }
  to { opacity: 1; transform: translateX(0) skewX(-10deg); }
}
@keyframes slideInLeftNoSkew {
  from { opacity: 0; transform: translateX(-30px); }
  to { opacity: 1; transform: translateX(0); }
}
@keyframes fadeInRight {
  from { opacity: 0; transform: translateX(20px); }
  to { opacity: 1; transform: translateX(0); }
}

/* 响应式调整 */
@media (max-width: 900px) {
  .split-header {
    grid-template-columns: 1fr;
    gap: 2rem;
    padding-bottom: 2rem;
    text-align: center;
  }
  .header-left {
    text-align: center;
    align-items: center;
  }
  /* 移动端取消倾斜，回归正常 */
  .split-title {
    font-size: 2.5rem;
    transform: none;
    text-shadow: none;
    letter-spacing: -1px;
    margin-bottom: 0.5rem;
  }
  .split-date {
    justify-content: center;
    &::after { display: none; }
    &::before { /* 移动端两边加线 */
       content: ''; display: block; width: 20px; height: 1px; background: currentColor;
    }
  }
  
  .header-left, .header-right {
    align-items: center;
    padding-top: 0;
  }
  .header-line { display: none; }
  .header-line-wrapper { display: none; }
  
  .note-text {
    text-align: left;
    margin: 0 auto;
    font-size: 1rem;
  }
}
</style>
