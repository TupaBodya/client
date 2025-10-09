import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '../views/AdminView.vue';
import AuthView from '../views/AuthView.vue';
import ProfileView from '../views/ProfileView.vue';
import MainView from '../views/MainView.vue';
import MMainView from '../views/MMainView.vue';
import MUniversityMapView from '../views/MUniversityMapView.vue';
import UniversityMapView from '../views/UniversityMapView.vue';

// Функция для определения мобильного устройства
const isMobileDevice = () => {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
         window.innerWidth <= 768;
};

const routes = [
  {
    path: '/',
    name: 'university-map',
    component: isMobileDevice() ? MUniversityMapView : UniversityMapView,
    meta: { requiresAuth: false }
  },
  {
    path: '/buildings',
    name: 'main',
    component: isMobileDevice() ? MMainView : MainView,
    meta: { requiresAuth: false }
  },
  {
    path: '/admin',
    name: 'admin',
    component: AdminView,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/auth',
    name: 'auth',
    component: AuthView,
    meta: { requiresGuest: false }
  },
  {
    path: '/profile',
    name: 'profile',
    component: ProfileView,
    meta: { requiresAuth: true }
  },
  {
    path: '/admin/edit/teachers/:id',
    name: 'edit-teacher',
    component: () => import('../views/admin/editTeacherView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/edit/groups/:id',
    name: 'edit-group',
    component: () => import('../views/admin/editGroupView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/edit/audiences/:id',
    name: 'edit-audience',
    component: () => import('../views/admin/editAudienceView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/edit/lessons/:id',
    name: 'edit-lesson',
    component: () => import('../views/admin/editLessonView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin/edit/schedule/:id',
    name: 'edit-schedule',
    component: () => import('../views/admin/editScheduleView.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  }
];

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes
});

let currentIsMobile = isMobileDevice();

const handleResize = () => {
  const newIsMobile = isMobileDevice();
  if (newIsMobile !== currentIsMobile) {
    currentIsMobile = newIsMobile;
    
    if (router.currentRoute.value.name === 'main') {
      router.replace({
        ...router.currentRoute.value,
        component: newIsMobile ? MMainView : MainView,
        component: newIsMobile ? MUniversityMapView : UniversityMapView
      });
    }
  }
};

window.addEventListener('resize', handleResize);

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

  if (to.name === 'main') {
    to.matched[0].components.default = isMobileDevice() ? MMainView : MainView;
  }

  if (to.meta.requiresAuth && !token) {
    next('/auth');
    return;
  }

  if (to.meta.requiresAdmin && (!user || user.role !== 'admin')) {
    next('/');
    return;
  }

  if (to.meta.requiresGuest && token) {
    next('/');
    return;
  }

  next();
});

export default router;