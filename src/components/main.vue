<template>
  <div class="main">
    <div class="finished" v-if="isFinished">
      Закончили. Ошибок: {{errorsQuantity}}
    </div>
    <div class="wrapper" v-else>

      <div class="mainBlock" :class="{disabled: penalty.show}">
        <div class="inputBlock">
          <input type="text" v-model="mainInput" @input="onMainInput" ref="mainInputRef" autofocus>
        </div>

        <div class="wordRibbon">
          <div class="window">
            <div class="ribbonWrapper" :style="ribbonStyle">
              <template v-for="(word, index) in words" :key="word.point">
                <template v-if="index-counter < -1">
                  <span class="word" style="opacity:0">{{ word.point }}</span>
                </template>
                <template v-else-if="index-counter === -1">
                  <span class="word" style="opacity:0.4">{{ word.point }}</span>
                </template>
                <template v-else-if="index-counter === 0">
                  <span class="word">
                    <span class="done"> {{ currentWordDone }} </span>
                    <span class="left"> {{ currentWordLeft }} </span>
                  </span>
                </template>
                <template v-else-if="index-counter === 1">
                  <span class="word" style="opacity:0.8">{{ word.point }}</span>
                </template>
                <template v-else>
                  <span class="word" style="display:none">{{ word.point }}</span>
                </template>
              </template>
            </div>
          </div>
        </div>
        <div class="spaceHand" :class="getSpaceHand">
          <span class="left">left</span>
          <span class="right">right</span>
        </div>
        <div class="counter">Осталось: {{words.length - counter}}</div>
      </div>

      <div class="penaltyBlock" v-show="penalty.show">
        PENALTY
        <div class="inputBlock">
          <input type="text" v-model="penaltyInput" @input="onPenaltyInput" ref="penaltyInputRef" autofocus>
        </div>
        <div class="penaltyWord">
          <span class="done"> {{penalty.wordDone}} </span>
          <span class="left"> {{penalty.wordLeft}} </span>
        </div>
        <div class="penaltyCounter"> Осталось: {{penalty.counter}} </div>
      </div>

    </div>




    <div class="debug">
      DEBUG
      <div class="wordsRibbon2" id="wordsRibbon">
        <span class="prev">{{ words[counter-1]?.point}}</span>
        <span class="active">
          <span class="done"> {{ currentWordDone }} </span>
          <span class="left"> {{ currentWordLeft }} </span>
        </span>
        <span class="next">{{ words[counter+1]?.point}}</span>
        <span class="afterNext">{{ words[counter+2]?.point}}</span>
      </div>
      <div> words: {{ words }}</div>
      <div> counter: {{ counter + 1 }}</div>
      <button @click="addCounter"> counter++</button>
    </div>

  </div>
</template>

