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
const photosSource = ref<PhotoItem[]>([])
watchEffect(() => {
  const fmAny: any = frontmatter.value || (route.meta as any)?.frontmatter
  const list = fmAny?.photos
  if (Array.isArray(list) && list.length)
    photosSource.value = list
})
// 深度监听 frontmatter.photos（属性后注入时）
watch(() => (frontmatter.value as any)?.photos, (val) => {
  if (Array.isArray(val) && val.length)
    photosSource.value = val
}, { deep: true })
const photos = computed(() => photosSource.value)
// 用户可在 frontmatter 中加 hideBody: true 隐藏正文（当存在 photos 时）
const hideBody = computed(() => !!frontmatter.value?.hideBody && photos.value.length > 0)
// Masonry 配置：列数 & 间距（可在 frontmatter: columns, gap 自定义）
const columns = computed(() => Number(frontmatter.value?.columns) || 4)
const gap = computed(() => frontmatter.value?.gap || '12px')
const galleryRef = ref<HTMLElement | null>(null)
let galleryInited = false
let galleryInstance: any = null
let io: IntersectionObserver | null = null

onMounted(() => {
  if (typeof window === 'undefined') return
  console.log('[album] frontmatter raw =', frontmatter.value)
  initGalleryIfReady()
  console.log('[album] photos length (mount) =', photos.value.length)
  // 轮询兜底（最多 1 秒）
  if (!photos.value.length) {
    let tries = 0
    const timer = setInterval(() => {
      tries++
      const fmAny: any = frontmatter.value || (route.meta as any)?.frontmatter
      const list = fmAny?.photos
      if (Array.isArray(list) && list.length) {
        photosSource.value = list
        initGalleryIfReady()
        clearInterval(timer)
        console.log('[album] photos loaded via polling after', tries * 100, 'ms')
      }
      if (tries >= 10)
        clearInterval(timer)
    }, 100)
  }
})

// 确保在 DOM 更新后再尝试初始化（避免还未渲染出 <a> 即初始化失败）
watch(() => photos.value.length, async (n, o) => {
  console.log('[album] photos length changed', o, '->', n)
  if (n && !galleryInited) {
    await nextTick()
    initGalleryIfReady()
  await nextTick()
  setupLazyLoad()
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
  if (galleryInited) return
  if (!galleryRef.value) return
  if (!photos.value.length) return
  try {
  galleryInstance = lightGallery(galleryRef.value, {
      selector: '.album-item', // 明确选择器
      plugins: [lgZoom, lgThumbnail],
      speed: 400,
      licenseKey: '0000-0000-000-0000',
      mode: 'lg-fade', // 官方常用淡入放大动画（可改 'lg-zoom-in','lg-slide'）
      download: true, // 显示下载按钮
      zoom: true,     // 启用缩放控件（需 zoom 插件）
      thumbnail: true, // 底部缩略图（需 thumbnail 插件）
      allowMediaOverlap: false,
      mobileSettings: {
        controls: true,
        showCloseIcon: true,
        download: true,
        rotate: false,
      },
    })
    galleryInited = true
    console.log('[album] lightGallery initialized')
  }
  catch (e) {
    console.warn('[album] init lightGallery failed', e)
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
        <!-- 仍让默认 main-content 渲染（从而注入 frontmatter），我们只追加 after 部分 -->
        <template #main-content-after>
          <div class="sakura-album-layout" :style="{ '--album-columns': columns, '--album-gap': gap }">
            <div v-if="photos.length" class="album-body">
              <div ref="galleryRef" class="album-masonry" data-lg="true">
                <a v-for="p in photos" class="album-item" :key="p.src" :href="p.src" :data-sub-html="p.alt || ''">
                  <img
                    :src="p.thumb || p.src"
                    :data-full="p.src"
                    :alt="p.alt || p.src"
                    loading="lazy"
                    class="album-img"
                    :class="{ 'has-thumb': !!p.thumb }"
                  >
                </a>
              </div>
            </div>
            <div v-else class="album-empty" style="padding:2rem;text-align:center;color:var(--sakura-text-3);">暂无照片（frontmatter.photos 为空或解析失败）</div>
          </div>
        </template>
      </component>
    </RouterView>
  </SakuraPage>
</template>

<style scoped lang="scss">
.sakura-album-layout {
  padding: 1.2rem 1rem 2.5rem;
  max-width: 1080px;
  margin: 0 auto;
}
.album-body { margin-top: 1rem; }
/* Masonry 布局 */
.album-masonry {
  column-count: var(--album-columns, 4);
  column-gap: var(--album-gap, 12px);
}
.album-item { break-inside: avoid; margin-bottom: var(--album-gap, 12px); width: 100%; display: block; position: relative; }
.album-item img { width: 100%; border-radius: 14px; object-fit: cover; display: block; transition: filter .3s, transform .3s; }
.album-item:hover img { filter: brightness(.92); }

/* 渐进式模糊占位：thumb 时初始模糊、轻微放大；加载完成移除 */
.album-item img.has-thumb { filter: blur(12px); transform: scale(1.04); opacity: .85; }
.album-item img.has-thumb.is-loaded { filter: blur(0); transform: scale(1); opacity: 1; transition: filter .6s ease, transform .6s ease, opacity .6s ease; }

@media (max-width: 1100px) { .album-masonry { column-count: calc(var(--album-columns, 4) - 1); } }
@media (max-width: 800px) { .album-masonry { column-count: 2; } }
@media (max-width: 520px) { .album-masonry { column-count: 1; } }
/* 简单响应式：缩小时让图片占满宽 */
@media (max-width: 640px) {
  .sakura-album-layout { padding: .8rem .75rem 2rem; }
}
.album-hide-body .sakura-page-content > :first-child .prose { display: none; }
</style>
