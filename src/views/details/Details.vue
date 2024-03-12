<script setup>
import ElectroLoading from "base/electroLoading/ElectroLoading.vue";
import MusicList from "components/musiclist/MusicList.vue";
import { useLoading } from "@/composables/loading";
import {getPlayListById, getSearchListByKeys} from "@/apis/musiclist";
import { usePlayListStore } from "@/stores/playlist";
import { ref, onMounted } from "vue";
import { useRoute } from "vue-router";
const route = useRoute();
const { isLoading, hideLoad } = useLoading();

const playListStore = usePlayListStore();
const { selectPlay } = playListStore;

const list = ref([]);

onMounted(() => {
  initializeList();
});

const initializeList = async () => {
  try {
    const id = route.params.id;
    const res = await getPlayListById(id);
    document.title = `${res.name} - Electro 在线音乐播放器`;
    list.value = res.tracks;
      console.log(list.value);
      hideLoad();
  } catch (err) {
    console.log(err);
    hideLoad();
  }
};

const searchValue = ref("");
const searchList = ref();
const onSearch = async () => {
    isSearch.value=false;
    searchValue.value = searchValue.value.trim();
    // console.log(searchValue.value);
    const res = await getSearchListByKeys(searchValue.value,list.value);
    //添加了歌词的数据数组
    searchList.value=res;
     //得到的数据中没有封面图，后面需要调用getSongDetail
    // loading end
    // 调用组合式函数--> @/composables/load.js
};

// 播放暂停事件
const selectItem = (item, index) => {
  selectPlay({ list: list.value, index });
};
const isSearch =ref(true);
</script>

<template>
  <!-- 歌单详情 -->
  <div class="details">
      <div class="search flex-col">

          <div class="search-head">
              <input
                      v-model.trim="searchValue"
                      class="search-input"
                      type="text"
                      placeholder="音乐/歌手"
                      autofocus
                      @keyup.enter="onSearch"
              />
          </div>
          <div v-if="isSearch">
              <MusicList
                      v-if="!isLoading"
                      ref="musicList"
                      :list="list"
                      list-type="pullUp"
                      @select="selectItem"
                      @pullUpLoad="pullUpLoad"
              />
          </div>
          <div v-else>
              <MusicList
                      v-if="!isLoading"
                      ref="musicList"
                      :list="searchList"
                      list-type="pullUp"
                      @select="selectItem"
                      @pullUpLoad="pullUpLoad"
              />
          </div>

      </div>
  </div>
</template>

<style lang="less" scoped>
.search {
  overflow: hidden;
  height: 100%;
  .search-head {
    display: flex;
    height: 40px;
    padding: 10px 15px;
    background-color: @search_bg_color;
    span {
      line-height: 40px;
      margin-right: 15px;
      cursor: pointer;
      &:hover {
        color: @text_color_active;
      }
      @media (max-width: 640px) {
        & {
          display: none;
        }
      }
    }
  }
  .search-input {
    flex: 1;
    height: 40px;
    box-sizing: border-box;
    padding: 0 15px;
    border: 1px solid @btn_color;
    outline: 0;
    background: transparent;
    color: @text_color_active;
    font-size: @font_size_medium;
    box-shadow: 0 0 1px 0px #fff inset;
    &::placeholder {
      color: @text_color;
    }
  }
}
.details {
  .music-list {
    height: 100%;
  }
}
</style>
