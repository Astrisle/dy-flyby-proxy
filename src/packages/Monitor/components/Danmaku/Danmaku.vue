<template>
  <div
    ref="dom_danmaku"
    class="danmaku"
  >
    <Deafult
      v-for="item in danmakuList"
      :key="item.key"
      :data="item"
      :showLevel="options.danmaku.show.includes('level')"
      :showNoble="options.danmaku.show.includes('noble')"
      :showFans="options.danmaku.show.includes('fans')"
      :showDiamond="options.danmaku.show.includes('diamond')"
      :showRoomAdmin="options.danmaku.show.includes('roomAdmin')"
      :showAvatar="options.danmaku.show.includes('avatar')"
      :showVip="options.danmaku.show.includes('vip')"
      @passToIndexForVIP="passToIndexForVIP"
      @passToIndexForBan="passToIndexForBan"
    ></Deafult>
    <div
      v-show="isLock"
      class="gobottom"
      @click.stop="goToScrollBottom(dom_danmaku)"
    >
      回到底部
    </div>
  </div>
</template>

<script setup>
import { ref, onUpdated, onMounted } from 'vue';
import Deafult from './templates/Default.vue';

import { useScroll } from '../../hooks/useScroll.js';
let props = defineProps({
  options: {
    type: Object,
  },
  danmakuList: {
    type: Array,
  },
});
let dom_danmaku = ref(null);
let { isLock, onScroll, onScrollUpdate, goToScrollBottom } = useScroll();

onUpdated(() => {
  onScrollUpdate(dom_danmaku.value);
});
onMounted(() => {
  dom_danmaku.value.addEventListener('mousewheel', () => {
    onScroll(dom_danmaku.value);
  });
  dom_danmaku.value.addEventListener('touchmove', () => {
    onScroll(dom_danmaku.value);
  });
  window.addEventListener('resize', () => {
    onScroll(dom_danmaku.value);
  });
});

const emit = defineEmits(['addToVIP', 'addToBan']);

function passToIndexForVIP(nn) {
  emit('addToVIP', nn);
}

function passToIndexForBan(nn) {
  emit('addToBan', nn);
}
</script>

<style
  lang="scss"
  scoped
>
@import '@/global/styles/themes/index.scss';
.danmaku {
  height: 100%;
  width: 100;
  padding: 0 5px;
  box-sizing: border-box;
  overflow-x: hidden;
  overflow-y: auto;
  content-visibility: auto;
  .item {
    justify-content: flex-start;
    text-align: left;
  }
}
</style>
