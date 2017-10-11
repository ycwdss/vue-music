<template>
  <div id="app">
    <v-header></v-header>
    <Tab></Tab>
    <keep-alive>
      <router-view></router-view>
    </keep-alive>
    <player></player>
  </div>
</template>

<script>
  import Header from './components/header/header'
  import Tab from './components/tab/tab'
  import Player from './components/player/player'
  export default {
    components: {
      'v-header': Header,
      Tab,
      Player
    }
  }
</script>

<style>

</style>
