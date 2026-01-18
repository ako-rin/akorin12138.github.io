<script lang="ts" setup>
import { useCategories, useSiteStore } from 'valaxy'
import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRoute } from 'vue-router'

const site = useSiteStore()

const { t } = useI18n()
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
            <div>
              <div text="center" class="yun-text-light" p="2">
                {{ t('counter.categories', Array.from(categories.children).length) }}
              </div>
              <SakuraCategories :categories="categories.children" />
            </div>
          </slot>
        </template>

        <template #main-nav-before>
          <slot name="posts">
            <div v-if="curCategory" class="sakura-categories-post-list">
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
    // Preventing TimeLine component distortion
    width: 100%;
  }
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
  justify-content: center;
  
  .sakura-post-list {
    width: 100%;
    max-width: 800px;
  }
}
</style>
