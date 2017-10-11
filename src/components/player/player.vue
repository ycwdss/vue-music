<template>
  <div class="player" v-show="playList.length>0">
    <transition name="normal"
                @enter="enter"
                @after-enter="afterEnter"
                @leave="leave"
                @after-leave="afterLeave"
    >
      <div class="normal-player" v-show="fullScreen">
        <div class="background">
          <img width="100%" height="100%" :src="currentSong.image">
        </div>
        <div class="top">
          <div class="back" @click="back">
            <i class="icon-back"></i>
          </div>
          <h1 class="title" v-html="currentSong.name"></h1>
          <h2 class="subtitle" v-html="currentSong.singer"></h2>
        </div>
        <div class="middle"
             @touchstart.prevent="middleTouchStart"
             @touchmove.prevent="middleTouchMove"
             @touchend="middleTouchEnd"
        >
          <div class="middle-l" ref="middleL">
            <div class="cd-wrapper" ref="cdWrapper">
              <div class="cd" :class="cdCls">
                <img class="image" :src="currentSong.image">
              </div>
            </div>
            <div class="playing-lyric-wrapper">
              <div class="playing-lyric">{{playingLyric}}</div>
            </div>
          </div>
          <scroll class="middle-r" ref="lyricList" :data="currentLyric && currentLyric.lines">
            <div class="lyric-wrapper">
              <div v-if="currentLyric">
                <p ref="lyricLine"
                   class="text"
                   :class="{'current': currentLineNum ===index}"
                   v-for="(line,index) in currentLyric.lines">{{line.txt}}</p>
              </div>
            </div>
          </scroll>
        </div>
        <div class="bottom">
          <div class="dot-wrapper">
            <span class="dot" :class="{'active':currentShow==='cd'}"></span>
            <span class="dot" :class="{'active':currentShow==='lyric'}"></span>
          </div>
          <div class="progress-wrapper">
            <span class="time time-l">{{format(currentTime)}}</span>
            <div class="progress-bar-wrapper">
              <progress-bar :percent="percent" @percentChange="onProgressBarChange"></progress-bar>
            </div>
            <span class="time time-r">{{format(currentSong.duration)}}</span>
          </div>
          <div class="operators">
            <div class="icon i-left" @click="changeMode">
              <i :class="iconMode"></i>
            </div>
            <div class="icon i-left" :class="disableCls">
              <i class="icon-prev" @click="prev"></i>
            </div>
            <div class="icon i-center" :class="disableCls">
              <i :class="playIcon" @click.stop="togglePlaying"></i>
            </div>
            <div class="icon i-right" :class="disableCls">
              <i class="icon-next" @click="next"></i>
            </div>
            <div class="icon i-right">
              <i class="icon icon-not-favorite"></i>
            </div>
          </div>
        </div>
      </div>
    </transition>
    <transition name="mini">
      <div class="mini-player" v-show="!fullScreen" @click="open">
        <div class="icon">
          <img :class="cdCls" width="40" height="40" :src="currentSong.image">
        </div>
        <div class="text">
          <h2 class="name" v-html="currentSong.name"></h2>
          <p class="desc" v-html="currentSong.singer"></p>
        </div>
        <div class="control">
          <progress-circle :radius="radius" :percent="percent">
            <i @click.stop="togglePlaying" class="icon-mini" :class="miniIcon"></i>
          </progress-circle>
        </div>
        <div class="control" @click.stop="showPlaylist">
          <i class="icon-playlist"></i>
        </div>
      </div>
    </transition>
    <play-list ref="playlist"></play-list>
    <audio ref="audio" :src="currentSong.url" @canplay="ready" @error="error" @timeupdate="updateTime"
           @ended="end"></audio>
  </div>
