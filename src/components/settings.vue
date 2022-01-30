<template>
  <div class="settingsBlock">
    <div>
      <span>Количество</span>
      <input type="text" v-model="newSettings.wordsQuantity">
    </div>
    <div>
      <span>Добавить заглавные</span>
      <input type="checkbox" v-model="newSettings.addUpperCase">
    </div>
    <div>
      <span>Добавить цифры</span>
      <input type="checkbox" v-model="newSettings.addNumbers">
    </div>
    <div>
      <span>Добавить символы</span>
      <input type="checkbox" v-model="newSettings.addSymbols">
    </div>
  </div>
</template>

<script>

// eslint-disable-next-line no-unused-vars
import {ref, onBeforeUnmount} from 'vue'

export default {
  name: "settings",
  components: {},
  props: {
    settings: {
      type: Object,
    }
  },
  setup(props, {emit}) {
    // let quantity = ref(props.settings.wordsQuantity)
    // const newSettings =   ref(props.settings)
    // const newSettings = toRef(props, 'settings')
    const newSettings =   ref({...props.settings})

    onBeforeUnmount(() => {
      // console.log(`props.settings: ${JSON.stringify(props.settings)}`);
      // console.log(`newSettings: ${JSON.stringify(newSettings.value)}`);
      // if (JSON.stringify(newSettings.value) != JSON.stringify(props.settings)) emit('updateSettings', newSettings.value)
      if (newSettings.value.wordsQuantity !== props.settings.wordsQuantity ||
          newSettings.value.addUpperCase !== props.settings.addUpperCase ||
          newSettings.value.addNumbers !== props.settings.addNumbers ||
          newSettings.value.addSymbols !== props.settings.addSymbols) emit('updateSettings', newSettings.value)
    })

    return {
      newSettings
    }
  },
  data() {
    return {}
  },
  methods: {},
  computed: {},
  watch: {},
  mounted() {
  },
}
</script>

<style lang="scss">
.settingsBlock {
  width: 250px;
  height: 300px;
  position: absolute;
  box-sizing: border-box;
  border: 2px solid #76e0b0;
  border-radius: 20px;
  padding: 20px;
  background: #fffeef;
  right: 0px;
  top: 60px;
}
</style>