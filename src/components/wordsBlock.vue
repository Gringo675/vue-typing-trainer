<template>
  <div class="wordsBlock" :class="{loading: !props.words.length}">
    <template v-for="(word, i) in props.words" :key="word.val">
          <span  :class="{done: word.left === '',
                          wasError: word.wasError,
                          isError: word.isError,
                          hidden: word.isPenalty,
                          activeWord: i === props.counter}">
                {{ word.val }}
          </span>
          <br v-if="word.isParEnd" />
    </template>
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
    },
    counter: {
      type: Number,
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
  max-height: calc(100vh - 480px);
  transition: max-height .5s ease-out;
  border: 2px solid #6ba6ac;
  box-shadow: inset 0px 0px 4px 1px #88c2c8;
  border-radius: 10px;
  padding: 16px;
  line-height: 1.4em;
  background: #ace6ec;
  align-self: center;
  overflow: auto;
  font-size: 18px;
  margin-bottom: 20px;

  &.loading {
    max-height: 50px;
  }

  &::-webkit-scrollbar {
    width: 20px;
    background-color: #98d4da;
    border-radius: 8px;
  }

  &::-webkit-scrollbar-thumb {
    border-radius: 6px;
    background-color: #88c2c8;
  }

  .activeWord {
    text-shadow: 0 0 1px #686868;
    -webkit-text-stroke: 0.02em #8c8c8c;
  }

  .wasError {
    color: #7c6c1b;
  }

  .done {
    color: #00a680;
    text-shadow: 0 0 1px #909090;

    &.isError {
      color: palevioletred;
    }

    &.wasError.isError {
      color: red;
    }
  }

  .hidden {
    display: none;
  }

}
</style>