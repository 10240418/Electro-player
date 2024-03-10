import { toHttps } from "./util";
import {getLyric, getSongDetail} from "apis/musiclist";
export class Song {
  constructor({ id, name, singer, album, image, duration, url }) {
    this.id = id;
    this.name = name;
    this.singer = singer;
    this.album = album;
    this.image = image;
    this.duration = duration;
    this.url = url;
  }
}

const getSingers = (singers) => {
  const nameList = singers.map((item) => item.name);
  return nameList.reduce((acc, item) => {
    return acc + "/" + item;
  });
};

const createSong = (music) => {
  const album = music.al || music.album || {};
  const duration = music.dt || music.duration;
  return new Song({
    id: music.id,
    name: music.name,
    singer: getSingers(music.ar || music.artists),
    album: album.name,
    image: toHttps(album.picUrl) || null,
    duration: duration / 1000,
    url: `https://music.163.com/song/media/outer/url?id=${music.id}.mp3 `,
  });
};

// 将获取的歌曲列表response提取关键信息，转化为songs对象数组
export const formatSongs = (list) => {
  const Songs = [];

  list.forEach((item) => {
    const musicData = item;
    if (musicData.id) {
      Songs.push(createSong(musicData));
    }
  });
  return Songs;
};
export const formatSongsToId = async (list, keys) => {
  const Songs = [];
  for (const item of list) {
    const musicData = item;
    if (musicData.id) {
      // 获取歌词
      const lyric = await getLyric(musicData.id);
      // 将歌词按行分割
      const lyricLines = lyric.lrc.lyric.split('\n');
      // 将关键词转换为小写，以进行不区分大小写的匹配
      const lowerCaseKeys = keys.toLowerCase();
      // 遍历歌词的每一行
      for (const line of lyricLines) {
        // 将当前行转换为小写，以进行匹配
        const lowerCaseLine = line.toLowerCase();
        // 判断当前行是否包含关键词
        if (lowerCaseLine.includes(lowerCaseKeys)) {
          // 匹配到关键词，直接输出当前行歌词
          console.log(line);
          // 匹配到关键词，获取歌曲详情
          const songDetail = await getSongDetail(musicData.id);
          Songs.push(songDetail);
          break; // 找到匹配的歌词后结束循环
        }
      }
    }
  }
  return Songs;
};



export const formatUser = (list) => {
  const Users = [];
  list.forEach((item) => {
    const musicData = item;

    if (musicData.uid) {
      Users.push(createSong(musicData));
    }
  });
  return Users;
};
