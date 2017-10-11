<template>
  <div class="search">
    <div class="search-box-wrapper">
      <search-box ref="searchBox" @query="onQueryChange"></search-box>
    </div>
    <div ref="shortcutWrapper" class="shortcut-wrapper" v-show="!query">
      <scroll ref="shortcut" class="shortcut" :data="shortcut">
        <div>
          <div class="hot-key">
            <h1 class="title">热门搜索</h1>
            <ul>
              <li @click="addQuery(item.k)" class="item" v-for="item in hotKey">
                <span>{{item.k}}</span>
              </li>
            </ul>
          </div>
          <div class="search-history" v-show="searchHistory.length">
            <h1 class="title">
              <span class="text">搜索历史</span>
              <span class="clear" @click="showConfirm" >
                <i class="icon-clear"></i>
              </span>
            </h1>
            <search-list :searches="searchHistory" @delete="deleteSearchHistory" @select="addQuery"></search-list>
          </div>
        </div>
      </scroll>
    </div>
    <!--搜索结果-->
    <div class="search-result" v-show="query" ref="searchResult">
      <suggest ref="suggest" @listScroll="blurInput" @select="saveSearch" :query="query"></suggest>
    </div>
    <!--清除所有-->
    <confirm ref="confirm" @confirm="clearSearchHistory" text="是否清空所有搜索历史" confirmBtnText="清空"></confirm>
    <router-view></router-view>
  </div>
</template>
<script>
  import api from './../../api/api'//接口地址
  import SearchBox from './../../components/searchBox/searchBox'
  import SearchList from './../../components/searchList/searchList'
  import Suggest from './../../components/suggest/suggest'
  import Scroll from './../../components/scroll/scroll'
  import Confirm from './../../components/confirm/confirm'
  import {mapActions, mapGetters} from 'vuex'
  import {playlistMixin,searchMixin} from './../../assets/js/mixin'
  export default {
    mixins: [playlistMixin,searchMixin],
    data () {
      return {
        hotKey: [],//搜索热门
        query: '',//搜索词
      }
    },
    computed: {
      shortcut() {
        return this.hotKey.concat(this.searchHistory)
      }
    },
    components: {
      SearchBox,
      SearchList,
      Suggest,
      Scroll,
      Confirm
    },
    created(){
      this._getHotKey();
    },
    methods: {
      ...mapActions([
        'saveSearchHistory',
        'deleteSearchHistory',
        'clearSearchHistory'
      ]),
      //播放器高度
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''

        this.$refs.searchResult.style.bottom = bottom
        this.$refs.suggest.refresh()

        this.$refs.shortcutWrapper.style.bottom = bottom
        this.$refs.shortcut.refresh()
      },
      //获取热门关键词
      _getHotKey(){
        api.getHotKey().then(res => {
          this.hotKey = res.data.hotkey.slice(0, 10)
        }).catch(err => {
          console.log(res)
        })
      },
      //清除所有
      showConfirm() {
        this.$refs.confirm.show()
      },
    },
    watch: {
      query(newQuery) {
        if (!newQuery) {
          setTimeout(() => {
            this.$refs.shortcut.refresh()
          }, 20)
        }
      }
    },
  }
</script>
<style lang="scss" type="text/scss" scoped>
  @import "./../../assets/style/variable";
  @import "./../../assets/style/mixin";

  .search {
    .search-box-wrapper {
      margin: 20px;
    }
  }

  .shortcut-wrapper {
    position: fixed;
    top: 178px;
    bottom: 0;
    width: 100%;
  }

  .shortcut {
    height: 100%;
    overflow: hidden;
  }

  .hot-key {
    margin: 0 20px 20px 20px;
    .title {
      margin-bottom: 20px;
      font-size: $font-size-medium;
      color: $color-text-l;
    }
  }

  .item {
    display: inline-block;
    padding: 5px 10px;
    margin: 0 20px 10px 0;
    border-radius: 6px;
    background: $color-highlight-background;
    font-size: $font-size-medium;
    color: $color-text-d;
  }

  .search-history {
    position: relative;
    margin: 0 20px;
    .title {
      display: flex;
      align-items: center;
      height: 40px;
      font-size: $font-size-medium;
      color: $color-text-l;
    }
  }

  .text {
    flex: 1;
  }

  .clear {
    @include extend-click();
  }

  .icon-clear {
    font-size: $font-size-medium;
    color: $color-text-d;
  }

  .search-result {
    position: fixed;
    width: 100%;
    top: 178px;
    bottom: 0;
  }
</style>
