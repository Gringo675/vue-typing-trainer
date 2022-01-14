<template>
  <Main />
</template>

<script>
import Main from './components/main.vue'

export default {
  name: 'App',
  components: {
    Main
  }
}
</script>

<style lang="scss">
  @import url('https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap');

#app {
  font-family: 'Play', sans-serif;
  font-size: 20px;
  color: #2c3e50;
  margin-top: 60px;
  text-align: center;
}
</style>
