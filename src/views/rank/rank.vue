<template>
  <div class="rank" ref="rank">
    <scroll :data="topList" class="toplist" ref="toplist">
      <ul>
        <li class="item" v-for="item in topList" @click="selectItem(item)">
          <div class="icon">
            <img width="100" height="100" v-lazy="item.picUrl"/>
          </div>
          <ul class="songlist">
            <li class="song" v-for="(song,index) in item.songList">
              <span>{{index + 1}}</span>
              <span>{{song.songname}}-{{song.singername}}</span>
            </li>
          </ul>
        </li>
      </ul>
      <div class="loading-container" v-show="!topList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>
<script>
  import api from './../../api/api'//接口地址
  import Scroll from './../../components/scroll/scroll'
  import Loading from './../../components/loading/loading'
  import {playlistMixin} from './../../assets/js/mixin'
  import {mapMutations} from 'vuex'
  export default {
    name: 'rank',
    mixins: [playlistMixin],
    data () {
      return {
        topList: []
      }
    },
    components: {
      Scroll,
      Loading
    },
    created(){
      this._getTopList();
    },
    methods: {
      ...mapMutations({
        setTopList: 'SET_TOP_LIST'
      }),
      //处理播放中bottom
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.rank.style.bottom = bottom
        this.$refs.toplist.refresh()
      },

      //获取数据
      _getTopList(){
        api.getTopList().then(res => {
          this.topList = res.data.topList
        }).catch(err => {
          console.log(err)
        })
      },
      //点击排行榜
      selectItem(item){
        this.$router.push({
          path: `/rank/${item.id}`
        })
        this.setTopList(item)
      }
    },
    watch: {
      topList() {
        setTimeout(() => {
          this.$Lazyload.lazyLoadHandler()
        }, 20)
      }
    },
  }
</script>
<style lang="scss" type="text/scss" scoped>
  @import "./../../assets/style/variable";
  @import "./../../assets/style/mixin";

  .rank {
    position: fixed;
    width: 100%;
    top: 88px;
    bottom: 0;
  }

  .toplist {
    height: 100%;
    overflow: hidden;
    .item {
      display: flex;
      margin: 0 20px;
      padding-top: 20px;
      height: 100px;
      &:last-child {
        padding-bottom: 20px;
      }
    }
    .icon {
      flex: 0 0 100px;
      width: 100px;
      height: 100px;
    }
  }

  .songlist {
    flex: 1;
    display: flex;
    flex-direction: column;
    justify-content: center;
    padding: 0 20px;
    height: 100px;
    overflow: hidden;
    background: $color-highlight-background;
    color: $color-text-d;
    font-size: $font-size-small;
  }

  .song {
    @include no-wrap();
    line-height: 26px;
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
