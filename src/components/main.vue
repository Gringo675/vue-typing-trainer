<template>
  <vLoader v-if="counter === null"/>
  <div v-else class="main-wrapper">
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
      <input type="text" v-model="wordInput" @input="onInput" @keydown="onKeydown"
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
    <vWordsBlock :words="words"
                 :counter="counter"/>
    <div class="stats">
      <svg viewBox="0 0 36 36" class="circular-chart">
        <path class="circle"
              :class="{penaltyActive: stats.penaltyWords>0}"
              :stroke-dasharray='(stats.wordsDone/stats.mainWords)*100 + ", 100"'
              d="M18 2.0845
      a 15.9155 15.9155 0 0 1 0 31.831
      a 15.9155 15.9155 0 0 1 0 -31.831"
        />
        <text x="18" y="20.35" class="wordsLeft">
          <tspan>{{ stats.mainWords - stats.wordsDone }}</tspan>
          <tspan style="font-size: .4em">/{{ stats.mainWords }}</tspan>
          <tspan class="penalty">{{ (stats.penaltyWords > 0 ? '+' + stats.penaltyWords : '') }}</tspan>
        </text>
        <text x="18" y="30" class="errors">{{ (stats.errors > 0 ? stats.errors : '') }}</text>
      </svg>
    </div>

    <v-finish/>
  </div>

  <!--  <div class="debug">-->
  <!--    DEBUG-->
  <!--    <div> stats: {{ stats }}</div>-->
  <!--    <div> counter: {{ counter + 1 }}</div>-->
  <!--    <button @click="++counter"> ++counter</button>-->
  <!--  </div>-->
</template>

<script>
/* eslint-disable no-unused-vars */

import vLoader from './loader'
import vFinish from './finish'
import vSettings from './settings'
import vWordsBlock from './wordsBlock'

import {createWordsArray} from "@/api/words"

import {computed, nextTick, ref, watch, onMounted} from 'vue'

export default {
  name: "main",
  components: {vLoader, vFinish, vSettings, vWordsBlock},
  props: {},
  setup() {

    const settings = ref({
      wordsQuantity: 100,
      addUpperCase: false,
      addNumbers: false,
      addSymbols: false,
      isText: false,
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

    const wordsRibbonBlockRef = ref(null)

    const leftSpaceHandChars = ['н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'р', 'о', 'л', 'д', 'ж', 'э', 'т', 'ь', 'б', 'ю', '7', '8', '9', '0', '-', '=', '+', '_', ')', '(', '*', '?', '/', '\\']

    watch(counter, (counter) => {

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
        // перемотка в wordsBlock, чтобы активное слово всегда было на виду
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
      })

      if (counter + 1 === words.value.length) { // конец
        // добавляем "ошибочные" слова в local storage
        let errors = words.value.filter(item => item.isError && !item.isPenalty).map(item => item.val)
        localStorage.setItem('errors', JSON.stringify(errors))
      }
    })

    const onInput = () => {
      const isError = !activeWord.value.val.startsWith(wordInput.value)
      if (isError) {
        if (!activeWord.value.isError) { // первая ошибка в слове, добавляем пенальти
          let penaltyWord = {
            val: activeWord.value.val,
            isPenalty: true
          }
          let addPenArr = []
          const penQuantity = (activeWord.value.isPenalty ? 2 : 3) // для "основного" слова добавляем 3 пенальти, для "пенальти" - 2
          for (let i = 0; i < penQuantity; i++) {
            addPenArr.push({
              val: activeWord.value.val,
              isPenalty: true
            })
          }
          words.value.splice(counter.value + 1, 0, ...addPenArr);
          activeWord.value.isError = true
          stats.value.penaltyWords = stats.value.penaltyWords + penQuantity
          ++stats.value.errors

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
      stats,
      settings,
      onUpdateSettings,
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
      border-radius: 5px;
      box-shadow: inset 0px 0px 30px 0px #faef6c;

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

  .stats {
    .circular-chart {
      display: block;
      margin: 10px auto;
      width: 200px;
    }

    .circle {
      stroke: #4CC790;
      fill: #c5ffe5;
      stroke-width: 1.4;
      stroke-linecap: round;

      &.penaltyActive {
        stroke: yellow;
      }
    }

    .wordsLeft {
      fill: #8371a6;
      font-size: .5em;
      text-anchor: middle;

      .penalty {
        fill: #eebf54;
      }
    }

    .errors {
      fill: #e75576;
      font-size: .4em;
      text-anchor: middle;
    }
  }


}

.rotate-y-enter-active, .rotate-y-leave-active {
  transition: transform .3s linear, opacity .3s linear;
}

.rotate-y-enter-from, .rotate-y-leave-to {
  transform: rotateY(90deg);
  opacity: .3;
}

.rotate-y-enter-to, .rotate-y-leave-from {
  transform: rotateY(0);
  opacity: 1;
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
