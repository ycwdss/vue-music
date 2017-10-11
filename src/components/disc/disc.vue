<template>
  <transition name="slide">
    <music-list :title="title" :bg-image="bgImage" :songs="songs"></music-list>
  </transition>
</template>
<script>
  import {createSong} from './../../assets/js/song'
  import api from './../../api/api'//接口地址
  import MusicList from '../musicList/musicList'
  import {mapGetters} from 'vuex'
  export default {
    name: '',
    data () {
      return {
        songs: []
      }
    },
    created(){
      this._getSongList()
    },
    components: {
      MusicList
    },
    computed: {
      ...mapGetters([
        'disc'
      ]),
      title() {
        return this.disc.dissname
      },
      bgImage() {
        return this.disc.imgurl
      },
    },
    methods: {
      _getSongList(){
        if(!this.disc.dissid){
          this.$router.push('/recommend')
            return
        }

        api.getSongList(this.disc.dissid).then(res => {
          this.songs=this.formatSongs(res.cdlist[0].songlist)
        }).catch(err => {
          console.log(err)
        })
      },
      //格式化
      formatSongs(list){
      let ret=[]
        list.forEach((musicData)=>{
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

</style>
