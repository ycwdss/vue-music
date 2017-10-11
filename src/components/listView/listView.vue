<template>
  <scroll @scroll="scroll"
          :listen-scroll="listenScroll"
          :probe-type="probeType"
          :data="data"
          class="listview"
          ref="listview">
    <ul>
      <li v-for="group in data" class="list-group" ref="listGroup">
        <h2 class="list-group-title">{{group.title}}</h2>
        <ul>
          <li v-for="item in group.items" class="list-group-item" @click="selectItem(item)">
            <img class="avatar" v-lazy="item.avatar">
            <span class="name">{{item.name}}</span>
          </li>
        </ul>
      </li>
    </ul>
    <div class="list-shortcut"
         @touchstart.stop.prevent="onShortcutTouchStart"
         @touchmove.stop.prevent="onShortcutTouchMove"
         @touchend.stop>
      <ul>
        <li v-for="(item,index) in shortcutList" class="item" :data-index="index"
            :class="{'current':currentIndex===index}">{{item}}
        </li>
      </ul>
    </div>
    <div class="list-fixed" ref="fixed" v-show="fixedTitle">
      <div class="fixed-title">{{fixedTitle}}</div>
    </div>
    <div v-show="!data.length" class="loading-container">
      <loading></loading>
    </div>
  </scroll>
</template>
<script>
  import Scroll from './../../components/scroll/scroll'
  import Loading from './../../components/loading/loading'

  const TITLE_HEIGHT = 30 //固定title高度
  const ANCHOR_HEIGHT = 18 //字母的高度
  export default {
    name: 'listview',
    props: {
      data: {
        type: Array,
        default: []
      }
    },
    data () {
      return {
        scrollY: -1, //滚动高度
        currentIndex: 0,//当前index
        diff: -1 //滚动查
      }
    },
    components: {
      Scroll,
      Loading
    },
    created(){
      this.probeType = 3
      this.touch = {}
      this.listenScroll = true //是否监听滚动
      this.listHeight = [] //Group高度集合
    },
    computed: {
      shortcutList(){
        return this.data.map((group) => {
          return group.title.substr(0, 1)
        })
      },
      //title设置
      fixedTitle() {
        if (this.scrollY > 0) {
          return ''
        }
        return this.data[this.currentIndex] ? this.data[this.currentIndex].title : ''
      }
    },
    methods: {
      //点击向父组件派发事件传item
      selectItem(item) {
        this.$emit('select', item)
      },
      onShortcutTouchStart(e){
        let anchorIndex = e.target.getAttribute('data-index')
        this.touch.y1 = e.touches[0].pageY //第一次按下的时候y轴
        this.touch.anchorIndex = anchorIndex //第一次按下的时候 锚点

        this.scrollTo(anchorIndex)
      },
      onShortcutTouchMove(e){
        this.touch.y2 = e.touches[0].pageY
        let disAnchor = (this.touch.y2 - this.touch.y1 ) / ANCHOR_HEIGHT | 0 //移动离第一次按下的距离/锚点高度==偏移几个锚点
        let anchorIndex = parseInt(this.touch.anchorIndex) + disAnchor //移动中index
        console.log(anchorIndex)
        this.scrollTo(anchorIndex)
      },
      refresh() {
        this.$refs.listview.refresh()
      },
      //滚动时的y轴距离
      scroll(pos) {
        this.scrollY = pos.y
      },
      _calculateHeight() {
        //计算每个group的y轴的高度
        this.listHeight = []
        const list = this.$refs.listGroup
        let height = 0
        this.listHeight.push(height)
        for (let i = 0; i < list.length; i++) {
          height += list[i].clientHeight
          this.listHeight.push(height)
        }
      },
      scrollTo(index) {
        //边界处理
        if (!index && index !== 0) {
          return
        }
        if (index < 0) {
          index = 0
        } else if (index > this.listHeight.length - 2) {
          index = this.listHeight.length - 2
        }
        this.scrollY = -this.listHeight[index]
        this.$refs.listview.scrollToElement(this.$refs.listGroup[index], 0)
      }
    },
    watch: {
      data() {
        setTimeout(() => {
          this._calculateHeight()
        }, 20)
      },
      //检测scrollY变化与_calculateHeight比较
      scrollY(newY){
        const listHeight = this.listHeight
        // 当滚动到顶部，newY>0
        if (newY > 0) {
          this.currentIndex = 0
          return
        }
        // 在中间部分滚动
        for (let i = 0; i < listHeight.length; i++) {
          let height1 = listHeight[i]
          let height2 = listHeight[i + 1]
          //组合在两个之间字母显示高亮
          if (-newY >= height1 && -newY < height2) {
            this.currentIndex = i
            this.diff = height2 + newY //两者之差
            return
          }
        }
        // 当滚动到底部，且-newY大于最后一个元素的上限
        this.currentIndex = listHeight.length - 2
      },
      diff(newVal) {
        //如果大于0并且小于了TITLE_HEIGHT
        let fixedTop = (newVal > 0 && newVal < TITLE_HEIGHT) ? newVal - TITLE_HEIGHT : 0
        if (this.fixedTop === fixedTop) {
          return
        }
        this.fixedTop = fixedTop
        this.$refs.fixed.style.transform = `translate3d(0,${fixedTop}px,0)`
      }
    }
  }
</script>
<style lang="scss" type="text/scss" scoped>
  @import "./../../assets/style/variable";

  .listview {
    position: relative;
    width: 100%;
    height: 100%;
    overflow: hidden;
    background: $color-background;
  }

  .list-group {
    padding-bottom: 30px;
    .list-group-title {
      height: 30px;
      line-height: 30px;
      padding-left: 20px;
      font-size: $font-size-small;
      color: $color-text-l;
      background: $color-highlight-background;
    }
  }

  .list-group-item {
    display: flex;
    align-items: center;
    padding: 20px 0 0 30px;
    .avatar {
      width: 50px;
      height: 50px;
      border-radius: 50%;
    }
    .name {
      margin-left: 20px;
      color: $color-text-l;
      font-size: $font-size-medium;
    }
  }

  .list-shortcut {
    position: absolute;
    z-index: 30;
    right: 0;
    top: 50%;
    transform: translateY(-50%);
    width: 20px;
    padding: 20px 0;
    border-radius: 10px;
    text-align: center;
    background: $color-background-d;
    font-family: 'Helvetica';
  }

  .item {
    padding: 3px;
    line-height: 1;
    color: $color-text-l;
    font-size: $font-size-small;
    &.current {
      color: $color-theme
    }
  }

  .list-fixed {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
  }

  .fixed-title {
    height: 30px;
    line-height: 30px;
    padding-left: 20px;
    font-size: $font-size-small;
    color: $color-text-l;
    background: $color-highlight-background;
  }

  .loading-container {
    position: absolute;
    width: 100%;
    top: 50%;
    transform: translateY(-50%);
  }
</style>