<script>
  /* eslint-disable no-unused-vars */

  import {nextTick, ref, computed, watch} from 'vue'
  import {createWordsArray} from "@/api/words"

  export default {
  name: "main",
  components: {},
  props: {},
  setup() {
    createWordsArray(5)
            .then( result => {
              words.value = result
              currentWord = words.value[0]
              currentWordLeft.value = currentWord.point
            })

    const isFinished = ref(false)
    const errorsQuantity = ref(0)

    const words = ref([])
    const counter = ref(0)
    const mainInput = ref('')
    const mainInputRef = ref(null)

    let currentWord
    let mainInputError = false

    const currentWordDone = ref('')  // начальное значение
    const currentWordLeft = ref('')  // начальное значение

    const onMainInput = () => {
      const isInputError = !currentWord.point.startsWith(mainInput.value)
      if (isInputError !== mainInputError) {
        mainInputRef.value.classList.toggle('error')
        mainInputError = !mainInputError
      }
      if (isInputError) {
        currentWord.isError = true
      }
      else {
        currentWordDone.value = currentWord.point.slice(0, mainInput.value.length)
        currentWordLeft.value = currentWord.point.slice(currentWordDone.value.length)

        if (currentWordLeft.value.length === 0) { // конец слова
          if (currentWord.isError) { // была ошибка
            penalty.value.show = true
            penalty.value.wordDone = ''
            penalty.value.word = penalty.value.wordLeft = currentWord.point
            penalty.value.counter = 3
            nextTick(() => {
              penaltyInputRef.value.focus()
            })

          }
          ++counter.value
          if (counter.value < words.value.length) {  // следующее слово
            currentWord = words.value[counter.value]
            currentWordDone.value = ''
            currentWordLeft.value = currentWord.point
            mainInput.value = ''
          }
          else { // конец
            console.log('end')
            // сохраняем ошибки в local storage
            let errors = words.value.filter( item => item.isError).map(item => item.point)
            localStorage.setItem('errors', JSON.stringify(errors))

            errorsQuantity.value = errors.length
            if (!penalty.value.show) isFinished.value = true // если нет пенальти на последнем слове
          }

        }
      }
   }

    const penalty = ref({
      show: false,
      word: '',
      wordDone: '',
      wordLeft: '',
      counter: 0,
      hasError: false
    })
    const penaltyInput = ref('')
    const penaltyInputRef = ref(null)
    let penaltyInputError = false
    const onPenaltyInput = () => {
      const isInputError = !penalty.value.word.startsWith(penaltyInput.value)
      if (isInputError !== penaltyInputError) {
        penaltyInputRef.value.classList.toggle('error')
        penaltyInputError = !penaltyInputError
      }
      if (isInputError) {
        penalty.value.hasError = true
      }
      else {
        penalty.value.wordDone = penalty.value.word.slice(0, penaltyInput.value.length)
        penalty.value.wordLeft = penalty.value.word.slice(penalty.value.wordDone.length)

        if (penalty.value.wordLeft.length === 0) { // конец слова
          if (penalty.value.hasError) { // была ошибка
            penalty.value.counter = penalty.value.counter + 2
            penalty.value.hasError = false
          }
          --penalty.value.counter

          if (penalty.value.counter > 0) {  // следующий цикл
            penalty.value.wordDone = ''
            penalty.value.wordLeft = penalty.value.word
            penaltyInput.value = ''
          }
          else { // конец пенальти
            if (counter.value === words.value.length) { // это было последнее слово
              isFinished.value = true
            }
            else {
              penaltyInput.value = ''
              penalty.value.show = false
              nextTick(() => {
                mainInputRef.value.focus()
              })
            }
          }
        }
      }
    }

    const ribbonStyle = computed(() => {
      return `left:${(counter.value > 0 ? document.querySelector(`.ribbonWrapper .word:nth-child(${counter.value + 1})`).offsetLeft * (-1) : 0)}px`
    })

    const leftSpaceHandChars = ['н', 'г', 'ш', 'щ', 'з', 'х', 'ъ', 'р', 'о', 'л', 'д', 'ж', 'э', 'т', 'ь', 'б', 'ю']
    const getSpaceHand = computed(() => {
      let lastChar = words.value[counter.value]?.point.slice(-2, -1)
      return ( leftSpaceHandChars.includes(lastChar) ? 'left' : 'right' )
    })

    watch(counter, (counter) => {
      if (counter > 0) {
        let wordsRibbon = document.getElementById('wordsRibbon')
        let prev = wordsRibbon.querySelector('.prev')
        let active = wordsRibbon.querySelector('.active')
        let next = wordsRibbon.querySelector('.next')
        let translate = active.getBoundingClientRect().width * (-1)
        // начальные значения
        wordsRibbon.style.transform = 'translateX(0)'
        prev.style.opacity = 1
        active.style.opacity = 0.6
        next.style.opacity = 0
        setTimeout(() => {
          // конечные значения
          wordsRibbon.style.transform = `translateX(${translate}px)`
          prev.style.opacity = 0
          active.style.opacity = 1
          next.style.opacity = 0.6
          wordsRibbon.classList.add('animation-active')
          wordsRibbon.addEventListener("transitionend", () => {
            wordsRibbon.classList.remove('animation-active')
          }, true);
        }, 0)
        // setTimeout(() => {
        //   wordsRibbon.classList.remove('animation-active')
        // }, 400)



        // nextTick(() => {
        //   wordsRibbon.style.left = '-200px'
        // })
      }

    })

    const addCounter = () => {
      counter.value++
    }
    // onMounted(createWords)

    return {
      words,
      counter,
      mainInput,
      mainInputRef,
      onMainInput,
      currentWordDone,
      currentWordLeft,
      penalty,
      penaltyInput,
      penaltyInputRef,
      onPenaltyInput,
      isFinished,
      errorsQuantity,
      ribbonStyle,
      getSpaceHand,
      addCounter
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
.mainBlock {
  &.disabled {
    opacity: 0.3;
  }

  .inputBlock {
    input {
      width: 200px;
      height: 30px;
      font-size: 18px;
    }
  }

  .wordRibbon {

    .done {
      color: gainsboro;
    }

    .window {
      width: 200px;
      height: 30px;
      position: relative;
      margin: 50px auto;
    }

    .ribbonWrapper {
      position: absolute;
      height: 30px;
      width: 1000px;
      text-align: left;
      overflow: hidden;
      transition: left .2s linear;

    }
  }

  .spaceHand {
    width: 300px;
    margin: auto;
    display: flex;
    justify-content: space-between;

    .left, .right {
      width: 70px;
      height: 30px;
    }
    &.left .left {
      background: green;
    }
    &.right .right {
      background: green;
    }
  }
}

.wordsRibbon2 {
  margin: 20px 0 20px 500px;
  text-align: left;
  position: relative;

  &.animation-active {
    transition: transform .2s linear;

    .prev, .active, .next {
      transition: opacity .2s linear;
    }
  }

  .next {
    opacity: 0.6;
  }
  .afterNext {
    opacity: 0;
  }

  .prev, .active .done {
    color: #87d282;
  }
}

.penaltyBlock {
  margin-top: 50px;

  .done {
    color: gainsboro;
  }
}

input.error {
  border: 2px solid red;
  background: crimson;
}

.debug {
  margin-top: 150px;
}
</style>