</template>
<script>
  import Lyric from 'lyric-parser'
  import {Base64} from 'js-base64'
  import api from '../../api/api'//接口地址
  import {shuffle} from '../../assets/js/config'
  import {playMode} from '../../assets/js/song'
  import {playerMixin} from '../../assets/js/mixin'
  import animations from 'create-keyframe-animation'
  import {mapGetters,mapActions, mapMutations} from 'vuex'
  import Scroll from '../scroll/scroll'
  import ProgressBar from '../progressBar/progressBar'
  import ProgressCircle from '../progressCircle/progressCircle'
  import PlayList from '../playList/playList'

  export default {
    mixins: [playerMixin],
    data() {
      return {
        songReady: false,//快速切换标记
        currentTime: 0,//当前播放时间
        radius: 32,
        currentLyric: null, //歌词信息
        currentLineNum: 0, //行数
        currentShow: 'cd', //显示歌词滑动
        playingLyric: '',//当前播放的歌词

      }
    },
    computed: {
      ...mapGetters([
        'currentIndex',
        'fullScreen',
        'playingState'
      ]),
      //play状态图标
      playIcon() {
        return this.playingState ? 'icon-pause' : 'icon-play'
      },
      //mini play状态图标
      miniIcon() {
        return this.playingState ? 'icon-pause-mini' : 'icon-play-mini'
      },
      //cd图片旋转
      cdCls() {
        return this.playingState ? 'play' : 'play pause'
      },
      //播放出错
      disableCls() {
        return this.songReady ? '' : 'disable'
      },
      //进度
      percent() {
        return this.currentTime / this.currentSong.duration
      },
      //随机播放
      iconMode() {
        return this.mode === playMode.sequence ? 'icon-sequence' : this.mode === playMode.loop ? 'icon-loop' : 'icon-random'
      }
    },
    components: {
      ProgressBar,
      ProgressCircle,
      Scroll,
      PlayList,
    },
    created() {
      this.touch = {}
    },
    methods: {
      ...mapMutations({
        setFullScreen: 'SET_FULL_SCREEN',
      }),
      ...mapActions([
        'savePlayHistory'
      ]),
      //隐藏
      back() {
        this.setFullScreen(false)
      },
      //展开
      open() {
        this.setFullScreen(true)
      },
      //唱片normal==>mini动画
      enter(el, done) {
        const {x, y, scale} = this._getPosAndScale()
        let animation = {
          0: {
            transform: `translate3d(${x}px,${y}px,0) scale(${scale})`
          },
          60: {
            transform: `translate3d(0,0,0) scale(1.1)`
          },
          100: {
            transform: `translate3d(0,0,0) scale(1)`
          }
        }
        animations.registerAnimation({
          name: 'move',
          animation,
          presets: {
            duration: 400,
            easing: 'linear'
          }
        })
        animations.runAnimation(this.$refs.cdWrapper, 'move', done)
      },
      afterEnter() {
        animations.unregisterAnimation('move')
        this.$refs.cdWrapper.style.animation = ''
      },
      leave(el, done) {
        this.$refs.cdWrapper.style.transition = 'all 0.4s'
        const {x, y, scale} = this._getPosAndScale()
        this.$refs.cdWrapper.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.style.webkitTransform = `translate3d(${x}px,${y}px,0) scale(${scale})`
        this.$refs.cdWrapper.addEventListener('transitionend', done)
      },
      afterLeave() {
        this.$refs.cdWrapper.style.transition = ''
        this.$refs.cdWrapper.style.transform = ''
        this.$refs.cdWrapper.style.webKitTransform = ''
      },
      //位置缩放函数
      _getPosAndScale() {
        //小cd图片
        const targetWidth = 40
        const paddingLeft = 40
        const paddingBottom = 30
        const paddingTop = 80
        //大cd图片
        const width = window.innerWidth * 0.8
        const scale = targetWidth / width//缩放比例
        //要移动的xy轴
        const x = -(window.innerWidth / 2 - paddingLeft)
        const y = window.innerHeight - paddingTop - width / 2 - paddingBottom
        return {
          x,
          y,
          scale
        }
      },
      //控制音乐播放
      togglePlaying() {
        if (!this.songReady) {
          return
        }
        this.setPlayingState(!this.playingState)
        //暂停 时候歌曲也跟着暂停那个
        if (this.currentLyric) {
          this.currentLyric.togglePlay()
        }
      },
      //上一首
      prev() {
        //切换标记
        if (!this.songReady) {
          return
        }
        //如果列表只有一首歌
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex - 1
          if (index === -1) {
            index = this.playList.length - 1
          }
          this.setCurrentIndex(index)
          //新歌曲播放
          if (!this.playingState) {
            this.togglePlaying()
          }
        }

        this.songReady = false
      },
      //下一首
      next() {
        //切换标记
        if (!this.songReady) {
          return
        }
        //如果列表只有一首歌
        if (this.playList.length === 1) {
          this.loop()
        } else {
          let index = this.currentIndex + 1
          if (index === this.playList.length) {
            index = 0
          }
          this.setCurrentIndex(index)
          //新歌曲播放
          if (!this.playingState) {
            this.togglePlaying()
          }
        }

        this.songReady = false
      },
      //歌曲播放完了，自动播放下一首
      end() {
        //如果说是单曲循环的话
        if (this.mode === playMode.loop) {
          this.loop();
        } else {
          this.next();
        }
      },
      //循环播放
      loop() {
        this.$refs.audio.currentTime = 0;
        this.$refs.audio.play();
        if (this.currentLyric) {
          this.currentLyric.seek(0)
        }
      },
      //歌曲播放的ready
      ready() {
        this.songReady = true
        //在播放歌曲的时候
        this.savePlayHistory(this.currentSong)
      },
      //歌曲加载失败
      error() {
        this.songReady = true

      },
      //播放时间
      updateTime(e) {
        this.currentTime = e.target.currentTime
      },
      //格式化播放时间
      format(interval) {
        interval = interval | 0  //取整数
        const minute = interval / 60 | 0
        const second = this._pad(interval % 60)
        return `${minute}:${second}`
      },
      //秒数如果一位的在前面补0
      _pad(num, n = 2) {
        let len = num.toString().length
        while (len < n) {
          num = '0' + num
          len++
        }
        return num
      },
      //progressbar派发过来事件修改进度
      onProgressBarChange(percent) {
        const currentTime = this.currentSong.duration * percent
        this.$refs.audio.currentTime = currentTime
        if (!this.playingState) {
          this.togglePlaying()
        }
        if (this.currentLyric) {
          this.currentLyric.seek(currentTime * 1000)
        }
      },


      //获取歌词
      _getLyric() {
        api.getLyric(this.currentSong.id).then(res => {
          var reg = /^\w+\(({[^()]+})\)$/
          var matches = res.match(reg)
          if (matches) {
            var response = JSON.parse(matches[1])
          }
          const lyric = Base64.decode(response.lyric);
          this.currentLyric = new Lyric(lyric, this.handleLyric)
          if (this.playingState) {
            this.currentLyric.play()
          }
          console.log(this.currentLyric)

        })
          .catch(err => {
            this.currentLyric = null
            this.playingLyric = ''
            this.currentLineNum = 0
          })
      },
      //处理歌词
      handleLyric({lineNum, txt}) {
        this.currentLineNum = lineNum
        if (lineNum > 5) {
          //歌词的p标签
          let lineEl = this.$refs.lyricLine[lineNum - 5]
          //整个scroll滚动
          this.$refs.lyricList.scrollToElement(lineEl, 1000)
        } else {
          this.$refs.lyricList.scrollTo(0, 0, 1000)
        }
        this.playingLyric = txt
      },
      //滑动歌词
      middleTouchStart(e) {
        this.touch.initiated = true
        const touch = e.touches[0]
        this.touch.startX = touch.pageX
        this.touch.startY = touch.pageY
      },
      middleTouchMove(e) {
        if (!this.touch.initiated) {
          return
        }
        const touch = e.touches[0]
        const disX = touch.pageX - this.touch.startX
        const disY = touch.pageY - this.touch.startY
        //如果纵轴便宜大于横轴便宜的话六不应该移动
        if (Math.abs(disY) > Math.abs(disX)) {
          return
        }
        //歌词相对于距离 如果当前是cd的话，歌词的left 距离是0 如果当前是歌词那当前歌词的left是屏幕的宽度
        const left = this.currentShow === 'cd' ? 0 : -window.innerWidth
        //滑动的最大距离与最小距离
        const offsetWidth = Math.min(0, Math.max(-window.innerWidth, left + disX))
        //滑动所占比例
        this.touch.percent = Math.abs(offsetWidth / window.innerWidth)
        //设置元素滑动的位置
        this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style.webkitTransform = `translate3d(${offsetWidth}px,0,0)`
        //设置滑动过渡默认0
        this.$refs.lyricList.$el.style.transtionDuration = 0
        this.$refs.lyricList.$el.style.webkitTransitionDuration = 0

        //滑动中修改cd的透明度
        this.$refs.middleL.style.opacity = 1 - this.touch.percent
        this.$refs.middleL.style.transtionDuration = 0
        this.$refs.middleL.style.webkitTransitionDuration = 0
      },
      middleTouchEnd(e) {
        //歌词移动宽度
        let offsetWidth
        //cd透明度
        let opacity
        //从右往左滑动
        if (this.currentShow === 'cd') {
          if (this.touch.percent > 0.1) {
            offsetWidth = -window.innerWidth
            opacity = 0
            this.currentShow = 'lyric '
          } else {
            offsetWidth = 0
            opacity = 1
          }
        } else {
          //从左往右滑动
          if (this.touch.percent < 0.9) {
            offsetWidth = 0;
            opacity = 1
            this.currentShow = 'cd'
          } else {
            offsetWidth = -window.innerWidth
            opacity = 0
          }
        }
        const time = 300
        //设置元素滑动的位置
        this.$refs.lyricList.$el.style.transform = `translate3d(${offsetWidth}px,0,0)`
        this.$refs.lyricList.$el.style.webkitTransform = `translate3d(${offsetWidth}px,0,0)`
        //设置滑动过渡
        this.$refs.lyricList.$el.style.transtionDuration = `${time}ms`
        this.$refs.lyricList.$el.style.webkitTransitionDuration = `${time}ms`

        //修改cd的透明度
        this.$refs.middleL.style.opacity = opacity
        this.$refs.middleL.style.transtionDuration = `${time}ms`
        this.$refs.middleL.style.webkitTransitionDuration = `${time}ms`
      },
      //显示播放列表
      showPlaylist() {

        this.$refs.playlist.show()
      },
    },
    watch: {
      currentSong(newSong, oldSong) {
        if (!newSong.id) {
          return
        }
        //如果切换播放模式的时候，当前暂停的歌曲不在播放
        if (newSong.id === oldSong.id) {
          return
        }
        //如果有当前歌词暂停
        if (this.currentLyric) {
          this.currentLyric.stop()
        }
        setTimeout(() => {
          this.$refs.audio.play()
          this._getLyric();
        }, 1000)
      },
      //playing状态
      playingState(newPlaying) {
        const audio = this.$refs.audio
        this.$nextTick(() => {
          newPlaying ? audio.play() : audio.pause()
        })
      },
    }
  }
