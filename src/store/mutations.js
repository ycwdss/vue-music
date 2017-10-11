/**
 * Created by wang on 2017/7/11.
 */
import * as types from './types'

const mutations = {
  //歌手信息
  [types.SET_SINGER](state, singer){
    state.singer = singer
  },
  //播放暂停
  [types.SET_PLAYING_STATE](state, flag) {
    state.playingState = flag
  },
  //播放隐藏
  [types.SET_FULL_SCREEN](state, flag) {
    state.fullScreen = flag
  },
  //播放列表
  [types.SET_PLAY_LIST](state, list) {
    state.playList = list
  },
  //顺序队列(播放模式)
  [types.SET_SEQUENCE_LIST](state, list) {
    state.sequenceList = list
  },
  //播放索引
  [types.SET_CURRENT_INDEX](state, index) {
    state.currentIndex = index
  },
  //播放模式
  [types.SET_PLAY_MODE](state, mode) {
    state.mode = mode
  },
  //推荐
  [types.SET_DISC](state, disc) {
    state.disc = disc
  },
  //排行榜
  [types.SET_TOP_LIST](state, topList) {
    state.topList = topList
  },
  //搜索历史
  [types.SET_SEARCH_HISTORY](state, history) {
    state.searchHistory = history
  },
  //播放历史
  [types.SET_PLAY_HISTORY](state, history) {
    state.playHistory = history
  },
  //喜欢歌曲
  [types.SET_FAVORITE_LIST](state, list) {
    state.favoriteList = list
  }
}
export default mutations
