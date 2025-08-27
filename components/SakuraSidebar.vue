<script lang="ts" setup>
import { ref } from 'vue'
import { useThemeConfig } from './composables'
import { useSakuraAppStore } from './stores'
import { useCloseSidebarOnEscape } from './composables/sidebar'

const props = withDefaults(defineProps<{
  position?: 'left' | 'right'
}>(), {})

const sakuraAppStore = useSakuraAppStore()
const themeConfig = useThemeConfig()

const position = ref(props.position ?? themeConfig.value.sidebarOptions.position)

// 支持 ESC 键关闭（类型断言避免推断为 boolean）
const isSidebarOpen = sakuraAppStore.sidebar.isOpen as any
useCloseSidebarOnEscape(isSidebarOpen, sakuraAppStore.sidebar.close)
</script>

<template>
  <div>
    <!-- 桌面与移动统一使用遮罩，点击空白关闭 -->
    <ValaxyOverlay
      class="bg-$sakura-color-overlay-background"
      :show="sakuraAppStore.sidebar.isOpen"
      @click="sakuraAppStore.sidebar.close"
    />

    <aside
      class="sakura-sidebar inset-y-0 overflow-y-auto"
      :class="[position, sakuraAppStore.sidebar.isOpen && 'open']"
      role="navigation"
      aria-label="侧边栏"
    >
      <slot>
        <SakuraSiteInfo />
        <SakuraSocialLinks />
        <SakuraSidebarLink class="mt-4" />
      </slot>

      <slot name="copyright">
        <SakuraCopyright />
      </slot>
    </aside>
  </div>
</template>

<style lang="scss" scoped>
.sakura-sidebar {
  position: fixed;
  top: 0;
  bottom: 0;
  z-index: 1000;
  width: var(--sakura-sidebar-width);
  max-width: 320px;
  padding: 28px 18px 40px;
  overflow-y: auto;
  background:
    linear-gradient(rgba(255,255,255,0.85), rgba(255,255,255,0.92))
    , var(--sakura-c-sidebar-bg-img) center bottom 1rem / cover no-repeat;
  backdrop-filter: blur(10px);
  box-shadow: 0 4px 18px rgba(0,0,0,0.16);
  transition: transform .35s cubic-bezier(.4,0,.2,1), box-shadow .3s, background-color .3s;
  text-align: left;
  display: flex;
  flex-direction: column;
  position: fixed;

  /* 可读性增强：额外半透明叠加层（统一控制透明度变量） */
  --sakura-sidebar-overlay-color: rgba(255, 255, 255, 0.68);
  --sakura-sidebar-overlay-blur: 14px;

  &::before {
    content: '';
    position: absolute;
    inset: 0;
    background: var(--sakura-sidebar-overlay-color);
    backdrop-filter: blur(var(--sakura-sidebar-overlay-blur)) saturate(180%);
    -webkit-backdrop-filter: blur(var(--sakura-sidebar-overlay-blur)) saturate(180%);
    pointer-events: none;
    z-index: 0;
  }

  /* 使内容浮在 overlay 之上 */
  & > * { position: relative; z-index: 1; }

  /* 文字微阴影提高对比度 */
  &, & a, & span, & li { text-shadow: 0 1px 2px rgba(0,0,0,0.15); }

  /* 深色模式下改用更暗的叠加层以增加反差 */
  :root.dark & {
    --sakura-sidebar-overlay-color: rgba(30,30,34,0.68);
    &, & a, & span, & li { text-shadow: 0 1px 3px rgba(0,0,0,0.4); }
  }

  &.left { left: 0; transform: translateX(-100%); }
  &.right { right: 0; transform: translateX(100%); }
  &.open { transform: translateX(0); }

  /* 已按需求：所有设备保持桌面宽度，不再在小屏缩放 */

  #marker { position: absolute; transition: opacity .4s, left .4s, top .4s; pointer-events: none; height: 100%; }
  .sakura-copyright { font-size: 12px; margin-top: auto; opacity: .8; }
}
</style>