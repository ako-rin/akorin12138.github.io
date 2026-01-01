<script lang="ts" setup>
import type { Post } from 'valaxy'
import { onContentUpdated, runContentUpdated, useAplayer, useCodePen, useCopyCode, useMediumZoom, wrapTable, useSiteConfig, useFrontmatter } from 'valaxy'
import { onMounted, onUpdated, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useCodeGroups } from 'valaxy/client/composables/codeGroups.ts'
import { useVanillaLazyLoad } from 'valaxy/client/composables/features/vanilla-lazyload.ts'
import { useEventListener } from '@vueuse/core'

const props = defineProps<{
  frontmatter: Post
  excerpt?: string
}>()

const { t } = useI18n()

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

      if (isFolded) {
        // --- 展开操作 ---
        const startHeight = parent.getBoundingClientRect().height
        const endHeight = parent.scrollHeight
        parent.style.maxHeight = ''
        parent.style.height = startHeight + 'px'
        parent.style.overflow = 'hidden'

        if (maxHClass && parent.classList.contains(maxHClass)) {
          parent.classList.remove(maxHClass)
          parent.dataset.removedMaxH = maxHClass
        }

        parent.classList.remove('folded')
        void parent.offsetHeight
        parent.style.height = endHeight + 'px'

        const onExpandEnd = (event: TransitionEvent) => {
          if (event.propertyName !== 'height') return
          if (!parent.classList.contains('folded')) {
            parent.style.height = ''
            parent.style.overflow = ''
          }
          parent.removeEventListener('transitionend', onExpandEnd)
        }
        parent.addEventListener('transitionend', onExpandEnd)
      } else {
        // --- 折叠操作 ---
        const startHeight = parent.getBoundingClientRect().height
        parent.style.maxHeight = ''
        parent.style.height = startHeight + 'px'
        parent.style.overflow = 'hidden'
        void parent.offsetHeight
        parent.style.height = limitHeight + 'px'

        const onCollapseEnd = (event: TransitionEvent) => {
          if (event.propertyName !== 'height') return
          if (!parent.classList.contains('folded')) {
            parent.classList.add('folded')
            if (parent.dataset.removedMaxH) {
              parent.classList.add(parent.dataset.removedMaxH)
            }
            parent.style.height = ''
            parent.style.overflow = ''
          }
          parent.removeEventListener('transitionend', onCollapseEnd)
        }
        parent.addEventListener('transitionend', onCollapseEnd)
      }
    }
  })

  // determine whether to add folded class name
  onMounted(() => {
    const els = document.querySelectorAll('div[class*="language-"]')
    for (const el of Array.from(els)) {
      const elHeight = getHeightViaClone(el as HTMLElement)
      if (elHeight > codeHeightLimit)
        el.classList.add('folded')
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

useCollapseCodeCustom()
// ------------------------------------

if (typeof props.frontmatter.medium_zoom === 'undefined' || props.frontmatter.medium_zoom)
  useMediumZoom()

useVanillaLazyLoad()
</script>

<template>
  <article v-if="$slots.default" :class="frontmatter.markdownClass || 'markdown-body'">
    <slot ref="contentRef" @vue:updated="runContentUpdated" />

    <div v-if="frontmatter.url" text="center">
      <a class="link" :href="frontmatter.url" target="_blank">
        View the original article: {{ frontmatter.url }}
      </a>
    </div>
  </article>
</template>
