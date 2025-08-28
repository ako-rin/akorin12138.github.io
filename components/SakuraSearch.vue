<script lang="ts" setup>
import { ref, watch, onMounted, onBeforeUnmount } from 'vue'
import { useI18n } from 'vue-i18n'
import { useRouter } from 'vue-router'
import { useMediaQuery } from '@vueuse/core'
// @ts-ignore - static asset
import iloliImg from '../assets/seaerch.gif'
import { useScrollLock, useSearch } from './composables'

// props: 外部控制开关
const props = defineProps<{ open: boolean }>()

useScrollLock()
const search = useSearch()
const router = useRouter()
const { t } = useI18n()

// 响应式状态
const input = ref('')
const loading = ref(false)
const searchInputRef = ref<HTMLInputElement>()
const isDesktop = useMediaQuery('(min-width: 768px)')

// 简单搜索历史（最近 5 条）
const history = ref<string[]>([])
const HISTORY_KEY = 'sakura-search-history'

function loadHistory() {
    try {
        const raw = localStorage.getItem(HISTORY_KEY)
        history.value = raw ? JSON.parse(raw) : []
    } catch (e) {
        history.value = []
    }
}
function saveHistory() {
    try { localStorage.setItem(HISTORY_KEY, JSON.stringify(history.value)) } catch {}
}
function pushHistory(q: string) {
    if (!q.trim()) return
    const existsIdx = history.value.indexOf(q)
    if (existsIdx !== -1) history.value.splice(existsIdx, 1)
    history.value.unshift(q)
    if (history.value.length > 5) history.value.length = 5
    saveHistory()
}

watch(() => props.open, (v) => {
    if (v) {
        loadHistory()
        setTimeout(() => searchInputRef.value?.focus(), 0)
    }
})

async function doSearch(q?: string) {
    const keyword = (q ?? input.value).trim()
    if (!keyword || loading.value)
        return
    loading.value = true
    pushHistory(keyword)
    try {
        await router.push({ path: '/search', query: { q: keyword } })
    } finally {
        loading.value = false
        search.close()
    }
}

// 键盘 ESC 关闭
function handleKey(e: KeyboardEvent) {
    if (!props.open) return
    if (e.key === 'Escape') {
        e.stopPropagation()
        search.close()
    }
    if (e.key === 'Enter' && document.activeElement === searchInputRef.value) {
        doSearch()
    }
}
onMounted(() => window.addEventListener('keydown', handleKey, { capture: true }))
onBeforeUnmount(() => window.removeEventListener('keydown', handleKey, { capture: true }))

function clickBackdrop(e: MouseEvent) {
    if (e.target === e.currentTarget)
        search.close()
}
</script>

<template>
        <Teleport to="body">
            <Transition name="overlay-fade" appear>
                <div
                    v-if="open"
                    class="sakura-search-overlay"
                    :class="{ 'is-desktop': isDesktop }"
                    @mousedown="clickBackdrop"
                    :style="{ '--sakura-search-bg-img': `url('${iloliImg}')` }"
                >
                    <Transition name="panel-fade" appear>
                        <div class="search-panel" v-if="open" role="dialog" aria-modal="true" aria-label="Search dialog">
                        <div class="input-wrapper">
                            <i class="i-fa-search leading-icon" />
                            <input
                                ref="searchInputRef"
                                v-model="input"
                                class="search-input"
                                :placeholder="t('search.placeholder') + ' / Ctrl+K'"
                                :disabled="loading"
                                autocomplete="off"
                            >
                            <button class="go-btn" :disabled="loading || !input" type="button" @click="doSearch()">
                                {{ loading ? '...' : t('search.placeholder') }}
                            </button>
                        </div>
                        <ul v-if="history.length" class="history">
                            <li v-for="h in history" :key="h" class="history-item" @click="doSearch(h)">
                                <i class="i-fa-clock mr-2 opacity-70" />{{ h }}
                            </li>
                        </ul>
                        <p class="tip" v-if="!history.length">{{ t('search.placeholder') }} ⇧/⌘K</p>
                        </div>
                    </Transition>
                </div>
            </Transition>
        </Teleport>
</template>

