<script setup>
import MusicList from "@/components/musiclist/MusicList.vue";
import ElectroLoading from "@/base/electroLoading/ElectroLoading.vue";
import { ref, onMounted } from "vue";
import { usePlayListStore } from "@/stores/playlist";
import {
    getSongDetail,
    getSearchHot,
    getSearchListSongs,
    getSearchListUser,
    getSearchSongsListsByUserId, getPlayListById, getSongsByLyric, getLyric
} from "apis/musiclist";
import {formatSongs, formatSongsToId} from "@/utils/song";
import { useLoading } from "@/composables/loading"; // 使用组合式函数代替mixins
import { showToast } from "base/electroToast/index";
import { toHttps } from "@/utils/util";
// import {forEach} from "vue3-carousel-3d/docs/public/js/carousel-3d.common";
const playListStore = usePlayListStore();
const { selectAddPlay } = playListStore;

const searchValue = ref("");
const searchHotWords = ref([]);
const searchListUsers = ref([]);
const searchListSongs = ref([]);
const page = ref(0);

const { isLoading, hideLoad } = useLoading();

// 获取热搜词语
const InitSearchHotWords = async () => {
  const res = await getSearchHot();
  searchHotWords.value = res.result.hots.slice(0, 5);
};

onMounted(() => {
  isLoading.value = false;
});

// 点击热搜词语
const clickHot = (keywords) => {
  searchValue.value = keywords;
  onSearch();
};

// 引用子组件实例，使用{scrollToTop}方法
const musicList = ref(null);

const onSearch = async (event) => {
    if (event.key !== 'Enter') return
    searchIsShowSongs.value += 1;
    console.log(searchIsShowSongs.value);
  searchValue.value = searchValue.value.trim();
   // console.log(searchValue.value);
  if (searchValue.value === "clickHot") {
    showToast({ message: "搜索内容不能为空~" });
    return;
  }
  // loading....
  page.value = 0;
  isLoading.value = true;
    // const res = await getSearchListSongs(searchValue.value);
    //获取用户信息
    const user = await getSearchListUser(searchValue.value);
    searchListUsers.value = user.result.userprofiles;
    if(searchListUsers.value.length< 1){
        showToast({ message: "用户不存在~" });
    }
    console.log(searchListUsers.value);
    // console.log(searchList.value);
    //得到的数据中没有封面图，后面需要调用getSongDetail
  // loading end
  // 调用组合式函数--> @/composables/load.js
  hideLoad();
};


// 滚动加载-添加新的数据
const pullUpLoad = async () => {
  page.value++;
  const res = await getSearchListSongs(searchValue.value, page.value);
  const result = res.result;
  if (!result.songs) {
    showToast({ message: "没有更多歌曲啦!" });
    return;
  }
  searchListSongs.value = [...searchListSongs.value, ...formatSongs(result.songs)];
};

const selectItem = async (music) => {
  try {
    const res = await getSongDetail(music.id);
    // console.log(res);
    const picUrl = res.songs[0].al.picUrl;
    music.image = toHttps(picUrl);
    selectAddPlay(music);
  } catch (error) {
    showToast({ message: "哎呀，出错了~" });
  }
};

//获取歌单列表
const SongsListsById = ref();
async function searchSongsLists(userId) {
    Style.value = 2;
    searchIsShowSongs.value =2;
    console.log("lalalla")
    console.log(Style.value);
    console.log(searchIsShowSongs.value);
    try{
      const result = await getSearchSongsListsByUserId(userId);
      SongsListsById.value = result.playlist;
      console.log("歌单列表")
      console.log(SongsListsById.value);
  }catch (error) {
      showToast({ message: "哎呀，出错了~" });
  }
}
const Style= ref(1);
//获取歌曲通过歌单id
// const songsIdList = ref();//歌单歌曲id表
const songsIdListLyric = ref();//歌词

//获取歌单歌曲
const  searchSongsById=async (id)=>{

    Style.value = 3;
    searchIsShowSongs.value = 3;
    const result = await getPlayListById(id);
    searchListSongs.value = result.tracks;
    console.log("歌单歌曲");
    console.log(searchListSongs.value);

    // songsIdListLyric.value = await formatSongsToId(searchListSongs.value,searchValueKeys.value);
    // console.log("歌曲id歌词表");
    //这里面就是关于歌曲的一些歌词
    // console.log(songsIdListLyric.value);
    // console.log(songsIdListLyric.value);

}
const onSearchSongs = async (event) => {
    if (event.key !== 'Enter') return

    searchValueKeys.value = searchValueKeys.value.trim();
    //输入歌词关键词
    console.log("歌词关键词");
    console.log(searchValueKeys.value);
    if (searchValueKeys.value === "clickHot") {
        showToast({ message: "搜索内容不能为空~" });
        return;
    }
    // loading....
    page.value = 0;
    isLoading.value = true;
    if (searchListSongs.value.length > 0) {
        musicList.value.scrollToTop();
    }
    //获取歌单里面的歌曲
    const result = await formatSongsToId(searchListSongs.value,searchValueKeys.value);
    searchListSongs.value = convertToSongObjects(result);
    // searchListSongs.value = result;
    console.log("搜索结果")
    console.log(result);
    hideLoad();
};
class Song {
    constructor(id, name, singer, album, image) {
        this.id = id;
        this.name = name;
        this.singer = singer;
        this.album = album;
        this.image = image;
    }
}

