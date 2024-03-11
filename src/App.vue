<script setup>
import { RouterView } from "vue-router";
import ElectroHeader from "components/electroHeader/ElectroHeader.vue";
import { ref, onMounted, nextTick } from "vue";
import { getPlayListById } from "./apis/musiclist";
import { usePlayListStore } from "./stores/playlist";
import { ELECTROPLAYER_CONFIG, VERSION, UPDATE_TIME } from "./config";

const usePlayList = usePlayListStore();

const initPlayList = async () => {
  const playList = await getPlayListById(ELECTROPLAYER_CONFIG.PLAYLIST_ID);
  const list = playList.tracks.slice(0, 100);
  usePlayList.setPlayList(list);
};

const electroPlayer = ref(null);
onMounted(() => {
  console.log("当前版本：", VERSION);
  console.log("更新时间：", UPDATE_TIME);
  // 初始化播放列表
  initPlayList();

  // 设置audio元素
  nextTick(() => {
    usePlayList.setAudioEle(electroPlayer.value);
  });
});

</script>

<template>
  <!-- 播放器 -->
  <audio ref="electroPlayer"></audio>
  <RouterView />
</template>

<style lang="less">
#app {
  position: relative;
  width: 100%;
  height: 100%;
  color: @text_color;
  font-size: @font_size_medium;
  audio {
    position: fixed;
  }
}
</style>
