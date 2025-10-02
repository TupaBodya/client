import { createRouter, createWebHistory } from 'vue-router';
import AdminView from '../views/AdminView.vue';
import AuthView from '../views/AuthView.vue';
import ProfileView from '../views/ProfileView.vue';
import MainView from '../views/MainView.vue';
import UniversityMapView from '../views/UniversityMapView.vue';

const routes = [
  {
    path: '/',
    name: 'university-map',
    component: UniversityMapView,
    meta: { requiresAuth: false }
  },
  {
    path: '/buildings',
    name: 'main',
    component: MainView,
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

router.beforeEach(async (to, from, next) => {
  const token = localStorage.getItem('token');
  const user = JSON.parse(localStorage.getItem('user'));

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