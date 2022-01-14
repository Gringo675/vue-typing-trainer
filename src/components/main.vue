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
        <div class="wordsBlock">
          <div class="prev">
            {{words[counter - 1]?.point ?? ''}}
          </div>
          <div class="current">
            <span class="done"> {{currentWordDone}} </span>
            <span class="left"> {{currentWordLeft}} </span>
          </div>
          <div class="next">
            {{words[counter + 1]?.point ?? ''}}
          </div>
        </div>
        <div class="wordRibbon">
          <span v-for="(word, index) in words" :key="word.point">
            <template v-if="index===counter">
              <span class="done"> {{currentWordDone}} </span>
              <span class="left"> {{currentWordLeft}} </span>
            </template>
            <template v-else>
              {{word.point}}
            </template>
          </span>
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
      <div> words: {{ words }}</div>
      <div> counter: {{ counter + 1 }}</div>
      <button @click="addCounter"> counter++</button>
    </div>

  </div>
</template>

<script>
/* eslint-disable no-unused-vars */

import {ref, nextTick, computed, onMounted} from 'vue'
import {createWordsArray} from "@/api/words"

export default {
  name: "main",
  components: {},
  props: {},
  setup() {
    createWordsArray(10)
            .then( result => {
              console.log(`result: ${JSON.stringify(result)}`);
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
            penalty.value.counter = 1
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

  }
  .wordsBlock {
    display: flex;
    justify-content: space-evenly;
    margin: 50px;
    color: grey;
    font-size: 20px;

    .current {
      color: black;

      .done {
        color: grey;
      }
    }
  }
  .wordRibbon {
    .done {
      color: grey;
    }
  }
}
.penaltyBlock {
  margin-top: 50px;

  .done {
    color: grey;
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