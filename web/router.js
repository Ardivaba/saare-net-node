import { createRouter, createWebHistory } from 'vue-router'

import HomeView from './pages/HomeView.vue'
import EventsView from "./pages/EventsView.vue";
import SettingsView from "./pages/SettingsView.vue";
import LoginView from "./pages/LoginView.vue";
import WorkersView from './pages/WorkersView.vue';
import WorkerView from './pages/WorkerView.vue';
import WorkerEdit from './pages/WorkerEdit.vue';
import RecipesView from './pages/RecipesView.vue';
import RecipeView from './pages/RecipeView.vue';
import RecipeEdit from './pages/RecipeEdit.vue';
import OrdersView from './pages/OrdersView.vue'
import OrderView from './pages/OrderView.vue'
import OrderEdit from './pages/OrderEdit.vue'
import MachinesView from './pages/MachinesView.vue'
import MachineView from './pages/MachineView.vue'
import MachineEdit from './pages/MachineEdit.vue'
import ProductionsView from './pages/ProductionsView.vue';
import ProductionWorkLogsView from './pages/ProductionWorkLogsView.vue';
import ReportsView from './pages/ReportsView.vue';
import WorkerLogin from './pages/WorkerLogin.vue';
import WorkerDashboard from './pages/WorkerDashboard.vue';
import DocumentationView from './pages/DocumentationView.vue';

const routes = [
    {path: '/', name: 'home', component: HomeView},
    {path: '/events', name: 'events', component: EventsView},
    {path: '/settings', name: 'settings', component: SettingsView},
    {path: '/login', name: 'login', component: LoginView},
    {path: '/:pathMatch(.*)*', redirect: '/'},
    {path: '/workers', name: 'workers', component: WorkersView},
    {path: '/workers/create', name: 'worker-create', component: WorkerEdit},
    {path: '/workers/:id', name: 'worker-view', component: WorkerView},
    {path: '/workers/edit/:id', name: 'worker-edit', component: WorkerEdit},
    {path: '/recipes', name: 'recipes', component: RecipesView},
    {path: '/recipes/create', name: 'recipe-create', component: RecipeEdit},
    {path: '/recipes/:id', name: 'recipe-view', component: RecipeView},
    {path: '/recipes/edit/:id', name: 'recipe-edit', component: RecipeEdit},
    {path: '/orders', name: 'orders', component: OrdersView},
    {path: '/orders/create', name: 'order-create', component: OrderEdit},
    {path: '/orders/:id', name: 'order-view', component: OrderView},
    {path: '/orders/edit/:id', name: 'order-edit', component: OrderEdit},
    {path: '/machines', name: 'machines', component: MachinesView},
    {path: '/machines/create', name: 'machine-create', component: MachineEdit},
    {path: '/machines/:id', name: 'machine-view', component: MachineView},
    {path: '/machines/edit/:id', name: 'machine-edit', component: MachineEdit},
    {path: '/reports', name: 'reports', component: ReportsView},
    {path: '/productions', name: 'productions', component: ProductionsView},
    {path: '/production-work-logs', name: 'production-work-logs', component: ProductionWorkLogsView},
    {path: '/worker-login', name: 'worker-login', component: WorkerLogin},
    {path: '/worker-dashboard', name: 'worker-dashboard', component: WorkerDashboard},
    {
        path: '/documentation',
        name: 'documentation',
        component: DocumentationView,
        meta: { hideHeader: true }
    }
]

const router = createRouter({
    history: createWebHistory(),
    routes,
})

export default router;