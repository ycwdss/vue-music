/**
 * Created by wang on 2017/7/11.
 */
import {playMode} from './../assets/js/song'
import {loadSearch, loadPlay, loadFavorite} from './../assets/js/storage'
const state={
  singer:{},//歌手列表
  playingState: false, //播放暂停
  fullScreen: false,//播放收起
  playList: [],//播放列表
  sequenceList: [],//顺序队列(播放模式)
  mode:playMode.sequence, //播放顺序
  currentIndex: -1, //当前播放的索引（前进后退)
  disc: {},//推荐歌曲
  topList: {},//排行榜
  searchHistory:loadSearch(),//搜索历史
  playHistory: loadPlay(), //播放历史
  favoriteList: loadFavorite()//设置喜欢
}
export default state
