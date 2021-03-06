<template>
  <div class="music-list">
    <div class="back" @click="back">
      <i class="icon-back"></i>
    </div>
    <h1 class="title" v-html="title"></h1>
    <div class="bg-image" :style="bgStyle" ref="bgImage">
      <div class="play-wrapper">
        <div ref="playBtn" v-show="songs.length>0" class="play" @click="random">
          <i class="icon-play"></i>
          <span class="text">随机播放全部</span>
        </div>
      </div>
      <div class="filter" ref="filter"></div>
    </div>
    <div class="bg-layer" ref="layer"></div>
    <scroll :data="songs" @scroll="scroll"
            :listen-scroll="listenScroll" :probe-type="probeType" class="list" ref="list">
      <div class="song-list-wrapper">
        <song-list :songs="songs"  :rank="rank" @select="selectItem"></song-list>
      </div>
      <div v-show="!songs.length" class="loading-container">
        <loading></loading>
      </div>
    </scroll>
  </div>
</template>
<script>
  import Scroll from './../scroll/scroll'
  import Loading from './../loading/loading'
  import SongList from '../songList/songList'
  import {mapActions} from 'vuex'
  import {playlistMixin} from './../../assets/js/mixin'
  const RESERVED_HEIGHT = 40 //顶部栏高度

  export default {
    name: 'music-list',
    mixins: [playlistMixin],
    props: {
      bgImage: {
        type: String,
        default: ''
      },
      songs: {
        type: Array,
        default: []
      },
      title: {
        type: String,
        default: ''
      },
      rank: {
        type: Boolean,
        default: false
      }
    },
    data () {
      return {
        scrollY: 0,
        imageHeight: 0
      }
    },
    computed: {
      bgStyle() {
        return `background-image:url(${this.bgImage})`
      }
    },
    mounted(){
      this.imageHeight = this.$refs.bgImage.clientHeight //歌手封面高度
      this.minTransalteY = -this.imageHeight + RESERVED_HEIGHT//歌曲list要滚动到顶部的高度
      this.$refs.list.$el.style.top = `${this.imageHeight}px`
    },
    created() {
      this.probeType = 3
      this.listenScroll = true
    },
    components: {
      Scroll,
      Loading,
      SongList
    },
    methods: {
      ...mapActions([
        'selectPlay',
        'randomPlay'
      ]),
      back() {
        this.$router.back()
      },
      scroll(pos) {
        this.scrollY = pos.y
        console.log(pos.y)
      },
      selectItem(item, index){
        //actions中selectPlay
        this.selectPlay({
          list: this.songs,
          index
        })
      },
      //随机播放
      random(){
        this.randomPlay({
          list: this.songs
        })
      },
      //处理playlist
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.list.$el.style.bottom = bottom
        this.$refs.list.refresh()
      },
    },
    watch: {
      scrollY(newY)
      {
        let translateY = Math.max(this.minTransalteY, newY) //取最大的
        let zIndex = 0
        let blur = 0
        let scale = 1
        const percent = Math.abs(newY / this.imageHeight) //比例
        console.log(newY, this.minTransalteY, translateY)
        if (newY > 0) {
          scale = 1 + percent
          zIndex = 10
        } else {
          blur = Math.min(20, percent * 20)
        }
        //遮罩滚动
        this.$refs.layer.style.transform = `translate3d(0,${translateY}px,0)`
        this.$refs.layer.style.webkitTransform = `translate3d(0,${translateY}px,0)`
        this.$refs.filter.style.filter = `blur(${blur}px)`
        this.$refs.filter.style.webkitFilter = `blur(${blur}px)`
        //到达顶部
        if (newY < this.minTransalteY) {
          zIndex = 10
          this.$refs.bgImage.style.paddingTop = 0
          this.$refs.bgImage.style.height = `${RESERVED_HEIGHT}px`
          this.$refs.playBtn.style.display = 'none'
        } else {
          this.$refs.bgImage.style.paddingTop = '70%'
          this.$refs.bgImage.style.height = 0
          this.$refs.playBtn.style.display = ''
        }
        //歌手封面缩放
        this.$refs.bgImage.style.transform = `scale(${scale})`
        this.$refs.bgImage.style.webkitTransform = `scale(${scale})`
        //歌手封面的zindex
        this.$refs.bgImage.style.zIndex = zIndex
      }
    }
    ,
  }
</script>
<style lang="scss" type="text/scss" scoped>
  @import "./../../assets/style/variable";
  @import "./../../assets/style/mixin";

  .music-list {
    position: fixed;
    z-index: 100;
    top: 0;
    left: 0;
    bottom: 0;
    right: 0;
    background: $color-background;
  }

  .back {
    position: absolute;
    top: 0;
    left: 6px;
    z-index: 50;
  }

  .icon-back {
    display: block;
    padding: 10px;
    font-size: $font-size-large-x;
    color: $color-theme;
  }

  .title {
    position: absolute;
    top: 0;
    left: 10%;
    z-index: 40;
    width: 80%;
    @include no-wrap();
    text-align: center;
    line-height: 40px;
    font-size: $font-size-large;
    color: $color-text;
  }

  .bg-image {
    position: relative;
    width: 100%;
    height: 0;
    padding-top: 70%;
    transform-origin: top;
    background-size: cover;
  }

  .play-wrapper {
    position: absolute;
    bottom: 20px;
    z-index: 50;
    width: 100%;
  }

  .play {
    box-sizing: border-box;
    width: 135px;
    padding: 7px 0;
    margin: 0 auto;
    text-align: center;
    border: 1px solid $color-theme;
    color: $color-theme;
    border-radius: 100px;
    font-size: 0;
  }

  .icon-play {
    display: inline-block;
    vertical-align: middle;
    margin-right: 6px;
    font-size: $font-size-medium-x;
  }

  .text {
    display: inline-block;
    vertical-align: middle;
    font-size: $font-size-small;
  }

  .filter {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(7, 17, 27, 0.4);
  }

  .bg-layer {
    position: relative;
    height: 100%;
    background: $color-background;
  }

  .list {
    position: fixed;
    top: 0;
    bottom: 0;
    width: 100%;
    background: $color-background;
  }

  .song-list-wrapper {
    padding: 20px 30px;
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
  }
</style>
