import { createApp } from 'vue'
import App from './App.vue'

import 'bootstrap/dist/css/bootstrap.min.css';
import 'bootstrap/dist/js/bootstrap.bundle.min.js';

import router from './router';

import './firebase/init.js';

import PrimeVue from 'primevue/config'
import DataTable from 'primevue/datatable'
import Column from 'primevue/column'
import Aura from '@primeuix/themes/aura';

//import 'primevue/resources/themes/saga-blue/theme.css';  // ✅ safe, included in v4
//import 'primevue/resources/primevue.min.css';
//import 'primeicons/primeicons.css';

const app = createApp(App)
app.use(router);
app.use(PrimeVue, {
    theme: {
        preset: Aura
    }
});
app.component('DataTable', DataTable)
app.component('Column', Column)
app.mount('#app')