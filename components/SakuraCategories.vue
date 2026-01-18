<script lang="ts" setup>
import type { Categories } from 'valaxy'
import { computed } from 'vue'
import { useRoute } from 'vue-router'

withDefaults(defineProps<{
  categories: Categories
  level?: number
  collapsable?: boolean
}>(), {
  level: 0,
  collapsable: true,
})

const route = useRoute()
const categoryList = computed(() => {
  const c = route.query.category || ''
  return Array.isArray(c) ? [c] : c.split('/')
})
</script>

<template>
  <div class="sakura-categories-container">
    <div class="categories-grid">
      <SakuraCategory
        v-for="category in categories.values()"
        :key="category.name"
        :parent-key="category.name"
        :category="category"
        :level="level + 1"
        :collapsable="!categoryList.includes(category.name)"
      />
    </div>
  </div>
</template>

<style lang="scss" scoped>
.sakura-categories-container {
  padding: 0.5rem 1rem;
}

.categories-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  
  @media (max-width: 640px) {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.75rem;
  }
}
</style>
