<script lang="ts" setup>
import type { CategoryList, Post } from 'valaxy'
import { isCategoryList, useInvisibleElement } from 'valaxy'
import { computed, onMounted, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute, useRouter } from 'vue-router'

const props = withDefaults(defineProps<{
  parentKey: string
  category: Post | CategoryList
  level?: number
  collapsable?: boolean
}>(), {
  collapsable: true,
})

const router = useRouter()
const route = useRoute()
const categoryList = computed(() => {
  const c = (route.query.category as string) || ''
  return Array.isArray(c) ? [c] : c.split('/')
})

const collapse = ref(props.collapsable)
const { t } = useI18n()
const { locale } = useI18n()

function getTitle(post: Post | any) {
  const lang = locale.value === 'zh-CN' ? 'zh' : locale.value
  return post[`title_${lang}`] ? post[`title_${lang}`] : post.title
}

const postCollapseElRef = ref<HTMLElement>()
const { show } = useInvisibleElement(postCollapseElRef)

function jumpToDisplayCategory(category: string) {
  router.push({
    query: {
      category,
    },
  })
  show()
}

// 判断当前分类是否被选中
const isActive = computed(() => {
  return route.query.category === props.parentKey
})

onMounted(() => {
  const postCollapseEl = document.querySelector('.post-collapse-container') as HTMLElement
  if (postCollapseEl)
    postCollapseElRef.value = postCollapseEl
})

// 根据分类名称生成不同的图标 - 使用更通用的匹配规则
const categoryIcon = computed(() => {
  const name = props.category.name.toLowerCase()
  // 算法/代码相关
  if (name.includes('算法') || name.includes('algorithm') || name.includes('code') || name.includes('编程')) return 'i-ri-code-box-line'
  // 神经网络/AI相关
  if (name.includes('神经') || name.includes('neural') || name.includes('ai') || name.includes('深度')) return 'i-ri-brain-line'
  // 机器学习相关
  if (name.includes('机器') || name.includes('machine') || name.includes('learning') || name.includes('ml')) return 'i-ri-robot-line'
  // 笔记相关
  if (name.includes('笔记') || name.includes('note') || name.includes('记录')) return 'i-ri-book-mark-line'
  // 浏览器/前端相关
  if (name.includes('浏览') || name.includes('browser') || name.includes('前端') || name.includes('web')) return 'i-ri-chrome-line'
  // 旅行相关
  if (name.includes('旅行') || name.includes('travel') || name.includes('游记') || name.includes('旅游')) return 'i-ri-plane-line'
  // 游戏/UE相关
  if (name.includes('ue') || name.includes('unreal') || name.includes('游戏') || name.includes('game') || name.includes('unity')) return 'i-ri-gamepad-line'
  // 数据相关
  if (name.includes('数据') || name.includes('data') || name.includes('database') || name.includes('sql')) return 'i-ri-database-2-line'
  // 设计相关
  if (name.includes('设计') || name.includes('design') || name.includes('ui') || name.includes('ux')) return 'i-ri-palette-line'
  // 工具相关
  if (name.includes('工具') || name.includes('tool') || name.includes('效率')) return 'i-ri-tools-line'
  // 教程/学习相关
  if (name.includes('教程') || name.includes('tutorial') || name.includes('学习') || name.includes('入门')) return 'i-ri-graduation-cap-line'
  // 生活相关
  if (name.includes('生活') || name.includes('life') || name.includes('日常')) return 'i-ri-heart-line'
  // 未分类
  if (name.includes('uncategorized') || name === 'Uncategorized') return 'i-ri-archive-line'
  // 默认使用文件夹图标
  return 'i-ri-folder-3-line'
})

// 根据分类名称生成稳定的颜色（基于字符串哈希）
const categoryGradient = computed(() => {
  const name = props.category.name
  
  // 预定义的渐变色列表
  const gradients = [
    'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', // 紫色
    'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)', // 粉色
    'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)', // 蓝色
    'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)', // 绿色
    'linear-gradient(135deg, #fa709a 0%, #fee140 100%)', // 橙粉
    'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // 淡彩
    'linear-gradient(135deg, #ff9a9e 0%, #fecfef 100%)', // 浅粉
    'linear-gradient(135deg, #a18cd1 0%, #fbc2eb 100%)', // 淡紫
    'linear-gradient(135deg, #ffecd2 0%, #fcb69f 100%)', // 暖橙
    'linear-gradient(135deg, #84fab0 0%, #8fd3f4 100%)', // 青绿
    'linear-gradient(135deg, #cfd9df 0%, #e2ebf0 100%)', // 灰色（未分类）
  ]
  
  // 未分类使用灰色
  if (name.toLowerCase().includes('uncategorized') || name === 'Uncategorized') {
    return gradients[gradients.length - 1]
  }
  
  // 基于名称生成稳定的哈希值来选择颜色
  let hash = 0
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash)
  }
  const index = Math.abs(hash) % (gradients.length - 1) // 排除最后一个灰色
  return gradients[index]
})
</script>