const convertToSongObjects = (data) => {
    const result = [];
    data.forEach((item, index) => {
        item.songs.forEach((songData) => {
            const { id, name, ar, al } = songData;
            const singer = ar[0].name;
            const album = al.name;
            const image = al.picUrl;
            const song = new Song(id, name, singer, album, image);
            result.push(song);
        });
    });
    return result;
};
// const songsIdList = ref();//歌单歌曲id表
//
// Style =1 就是用户
// Style =2 就是歌单
// Style =3 就是歌曲
// seachIsShowSongs = ref(true); 就是搜索用户
// seachIsShowSongs = ref(false); 就是搜索歌曲
//点一下显示第一个搜索框,点击那啥以后显示第二格shousuokuan
const searchIsShowSongs = ref(1);
const searchValueKeys = ref([]);
const setStatues=()=>{
    searchIsShowSongs.value -=1
    Style.value =searchIsShowSongs.value;
    if(searchIsShowSongs.value<=1 || Style.value<=1){
        searchIsShowSongs.value = 1;
        Style.value = 1;
        searchValue.value = "";
    }
}
</script>

<template>
  <div class="search flex-col">
      <div class="music-btn"  v-if="searchIsShowSongs!==1">
          <span @click="setStatues">返回</span>
      </div>
    <ElectroLoading :show="isLoading" />
    <div v-if="searchIsShowSongs===1" class="search-head">
      <input
        v-model.trim="searchValue"
        class="search-input"
        type="text"
        placeholder="音乐/歌手"
        autofocus
        @keyup="onSearch"
      />
    </div>
      <div v-else-if="searchIsShowSongs===3" class="search-head">
          <input
                  v-model.trim="searchValueKeys"
                  class="search-input"
                  type="text"
                  placeholder="关键词"
                  autofocus
                  @keyup="onSearchSongs"
          />
      </div>
      <div v-if="Style===1" class="content">
          <div  class="user-click" v-for="(item, index) in searchListUsers" :key="index" @click="searchSongsLists(item.userId)">
              <div class="user-info">
                  <h2>{{ item.nickname }}</h2>
                  <p>UserId : {{ item.userId }}</p>
              </div>
          </div>
      </div>
      <div v-else-if="Style===2" class="content">
          <div  class="user-click" v-for="(item, index) in SongsListsById" :key="index" @click="searchSongsById(item.id)">
              <div class="user-info">
                  <h2> name: {{ item.name }}</h2>
                  <p> {{ item.trackCount }} 首</p>
                  <p> id:{{ item.id }} </p>
                  <p>播放次数: {{ item.playCount }}</p>
              </div>
          </div>
      </div>
      <div v-else-if="Style===3">
              <MusicList
                ref="musicList"
                :list="searchListSongs"
              />
      </div>


  </div>
</template>

<style lang="less" scoped>
.content {
  display: flex;
  flex-wrap: wrap;

  align-items: center;
  justify-content: center;
}

.music-btn {
  margin-bottom: 10px;
  width: 100%;
  height: 60px;
  display: flex;
  gap: 8px;
  a,
  span {
    display: inline-block;
    height: 40px;
    box-sizing: border-box;
    padding: 0 23px;
    border: 1px solid @btn_color;
    color: @btn_color;
    border-radius: @btn_border_radius;
    font-size: 14px;
    line-height: 40px;
    overflow: hidden;
    cursor: pointer;
    &:hover,
    &:active {
      border-color: @btn_color_active;
      color: @btn_color_active;
    }
  }

  @media (min-width: 960px) {
    span.show-960 {
      display: none;
    }
  }

  @media (max-width: 960px) {
    span.show-960 {
      display: inline-block;
    }
  }

  @media (max-width: 768px) {
    height: 50px;
    a,
    span {
      height: 35px;
      padding: 0 10px;
      margin-right: 6px;
      line-height: 35px;
    }
  }
}
@media (max-width: 520px) {
  .music-btn {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    grid-template-rows: repeat(2, 1fr);
    height: 80px;
    a,
    span {
      text-align: center;
    }
  }
}
.user-click{
//  鼠标移入变形状
  cursor: pointer;
  &:hover{
    transform: scale(1.05);
    transition-duration: 0.5s;
  }
}
.user-info {
  background-color: #625353;
  padding: 20px;
  border-radius: 5px;
  margin: 20px;
  width: 300px;
}
.user-info h2 {
  margin-top: 0;
}
.user-info p {
  margin-bottom: 5px;
}
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
    background: transparent;
    color: @text_color_active;
    font-size: @font_size_medium;
    &::placeholder {
      color: @text_color;
    }
    &:disabled {
      border: 0;
    }
  }
}
</style>
