/**
 * Created by wang on 2017/7/10.
 */
import axios from 'axios'
import qs from 'qs'

// 使用代理
const HOST = '/api/';
const HOST2 = '/lyric/'
const ERR_OK = 0

// 全局 axios 默认配置
var instance = axios.create({
  // baseURL: "http://121.41.37.19:8081/urfresh/pms/app/v1/", //配置接口地址
  timeout: 5000,                                            //响应时间
  headers: {'content-Type': 'application/x-www-form-urlencoded'}
});


//POST传参序列化(添加请求拦截器)
instance.interceptors.request.use((config) => {
  //在发送请求之前做某件事
  if (config.method === 'post') {
    config.data = qs.stringify(config.data);
  }
  return config;
}, (error) => {
  console.log(error)
  return Promise.reject(error);
});


//返回一个Promise(发送post请求)
export function fetch(url, params) {
  return new Promise((resolve, reject) => {
    instance.get(HOST + url, {
      params: params
    })
      .then(response => {
        if (response.data.code == ERR_OK) {
          resolve(response.data);
        }
      }, err => {
        reject(err);
      })
      .catch((error) => {
        reject(error)
      })
  })
}
export function fetch2(url, params) {
  return new Promise((resolve, reject) => {
    instance.get(HOST2 + url, {
      params: params
    })
      .then(response => {
        resolve(response.data);
      }, err => {
        reject(err);
      })
      .catch((error) => {
        reject(error)
      })
  })
}

export default  {
  /*
   获取slider轮播
   * */
  getSilder(){
    return fetch('musichall/fcgi-bin/fcg_yqqhomepagerecommend.fcg')
  },
  /*
   * 热门推荐
   * */
  getDiscList(){
    const params = {
      tpl: 'v12',
      page: 'other',
      rnd: Math.random(),
      g_tk: 5381,
      loginUin: 0,
      hostUin: 0,
      format: 'json',
      inCharset: 'utf8',
      outCharset: 'GB2312',
      notice: 0,
      platform: 'yqq',
      needNewCode: 0
    }
    return fetch('v8/fcg-bin/fcg_first_yqq.fcg', params)
  },
  /*
   * 歌手列表
   * */
  getSingerList(){
    const params = {
      channel: 'singer',
      page: 'list',
      key: 'all_all_all',
      pagesize: 100,
      pagenum: 1,
      hostUin: 0,
      needNewCode: 0,
      platform: 'yqq',
      g_tk: 1928093487,
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      format: 'json'
    }
    return fetch('v8/fcg-bin/v8.fcg', params)
  },
  /*
   * 获取歌手详情
   * */
  getSingerDetail(singerId){
    const params = {
      hostUin: 0,
      needNewCode: 0,
      platform: 'yqq',
      order: 'listen',
      begin: 0,
      num: 80,
      songstatus: 1,
      singermid: singerId
    }
    return fetch('v8/fcg-bin/fcg_v8_singer_track_cp.fcg', params)
  },
  /*
   * 抓取歌词
   * */
  getLyric(id){
    return fetch2('music/lyric/' + id + '/')
  },
  /*
  * 推荐歌曲歌单
  * */
  getSongList(disstid){
    const params={
      g_tk: 1928093487,
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      disstid:disstid,
      type: 1,
      json: 1,
      utf8: 1,
      onlysong: 0,
      platform: 'yqq',
      hostUin: 0,
      needNewCode: 0,
      format:'json',
    }
    return fetch('qzone/fcg-bin/fcg_ucc_getcdinfo_byids_cp.fcg',params)
  },
  /*
  * 歌曲排行榜
  * */
  getTopList(){
    const params={
      g_tk: 1928093487,
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      notice: 0,
      format: 'json',
      uin: 0,
      needNewCode: 1,
      platform: 'h5'
    }
    return fetch('v8/fcg-bin/fcg_myqq_toplist.fcg',params)
  },
  /*
  * 排行榜歌曲列表
  * */
  getMusicList(topid){
    const params={
      g_tk: 1928093487,
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      topid,
      needNewCode: 1,
      uin: 0,
      tpl: 3,
      page: 'detail',
      type: 'top',
      platform: 'h5'
    }
    return fetch('v8/fcg-bin/fcg_v8_toplist_cp.fcg',params)
  },
  /*
  * 热门搜索
  * */
  getHotKey(){
    const params={
      g_tk: 1928093487,
      inCharset: 'utf-8',
      outCharset: 'utf-8',
      uin: 0,
      needNewCode: 1,
      platform: 'h5',
      format:'json'
    }
    return fetch('splcloud/fcgi-bin/gethotkey.fcg',params)
  },
  /*
  * 搜索
  * */
  search(query,page,zhida,perpage){
    // 搜索 页数 是否直达歌曲，每页显示数量
    const params={
      w: query,
      p: page,
      perpage,
      n: perpage,
      catZhida: zhida ? 1 : 0,
      zhidaqu: 1,
      t: 0,
      flag: 1,
      ie: 'utf-8',
      sem: 1,
      aggr: 0,
      remoteplace: 'txt.mqq.all',
      uin: 0,
      needNewCode: 1,
      platform: 'h5',
      format:'json'
    }
    return fetch('soso/fcgi-bin/search_for_qq_cp',params)
  }
}
