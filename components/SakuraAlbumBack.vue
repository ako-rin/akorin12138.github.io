<script setup lang="ts">
/**
 * SakuraAlbumBack
 * 浮动返回按钮 / Floating Back Button for Album
 */
</script>

<template>
  <Teleport to="body">
    <div v-bind="$attrs" class="sakura-album-back" role="button" aria-label="Back to Album Collection">
      <div class="icon-wrapper">
        <!-- Return / Arrow Left Icon -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M9 14L4 9L9 4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
          <path d="M20 20V13C20 11.9391 19.5786 10.9217 18.8284 10.1716C18.0783 9.42143 17.0609 9 16 9H4" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
        </svg>
      </div>
      <span class="text">BACK</span>
    </div>
  </Teleport>
</template>

<style scoped lang="scss">
.sakura-album-back {
  position: fixed;
  right: 2rem;
  bottom: 3rem;
  z-index: 9999;
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  padding: 12px 24px;
  
  /* Default (Light Mode) */
  background: rgba(255, 255, 255, 0.9);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(0, 0, 0, 0.05);
  color: #333;
  
  border-radius: 50px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1);
  
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;
  
  font-family: var(--sakura-font-text);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  user-select: none;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    color: var(--sakura-c-brand);
    border-color: var(--sakura-c-brand);
  }

  &:active {
    transform: translateY(-1px) scale(0.98);
  }

  .icon-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
  }
}

/* Fallback for explicit dark class on html if above doesn't work */
html.dark .sakura-album-back {
  background: rgba(30, 30, 30, 0.85);
  border: 1px solid rgba(255, 255, 255, 0.1);
  color: #eee;
}

/* Mobile: Compact circle button */
@media (max-width: 768px) {
  .sakura-album-back {
    right: 1.5rem;
    bottom: 5rem;
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%;
    
    .text {
      display: none;
    }
  }
}
</style>