<style lang="scss" scoped>
/* 覆盖层 */
/* 统一使用变量，避免动画结束与最终颜色不一致 */
.sakura-search-overlay {
    position: fixed;
    inset: 0;
    z-index: 150;
    display: flex;
    justify-content: center;
    align-items: flex-start;
    padding: 12vh 1rem 2rem;
    /* 使用统一颜色避免过渡末尾闪白，可自行调整明度/透明度 */
    --search-overlay-bg-final: rgba(248 249 250 / 0.75); /* 原 0.72 稍微调暖 */
    --search-overlay-bg-start: var(--search-overlay-bg-final);
    backdrop-filter: blur(26px) saturate(1.3);
    background-color: var(--search-overlay-bg-final);
    color: var(--sakura-color-text);
    overflow-y: auto;
    background-image: var(--sakura-search-bg-img);
    background-repeat: no-repeat;
    background-position: bottom right;
    transition: background-color .28s ease, backdrop-filter .28s ease;
    will-change: backdrop-filter, background-color, opacity;
}
.sakura-search-overlay.is-desktop { align-items: flex-start; }

@media (max-width: 767px) {
    .sakura-search-overlay { align-items: flex-start; padding-top: 5rem; }
}

/* 面板 */
.search-panel {
    position: relative;
    width: min(720px, 100% - 2rem);
    /* 更高对比度：更接近纯白 + 轻微渐变 */
    background: linear-gradient(120deg, #ffffffcc, #ffffffe6);
    border: 1px solid rgba(120 125 140 / 0.28);
    border-radius: 20px;
    box-shadow:
        0 4px 14px -2px rgba(0 0 0 / .12),
        0 2px 4px -1px rgba(0 0 0 / .08);
    padding: 1.2rem 1.2rem 1.4rem;
    backdrop-filter: blur(20px) saturate(1.4);
}
@media (max-width: 767px) {
    .search-panel { width: 100%; border-radius: 16px; padding: .9rem .85rem 1.05rem; }
}


.input-wrapper { position: relative; display: flex; align-items: center; gap: .7rem; }
.leading-icon { position: absolute; left: 1rem; top: 50%; transform: translateY(-50%); pointer-events: none; }
.search-input {
    flex: 1;
    background: #fff;
    border: 1.5px solid #b9bed1;
    padding: .62rem .95rem .62rem 2.4rem; /* 更紧凑保持高度一致 */
    border-radius: 14px;
    font-size: 1rem;
    line-height: 1.1;
    font-weight: 500;
    color: #222;
    transition: border-color .18s, box-shadow .18s, background .25s;
    height: 2.7rem;
    box-sizing: border-box;
    /* 允许在窄屏水平放不下时收缩，避免把按钮挤出容器 */
    min-width: 0;
}
.search-input:focus { outline: none; border-color: var(--sakura-color-primary); box-shadow: 0 0 0 3px rgba(140 120 255 / .25); }
.search-input:disabled { opacity: .6; cursor: progress; }

.go-btn { height: 2.7rem; padding: 0 .95rem; border: 1.5px solid var(--sakura-color-primary); border-radius: 12px; background: var(--sakura-color-primary); color:#fff; font-weight:600; cursor:pointer; transition: background .2s, box-shadow .2s, transform .15s; display:flex; align-items:center; justify-content:center; white-space:nowrap; line-height:1; }
@media (max-width: 767px) {
    .search-input { font-size: .95rem; height: 2.55rem; padding: .5rem .85rem .5rem 2.2rem; }
    .go-btn { height: 2.55rem; font-size: .8rem; padding: 0 .75rem; min-width: 4.1rem; }
    .input-wrapper { gap: .55rem; }
}

/* 介于 421px~520px 的窄宽度：保持横向布局但再紧凑一点 */
@media (max-width: 520px) and (min-width: 421px) {
    .input-wrapper { gap: .45rem; }
    .search-input { padding-right: .8rem; }
}

/* 极窄屏（例如 360px 以下）防止按钮挤出：改为纵向排列 */
@media (max-width: 420px) {
    .input-wrapper { flex-direction: column; align-items: stretch; gap: .5rem; }
    .search-input { width: 100%; height: 2.6rem; padding: .55rem .9rem .55rem 2.2rem; }
    .go-btn { width: 100%; height: 2.55rem; font-size: .85rem; justify-content: center; }
    /* 列布局下图标按原 50% 会位于输入与按钮之间，这里改为相对输入垂直居中 */
    .leading-icon { top: 1.3rem; transform: translateY(-50%); }
}
.go-btn:disabled { opacity:.5; cursor: not-allowed; }
.go-btn:not(:disabled):hover { filter: brightness(1.1); }
.go-btn:not(:disabled):active { transform: translateY(1px); }

.history { list-style: none; margin: .9rem 0 0; padding: 0; display: grid; gap: .55rem; }
.history-item { font-size: .875rem; padding: .6rem .85rem; border: 1px solid #d6d9e2; border-radius: 10px; background: #fff; cursor:pointer; display:flex; align-items:center; transition: background .15s, box-shadow .15s, border-color .15s; }
.history-item:hover { background: #f5f6fa; border-color: #c5cada; box-shadow: 0 1px 2px rgba(0 0 0 / .06); }

.tip { margin-top: .9rem; font-size: .75rem; opacity: .6; text-align: center; }

/* 面板进入/离开动画（遮罩保持静止不透明度，避免跳变） */
.panel-fade-enter-active, .panel-fade-leave-active { transition: opacity .22s ease, transform .22s ease; }
.panel-fade-enter-from, .panel-fade-leave-to { opacity: 0; transform: translateY(4px); }

/* 覆盖层淡入淡出：点击空白关闭时更柔和 */
.overlay-fade-enter-active, .overlay-fade-leave-active { transition: opacity .25s ease; }
.overlay-fade-enter-from, .overlay-fade-leave-to { opacity: 0; }

/* 占位符颜色（亮色模式） */
.search-input::placeholder { color: rgba(0 0 0 / .35); }

/* 暗色 / 夜间模式增强对比：通过 .dark 或系统 prefers-color-scheme: dark 触发 */
.dark .sakura-search-overlay { background-color: rgba(20 22 30 / 0.78); color: #e5e9ef; }
@media (prefers-color-scheme: dark) { .sakura-search-overlay { background-color: rgba(20 22 30 / 0.78); color: #e5e9ef; } }

.dark .search-panel { background: linear-gradient(135deg, rgba(40 44 55 / .92), rgba(40 44 55 / .82)); border-color: rgba(255 255 255 / .08); box-shadow: 0 8px 32px -8px rgba(0,0,0,.55), 0 2px 6px -2px rgba(0,0,0,.5); }
@media (prefers-color-scheme: dark) { .search-panel { background: linear-gradient(135deg, rgba(40 44 55 / .92), rgba(40 44 55 / .82)); border-color: rgba(255 255 255 / .08); box-shadow: 0 8px 32px -8px rgba(0,0,0,.55), 0 2px 6px -2px rgba(0,0,0,.5); } }

.dark .search-input { background: rgba(255 255 255 / .07); border-color: rgba(255 255 255 / .18); color: #fff; }
@media (prefers-color-scheme: dark) { .search-input { background: rgba(255 255 255 / .07); border-color: rgba(255 255 255 / .18); color: #fff; } }
.dark .search-input:focus { border-color: var(--sakura-color-primary); box-shadow: 0 0 0 3px rgba(140 120 255 / .35); }
@media (prefers-color-scheme: dark) { .search-input:focus { border-color: var(--sakura-color-primary); box-shadow: 0 0 0 3px rgba(140 120 255 / .35); } }
.dark .search-input:disabled { opacity: .55; }
@media (prefers-color-scheme: dark) { .search-input:disabled { opacity: .55; } }
.dark .search-input::placeholder { color: rgba(255 255 255 / .4); }
@media (prefers-color-scheme: dark) { .search-input::placeholder { color: rgba(255 255 255 / .4); } }

.dark .go-btn { background: var(--sakura-color-primary); border-color: var(--sakura-color-primary); }
@media (prefers-color-scheme: dark) { .go-btn { background: var(--sakura-color-primary); border-color: var(--sakura-color-primary); } }
.dark .go-btn:not(:disabled):hover { filter: brightness(1.15); }
@media (prefers-color-scheme: dark) { .go-btn:not(:disabled):hover { filter: brightness(1.15); } }

.dark .history-item { background: rgba(255 255 255 / .07); color: #d0d5dc; border-color: transparent; }
@media (prefers-color-scheme: dark) { .history-item { background: rgba(255 255 255 / .07); color: #d0d5dc; border-color: transparent; } }
.dark .history-item:hover { background: rgba(255 255 255 / .14); border-color: rgba(255 255 255 / .12); }
@media (prefers-color-scheme: dark) { .history-item:hover { background: rgba(255 255 255 / .14); border-color: rgba(255 255 255 / .12); } }


.dark .tip { color: rgba(255 255 255 / .55); opacity: .7; }
@media (prefers-color-scheme: dark) { .tip { color: rgba(255 255 255 / .55); opacity: .7; } }
</style>