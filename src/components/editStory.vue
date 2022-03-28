<script setup>
import { getStoryData, newStoryPar } from "@/api/words"
import {ref, onMounted, nextTick, defineEmits} from 'vue'

const emit = defineEmits(['closeEditStory', 'reCreateStory'])

let storyData = ref()
let activePar = ref()

onMounted(async ()=> {
  storyData.value = await getStoryData()
  activePar.value = storyData.value.lastPar
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

const handleOK = ()=> {
  if (activePar.value !== storyData.value.lastPar) { // нужно сохранить новое значение активного параграфа
    newStoryPar(activePar.value)
    emit('reCreateStory') // пересоздать Words
    emit('closeEditStory')
  }
}
</script>

<template>
  <div class="modal-container">
    <div class="modal-form">
      <div class="modal-header">
        <div class="title">storyMod</div>
        <div class="btn-close" @click="$emit('closeEditStory')"></div>
      </div>
      <div class="modal-body">
        <div class="choosePar">
          <template v-if="storyData !== undefined">
            <div v-for="(par, index) in storyData.storyArr" :key="index" class="par" :class="{active: index === activePar}"
                  @click="activePar = index">
              {{ par }}
            </div>
          </template>
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
</style>