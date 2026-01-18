<script lang="ts" setup>
import { useFrontmatter } from 'valaxy'
import { computed } from 'vue'

const frontmatter = useFrontmatter()

const endText = computed(() => {
  const end = (frontmatter.value as any).end
  if (end === undefined)
    return null
  return end ? 'Q.E.D.' : 'To Be Continued.'
})
</script>

<template>
  <div v-if="endText" class="text-center py-8 mt-8 opacity-70 font-serif text-lg font-bold tracking-widest leading-loose select-none">
    {{ endText }}
  </div>
</template>
