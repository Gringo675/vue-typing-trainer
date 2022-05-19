<template>
  <div class="main-wrapper">
    <div class="headerBlock">
      <h1>Excelent Typer</h1>
      <div class="settingsButton">
        <img class="icon" :class="{rotate: settings.show}" @click="settings.show = !settings.show"
             :src="require(`@/assets/settings-icon.png`)"
             alt="">
        <transition name="pop-up">
          <vSettings v-if="settings.show"
                     :settings="settings"
                     @updateSettings="onUpdateSettings"
          />
        </transition>
      </div>
    </div>
    <div class="inputBlock">
      <div class="leftHand" :class="{ active: activeWord.hand === 'left' }"></div>
      <input type="text" v-model="wordInput" @input="onInput" @keydown="onKeydown" ref="inputRef"
             :class="{ error: activeWord.activeError }"
             autofocus>
      <div class="rightHand" :class="{ active: activeWord.hand === 'right' }"></div>
    </div>
    <div class="wordsRibbon" ref="wordsRibbonBlockRef">
      <span class="prev" :class="{penalty:prevWord.isPenalty, parEnd: prevWord.isParEnd}">{{ prevWord.val }}</span>
      <span class="active" :class="{penalty:activeWord.isPenalty, parEnd: activeWord.isParEnd}">
              <span class="done"> {{ activeWord.done }} </span>
              <span class="left"> {{ activeWord.left }} </span>
            </span>
      <span class="next" :class="{penalty:nextWord.isPenalty, parEnd: nextWord.isParEnd}">{{ nextWord.val }}</span>
    </div>
    <vStatsCircle v-if="!settings.isText || (settings.isText && !settings.isStory)"
                  :stats="stats"
                  @reload="onReload"/>
    <vWordsBlock :words="words"
                 :counter="counter"/>
  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

import vSettings from './settings'
import vWordsBlock from './wordsBlock'
import vStatsCircle from './statsCircle'
import {createWordsArray, nextStoryPar} from "@/api/words"

import {computed, nextTick, onMounted, ref, watch} from 'vue'

