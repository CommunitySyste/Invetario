import { defineStore } from "pinia";
import { ref } from "vue";

export const useNotificationStore = defineStore('notification', () => {
    const show = ref(false);
    const message = ref('');
    const type = ref('success');

    function notify(msg, t = 'success') {
        message.value = msg;
        type.value = t;
        show.value = true;

        setTimeout(() => {
            show.value = false;
        }, 3000);
    }
    return { show, message, type, notify };
})