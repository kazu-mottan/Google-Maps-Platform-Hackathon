import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'

import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

import { createVuetify } from 'vuetify'
import { VOverlay } from 'vuetify/components'
import * as directives from 'vuetify/directives'

import VueQrcode from '@chenfengyuan/vue-qrcode';

const app = createApp(App);
app.use(store).use(router);
app.use(ElementPlus);

const vuetify = createVuetify({
    VOverlay,
    directives,
});
app.use(vuetify);

app.component(VueQrcode.name, VueQrcode);
app.mount('#app');
