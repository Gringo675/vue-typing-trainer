<template>
    <div class="statsCircle">
        statsCircle {{stat}}
        <div class="circleWrapper" :class="{loading: !stat.mainWords}">
            <svg viewBox="0 0 36 36" class="circular-chart">
                <path class="circle"
                      :class="{penaltyActive: stat.penaltyWords>0}"
                      :stroke-dasharray='(stat.wordsDone/stat.mainWords)*100 + ", 100"'
                      d="M18 2.0845
                  a 15.9155 15.9155 0 0 1 0 31.831
                  a 15.9155 15.9155 0 0 1 0 -31.831"
                />
                <template v-if="stat.mainWords">
                    <text x="18" y="10.4" class="wordsTotal">{{stat.mainWords}}</text>
                    <text x="18" y="21" class="wordsLeft">
                        <tspan>{{ stat.mainWords - stat.wordsDone }}</tspan>
                        <tspan class="penalty">{{ (stat.penaltyWords > 0 ? '+' + stat.penaltyWords : '') }}</tspan>
                    </text>
                    <text x="18" y="30" class="errors">{{ (stat.errors > 0 ? stat.errors : '') }}</text>
                </template>
                <template v-else>
                    <text x="18" y="21" class="load">Loading...</text>
                </template>
            </svg>
            <transition name="reload-anim">
                <div class="reload" @click="emit('reload')"
                     v-if="stat.mainWords && stat.wordsDone === stat.mainWords && stat.penaltyWords === 0">
                    <svg xmlns="http://www.w3.org/2000/svg" width="36" height="36" fill="#5be769" viewBox="0 0 16 16">
                        <path fill-rule="evenodd" d="M8 3a5 5 0 1 0 4.546 2.914.5.5 0 0 1 .908-.417A6 6 0 1 1 8 2v1z"/>
                        <path d="M8 4.466V.534a.25.25 0 0 1 .41-.192l2.36 1.966c.12.1.12.284 0 .384L8.41 4.658A.25.25 0 0 1 8 4.466z"/>
                    </svg>
                </div>
            </transition>
        </div>

    </div>
</template>

<script>
    import {toRef} from 'vue'

    export default {
        name: "statsCircle",
        components: {},
        props: {
            stats: {
                type: Object,
            },
        },

        setup(props, {emit}) {
            //let wordsArray = ref(props.words)
            const stat = toRef(props, 'stats')
            return {
                stat,
                emit
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
    .statsCircle {

        .circleWrapper {
            display: block;
            position: relative;
            margin: 10px auto;
            width: 200px;

            &.loading {
                animation: loader 2s infinite linear;
            }

            .circular-chart {

                .circle {
                    stroke: #4CC790;
                    fill: #c5ffe5;
                    stroke-width: 1.4;
                    stroke-linecap: round;

                    &.penaltyActive {
                        stroke: yellow;
                    }
                }

                .wordsTotal {
                    fill: #8371a6;
                    font-size: .25em;
                    text-anchor: middle;
                }

                .wordsLeft {
                    fill: #8371a6;
                    font-size: .4em;
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

                .load {
                    fill: #5be769;
                    font-size: .25em;
                    text-anchor: middle;
                }

            }

            .reload {
                position: absolute;
                right: 0;
                top: 0;
                cursor: pointer;
                transform: rotate(0);
                transition: transform .3s linear;

                &:hover {
                    transform: rotate(180deg);
                }
            }
        }

        @keyframes loader {
            from,
            to {
                transform: scale(1);
            }
            25%,
            75% {
                transform: scale(.8);
            }
            50% {
                transform: scale(1.1);
            }
        }
    }

    .reload-anim-enter-active, .reload-anim-leave-active {
        transition: all 10s linear;
    }
    .reload-anim-enter-from, .reload-anim-leave-to {
        transform: translateX(70px);
    }

    .reload-anim-enter-to, .reload-anim-leave-from {
        transform: translateX(0);
    }
</style>