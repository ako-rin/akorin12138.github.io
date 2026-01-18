<script lang="ts" setup>
import { useCategories, useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

const site = useSiteStore()

const route = useRoute()
const curCategory = computed(() => (route.query.category || '') as string)
const categories = useCategories()

// 添加一个 key 用于强制刷新 PostList，解决图片缓存问题
const postListKey = computed(() => `category-${curCategory.value}-${Date.now()}`)

const posts = computed(() => {
  const list = site.postList.filter((post) => {
    if (post.categories && curCategory.value !== 'Uncategorized') {
      if (typeof post.categories === 'string')
        return post.categories === curCategory.value
      else
        return post.categories.join('/').startsWith(curCategory.value) && post.categories[0] === curCategory.value.split('/')[0]
    }
    if (!post.categories && curCategory.value === 'Uncategorized')
      return post.categories === undefined
    return false
  })
  return list
})
</script>

<template>
  <SakuraPage class="sakura-categories-page">
    <RouterView v-slot="{ Component }">
      <component :is="Component">
        <template #main-content>
          <slot name="content">
            <div class="categories-header">
              <div class="categories-stats">
                <span class="stats-number">{{ Array.from(categories.children).length }}</span>
                <span class="stats-label">个分类</span>
              </div>
              <p class="categories-hint">点击分类卡片查看该分类下的文章</p>
            </div>
            <SakuraCategories :categories="categories.children" />
          </slot>
        </template>

        <template #main-nav-before>
          <slot name="posts">
            <div v-if="curCategory" class="sakura-categories-post-list">
              <div class="current-category-header">
                <div class="category-breadcrumb">
                  <span class="breadcrumb-icon" i-ri-folder-open-line />
                  <span class="breadcrumb-text">{{ curCategory }}</span>
                </div>
                <span class="post-count">共 {{ posts.length }} 篇文章</span>
              </div>
              <!-- 使用 SakuraMultiColumns 包裹 PostList，确保宽度约束 -->
              <SakuraMultiColumns class="sakura-safe-padding sakura-categories-layout" base>
                <SakuraPostList :key="postListKey" w="full" :posts />
              </SakuraMultiColumns>
            </div>
          </slot>
        </template>
      </component>
    </RouterView>
  </SakuraPage>
</template>

<style lang="scss">
@use 'valaxy/client/styles/mixins/index.scss' as *;

.sakura-categories-page {
  .sakura-triple-columns {
    width: 100%;
  }
}

// 分类页面头部样式
.categories-header {
  text-align: center;
  padding: 1rem 0 1.5rem;
}

.categories-stats {
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
  margin-bottom: 8px;
}

.stats-number {
  font-size: 2.5rem;
  font-weight: 700;
  background: linear-gradient(135deg, var(--sakura-c-primary) 0%, #f093fb 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.stats-label {
  font-size: 1.1rem;
  color: var(--sakura-color-text);
  font-weight: 500;
}

.categories-hint {
  font-size: 0.875rem;
  color: var(--sakura-color-text-light);
  margin: 0;
}

// 当前分类头部
.current-category-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  max-width: 800px;
  margin: 2rem auto 1rem;
  padding: 1rem 1.5rem;
  background: var(--sakura-color-background);
  border-radius: 12px;
  border: 1px solid var(--sakura-color-divider);
  
  @media (max-width: 840px) {
    margin-left: 1rem;
    margin-right: 1rem;
  }
}

.category-breadcrumb {
  display: flex;
  align-items: center;
  gap: 8px;
}

.breadcrumb-icon {
  font-size: 20px;
  color: var(--sakura-c-primary);
}

.breadcrumb-text {
  font-size: 1.1rem;
  font-weight: 600;
  color: var(--sakura-color-text-deep);
}

.post-count {
  font-size: 0.875rem;
  color: var(--sakura-color-text-light);
  background: var(--sakura-color-divider);
  padding: 6px 14px;
  border-radius: 20px;
  margin-left: 16px;
  white-space: nowrap;
}

// 分类页面的布局约束，与首页保持一致
.sakura-categories-layout {
  &.sakura-one-columns {
    grid-template-columns: minmax(0, 800px);
    justify-content: center;
  }

  @include screen('md') {
    &.sakura-one-columns {
      grid-template-columns: minmax(0, 800px);
    }
  }

  @include screen('lg') {
    &.sakura-one-columns {
      grid-template-columns: minmax(0, 800px);
    }
  }

  @include screen('xl') {
    &.sakura-one-columns {
      grid-template-columns: minmax(0, 800px);
    }
  }
}

// 确保 PostList 在分类页面有正确的宽度约束
.sakura-categories-post-list {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  
  .sakura-post-list {
    width: 100%;
    max-width: 800px;
  }
}
</style>