</script>
<style lang="scss" type="text/scss" scoped>
  @import "../../assets/style/variable";
  @import "../../assets/style/mixin";

  .player {
    .normal-player {
      position: fixed;
      left: 0;
      right: 0;
      top: 0;
      bottom: 0;
      z-index: 150;
      background: $color-background;
      .background {
        position: absolute;
        left: 0;
        top: 0;
        width: 100%;
        height: 100%;
        z-index: -1;
        opacity: 0.6;
        filter: blur(20px);
      }
      .top {
        position: relative;
        margin-bottom: 25px;
        .back {
          position: absolute;
          top: 0;
          left: 6px;
          z-index: 50;
          .icon-back {
            display: block;
            padding: 9px;
            font-size: $font-size-large-x;
            color: $color-theme;
            transform: rotate(-90deg);
          }
        }
        .title {
          width: 70%;
          margin: 0 auto;
          line-height: 40px;
          text-align: center;
          @include no-wrap();
          font-size: $font-size-large;
          color: $color-text;
        }
        .subtitle {
          line-height: 20px;
          text-align: center;
          font-size: $font-size-medium;
          color: $color-text;
        }
      }
      .middle {
        position: fixed;
        width: 100%;
        top: 80px;
        bottom: 170px;
        white-space: nowrap;
        font-size: 0;
        .middle-l {
          display: inline-block;
          vertical-align: top;
          position: relative;
          width: 100%;
          height: 0;
          padding-top: 80%;
          .cd-wrapper {
            position: absolute;
            left: 10%;
            top: 0;
            width: 80%;
            height: 100%;
            .cd {
              width: 100%;
              height: 100%;
              box-sizing: border-box;
              border: 10px solid rgba(255, 255, 255, 0.1);
              border-radius: 50%;
              &.play {
                animation: rotate 20s linear infinite;
              }
              &.pause {
                animation-play-state: paused;
              }
              .image {
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                border-radius: 50%;
              }
            }

          }
          .playing-lyric-wrapper {
            width: 80%;
            margin: 30px auto 0 auto;
            overflow: hidden;
            text-align: center;
            .playing-lyric {
              height: 20px;
              line-height: 20px;
              font-size: $font-size-medium;
              color: $color-text-l;
            }
          }

        }
        .middle-r {
          display: inline-block;
          vertical-align: top;
          width: 100%;
          height: 100%;
          overflow: hidden;
          .lyric-wrapper {
            width: 80%;
            margin: 0 auto;
            overflow: hidden;
            text-align: center;
            .text {
              line-height: 32px;
              color: $color-text-l;
              font-size: $font-size-medium;
              &.current {
                color: $color-text;
              }
            }

          }
        }
      }
      .bottom {
        position: absolute;
        bottom: 50px;
        width: 100%;
        .dot-wrapper {
          text-align: center;
          font-size: 0;
          .dot {
            display: inline-block;
            vertical-align: middle;
            margin: 0 4px;
            width: 8px;
            height: 8px;
            border-radius: 50%;
            background: $color-text-l;
            &.active {
              width: 20px;
              border-radius: 5px;
              background: $color-text-ll;
            }
          }

        }
        .progress-wrapper {

          display: flex;
          align-items: center;
          width: 80%;
          margin: 0px auto;
          padding: 10px 0;
          .time {
            color: $color-text;
            font-size: $font-size-small;
            flex: 0 0 30px;
            line-height: 30px;
            width: 30px;
            &.time-l {
              text-align: left;
            }
            &.time-r {
              text-align: right;
            }
          }
          .progress-bar-wrapper {
            flex: 1;
          }
        }
        .operators {
          display: flex;
          align-items: center;
          .icon {
            flex: 1;
            color: $color-theme;
            &.disable {
              color: $color-theme-d;
            }
            i {
              font-size: 30px
            }
          }
          .i-left {
            text-align: right
          }
          .i-center {
            padding: 0 20px;
            text-align: center;
            i {
              font-size: 40px;
            }
          }

          .i-right {
            text-align: left;
          }
          .icon-favorite {
            color: $color-sub-theme;
          }
        }
      }
      &.normal-enter-active, &.normal-leave-active {
        transition: all 0.3s;
        .top, .bottom {
          transition: all 0.4s cubic-bezier(0.86, 0.18, 0.82, 1.32)
        }
      }
      &.normal-enter, &.normal-leave-to {
        opacity: 0;
        .top {
          transform: translate3d(0, -100px, 0);
        }
        .bottom {
          transform: translate3d(0, 100px, 0);
        }
      }
    }
    .mini-player {
      display: flex;
      align-items: center;
      position: fixed;
      left: 0;
      bottom: 0;
      z-index: 180;
      width: 100%;
      height: 60px;
      background: $color-highlight-background;
      &.mini-enter-active, &.mini-leave-active {
        transition: all 0.4s;
      }
      &.mini-enter, &.mini-leave-to {
        opacity: 0;
      }
      .icon {
        flex: 0 0 40px;
        width: 40px;
        padding: 0 10px 0 20px;
        img {
          border-radius: 50%;
          &.play {
            animation: rotate 10s linear infinite;
          }
          &.pause {
            animation-play-state: paused;
          }
        }
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        .name {
          margin-bottom: 2px;
          @include no-wrap();
          font-size: $font-size-medium;
          color: $color-text;
        }
        .desc {
          @include no-wrap();
          font-size: $font-size-small;
          color: $color-text-d;
        }
      }
      .control {
        flex: 0 0 30px;
        width: 30px;
        padding: 0 10px;
        .icon-play-mini, .icon-pause-mini, .icon-playlist {
          font-size: 30px;
          color: $color-theme-d;
        }
        .icon-mini {
          font-size: 32px;
          position: absolute;
          left: 0;
          top: 0;
        }
      }
    }
  }

  @keyframes rotate {
    0% {
      transform: rotate(0);
    }
    100% {
      transform: rotate(360deg);
    }
  }

</style>