<template>
  <div
    class="category-card"
    :class="{ 'is-active': isActive, 'is-expanded': !collapse }"
    @click="jumpToDisplayCategory(parentKey)"
  >
    <!-- 卡片背景装饰 -->
    <div class="card-bg" :style="{ background: categoryGradient }" />
    
    <!-- 卡片内容 -->
    <div class="card-content">
      <!-- 图标 -->
      <div class="card-icon">
        <div :class="categoryIcon" />
      </div>
      
      <!-- 分类名称 -->
      <div class="card-info">
        <span class="card-name">
          {{ category.name === 'Uncategorized' ? t('category.uncategorized') : category.name }}
        </span>
        <span class="card-count">{{ category.total }} 篇文章</span>
      </div>
      
      <!-- 展开/折叠指示器 -->
      <div class="card-arrow" @click.stop="collapse = !collapse">
        <div :class="collapse ? 'i-ri-arrow-right-s-line' : 'i-ri-arrow-down-s-line'" />
      </div>
    </div>

    <!-- 子分类列表 -->
    <Transition name="slide-fade">
      <div v-if="!collapse && category.children && category.children.size > 0" class="card-children" @click.stop>
        <ul class="children-list">
          <li v-for="(categoryItem, i) in category.children.values()" :key="i" class="children-item">
            <template v-if="isCategoryList(categoryItem)">
              <SakuraCategory
                :parent-key="parentKey ? `${parentKey}/${categoryItem.name}` : categoryItem.name"
                :category="categoryItem"
                :collapsable="!categoryList.includes(categoryItem.name)"
              />
            </template>
            <template v-else>
              <RouterLink v-if="categoryItem.title" :to="categoryItem.path || ''" class="children-link">
                <div i-ri-article-line class="children-icon" />
                <span class="children-title">{{ getTitle(categoryItem) }}</span>
              </RouterLink>
            </template>
          </li>
        </ul>
      </div>
    </Transition>
  </div>
</template>

<style lang="scss" scoped>
.category-card {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  background: var(--sakura-color-background);
  border: 1px solid var(--sakura-color-divider);
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.15);
    
    .card-bg {
      opacity: 0.15;
    }
    
    .card-icon {
      transform: scale(1.1);
    }
  }
  
  &.is-active {
    border-color: var(--sakura-c-primary);
    box-shadow: 0 0 0 2px rgba(var(--sakura-c-primary-rgb), 0.2);
    
    .card-bg {
      opacity: 0.12;
    }
  }
  
  &.is-expanded {
    grid-column: 1 / -1;
  }
}

.card-bg {
  position: absolute;
  inset: 0;
  opacity: 0.08;
  transition: opacity 0.3s ease;
}

.card-content {
  position: relative;
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px;
  z-index: 1;
}

.card-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  border-radius: 10px;
  background: var(--sakura-color-background-alpha);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease;
  flex-shrink: 0;
  
  > div {
    font-size: 22px;
    color: var(--sakura-c-primary);
  }
}

.card-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.card-name {
  font-size: 15px;
  font-weight: 600;
  color: var(--sakura-color-text-deep);
  word-break: break-word;
  line-height: 1.3;
}

.card-count {
  font-size: 12px;
  color: var(--sakura-color-text-light);
  margin-top: 2px;
}

.card-arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: 6px;
  transition: all 0.2s ease;
  flex-shrink: 0;
  
  &:hover {
    background: var(--sakura-color-divider);
  }
  
  > div {
    font-size: 18px;
    color: var(--sakura-color-text-light);
    transition: transform 0.2s ease;
  }
}

// 子分类/文章列表样式
.card-children {
  border-top: 1px solid var(--sakura-color-divider);
  background: var(--sakura-color-background-alpha);
}

.children-list {
  list-style: none;
  margin: 0;
  padding: 8px 0;
}

.children-item {
  margin: 0;
  padding: 0;
}

.children-link {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px 10px 24px;
  color: var(--sakura-color-text);
  text-decoration: none;
  transition: all 0.2s ease;
  border-left: 2px solid transparent;
  
  &:hover {
    background: var(--sakura-color-divider);
    border-left-color: var(--sakura-c-primary);
    color: var(--sakura-c-primary);
  }
}

.children-icon {
  font-size: 16px;
  color: var(--sakura-color-text-light);
  flex-shrink: 0;
}

.children-title {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

// 展开/收起动画
.slide-fade-enter-active {
  transition: all 0.3s ease;
}

.slide-fade-leave-active {
  transition: all 0.2s ease;
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  opacity: 0;
  max-height: 0;
}

.slide-fade-enter-to,
.slide-fade-leave-from {
  opacity: 1;
  max-height: 500px;
}

// 暗色模式适配
:global(html.dark) {
  .category-card {
    &:hover {
      box-shadow: 0 12px 24px -8px rgba(0, 0, 0, 0.4);
    }
  }
  
  .card-icon {
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
