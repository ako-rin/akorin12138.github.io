<script lang="ts" setup>
import type { Post } from 'valaxy'
import { onContentUpdated, runContentUpdated, useAplayer, useCodePen, useCopyCode, useMediumZoom, wrapTable, useSiteConfig, useFrontmatter } from 'valaxy'
import { onMounted, onUpdated, ref } from 'vue'
import { useCodeGroups } from 'valaxy/client/composables/codeGroups.ts'
import { useVanillaLazyLoad } from 'valaxy/client/composables/features/vanilla-lazyload.ts'
import { useEventListener } from '@vueuse/core'

const props = defineProps<{
  frontmatter: Post
  excerpt?: string
}>()

const contentRef = ref()
onContentUpdated(() => {
  wrapTable(contentRef.value)
})

onMounted(() => {
  runContentUpdated()
})

onUpdated(() => {
  runContentUpdated()
})

// widgets
if (props.frontmatter.aplayer)
  useAplayer()

if (props.frontmatter.codepen)
  useCodePen()

useCopyCode()
useCodeGroups()

// --- Custom useCollapseCode Logic ---
function useCollapseCodeCustom() {
  const config = useSiteConfig()
  const frontmatter = useFrontmatter()

  const codeHeightLimit = frontmatter.value.codeHeightLimit || config.value.codeHeightLimit
  if (typeof codeHeightLimit !== 'number' || codeHeightLimit <= 0) {
    return
  }

  useEventListener('click', (e) => {
    const el = e.target as HTMLElement
    if (el.matches('[class*="language-"] > button.code-block-unfold-btn')) {
      e.preventDefault()
      e.stopPropagation()

      const parent = el.parentElement
      if (!parent) return

      const isFolded = parent.classList.contains('folded')
      // 查找 max-h- 类，或者使用之前保存的
      const maxHClass = Array.from(parent.classList).find(c => c.startsWith('max-h-')) || parent.dataset.removedMaxH
      
      let limitHeight = codeHeightLimit
      if (maxHClass) {
        const match = maxHClass.match(/max-h-(\d+)px/)
        if (match) {
          limitHeight = parseInt(match[1], 10)
        }
      }

      const contentHeight = parent.scrollHeight
      if (!isFolded && contentHeight <= limitHeight) {
        return
      }

      if (isFolded) {
        // --- 展开操作 ---
        // 1. 捕获起始高度
        const startHeight = parent.getBoundingClientRect().height
        
        // 2. 计算目标高度（在修改 DOM 之前）
        const endHeight = getExpandedHeight(parent)
        
        // 3. 禁用 transition，锁定当前高度
        parent.style.transition = 'none'
        parent.style.height = startHeight + 'px'
        parent.style.overflow = 'hidden'
        parent.style.maxHeight = 'none'

        // 4. 移除限制类（此时高度被锁定，不会跳动）
        if (maxHClass && parent.classList.contains(maxHClass)) {
          parent.classList.remove(maxHClass)
          parent.dataset.removedMaxH = maxHClass
        }
        parent.classList.remove('folded')
        
        // 5. 使用双重 RAF 确保浏览器完成一帧渲染
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 6. 启用 transition 并设置目标高度
            parent.style.transition = 'height 0.5s ease-in-out'
            parent.style.height = endHeight + 'px'

            const onExpandEnd = (event: TransitionEvent) => {
              if (event.propertyName !== 'height') return
              parent.removeEventListener('transitionend', onExpandEnd)
              
              if (!parent.classList.contains('folded')) {
                parent.style.transition = 'none'
                parent.style.height = ''
                parent.style.overflow = ''
                parent.style.maxHeight = ''
              }
            }
            parent.addEventListener('transitionend', onExpandEnd)
          })
        })
      } else {
        // --- 折叠操作 ---
        // 1. 捕获起始高度
        const startHeight = parent.getBoundingClientRect().height
        
        // 2. 禁用 transition，锁定当前高度
        parent.style.transition = 'none'
        parent.style.height = startHeight + 'px'
        parent.style.overflow = 'hidden'
        parent.style.maxHeight = 'none'
        
        // 3. 使用双重 RAF 确保浏览器完成一帧渲染
        requestAnimationFrame(() => {
          requestAnimationFrame(() => {
            // 4. 启用 transition 并设置目标高度
            parent.style.transition = 'height 0.5s ease-in-out'
            parent.style.height = limitHeight + 'px'

            const onCollapseEnd = (event: TransitionEvent) => {
              if (event.propertyName !== 'height') return
              parent.removeEventListener('transitionend', onCollapseEnd)
              
              if (!parent.classList.contains('folded')) {
                parent.classList.add('folded')
                if (parent.dataset.removedMaxH) {
                  parent.classList.add(parent.dataset.removedMaxH)
                }
                parent.style.transition = 'none'
                parent.style.height = ''
                parent.style.overflow = ''
                parent.style.maxHeight = ''
              }
            }
            parent.addEventListener('transitionend', onCollapseEnd)
          })
        })
      }
    }
  })

  // determine whether to add folded class name
  onMounted(() => {
    const els = document.querySelectorAll('div[class*="language-"]')
    for (const el of Array.from(els)) {
      const elHeight = getHeightViaClone(el as HTMLElement)
      if (elHeight > codeHeightLimit) {
        el.setAttribute('data-collapsible', 'true')
        el.classList.add('folded')
      } else {
        el.removeAttribute('data-collapsible')
      }
    }
  })
}

function getHeightViaClone(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement
  clone.style.cssText = `
      position: absolute;
      visibility: hidden;
      display: block;
      left: -9999px;
  `
  document.body.appendChild(clone)
  const height = clone.scrollHeight
  document.body.removeChild(clone)
  return height
}

function getExpandedHeight(el: HTMLElement) {
  const clone = el.cloneNode(true) as HTMLElement
  clone.classList.remove('folded')
  clone.style.cssText = `
      position: absolute;
      visibility: hidden;
      display: block;
      left: -9999px;
      max-height: none;
      height: auto;
      overflow: visible;
  `
  document.body.appendChild(clone)
  const height = clone.scrollHeight
  document.body.removeChild(clone)
  return height
}

useCollapseCodeCustom()
// ------------------------------------

if (typeof props.frontmatter.medium_zoom === 'undefined' || props.frontmatter.medium_zoom)
  useMediumZoom()

useVanillaLazyLoad()
</script>

<template>
  <article v-if="$slots.default" :class="frontmatter.markdownClass || 'markdown-body'">
    <div v-if="frontmatter.time_warning && frontmatter.layout === 'post'" class="warning-bar text-center m-5 p-2 bg-orange-100 text-orange-600 dark:bg-orange-900 dark:text-orange-200 rounded-lg border border-orange-200 dark:border-orange-800">
      <div class="i-fa6-solid-triangle-exclamation inline-block mr-2" />
      <span>本文发布于较长时间前，文中所述内容可能已发生改变，请注意甄别。</span>
    </div>

    <slot ref="contentRef" @vue:updated="runContentUpdated" />

    <slot name="main-content-after" />

    <div v-if="frontmatter.url" text="center">
      <a class="link" :href="frontmatter.url" target="_blank">
        View the original article: {{ frontmatter.url }}
      </a>
    </div>

    <slot name="footer" />
  </article>
</template>
