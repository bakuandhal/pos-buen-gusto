import { createRouter, createWebHistory } from 'vue-router';
import DashboardView from '@/views/DashboardView.vue';
import MesaDetailView from '@/views/MesaDetailView.vue';
import CatalogoView from '@/views/CatalogoView.vue';
import PreciosView from '@/views/PreciosView.vue';
import CocinaView from '@/views/CocinaView.vue';
import CajaView from '@/views/CajaView.vue';
import AdministracionPreciosView from '@/views/AdministracionPreciosView.vue';
import CotizadorPrecioView from '@/views/CotizadorPrecioView.vue';

const routes = [
  { path: '/', name: 'dashboard', component: DashboardView },
  { path: '/mesas/:id', name: 'mesa-detalle', component: MesaDetailView },
  { path: '/catalogo', name: 'catalogo', component: CatalogoView },
  { path: '/precios', name: 'precios', component: PreciosView },
  { path: '/precios/admin', name: 'precios-admin', component: AdministracionPreciosView },
  { path: '/precios/cotizador', name: 'precios-cotizador', component: CotizadorPrecioView },
  { path: '/cocina', name: 'cocina', component: CocinaView },
  { path: '/caja', name: 'caja', component: CajaView },
];

export const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
  scrollBehavior(_to, _from, savedPosition) {
    if (savedPosition) {
      return savedPosition;
    }
    return { top: 0, behavior: 'smooth' };
  },
});
