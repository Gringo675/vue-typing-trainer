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
  @import '@/assets/css/reset.scss';
  @import url('https://fonts.googleapis.com/css2?family=Play:wght@400;700&display=swap');

#app {
  font-family: 'Play', sans-serif;
  font-size: 22px;
  color: #2c3e50;
  background-color: #6bb3ba;
  background-image: linear-gradient(90deg, rgba(255,255,255,.07) 50%, transparent 50%),
  linear-gradient(90deg, rgba(255,255,255,.13) 50%, transparent 50%),
  linear-gradient(90deg, transparent 50%, rgba(255,255,255,.17) 50%),
  linear-gradient(90deg, transparent 50%, rgba(255,255,255,.19) 50%);
  background-size: 13px, 29px, 37px, 53px;
}
</style>
