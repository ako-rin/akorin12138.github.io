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
        <!-- Grid icon representing collection -->
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
           <path d="M10 3H3V10H10V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M21 3H14V10H21V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M21 14H14V21H21V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
           <path d="M10 14H3V21H10V14Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
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
  z-index: 9999; /* Changed to be very high */
  
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  
  padding: 12px 24px;
  background: var(--sakura-bg-card, #ffffff);
  border: 1px solid rgba(150, 150, 150, 0.2);
  border-radius: 50px;
  
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15); /* Stronger shadow */
  transition: all 0.3s cubic-bezier(0.25, 0.8, 0.5, 1);
  cursor: pointer;
  
  /* Text Style */
  color: var(--sakura-text-1, #333);
  font-family: var(--sakura-font-text);
  font-weight: 700;
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  user-select: none;

  &:hover {
    transform: translateY(-4px) scale(1.02);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
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

/* Mobile: Compact circle button */
@media (max-width: 768px) {
  .sakura-album-back {
    right: 1.5rem;
    bottom: 5rem; /* Raised higher for mobile */
    width: 48px;
    height: 48px;
    padding: 0;
    border-radius: 50%; /* Strictly circle */
    
    .text {
      display: none;
    }
  }
}
</style>
