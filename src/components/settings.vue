<template>
    <div class="settingsBlock">
        quantity: {{ quantity }}
        <div>
            <span>Количество</span>
            <input type="text" v-model="quantity">
        </div>
    </div>
</template>

<script>

    import {ref, onBeforeUnmount} from 'vue'

    export default {
        name: "settings",
        components: {},
        props: {
            settings: {
                type: Object,
            }
        },
        setup(props, { emit }) {
            let quantity = ref(props.settings.wordsQuantity)

            onBeforeUnmount( ()=> {
                console.log(`props.settings.wordsQuantity: ${props.settings.wordsQuantity}`);
                console.log(`quantity.value: ${quantity.value}`);
                emit('updateSettings', quantity.value)
            })

            return {
                quantity
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
.settingsBlock {
    width: 200px;
    height: 300px;
    position: absolute;
    border: 1px solid red;
    padding: 10px;
    background: beige;
    right: 13px;
    top: 96px;
}
</style>