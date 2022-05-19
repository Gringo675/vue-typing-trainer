<script setup>
import {getStoryData, newStoryPar, newStoryText} from "@/api/words"
import {defineEmits, nextTick, onMounted, ref} from 'vue'

const emit = defineEmits(['closeEditStory', 'reCreateStory'])

const storyData = ref()
const activePar = ref()
const oldText = ref()
const newText = ref()

onMounted(async () => {
  storyData.value = await getStoryData()
  activePar.value = storyData.value.lastPar
  oldText.value = newText.value = storyData.value.storyArr.join('\n')
  // скроллим текст, чтобы активный блок был видимым
  await nextTick()
  const element = document.querySelector('.choosePar .active')
  const elmTop = element.getBoundingClientRect().top
  const parent = document.querySelector('.modal-body')
  const parTop = parent.getBoundingClientRect().top
  const parScroll = parent.scrollTop
  const newParScroll = elmTop - parTop + parScroll - 34
  // console.log(`elmTop: ${elmTop}`)
  // console.log(`parTop: ${parTop}`)
  // console.log(`newParScroll: ${newParScroll}`)
  parent.scrollTo({top: newParScroll})

})

const handleOK = () => {
  if (activePar.value !== storyData.value.lastPar || oldText.value !== newText.value) { // есть изменения
    if (oldText.value !== newText.value) { // изменили текст
      newStoryText(newText.value)
      newStoryPar(0) // нужно сбросить параграф
    } else {  // изменили параграф
      newStoryPar(activePar.value)
    }
    emit('reCreateStory') // пересоздать Words
  }

  emit('closeEditStory')
}

const currentTab = ref('choosePar')

</script>

<template>
  <div class="modal-container">
    <div class="modal-form">
      <div class="modal-header">
        <div class="title">storyMod</div>
        <div class="btn-close" @click="$emit('closeEditStory')"></div>
      </div>
      <div class="modal-nav-bar">
        <div class="nav-button" @click="currentTab='choosePar'" :class="{activeTab: currentTab === 'choosePar'}">Выбрать
          параграф
        </div>
        <div class="nav-button" @click="currentTab='changeText'" :class="{activeTab: currentTab === 'changeText'}">
          Изменить текст
        </div>
      </div>
      <div class="modal-body">
        <div class="choosePar" v-show="currentTab === 'choosePar'">
          <template v-if="storyData !== undefined">
            <div v-for="(par, index) in storyData.storyArr" :key="index" class="par"
                 :class="{active: index === activePar}"
                 @click="activePar = index">
              {{ par }}
            </div>
          </template>
        </div>
        <div class="changeText" v-show="currentTab === 'changeText'">
          <textarea v-model.lazy="newText"></textarea>
        </div>
      </div>
      <div class="modal-footer">
        <button @click="handleOK">OK</button>
      </div>
    </div>
  </div>
</template>

<style lang="scss">
.modal-container {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  z-index: 1000;
  background-color: #ffffffab;
  display: flex;
  flex-direction: column;
  align-items: center;

  & .modal-form {
    position: relative;
    top: 10vh;
    max-height: 75vh;
    width: 900px;
    max-width: 95vw;
    border-radius: 10px;
    box-shadow: 0 0 1px 1px #e4e4e4;
    overflow: auto;
    display: flex;
    flex-direction: column;
    justify-content: flex-start;


    & .modal-header {
      background: #ffc9af;
      display: flex;
      flex-direction: row;
      justify-content: space-between;
      align-items: center;
      padding: 10px;

      & .title {
        max-width: 100%;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        font-size: 1.2em;
      }

      & .btn-close {
        background: url('~@/assets/x-circle.svg') center no-repeat;
        background-size: contain;
        width: 25px;
        height: 25px;
        margin-left: 10px;
        flex-shrink: 0;
        cursor: pointer;
      }
    }

    .modal-nav-bar {
      background: #fcece4;
      border-bottom: 1px solid #debe93;
      padding: 10px 20px 0;


      .nav-button {
        float: left;
        background: #fef0dd;
        padding: 10px;
        border: 1px solid #debe93;
        margin: 0 5px -1px;
        cursor: pointer;
        border-top-right-radius: 10px;
        border-top-left-radius: 10px;
        color: #88b6c5;

        &.activeTab {
          cursor: auto;
          border-bottom-color: transparent;
          background: #ffe5c1;
          color: #2c3e50;
        }
      }
    }

    & .modal-body {
      padding: 20px;
      background: #ffe5c1;
      overflow: auto;
    }

    & .modal-footer {
      padding: 10px;
      background: #ffd192;
      display: flex;
      flex-direction: row;
      justify-content: flex-end;
      align-items: center;
    }

    button {
      display: inline-block;
      margin: 5px 20px;
      padding: 8px 14px;
      min-width: 100px;
      font-size: 14px;
      color: #2c3e50;
      cursor: pointer;
      background: linear-gradient(to bottom, #c0fffc, #37c5dc);
      border: 1px solid #9c9c9c;
      border-radius: 4px;
    }
  }
}

.choosePar {
  font-size: 18px;

  .par {
    margin: 5px 0;
    padding: 5px;
    cursor: pointer;

    &.active {
      background: #fef4e7;
      border-radius: 8px;
    }
  }

}

.changeText {

  textarea {
    outline: none;
    border: none;
    resize: none;
    padding: 10px;
    width: 100%;
    height: 400px;
    font-size: 14px;
  }
}
</style>