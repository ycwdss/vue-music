<template>
  <div class='recommend' ref="recommend">
    <scroll ref="scroll" class="recommend-content" :data="discList">
      <div>
        <swiper class="recommend-slider" :options="swiperOption">
          <swiper-slide v-for="item in recommends" key="index">
            <a class="slider-img" :link="item.linkUrl"><img @load="loadImage" :src="item.picUrl"></a>
          </swiper-slide>
          <div class="swiper-pagination" slot="pagination"></div>
        </swiper>
        <div class="recommend-list">
          <h1 class="list-title">热门歌单推荐</h1>
          <ul>
            <li v-for="item in discList" class="item" @click="selectItem(item)">
              <div class="icon">
                <img width="60" height="60" v-lazy="item.imgurl">
              </div>
              <div class="text">
                <h2 class="name" v-html="item.author"></h2>
                <p class="desc" v-html="item.dissname"></p>
              </div>
            </li>
          </ul>
        </div>
      </div>
      <div class="loading-container" v-show="!discList.length">
        <loading></loading>
      </div>
    </scroll>
    <router-view></router-view>
  </div>
</template>
<script>
  import api from '../../api/api'//接口地址
  import {swiper, swiperSlide} from 'vue-awesome-swiper'
  import Scroll from '../scroll/scroll'
  import Loading from '../loading/loading'
  import {playlistMixin} from '../../assets/js/mixin'
  import {mapMutations} from 'vuex'
  export default {
    name: 'recommend',
    mixins: [playlistMixin],
    data () {
      return {
        recommends: [],
        discList: [],
        swiperOption: {
          pagination: '.swiper-pagination',
          paginationClickable: true,
          spaceBetween: 30,
          centeredSlides: true,
          autoplay: 2500,
          autoplayDisableOnInteraction: false
        },
      }
    },
    components: {
      swiper,
      swiperSlide,
      Scroll,
      Loading
    },
    created(){
      this._getSilder();
      this._getDiscList();
    },
    methods: {
      ...mapMutations({
        setDisc: 'SET_DISC'
      }),
      loadImage() {
        if (!this.checkloaded) {
          this.checkloaded = true
          this.$refs.scroll.refresh()
        }
      },
      _getSilder(){
        api.getSilder().then(res => {
          this.recommends = res.data.slider
        })
          .catch(err => {
            console.log(err)
          })
      },
      _getDiscList(){
        api.getDiscList().then(res => {
          this.discList = res.data.hotdiss.list
        })
          .catch(err => {
            console.log(err)
          })
      },
      //处理playlist
      handlePlaylist(playlist) {
        const bottom = playlist.length > 0 ? '60px' : ''
        this.$refs.recommend.style.bottom = bottom
        this.$refs.scroll.refresh()
      },
      selectItem(item) {
        this.$router.push({
          path: `/recommend/${item.dissid}`
        })
        this.setDisc(item)
      },
    },

  }
</script>
<style lang="scss" type="text/scss">
  @import "../../assets/style/variable";

  .recommend {
    width: 100%;
    position: fixed;
    top: 88px;
    bottom: 0;
  }

  .recommend-content {
    height: 100%;
    overflow: hidden;
  }

  .recommend-slider {
    position: relative;
    width: 100%;
    overflow: hidden;
    .slider-img {
      display: block;
      img {
        display: block;
        width: 100%;
      }
    }
    .swiper-pagination {
      .swiper-pagination-bullet {
        width: 8px;
        height: 8px;
        border-radius: 50%;
        background: $color-text-l;
      }
      .swiper-pagination-bullet-active {
        width: 20px;
        border-radius: 5px;
        background: $color-text-ll;
      }
    }
  }

  .recommend-list {
    .list-title {
      height: 65px;
      line-height: 65px;
      text-align: center;
      font-size: $font-size-medium;
      color: $color-theme;
    }
    .item {
      display: flex;
      box-sizing: border-box;
      align-items: center;
      padding: 0 20px 20px 20px;
      .icon {
        flex: 0 0 60px;
        width: 60px;
        padding-right: 20px;
      }
      .text {
        display: flex;
        flex-direction: column;
        justify-content: center;
        flex: 1;
        line-height: 20px;
        overflow: hidden;
        font-size: $font-size-medium;
        .name {
          margin-bottom: 10px;
          color: $color-text;
        }
        .desc {
          color: $color-text;
        }
      }

    }
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