export default {
  name: "main",
  components: {vSettings, vWordsBlock, vStatsCircle},
  props: {},
  setup() {

    const settings = ref({
      wordsQuantity: 100,
      addUpperCase: false,
      addNumbers: false,
      addSymbols: false,
      isText: false,
      isStory: false,
      show: false
    })

    onMounted(() => {
      // читаем настройки из local storage
      let localSettings = JSON.parse(localStorage.getItem('settings'))
      if (localSettings) settings.value = localSettings
      // console.log(`localSettings: ${JSON.stringify(localSettings)}`);
      // создаем words
      createWords()
    })

    const onUpdateSettings = (newSettings) => {
      // убираем свойство show и сохраняем в local storage
      delete newSettings.show
      localStorage.setItem('settings', JSON.stringify(newSettings))
      // принимаем новые значения
      settings.value = newSettings
      // пересоздаем words
      createWords()
      // console.log(`settings.value: ${JSON.stringify(settings.value)}`);
    }

    const onReload = () => {
      createWords()
    }

    const createWords = () => {
      stats.value = {
        mainWords: 0,
        penaltyWords: 0,
        errors: 0,
        wordsDone: 0
      }
      wordInput.value = ''
      words.value = []
      counter.value = undefined
      createWordsArray(settings.value)
          .then(result => {
            words.value = result
            counter.value = 0
            stats.value.mainWords = words.value.length
            inputRef.value.focus()
            // let aaa = ''
            // words.value.forEach((word) => {
            //   aaa = aaa + word.val + '   '
            // })
            // console.log(`words: ${aaa}`);
          })
    }

    let words = ref([])
    const prevWord = computed(() => {
      return words.value[counter.value - 1] ?? {}
    })
    const activeWord = ref({})
    const nextWord = computed(() => {
      return words.value[counter.value + 1] ?? {}
    })
    const wordInput = ref('')
    const counter = ref(null)
    const stats = ref({
      mainWords: 0,
      penaltyWords: 0,
      errors: 0,
      wordsDone: 0
    })

    const inputRef = ref(null)
    const wordsRibbonBlockRef = ref(null)

    const leftSpaceHandChars = ['н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'р', 'о', 'л', 'д', 'ж', 'э', 'т', 'ь', 'б', 'ю', '7', '8', '9', '0', '-', '=', '+', '_', ')', '(', '*', '?', '/', '\\', ',', '.']

    watch(counter, (counter) => {

      // если закончился параграф в storyMod
      if (settings.value.isText && settings.value.isStory && Number(counter) === words.value.length-2) {
        nextStoryPar()
        createWords()
      }

      activeWord.value = words.value[counter] ?? {}
      activeWord.value.done = ''
      activeWord.value.left = activeWord.value.val

      let lastChar = activeWord.value.val?.slice(-2, -1)
      activeWord.value.hand = (leftSpaceHandChars.includes(lastChar) ? 'left' : 'right')

      // animation
      nextTick(() => {
        const prevWordWidth = wordsRibbonBlockRef.value.querySelector('.prev').getBoundingClientRect().width
        const activeWordWidth = wordsRibbonBlockRef.value.querySelector('.active').getBoundingClientRect().width
        wordsRibbonBlockRef.value.style.cssText = `--prevWordWidth: ${prevWordWidth}px;--activeWordWidth: ${activeWordWidth}px`
        wordsRibbonBlockRef.value.classList.add('animate-counter-enter')
        setTimeout(() => {
          wordsRibbonBlockRef.value.classList.remove('animate-counter-enter')
          wordsRibbonBlockRef.value.classList.add('animate-counter-active')
          wordsRibbonBlockRef.value.addEventListener("transitionend", () => {
            wordsRibbonBlockRef.value.classList.remove('animate-counter-active')
          }, true);
        }, 0)
        // перемотка в wordsBlock, чтобы активное слово всегда было на виду, если не сториМод
        if (!settings.value.isText || (settings.value.isText && !settings.value.isStory)) {
          setTimeout(() => {
            let element = document.querySelector('.activeWord')
            if (!element) return
            let elmTop = element.getBoundingClientRect().top
            if (!elmTop) return // если элемент скрыт (пенальти)
            let parent = element.parentElement
            let parTop = parent.getBoundingClientRect().top
            let parScroll = parent.scrollTop
            let newParScroll = elmTop - parTop + parScroll - 34
            // console.log(`elmTop: ${elmTop}`)
            // console.log(`parTop: ${parTop}`)
            parent.scrollTo({top: newParScroll, behavior: 'smooth'});

          }, 0)
        }
      })

      if (counter + 1 === words.value.length) { // конец
        // добавляем "ошибочные" слова в local storage, если не текст
        if (!settings.value.isText) {
          let errors = words.value.filter(item => item.isError && !item.isPenalty).map(item => item.val)
          localStorage.setItem('errors', JSON.stringify(errors))
        }
      }
    })

    const onInput = () => {
      const isError = !activeWord.value.val.startsWith(wordInput.value)
      if (isError) {
        if (!activeWord.value.isError) { // первая ошибка в слове
          activeWord.value.isError = true
          ++stats.value.errors
          // добавляем пенальти, если не сториМод
          if (!settings.value.isText || (settings.value.isText && !settings.value.isStory)) {
             let addPenArr = []
            const penQuantity = (activeWord.value.isPenalty ? 2 : 3) // для "основного" слова добавляем 3 пенальти, для "пенальти" - 2
            for (let i = 0; i < penQuantity; i++) {
              addPenArr.push({
                val: activeWord.value.val,
                isPenalty: true
              })
            }
            words.value.splice(counter.value + 1, 0, ...addPenArr)
            stats.value.penaltyWords = stats.value.penaltyWords + penQuantity

            // animation
            wordsRibbonBlockRef.value.classList.add('animate-penalty-enter')
            setTimeout(() => {
              wordsRibbonBlockRef.value.classList.remove('animate-penalty-enter')
              wordsRibbonBlockRef.value.classList.add('animate-penalty-active')
              wordsRibbonBlockRef.value.addEventListener("transitionend", () => {
                wordsRibbonBlockRef.value.classList.remove('animate-penalty-active')
              }, true);
            }, 0)
          }
        }
      } else {
        activeWord.value.done = wordInput.value
        activeWord.value.left = activeWord.value.val.slice(activeWord.value.done.length)

        if (activeWord.value.left.length === 0) { // next word
          (activeWord.value.isPenalty ? --stats.value.penaltyWords : ++stats.value.wordsDone)
          wordInput.value = ''
          ++counter.value
        }
      }
      activeWord.value.activeError = isError // флаг ошибки для template
    }

    const onKeydown = (event) => {
      // wildcard на ControlRight (для пропуска активного слова)
      if (event.code === 'ControlRight') {
        event.preventDefault()
        const nextSymb = activeWord.value.left
        wordInput.value += nextSymb
        onInput()
      }
      // обрабатываем нажатие Tab (заменяем на пробел)
      if (event.key === 'Tab') {
        event.preventDefault()
        wordInput.value += ' '
        onInput()
      }
      // обрабатываем нажатие Enter (заменяем на символ параграфа)
      if (event.key === 'Enter') {
        event.preventDefault()
        wordInput.value += '¶'
        onInput()
      }
    }

    return {
      prevWord,
      activeWord,
      nextWord,
      counter,
      wordInput,
      onInput,
      onKeydown,
      wordsRibbonBlockRef,
      inputRef,
      stats,
      settings,
      onUpdateSettings,
      onReload,
      words
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
.main-wrapper {
  width: 1000px;
  min-height: 100vh;
  margin: auto;
  display: flex;
  flex-direction: column;
  background: #88c2c8;

  .headerBlock {
    display: flex;
    align-content: center;
    justify-content: space-between;
    align-items: center;
    margin: 20px 20px 40px;

    h1 {
      font-size: 58px;
      font-style: italic;
      font-weight: bold;
      color: #8f07e4;
    }

    .settingsButton {
      position: relative;

      .icon {
        display: block;
        cursor: pointer;
        transform: rotate(0);
        transition: transform .3s linear;

        &.rotate {
          transform: rotate(90deg);
        }
      }
    }

  }

  .inputBlock {
    align-self: center;
    display: flex;

    input, input:focus {
      width: 270px;
      font-size: 24px;
      padding: 5px 10px;
      border: 2px solid #6ba6ac;
      border-radius: 15px;
      background: #d4fbff;
      color: inherit;

      &.error {
        background: pink;
        box-shadow: 0 0 14px 8px pink;
      }
    }

    .leftHand, .rightHand {
      width: 40px;
      height: 40px;
      margin: 0 20px;
      border-radius: 50%;
      background: #8ec6cc;

      &.active {
        background: #ace6ec;
        box-shadow: 0 0 4px 0 #ace6ec;
      }
    }


  }

  .wordsRibbon {
    margin: 20px 0 20px 370px;
    transform: translateX(calc(var(--prevWordWidth) * -1));
    white-space: nowrap;
    text-shadow: 0 0 1px #818181;

    .prev, .done {
      color: #9bff9a;
    }

    .prev {
      opacity: 0;
    }

    .active {
      opacity: 1;
    }

    .next {
      opacity: .6;
      display: inline-block;
    }

    .penalty {
      border-radius: 12px;
      padding: 0 8px;
      background: #fdff93;
      margin-right: 5px;

      .done {
        color: #03c809;
      }
    }

    .parEnd {
      padding-right: 30px;
    }

    &.animate-counter-enter {
      transform: translateX(0);

      .prev {
        opacity: 1;
      }

      .active {
        opacity: .6;
      }

      .next {
        opacity: 0;
      }
    }

    &.animate-counter-active {
      transition: transform .2s linear;

      .prev, .active, .next {
        transition: opacity .2s linear;
      }
    }

    &.animate-penalty-enter {
      .next {
        transform: translateX(calc(var(--activeWordWidth) * -1));
        opacity: 0;
      }
    }

    &.animate-penalty-active {
      .next {
        transition: transform .2s linear, opacity .2s linear;
      }
    }
  }
}

.pop-up-enter-active, .pop-up-leave-active {
  transition: all .3s linear;
}

.pop-up-enter-from, .pop-up-leave-to {
  transform: translateY(-40px) scale(0.1) skewY(-30deg);
  transform-origin: 100% 0;
  opacity: .1;

}

.pop-up-enter-to, .pop-up-leave-from {
  transform: none;
  transform-origin: 100% 0;
  opacity: 1;
}


.debug {
  margin-top: 50px;
}
</style>
