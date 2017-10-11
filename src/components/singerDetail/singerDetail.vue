<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import api from '../../api/api'//接口地址
  import {createSong} from '../../assets/js/song'
  import MusicList from '../musicList/musicList'
  import {mapGetters} from 'vuex'
  export default {
    name: '',
    data () {
      return {
          songs:[]
      }
    },
    computed: {
      ...mapGetters([
        'singer'
      ]),
      title() {
        return this.singer.name
      },
      bgImage() {
        return this.singer.avatar
      },
    },
    created(){
      this._getSingerDetail()
    },
    components: {
      MusicList
    },
    methods: {
      _getSingerDetail(){
        if (!this.singer.id) {
          this.$router.push('/singer')
          return
        }
        const singerId = this.singer.id
        api.getSingerDetail(singerId).then(res => {
          this.songs = this.formatSongs(res.data.list)
        })
          .catch(err => {
            console.log(err)
          })
      },
      formatSongs(list){
        let ret = []
        list.forEach((item) => {
          let {musicData} = item
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
    transition: all 0.3s
  }

  .slide-enter, .slide-leave-to {
    transform: translate3d(100%, 0, 0)
  }
</style>
