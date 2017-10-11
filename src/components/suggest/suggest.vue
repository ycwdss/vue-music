<template>
  <Scroll class="suggest"
          ref="suggest"
          :data="result"
          :pullup="pullup"
          @scrollToEnd="searchMore"
          :beforeScroll="beforeScroll"
          @beforeScroll="listScroll"
  >
    <ul class="suggest-list">
      <li class="suggest-item" v-for="item in result" @click="selectItem(item)">
        <div class="icon">
          <i :class="getIconCls(item)"></i>
        </div>
        <div class="name">
          <p class="text" v-html="getDisplayName(item)"></p>
        </div>
      </li>
      <loading v-show="hasMore" title=""></loading>
    </ul>
    <div v-show="!hasMore && !result.length" class="no-result-wrapper">
      <no-result title="抱歉，暂无搜索结果"></no-result>
    </div>
  </Scroll>
</template>
<script>
  import api from './../../api/api'//接口地址
  import Scroll from './../../components/scroll/scroll'
  import Loading from './../../components/loading/loading'
  import noResult from './../../components/noResult/noResult'
  import {createSong} from './../../assets/js/song'
  import Singer from './../../assets/js/singer'
  import {mapMutations, mapActions} from 'vuex'
  const TYPE_SINGER = 'singer'
  const perpage = 20

  export default {
    props: {
      query: {
        type: String,
        default: ''
      },
      showSinger: {
        //是否显示歌手
        type: Boolean,
        default: true
      },
    },
    data () {
      return {
        page: 1,
        result: [],//搜索结果
        pullup: true,
        hasMore: true,
        beforeScroll: true,
      }
    },
    components: {
      Scroll,
      Loading,
      noResult,
    },
    watch: {
      query(newQuery) {
        console.log(newQuery)
        this.search(newQuery)
      },
    },
    methods: {
      ...mapMutations({
        setSinger: 'SET_SINGER'
      }),
      ...mapActions([
        'insertSong'
      ]),
      refresh() {
        this.$refs.suggest.refresh()
      },
      search(){
        this.result = []
        this.page = 1
        this.hasMore = true
        this.$refs.suggest.scrollTo(0, 0)
        api.search(this.query, this.page, this.showSinger).then(res => {
          console.log(res)
          this.result = this.result.concat(this.formatResult(res.data))
          this._checkMore(res.data)
          console.log(this.result)
        }).catch(err => {
          console.log(err)
        })
      },
      //处理结果，
      formatResult(data){
        let result = []
        //如果有歌手处理结果
        if (data.zhida && data.zhida.singerid) {
          result.push({...data.zhida, ...{type: TYPE_SINGER}})
        }
        //处理歌曲
        if (data.song) {
          result = result.concat(this.formatSong(data.song.list))
        }
        return result
      },
      //处理歌曲
      formatSong(list){
        let result = []
        list.forEach((musicData) => {
          if (musicData.songid && musicData.albummid) {
            result.push(createSong(musicData))
          }
        })
        return result
      },
      //搜索结果前图标处理
      getIconCls(item){
        if (item.type === TYPE_SINGER) {
          return 'icon-mine'
        } else {
          return 'icon-music'
        }
      },
      //搜索结果名字
      getDisplayName(item) {
        if (item.type === TYPE_SINGER) {
          return item.singername
        } else {
          return `${item.name}-${item.singer}`
        }
      },
      //加载更改
      searchMore(){
        if (!this.hasMore) {
          return
        }
        this.page++
        api.search(this.query, this.page, this.showSinger).then(res => {
          this.result = this.result.concat(this.formatResult(res.data))
          this._checkMore(res.data)
        }).catch(err => {
          console.log(err)
        })
      },
      //是否搜索完
      _checkMore(data) {
        const song = data.song
        if (!song.list.length || (song.curnum + song.curpage * perpage) > song.totalnum) {
          this.hasMore = false
        }
      },
      //点击搜索出来的列表
      selectItem(item) {
        console.log(item)
        //如果是歌手
        if (item.type === TYPE_SINGER) {
          const singer = new Singer({
            id: item.singermid,
            name: item.singername
          })
          this.$router.push({
            path: `/search/${singer.id}`
          })
          this.setSinger(singer)
        } else {
          //如果是歌曲
          this.insertSong(item)
        }
        //派发到父组件 保存搜索数据
        this.$emit('select')
      },
      listScroll() {
        this.$emit('listScroll')
      },
    }
  }
</script>
<style lang="scss" type="text/scss" scoped>
  @import "./../../assets/style/variable";
  @import "./../../assets/style/mixin";

  .suggest {
    height: 100%;
    overflow: hidden;
  }

  .suggest-list {
    padding: 0 30px;
  }

  .suggest-item {
    display: flex;
    align-items: center;
    padding-bottom: 20px;
    .icon {
      flex: 0 0 30px;
      width: 30px;
      [class^="icon-"] {
        font-size: 14px;
        color: $color-text-d;
      }
    }
  }

  .name {
    flex: 1;
    font-size: $font-size-medium;
    color: $color-text-d;
    overflow: hidden;
  }

  .text {
    @include no-wrap();
  }

  .no-result-wrapper {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
