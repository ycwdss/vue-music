/**
 * Created by wang on 2017/7/11.
 */
//歌手信息
export const singer = state => state.singer
//播放暂停
export const playingState = state => state.playingState
//显示收起
export const fullScreen = state => state.fullScreen
//播放列表
export const playList = state => state.playList
//顺序队列(播放模式)
export const sequenceList = state => state.sequenceList
//播放模式
export const mode = state => state.mode
//播放索引
export const currentIndex = state => state.currentIndex
//当前歌曲
export const currentSong = (state) => {
  return state.playList[state.currentIndex] || {}
}
//推荐
export const disc = state => state.disc
//排行榜
export const topList = state => state.topList
//搜索历史
export const searchHistory = state => state.searchHistory
//播放历史
export const playHistory = state => state.playHistory
//喜欢列表
export const favoriteList = state => state.favoriteList
