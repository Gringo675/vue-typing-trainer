<template>
    <vLoader v-if="counter === null"/>
    <div v-else class="main-wrapper">
        <h1>Type trainer</h1>
        <div class="inputBlock">
            <input type="text" v-model="wordInput" @input="onInput" :class="{ error: activeWord.activeError }"
                   autofocus>
        </div>
        <div class="wordsRibbon" ref="wordsRibbonBlockRef">
            <span class="prev" :class="{penalty:prevWord.isPenalty}">{{ prevWord.val}}</span>
            <span class="active" :class="{penalty:activeWord.isPenalty}">
              <span class="done"> {{ activeWord.done }} </span>
              <span class="left"> {{ activeWord.left }} </span>
            </span>
            <span class="next" :class="{penalty:nextWord.isPenalty}">{{ nextWord.val}}</span>
        </div>
        <div class="infoBlock" :class="getSpaceHand">
            <span class="leftHand">left</span>
            <span class="penaltyCounter"> penaltyLeftCounter: {{ penaltyLeftCounter }}</span>
            <span class="counter"> leftCounter: {{ leftCounter }}</span>
            <span class="rightHand">right</span>
        </div>

        <v-finish v-if="leftCounter === 0"/>
    </div>

    <div class="debug">
        DEBUG
        <div> counter: {{ counter + 1 }}</div>
        <div> Error: {{ activeWord.activeError }}</div>
        <button @click="++counter"> ++counter</button>
    </div>
</template>

<script>
    /* eslint-disable no-unused-vars */

    import vLoader from './loader'
    import vFinish from './finish'

    import {createWordsArray} from "@/api/words"

    import {computed, nextTick, ref, watch} from 'vue'

    export default {
        name: "main",
        components: {vLoader, vFinish},
        props: {},
        setup() {
            createWordsArray(5)
                .then(result => {
                    words.value = result
                    counter.value = 0
                })

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
            const leftCounter = computed(() => {
                return words.value.length - counter.value
            })
            const penaltyLeftCounter = computed(() => {
                let penaltyCounter = 0
                for (let i=counter.value; i<words.value.length; i++) {
                    if (words.value[i].isPenalty) penaltyCounter++
                }
                return penaltyCounter
            })
            const wordsRibbonBlockRef = ref(null)

            watch(counter, (counter) => {

                activeWord.value = words.value[counter] ?? {}
                activeWord.value.done = ''
                activeWord.value.left = activeWord.value.val

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
                })
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
                        if (!activeWord.value.isPenalty) {  // не пенальти, добавляем 3 раза
                            for (let i = 0; i < 3; i++) {
                                addPenArr.push({
                                    val: activeWord.value.val,
                                    isPenalty: true
                                })
                            }
                        } else { // пенальти, добавляем 2 раза
                            for (let i = 0; i < 2; i++) {
                                addPenArr.push({
                                    val: activeWord.value.val,
                                    isPenalty: true
                                })
                            }
                        }
                        words.value.splice(counter.value + 1, 0, ...addPenArr);
                        activeWord.value.isError = true

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
                        wordInput.value = ''
                        ++counter.value
                    }
                }
                activeWord.value.activeError = isError // флаг ошибки для template
            }


            return {
                prevWord,
                activeWord,
                nextWord,
                counter,
                leftCounter,
                penaltyLeftCounter,
                wordInput,
                onInput,
                wordsRibbonBlockRef

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
        margin: auto;
        display: flex;
        flex-direction: column;

        .inputBlock {
            align-self: center;

            input, input:focus {
                width: 270px;
                font-size: 22px;
                padding: 5px 10px;
                border: 2px solid #44f2ff;
                border-radius: 15px;
                outline: none;
            }

            .error {
                background: pink;
                box-shadow: 0 0 14px 8px pink;
            }
        }

        .wordsRibbon {
            margin: 20px 0 20px 370px;
            transform: translateX(calc(var(--prevWordWidth) * -1));

            .prev, .done {
                color: #87d282;
            }

            .prev {
                opacity: 0;
            }

            .active {
                opacity: 1;
            }

            .next {
                opacity: .6;
            }

            .penalty {
                background: yellow;
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
                transform: translateX(calc((var(--prevWordWidth) + var(--activeWordWidth)) * -1));

                .active {
                    opacity: 0;
                }
            }
            &.animate-penalty-active {
                transition: transform .2s linear;

                .active {
                    transition: opacity .2s linear;
                }
            }
        }


    }

    .debug {
        margin-top: 50px;
    }
</style>