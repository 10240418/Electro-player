<template>
    <div class="flex-row-let">
        <div class="music-list flex-col">
            <template v-if="list.length > 0">
                <div class="list-item list-header">
                    <span class="list-name">歌曲</span>
                    <span class="list-artist">歌手</span>
                    <span v-if="isDuration" class="list-time">时长</span>
                    <span v-else class="list-album">专辑</span>
                </div>
                <div ref="listContent" class="list-content" @scroll="listScroll">
                    <div v-for="(item, index) in list" :key="item.id" class="list-item"
                         @click.stop="selectItem(item, index)"
                         :class="{ on: isPlaying && currentMusic.id === item.id }" @dblclick="selectItem(item, index)">
                        <div class="list-num" v-text="index + 1"></div>
                        <div class="list-name">
                            <span class="list-name-text">{{ item.name }}</span>
                        </div>
                        <div class="list-artist">{{ item.singer }}</div>
                        <div v-if="isDuration" class="list-time">
                            <span class="list-time-format">{{ getFormatTime(item.duration % 3600) }}</span>
                        </div>
                        <span v-else class="list-album">{{ item.album }}</span>
                    </div>
                    <slot name="listBtn"></slot>
                </div>
            </template>
        </div>

        <div v-if="showLyrics" class="lyrics-section" @scroll="listScroll" @click="toggleLyricsDisplay">
            <h2>歌词</h2>
            <pre>{{ lyrics.lrc.lyric }}</pre>
        </div>
    </div>
</template>

<script setup>
import {ref, computed, watch, defineEmits, defineExpose} from "vue";
import {formatSecond} from "@/utils/util";
import {usePlayListStore} from "@/stores/playlist";
import {storeToRefs} from "pinia";
import {getLyric} from "apis/musiclist";

const playListStore = usePlayListStore();
const {setPlaying} = playListStore;
const {currentMusic, isPlaying} = storeToRefs(playListStore);

const emit = defineEmits(["pullUpLoad", "select", "del"]);

const props = defineProps({
    list: {
        type: Array,
        default: () => [],
    },
    listType: {
        type: String,
        default: "album",
    },
});

const isDuration = computed(() => {
    return props.listType === "duration";
});

const getStateType = ({id: itemId}) => {
    return isPlaying.value && currentMusic.value.id === itemId ? "pause-circle" : "play-circle";
};

const getFormatTime = (seconds) => {
    return formatSecond(seconds);
};

const showLyrics = ref(false);
const lyrics = ref('');

const selectItem = async (item, index) => {
    const res = await getLyric(item.id);
    if (res) {
        lyrics.value = res;
        showLyrics.value = true;
    }
    if (currentMusic.value.id && item.id === currentMusic.value.id) {
        setPlaying(!isPlaying.value);
        return;
    }
    emit("select", item, index);
};

const deleteItem = (index) => {
    emit("del", index);
};

const lockUp = ref(true);
const listScroll = (e) => {
    if (props.listType !== "pullUp" || lockUp.value) {
        return;
    }
    const scrollTop = e.target.scrollTop;
    const {scrollHeight, offsetHeight} = e.target;
    const heightLeft = scrollHeight - scrollTop - offsetHeight;
    if (heightLeft <= THRESHOLD) {
        lockUp.value = true;
        emit("pullUpLoad");
    }
};

const listContent = ref(null);
const scrollToTop = () => {
    listContent.value.scrollTop = 0;
};

const toggleLyricsDisplay = () => {
    showLyrics.value = !showLyrics.value;
};

defineExpose({scrollToTop});
</script>

<style lang="less" scoped>
.flex-row-let {
    width: 100%;
    height: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
    position: relative;
}

.music-list {
  height: 100%;
    width: 100%;
  min-height: 0;
}

.list-content {
  overflow-y: auto; /* Add scrollbar */
  max-height: calc(100vh - 150px); /* Set max-height to limit number of songs */
}

.list-header {
  border-bottom: 1px solid @list_head_line_color;
  color: @text_color_active;

  .list-name {
    padding-left: 40px;
    user-select: none;
  }
}

.list-item {
  display: flex;
  width: 100%;
  height: 50px;
  border-bottom: 1px solid @list_item_line_color;
  line-height: 50px;
  overflow: hidden;
    cursor: pointer;

    &:hover {
        background-color: rgba(0, 0, 0, 0.1);
    }

  &.on {
    color: #fff;

    .list-num {
      font-size: 0;
      background: url("assets/img/wave.gif") no-repeat center center;
    }
  }

  .list-num {
    display: block;
    width: 30px;
    margin-right: 10px;
    text-align: center;
  }

  .list-name {
    position: relative;
    flex: 1;
    box-sizing: border-box;

    .list-name-text {
      text-overflow: ellipsis;
      overflow: hidden;
    }

    .list-menu-icon {
      display: none;
      position: absolute;
      top: 50%;
      right: 10px;
      transform: translateY(-50%);
    }
  }

  .list-artist,
  .list-album {
    display: block;
    width: 300px;
    .no-wrap();
    @media (max-width: 1440px) {
      width: 200px;
    }
    @media (max-width: 1200px) {
      width: 150px;
    }
  }

  .list-artist {
    width: 250px;
  }

  .list-time {
    display: block;
    width: 60px;
    position: relative;

    .list-menu-icon-del {
      display: none;
      position: absolute;
      top: 50%;
      left: 0;
      transform: translateY(-50%);
    }
  }
}

@media (max-width: 960px) {
  .list-item .list-name {
    padding-right: 40px;
  }
}

@media (max-width: 768px) {
  .list-item {
    .list-name .list-menu {
      display: block;
    }

    .list-artist,
    .list-album {
      width: 30%;
    }
  }
}

@media (max-width: 640px) {
  .list-item {
    .list-artist {
      width: 40%;
    }

    .list-album,
    .list-time {
      display: none;
    }
  }
}

.lyrics-section {
    float: right;
    transform: translateY(10px);
  padding: 10px;
  border: 1px solid #ccc;
  border-radius: 5px;
  background-color: rgba(0, 0, 0, 0.2);
  cursor: pointer;
  width: 400px;
  height: 900px;
  overflow-y: auto;
  max-height: calc(100vh - 150px);

}

.lyrics-section h2 {
  margin-bottom: 10px;
}
</style>
