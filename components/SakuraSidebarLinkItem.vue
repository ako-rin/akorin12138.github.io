<script lang="ts" setup>
import { computed, reactive, watchEffect } from 'vue'
import { useMediaQuery } from '@vueuse/core'
import type { NavItem, SidebarItem } from './types'
import SakuraNavLink from './SakuraNavLink.vue'

type SidebarNavItem = Partial<NavItem & SidebarItem>

const props = defineProps<{
  items?: SidebarNavItem[]
  item?: SidebarNavItem
}>()

const isMobile = useMediaQuery('(max-width: 959px)')

function getItemKey(navItem: SidebarNavItem) {
  return String(navItem.link || navItem.text || navItem.locale || '')
}

const groupOpenState = reactive(new Map<string, boolean>())

function isGroup(navItem: SidebarNavItem) {
  return Array.isArray(navItem.items) && navItem.items.length > 0
}

function getDefaultOpen(navItem: SidebarNavItem) {
  // 仅移动端默认折叠；若配置了 collapsed，则尊重其默认状态
  if (!isMobile.value)
    return true
  if (navItem.collapsed === true)
    return false
  if (navItem.collapsed === false)
    return true
  return false
}

function ensureGroupState(navItem: SidebarNavItem) {
  const key = getItemKey(navItem)
  if (!groupOpenState.has(key))
    groupOpenState.set(key, getDefaultOpen(navItem))
  return key
}

function isOpen(navItem: SidebarNavItem) {
  const key = ensureGroupState(navItem)
  return groupOpenState.get(key) ?? false
}

function toggleGroup(navItem: SidebarNavItem) {
  const key = ensureGroupState(navItem)
  groupOpenState.set(key, !Boolean(groupOpenState.get(key)))
}

watchEffect(() => {
  // 初始化当前层级的分组状态（避免首屏闪烁）
  for (const navItem of props.items || []) {
    if (isGroup(navItem))
      ensureGroupState(navItem)
  }
})

const isCollapsibleGroup = computed(() => isMobile.value && props.item && isGroup(props.item))
</script>

<template>
  <template v-if="item">
    <template v-if="isCollapsibleGroup">
      <div class="sakura-sidebar-link-group">
        <SakuraNavLink v-bind="item" class="sakura-sidebar-link-item sakura-sidebar-link-group__link">
          <SakuraSidebarCount :locale="item.locale" />
        </SakuraNavLink>
        <button
          class="sakura-sidebar-link-group__toggle"
          type="button"
          :aria-expanded="isOpen(item)"
          :aria-label="isOpen(item) ? '收起' : '展开'"
          @click.stop.prevent="toggleGroup(item)"
        />
      </div>
      <div v-show="isOpen(item)" class="sakura-sidebar-link-sub-items">
        <SakuraSidebarLinkItem :items="item.items" />
      </div>
    </template>

    <template v-else>
      <SakuraNavLink v-bind="item" class="sakura-sidebar-link-item">
        <SakuraSidebarCount :locale="item.locale" />
      </SakuraNavLink>
      <SakuraSidebarLinkItem v-if="item.items" :items="item.items" class="sakura-sidebar-link-sub-items" />
    </template>
  </template>

  <ul v-else-if="items?.length" class="sakura-sidebar-link-items">
    <li v-for="(navItem, index) in items" :key="index">
      <SakuraSidebarLinkItem :item="navItem" />
    </li>
  </ul>
</template>

<style lang="scss" scoped>
.sakura-sidebar-link-items {
  .sakura-sidebar-link-item {
    padding: 6px 15px;
    color: var(--sakura-color-text);
    font-size: 14px;
    letter-spacing: 0.02em;

    &:hover {
      color: var(--sakura-color-primary);
    }
  }

  .sakura-icon {
    width: 1rem;
    height: 1rem;
    margin-right: 6px;
  }

  .sakura-sidebar-link-group {
    display: flex;
    align-items: center;

    &__link {
      flex: 1;
      min-width: 0;
    }

    &__toggle {
      width: 28px;
      height: 28px;
      display: inline-flex;
      align-items: center;
      justify-content: center;
      color: inherit;
      opacity: 0.75;
      background: transparent;
      border: 0;
      padding: 0;
      cursor: pointer;
    }

    &__toggle::before {
      content: '';
      width: 7px;
      height: 7px;
      border-right: 2px solid currentColor;
      border-bottom: 2px solid currentColor;
      transform: rotate(45deg);
      transition: transform 0.2s ease;
    }

    &__toggle[aria-expanded='true']::before {
      transform: rotate(-135deg);
    }
  }

  .sakura-sidebar-link-sub-items {
    padding-left: 20px;

    .sakura-sidebar-link-item {
      font-size: 13px;
      color: var(--sakura-color-text);
    }

    .sakura-icon {
      width: 0.9rem;
      height: 0.9rem;
    }
  }
}
</style>