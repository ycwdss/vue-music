<template>
  <transition name="silde">
    <music-list :rank="rank" :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import api from './../../api/api'//接口地址
  import MusicList from '../musicList/musicList'
  import {createSong} from './../../assets/js/song'
  import {mapGetters} from 'vuex'
  export default {
    name: '',
    data () {
      return {
        songs: [],
        rank: true
      }
    },
    created(){
      this._getMusicList()
    },
    computed: {
      ...mapGetters([
        'topList'
      ]),
      title(){
        return this.topList.topTitle
      },
      bgImage(){
        if (this.songs.length) {
          return this.songs[0].image
        }
        return ''
      }
    },
    components: {
      MusicList
    },
    methods: {
      _getMusicList(){
        if (!this.topList.id) {
          this.$router.push('/rank')
          return
        }
        api.getMusicList(this.topList.id).then(res => {

          this.songs = this.formatSongs(res.songlist)
        }).catch(err => {
          console.log(err)
        })
      },
      //格式化
      formatSongs(list){
        let ret = []
        list.forEach((item) => {
          const musicData = item.data
          if (musicData.songid && musicData.albummid) {
            ret.push(createSong(musicData))
          }
        })
        return ret
      }
    }
  }
</script>
<style lang="scss" type="text/scss" scoped>
  .slide-enter-active, .slide-leave-active {
    transition: all 0.3s ease
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0)
  }
</style>
