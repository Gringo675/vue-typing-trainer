<script>

// eslint-disable-next-line no-unused-vars
import vEditStory from './editStory'
import {onBeforeUnmount, ref} from 'vue'

export default {
  name: "settings",
  components: {vEditStory},
  props: {
    settings: {
      type: Object,
    }
  },
  setup(props, {emit}) {
    // let quantity = ref(props.settings.wordsQuantity)
    // const newSettings =   ref(props.settings)
    // const newSettings = toRef(props, 'settings')
    const newSettings = ref({...props.settings})

    onBeforeUnmount(() => {
      // console.log(`props.settings: ${JSON.stringify(props.settings)}`);
      // console.log(`newSettings: ${JSON.stringify(newSettings.value)}`);
      // if (JSON.stringify(newSettings.value) != JSON.stringify(props.settings)) emit('updateSettings', newSettings.value)
      if (newSettings.value.wordsQuantity !== props.settings.wordsQuantity ||
          newSettings.value.addUpperCase !== props.settings.addUpperCase ||
          newSettings.value.addNumbers !== props.settings.addNumbers ||
          newSettings.value.addSymbols !== props.settings.addSymbols ||
          newSettings.value.isText !== props.settings.isText ||
          newSettings.value.isStory !== props.settings.isStory ||
          isStoryChanged.value) emit('updateSettings', newSettings.value)
    })

    let showEditStory = ref(false)
    let isStoryChanged = ref(false)

    return {
      newSettings,
      showEditStory,
      isStoryChanged
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

<template>
  <div class="settingsBlock">
    <div class="switcherBlock" :class="{hide: newSettings.isText && newSettings.isStory}">
      <span class="name">Слов</span>
      <span class="quantity">
          <input type="text" v-model="newSettings.wordsQuantity">
        </span>
    </div>

    <div class="switcherBlock">
      <span class="name">Текст</span>
      <span class="switcher">
              <input type="checkbox" id="isText" v-model="newSettings.isText">
              <label for="isText"></label>
            </span>
    </div>

    <div class="switcherBlock" :class="{hide: !newSettings.isText}">
      <span class="name">StoryMod</span>
      <span class="switcher">
              <input type="checkbox" id="isStory" v-model="newSettings.isStory">
              <label for="isStory"></label>
            </span>
    </div>
    <div class="switcherBlock" :class="{hide: !newSettings.isText || !newSettings.isStory}">
      <button class="edit" @click="showEditStory = !showEditStory">Редактировать</button>
    </div>

    <div class="switcherBlock" :class="{hide: newSettings.isText}">
      <span class="name">Заглавные</span>
      <span class="switcher">
                  <input type="checkbox" id="upperCase" v-model="newSettings.addUpperCase">
                  <label for="upperCase"></label>
                </span>
    </div>
    <div class="switcherBlock" :class="{hide: newSettings.isText}">
      <span class="name">Цифры</span>
      <span class="switcher">
                  <input type="checkbox" id="numbers" v-model="newSettings.addNumbers">
                  <label for="numbers"></label>
                </span>
    </div>
    <div class="switcherBlock" :class="{hide: newSettings.isText}">
      <span class="name">Символы</span>
      <span class="switcher">
                  <input type="checkbox" id="symbols" v-model="newSettings.addSymbols">
                  <label for="symbols"></label>
                </span>
    </div>
    <Teleport to="#app">
      <v-edit-story v-if="showEditStory" @closeEditStory="showEditStory = false"
                                          @reCreateStory="isStoryChanged = true"/>
    </Teleport>
  </div>
</template>

<style lang="scss">

.settingsBlock {
  width: 240px;
  position: absolute;
  border: 2px solid #5a9ca3;
  box-shadow: 4px -6px 7px 1px #43aab6;
  border-radius: 20px;
  padding: 20px;
  background: #f4efe3;
  right: 0px;
  top: 60px;
  z-index: 2;
  perspective: 500px;
}

.switcherBlock {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin: 10px 0;
  transform: (rotateX(0));
  opacity: 1;
  height: 36px;
  transition: transform .5s linear .2s, opacity .5s linear .2s, height .2s linear;

  &.hide {
    transform: (rotateX(-90deg));
    opacity: 0;
    height: 0;
    transition: transform .5s linear, opacity .5s linear, height .2s linear .5s;
  }

  .name {
    color: #026873;
  }

  .switcher {
    $track-w: 3em;
    $track-h: 1.6em;
    $track-b: .3125em;
    $thumb-w: .5*($track-w - 2*$track-b);
    $thumb-h: $track-h - 2*$track-b;
    $thumb-b: 3px;
    $c: rgba(#777, .04);
    $list: $c 0, $c 2px, transparent 0, transparent 5px;

    input {
      position: absolute;
      z-index: -1;
      opacity: 0;

      &:checked + label {
        --s: 1
      }
    }

    label {
      --s: 0;
      display: block;
      position: relative;
      --c: #5ff2e6;
      filter: blur(.5px);
      cursor: pointer;

      &, &:before {
        border: solid $track-b transparent;
        width: $track-w;
        height: $track-h;
        border-radius: .5*$track-h;
        box-shadow: inset 0 .125em .75em rgba(#000, .5);
        background: repeating-linear-gradient(-45deg, $list) padding-box, repeating-linear-gradient(45deg, $list) padding-box,
        linear-gradient(transparent, rgba(#000, .32)) padding-box, linear-gradient(var(--c), var(--c)) padding-box, linear-gradient(#bebebb, #fdfdfc) border-box
      }

      &:before, &:after {
        position: absolute;
        top: 0;
        left: 0;
        content: ''
      }

      &:before {
        margin: -$track-b;
        opacity: calc(1 - var(--s));
        --c: #fff1d6;
        transition: .2s opacity;
      }

      &:after {
        border: solid $thumb-b transparent;
        width: $thumb-w;
        height: $thumb-h;
        border-radius: .5*$thumb-h;
        transform: translate(calc(var(--s) * 100%));
        box-shadow: 0 2px 9px rgba(#000, .8);
        background: linear-gradient(#d1d1d1, #edede9) padding-box, linear-gradient(#fcfcfc, #b2b2b2) border-box;
        transition: .2s transform ease-in;
      }
    }
  }

  .quantity {
    input {
      border: solid 0.3125em transparent;
      width: 3em;
      height: 1.6em;
      border-radius: 0.8em;
      box-shadow: inset 0 0.125em 0.75em rgba(0, 0, 0, 0.5);
      background: repeating-linear-gradient(-45deg, rgba(119, 119, 119, 0.04) 0, rgba(119, 119, 119, 0.04) 2px, transparent 0, transparent 5px) padding-box, repeating-linear-gradient(45deg, rgba(119, 119, 119, 0.04) 0, rgba(119, 119, 119, 0.04) 2px, transparent 0, transparent 5px) padding-box, linear-gradient(transparent, rgba(0, 0, 0, 0.32)) padding-box, linear-gradient(#5ff2e6, #5ff2e6) padding-box, linear-gradient(#bebebb, #fdfdfc) border-box;
      font-size: 1em;
      text-align: center;
      padding: 5px;
      color: inherit;

      &:focus {
        background: linear-gradient(#bebebb, #fdfdfc) border-box;
      }
    }
  }

  button.edit {
    margin: 0 auto;
    padding: 10px;
    border: 1px solid #d9d9d7;
    border-radius: 10px;
    font-size: 18px;
    background: #7ec7c1;
    cursor: pointer;
  }
}
</style>