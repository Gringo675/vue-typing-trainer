<template>
    <div class="wordsBlock">
        <span v-for="word in props.words" :key="word.val" :class="{done: word.left === '',
                                                                   wasError: word.wasError,
                                                                   isError: word.isError,
                                                                   hidden: word.isPenalty}">
            {{word.val}}
        </span>
    </div>
</template>

<script>
    //import {ref} from 'vue'

    export default {
        name: "wordsBlock",
        components: {},
        props: {
            words: {
                type: Array,
            }
        },

        setup(props) {
            //let wordsArray = ref(props.words)

            return {
                props
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
    .wordsBlock {
        width: 800px;
        border: 1px solid red;
        border-radius: 10px;
        padding: 10px;
        align-self: center;
        max-height: 300px;
        overflow: auto;

        .wasError {
            color: #ccaf1d;
        }

        .done {
            color: #5bf3ff;

            &.isError {
                color: palevioletred;
            }
        }

        .hidden {
            display: none;
        }

    }
</style>