<template>
  <div class="profile-main-container">
    <!-- Навигационная панель как на главной -->
    <nav class="top-nav glassmorphism">
      <div class="logo">
        <i><img src="/img/logo.jpg" class="logo_img"></i>
        <span>Карта БГИТУ</span>
      </div>
      <div class="nav-buttons">
        <router-link to="/" class="nav-btn">
          <i class="fas fa-map-marked-alt"></i>
          <span class="btn-text">Территория</span>
        </router-link>
        <router-link to="/buildings" class="nav-btn">
          <i class="fas fa-university"></i>
          <span class="btn-text">Корпус</span>
        </router-link>
      </div>
      <div class="user-actions">
        <div class="user-profile" v-if="user">
          <div class="avatar-wrapper">
            <img :src="user.avatar || '/img/default-avatar.png'" class="user-avatar" alt="Аватар">
          </div>
          <span class="username">{{ user.username }}</span>
          <button @click="logout" class="logout-btn">
            <i class="fas fa-sign-out-alt"></i>
          </button>
        </div>
      </div>
    </nav>

    <!-- Основной контент профиля -->
    <div class="profile-content">
      <div class="profile-layout">
        <!-- Боковая панель -->
        <div class="profile-sidebar glassmorphism">
          <div class="sidebar-header">
            <div class="avatar-section">
              <div class="avatar-container">
                <img 
                  :src="user.avatar || '/img/default-avatar.png'" 
                  alt="Аватар" 
                  class="profile-avatar"
                  @click="triggerAvatarUpload"
                >
                <div class="avatar-overlay" @click="triggerAvatarUpload">
                  <i class="fas fa-camera"></i>
                </div>
                <input 
                  type="file" 
                  ref="avatarInput"
                  @change="handleAvatarUpload" 
                  accept="image/*" 
                  class="avatar-upload"
                >
              </div>
              <h2 class="username">{{ user.username }}</h2>
              <p class="user-role">{{ user.role === 'admin' ? 'Администратор' : 'Пользователь' }}</p>
            </div>
          </div>

          <nav class="sidebar-nav">
            <button 
              v-for="tab in tabs" 
              :key="tab.id"
              @click="activeTab = tab.id"
              :class="['nav-item', { 'active': activeTab === tab.id }]"
            >
              <i :class="tab.icon"></i>
              <span>{{ tab.name }}</span>
              <i class="fas fa-chevron-right arrow"></i>
            </button>
          </nav>

          <div class="sidebar-stats glassmorphism">
            <h3>Статистика</h3>
            <div class="stat-item">
              <i class="fas fa-calendar-day"></i>
              <span>Зарегистрирован</span>
              <strong>{{ formatDate(user.created_at) }}</strong>
            </div>
            <div class="stat-item">
              <i class="fas fa-history"></i>
              <span>Последний вход</span>
              <strong>{{ formatDate(user.last_login) }}</strong>
            </div>
          </div>
        </div>

        <!-- Основная область контента -->
        <div class="profile-main">
          <!-- Вкладка основная информация -->
          <div v-if="activeTab === 'main'" class="tab-content">
            <div class="tab-header">
              <h1><i class="fas fa-user-cog"></i> Основная информация</h1>
              <p>Управление вашими персональными данными</p>
            </div>

            <form @submit.prevent="updateProfile" class="profile-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-user"></i>
                    Имя пользователя
                  </label>
                  <input 
                    v-model="formData.username" 
                    type="text" 
                    class="form-input"
                    :class="{ 'error': errors.username }"
                    required
                  >
                  <span v-if="errors.username" class="error-text">{{ errors.username }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-envelope"></i>
                    Email адрес
                  </label>
                  <input 
                    v-model="formData.email" 
                    type="email" 
                    class="form-input"
                    :class="{ 'error': errors.email }"
                    required
                  >
                  <span v-if="errors.email" class="error-text">{{ errors.email }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-users"></i>
                    Учебная группа
                  </label>
                  <input 
                    v-model="formData.group" 
                    type="text" 
                    class="form-input"
                    placeholder="Введите вашу группу"
                  >
                </div>

                <div class="form-group full-width">
                  <label class="form-label">
                    <i class="fas fa-info-circle"></i>
                    О себе
                  </label>
                  <textarea 
                    v-model="formData.bio" 
                    class="form-textarea"
                    placeholder="Расскажите немного о себе..."
                    rows="4"
                  ></textarea>
                </div>
              </div>

              <div class="form-actions">
                <button type="submit" class="save-btn" :disabled="loading">
                  <i class="fas" :class="loading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                  {{ loading ? 'Сохранение...' : 'Сохранить изменения' }}
                </button>
                <button type="button" @click="resetForm" class="reset-btn">
                  <i class="fas fa-undo"></i>
                  Сбросить
                </button>
              </div>
            </form>
          </div>

          <!-- Вкладка безопасность -->
          <div v-if="activeTab === 'security'" class="tab-content">
            <div class="tab-header">
              <h1><i class="fas fa-shield-alt"></i> Безопасность</h1>
              <p>Управление паролем и настройками безопасности</p>
            </div>

            <form @submit.prevent="updatePassword" class="security-form">
              <div class="form-grid">
                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-lock"></i>
                    Текущий пароль
                  </label>
                  <div class="password-input-wrapper">
                    <input 
                      v-model="passwordData.currentPassword" 
                      :type="showCurrentPassword ? 'text' : 'password'" 
                      class="form-input"
                      :class="{ 'error': errors.currentPassword }"
                      required
                    >
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showCurrentPassword = !showCurrentPassword"
                    >
                      <i :class="showCurrentPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <span v-if="errors.currentPassword" class="error-text">{{ errors.currentPassword }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-key"></i>
                    Новый пароль
                  </label>
                  <div class="password-input-wrapper">
                    <input 
                      v-model="passwordData.newPassword" 
                      :type="showNewPassword ? 'text' : 'password'" 
                      class="form-input"
                      :class="{ 'error': errors.newPassword }"
                    >
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showNewPassword = !showNewPassword"
                    >
                      <i :class="showNewPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <div class="password-strength" v-if="passwordData.newPassword">
                    <div class="strength-bar" :class="passwordStrength"></div>
                    <span class="strength-text">{{ strengthText }}</span>
                  </div>
                  <span v-if="errors.newPassword" class="error-text">{{ errors.newPassword }}</span>
                </div>

                <div class="form-group">
                  <label class="form-label">
                    <i class="fas fa-redo"></i>
                    Подтверждение пароля
                  </label>
                  <div class="password-input-wrapper">
                    <input 
                      v-model="passwordData.confirmPassword" 
                      :type="showConfirmPassword ? 'text' : 'password'" 
                      class="form-input"
                      :class="{ 'error': errors.confirmPassword }"
                    >
                    <button 
                      type="button" 
                      class="password-toggle"
                      @click="showConfirmPassword = !showConfirmPassword"
                    >
                      <i :class="showConfirmPassword ? 'fas fa-eye-slash' : 'fas fa-eye'"></i>
                    </button>
                  </div>
                  <span v-if="errors.confirmPassword" class="error-text">{{ errors.confirmPassword }}</span>
                </div>
              </div>

              <div class="security-tips">
                <h4><i class="fas fa-lightbulb"></i> Советы по безопасности:</h4>
                <ul>
                  <li>Используйте пароль длиной не менее 8 символов</li>
                  <li>Включайте заглавные буквы, цифры и специальные символы</li>
                  <li>Не используйте один и тот же пароль на разных сайтах</li>
                </ul>
              </div>

              <div class="form-actions">
                <button type="submit" class="save-btn" :disabled="passwordLoading">
                  <i class="fas" :class="passwordLoading ? 'fa-spinner fa-spin' : 'fa-key'"></i>
                  {{ passwordLoading ? 'Обновление...' : 'Обновить пароль' }}
                </button>
              </div>
            </form>
          </div>

          <!-- Вкладка активность -->
          <div v-if="activeTab === 'activity'" class="tab-content">
            <div class="tab-header">
              <h1><i class="fas fa-chart-line"></i> Активность</h1>
              <p>История ваших действий и поисков</p>
            </div>

            <div class="activity-stats">
              <div class="stat-cards">
                <div class="stat-card glassmorphism">
                  <i class="fas fa-search stat-icon"></i>
                  <div class="stat-content">
                    <h3>{{ userStats.totalSearches }}</h3>
                    <p>Всего поисков</p>
                  </div>
                </div>
                <div class="stat-card glassmorphism">
                  <i class="fas fa-calendar-check stat-icon"></i>
                  <div class="stat-content">
                    <h3>{{ userStats.thisWeekSearches }}</h3>
                    <p>Поисков за неделю</p>
                  </div>
                </div>
                <div class="stat-card glassmorphism">
                  <i class="fas fa-star stat-icon"></i>
                  <div class="stat-content">
                    <h3>{{ userStats.favoriteAudiences }}</h3>
                    <p>Избранных аудиторий</p>
                  </div>
                </div>
              </div>
            </div>

            <div class="recent-activity">
              <h3><i class="fas fa-history"></i> Недавняя активность</h3>
              <div class="activity-list">
                <div 
                  v-for="activity in recentActivity" 
                  :key="activity.id"
                  class="activity-item"
                >
                  <i :class="activity.icon"></i>
                  <div class="activity-content">
                    <p>{{ activity.description }}</p>
                    <span class="activity-time">{{ activity.time }}</span>
                  </div>
                </div>
                <div v-if="recentActivity.length === 0" class="empty-state">
                  <i class="fas fa-inbox"></i>
                  <p>Активность отсутствует</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Вкладка настройки -->
          <div v-if="activeTab === 'settings'" class="tab-content">
            <div class="tab-header">
              <h1><i class="fas fa-cog"></i> Настройки</h1>
              <p>Настройте внешний вид и поведение приложения</p>
            </div>

            <div class="settings-sections">
              <div class="settings-section glassmorphism">
                <h3><i class="fas fa-palette"></i> Внешний вид</h3>
                <div class="setting-item">
                  <label>Тема оформления</label>
                  <select v-model="settings.theme" class="form-select">
                    <option value="light">Светлая</option>
                    <option value="dark">Тёмная</option>
                    <option value="auto">Системная</option>
                  </select>
                </div>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="settings.compactMode" 
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    Компактный режим
                  </label>
                </div>
              </div>

              <div class="settings-section glassmorphism">
                <h3><i class="fas fa-bell"></i> Уведомления</h3>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="settings.emailNotifications" 
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    Email уведомления
                  </label>
                </div>
                <div class="setting-item">
                  <label class="checkbox-label">
                    <input 
                      type="checkbox" 
                      v-model="settings.newsletter" 
                      class="checkbox"
                    >
                    <span class="checkmark"></span>
                    Рассылка новостей
                  </label>
                </div>
              </div>

              <div class="settings-section glassmorphism danger-zone">
                <h3><i class="fas fa-exclamation-triangle"></i> Опасная зона</h3>
                <div class="setting-item">
                  <p>Удаление аккаунта безвозвратно удалит все ваши данные</p>
                  <button @click="showDeleteConfirm = true" class="delete-btn">
                    <i class="fas fa-trash"></i>
                    Удалить аккаунт
                  </button>
                </div>
              </div>
            </div>

            <div class="form-actions">
              <button @click="saveSettings" class="save-btn" :disabled="settingsLoading">
                <i class="fas" :class="settingsLoading ? 'fa-spinner fa-spin' : 'fa-save'"></i>
                {{ settingsLoading ? 'Сохранение...' : 'Сохранить настройки' }}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Уведомления -->
    <transition name="slide-down">
      <div v-if="success" class="notification success glassmorphism">
        <i class="fas fa-check-circle"></i>
        <span>{{ success }}</span>
        <button @click="success = ''" class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>

    <transition name="slide-down">
      <div v-if="error" class="notification error glassmorphism">
        <i class="fas fa-exclamation-circle"></i>
        <span>{{ error }}</span>
        <button @click="error = ''" class="notification-close">
          <i class="fas fa-times"></i>
        </button>
      </div>
    </transition>

    <!-- Модальное окно подтверждения удаления -->
    <transition name="modal">
      <div v-if="showDeleteConfirm" class="modal-overlay" @click.self="showDeleteConfirm = false">
        <div class="modal-container glassmorphism">
          <div class="modal-header">
            <h3><i class="fas fa-exclamation-triangle"></i> Подтверждение удаления</h3>
            <button @click="showDeleteConfirm = false" class="close-btn">
              <i class="fas fa-times"></i>
            </button>
          </div>
          <div class="modal-content">
            <p>Вы уверены, что хотите удалить свой аккаунт? Это действие нельзя отменить.</p>
            <div class="modal-actions">
              <button @click="deleteAccount" class="delete-confirm-btn">
                <i class="fas fa-trash"></i>
                Да, удалить аккаунт
              </button>
              <button @click="showDeleteConfirm = false" class="cancel-btn">
                Отмена
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'EnhancedProfileView',
  setup() {
    const router = useRouter();
    
    // Refs
    const user = ref(JSON.parse(localStorage.getItem('user')) || {});
    const activeTab = ref('main');
    const loading = ref(false);
    const passwordLoading = ref(false);
    const settingsLoading = ref(false);
    const showDeleteConfirm = ref(false);
    const success = ref('');
    const error = ref('');
    const avatarInput = ref(null);
    
    // Password visibility
    const showCurrentPassword = ref(false);
    const showNewPassword = ref(false);
    const showConfirmPassword = ref(false);
    
    // Form data
    const formData = ref({
      username: '',
      email: '',
      group: '',
      bio: ''
    });
    
    const passwordData = ref({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
    
    const settings = ref({
      theme: 'light',
      compactMode: false,
      emailNotifications: true,
      newsletter: false
    });
    
    const errors = ref({});
    
    // Mock data for activity
    const userStats = ref({
      totalSearches: 24,
      thisWeekSearches: 5,
      favoriteAudiences: 3
    });
    
    const recentActivity = ref([
      {
        id: 1,
        icon: 'fas fa-search',
        description: 'Поиск аудитории 301',
        time: '2 часа назад'
      },
      {
        id: 2,
        icon: 'fas fa-map-marker-alt',
        description: 'Просмотр 2 корпуса',
        time: '5 часов назад'
      },
      {
        id: 3,
        icon: 'fas fa-star',
        description: 'Добавлена в избранное аудитория 215',
        time: '1 день назад'
      }
    ]);
    
    // Tabs configuration
    const tabs = [
      { id: 'main', name: 'Основная информация', icon: 'fas fa-user' },
      { id: 'security', name: 'Безопасность', icon: 'fas fa-shield-alt' },
      { id: 'activity', name: 'Активность', icon: 'fas fa-chart-line' },
      { id: 'settings', name: 'Настройки', icon: 'fas fa-cog' }
    ];
    
    // Computed
    const passwordStrength = computed(() => {
      const password = passwordData.value.newPassword;
      if (!password) return '';
      
      const strongRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
      const mediumRegex = /^(?=.*[a-zA-Z])(?=.*\d)[A-Za-z\d]{6,}$/;
      
      if (strongRegex.test(password)) return 'strong';
      if (mediumRegex.test(password)) return 'medium';
      return 'weak';
    });
    
    const strengthText = computed(() => {
      switch (passwordStrength.value) {
        case 'strong': return 'Сильный пароль';
        case 'medium': return 'Средний пароль';
        case 'weak': return 'Слабый пароль';
        default: return '';
      }
    });
    
    // Methods
    const loadProfile = async () => {
      try {
        const response = await axios.get('/api/auth/me');
        const userData = response.data;
        
        formData.value = {
          username: userData.username,
          email: userData.email,
          group: userData.group || '',
          bio: userData.bio || ''
        };
        
        // Load settings from localStorage
        const savedSettings = localStorage.getItem('userSettings');
        if (savedSettings) {
          settings.value = { ...settings.value, ...JSON.parse(savedSettings) };
        }
      } catch (err) {
        console.error('Ошибка загрузки профиля:', err);
        error.value = 'Не удалось загрузить данные профиля';
      }
    };
    
    const validateForm = () => {
      errors.value = {};
      
      if (!formData.value.username.trim()) {
        errors.value.username = 'Имя пользователя обязательно';
      }
      
      if (!formData.value.email.trim()) {
        errors.value.email = 'Email обязателен';
      } else if (!/\S+@\S+\.\S+/.test(formData.value.email)) {
        errors.value.email = 'Некорректный email адрес';
      }
      
      return Object.keys(errors.value).length === 0;
    };
    
    const validatePassword = () => {
      errors.value = {};
      
      if (!passwordData.value.currentPassword) {
        errors.value.currentPassword = 'Текущий пароль обязателен';
      }
      
      if (passwordData.value.newPassword && passwordData.value.newPassword.length < 6) {
        errors.value.newPassword = 'Пароль должен содержать минимум 6 символов';
      }
      
      if (passwordData.value.newPassword !== passwordData.value.confirmPassword) {
        errors.value.confirmPassword = 'Пароли не совпадают';
      }
      
      return Object.keys(errors.value).length === 0;
    };
    
    const updateProfile = async () => {
      if (!validateForm()) return;
      
      loading.value = true;
      try {
        const response = await axios.put('/api/auth/me', formData.value);
        
        // Update user in localStorage
        const updatedUser = {
          ...user.value,
          username: response.data.username,
          email: response.data.email
        };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        user.value = updatedUser;
        
        success.value = 'Профиль успешно обновлен!';
        setTimeout(() => success.value = '', 3000);
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка при обновлении профиля';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };
    
    const updatePassword = async () => {
      if (!validatePassword()) return;
      
      passwordLoading.value = true;
      try {
        await axios.put('/api/auth/me/password', {
          currentPassword: passwordData.value.currentPassword,
          newPassword: passwordData.value.newPassword
        });
        
        success.value = 'Пароль успешно обновлен!';
        passwordData.value = {
          currentPassword: '',
          newPassword: '',
          confirmPassword: ''
        };
        setTimeout(() => success.value = '', 3000);
      } catch (err) {
        error.value = err.response?.data?.error || 'Ошибка при обновлении пароля';
        console.error(err);
      } finally {
        passwordLoading.value = false;
      }
    };
    
    const handleAvatarUpload = async (event) => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type and size
      if (!file.type.startsWith('image/')) {
        error.value = 'Пожалуйста, выберите изображение';
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        error.value = 'Размер файла не должен превышать 5MB';
        return;
      }

      try {
        const formData = new FormData();
        formData.append('avatar', file);
        
        loading.value = true;
        
        const response = await axios.post('/api/auth/me/avatar', formData, {
          headers: {
            'Content-Type': 'multipart/form-data'
          }
        });
        
        // Update user avatar in local state
        user.value.avatar = response.data.avatarUrl;
        localStorage.setItem('user', JSON.stringify(user.value));
        
        success.value = 'Аватар успешно обновлен!';
        setTimeout(() => success.value = '', 3000);
        
      } catch (err) {
        console.error('Avatar upload error:', err);
        if (err.response?.data?.error) {
          error.value = err.response.data.error;
        } else {
          error.value = 'Ошибка загрузки аватара';
        }
      } finally {
        loading.value = false;
        // Reset file input
        if (avatarInput.value) {
          avatarInput.value.value = '';
        }
      }
    };
    
    const triggerAvatarUpload = () => {
      avatarInput.value?.click();
    };
    
    const saveSettings = async () => {
      settingsLoading.value = true;
      try {
        // Save settings to backend
        await axios.put('/api/auth/me/settings', settings.value);
        
        // Save to localStorage for immediate effect
        localStorage.setItem('userSettings', JSON.stringify(settings.value));
        
        success.value = 'Настройки сохранены!';
        setTimeout(() => success.value = '', 3000);
      } catch (err) {
        error.value = 'Ошибка сохранения настроек';
        console.error(err);
      } finally {
        settingsLoading.value = false;
      }
    };
    
    const deleteAccount = async () => {
      try {
        await axios.delete('/api/auth/me');
        localStorage.removeItem('user');
        localStorage.removeItem('userSettings');
        router.push('/auth');
      } catch (err) {
        error.value = 'Ошибка удаления аккаунта';
        console.error(err);
      }
    };
    
    const resetForm = () => {
      loadProfile();
    };
    
    const logout = () => {
      localStorage.removeItem('user');
      router.push('/auth');
    };
    
    const formatDate = (dateString) => {
      if (!dateString) return 'Неизвестно';
      return new Date(dateString).toLocaleDateString('ru-RU');
    };
    
    // Lifecycle
    onMounted(() => {
      if (!user.value) {
        router.push('/auth');
        return;
      }
      loadProfile();
    });
    
    return {
      // Refs
      user,
      activeTab,
      loading,
      passwordLoading,
      settingsLoading,
      showDeleteConfirm,
      success,
      error,
      avatarInput,
      showCurrentPassword,
      showNewPassword,
      showConfirmPassword,
      formData,
      passwordData,
      settings,
      errors,
      userStats,
      recentActivity,
      tabs,
      
      // Computed
      passwordStrength,
      strengthText,
      
      // Methods
      updateProfile,
      updatePassword,
      handleAvatarUpload,
      triggerAvatarUpload,
      saveSettings,
      deleteAccount,
      resetForm,
      logout,
      formatDate
    };
  }
};
</script>

<style scoped>
.profile-main-container {
  min-height: 100vh;
  background: #edf2f7;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Навигационная панель */
.top-nav {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 24px;
  height: 72px;
  color: #2d3748;
  z-index: 50;
  transition: all 0.3s ease;
}

.logo {
  display: flex;
  align-items: center;
  gap: 12px;
  font-size: 1.5rem;
  font-weight: 700;
  color: #2d3748;
}

.logo_img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.nav-buttons {
  display: flex;
  gap: 8px;
}

.nav-btn {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  background: transparent;
  border: none;
  border-radius: 8px;
  color: #4a5568;
  text-decoration: none;
  cursor: pointer;
  transition: all 0.3s ease;
  font-weight: 500;
}

.nav-btn:hover,
.nav-btn.router-link-active {
  background: rgba(255, 255, 255, 0.6);
  color: #4361ee;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
}

.user-profile {
  display: flex;
  align-items: center;
  gap: 12px;
}

.avatar-wrapper {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  padding: 2px;
}

.user-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.username {
  font-weight: 500;
}

.logout-btn {
  background: none;
  border: none;
  color: #718096;
  font-size: 1.1rem;
  cursor: pointer;
  transition: all 0.2s ease;
  padding: 8px;
  border-radius: 50%;
}

.logout-btn:hover {
  background-color: rgba(237, 242, 247, 0.9);
  color: #e53e3e;
}

/* Основной контент */
.profile-content {
  padding: 24px;
}

.profile-layout {
  display: grid;
  grid-template-columns: 300px 1fr;
  gap: 24px;
  max-width: 1400px;
  margin: 0 auto;
}

/* Боковая панель */
.profile-sidebar {
  border-radius: 16px;
  padding: 24px;
  height: fit-content;
  position: sticky;
  top: 24px;
}

.sidebar-header {
  text-align: center;
  margin-bottom: 24px;
}

.avatar-container {
  position: relative;
  width: 120px;
  height: 120px;
  margin: 0 auto 16px;
  cursor: pointer;
}

.profile-avatar {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  object-fit: cover;
  border: 4px solid #4361ee;
  transition: all 0.3s ease;
}

.avatar-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: all 0.3s ease;
  color: white;
}

.avatar-container:hover .avatar-overlay {
  opacity: 1;
}

.avatar-container:hover .profile-avatar {
  transform: scale(1.05);
}

.avatar-upload {
  display: none;
}

.sidebar-header h2 {
  margin: 0 0 4px 0;
  color: #2d3748;
  font-size: 1.4rem;
}

.user-role {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

/* Навигация боковой панели */
.sidebar-nav {
  margin-bottom: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  background: none;
  border: none;
  border-radius: 8px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-bottom: 4px;
}

.nav-item:hover {
  background: rgba(67, 97, 238, 0.1);
  color: #4361ee;
}

.nav-item.active {
  background: #4361ee;
  color: white;
}

.nav-item i:first-child {
  margin-right: 12px;
  width: 20px;
  text-align: center;
}

.arrow {
  font-size: 0.8rem;
  opacity: 0.7;
}

/* Статистика */
.sidebar-stats {
  padding: 16px;
  border-radius: 12px;
}

.sidebar-stats h3 {
  margin: 0 0 16px 0;
  font-size: 1.1rem;
  color: #2d3748;
}

.stat-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid #e2e8f0;
}

.stat-item:last-child {
  border-bottom: none;
}

.stat-item i {
  color: #4361ee;
  margin-right: 8px;
}

.stat-item span {
  flex: 1;
  color: #718096;
  font-size: 0.9rem;
}

.stat-item strong {
  color: #2d3748;
  font-size: 0.9rem;
}

/* Основная область */
.profile-main {
  min-height: 600px;
}

.tab-content {
  animation: fadeIn 0.3s ease;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
}

.tab-header {
  margin-bottom: 32px;
}

.tab-header h1 {
  margin: 0 0 8px 0;
  color: #2d3748;
  font-size: 2rem;
  display: flex;
  align-items: center;
  gap: 12px;
}

.tab-header p {
  margin: 0;
  color: #718096;
  font-size: 1.1rem;
}

/* Формы */
.profile-form,
.security-form {
  background: white;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 24px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 32px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group.full-width {
  grid-column: 1 / -1;
}

.form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 8px;
  font-weight: 600;
  color: #2d3748;
}

.form-label i {
  color: #4361ee;
}

.form-input,
.form-textarea,
.form-select {
  padding: 12px 16px;
  border: 2px solid #e2e8f0;
  border-radius: 8px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background: white;
}

.form-input:focus,
.form-textarea:focus,
.form-select:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.form-input.error,
.form-textarea.error {
  border-color: #e53e3e;
}

.error-text {
  color: #e53e3e;
  font-size: 0.85rem;
  margin-top: 4px;
}

.form-textarea {
  resize: vertical;
  min-height: 100px;
  font-family: inherit;
}

/* Пароль */
.password-input-wrapper {
  position: relative;
}

.password-toggle {
  position: absolute;
  right: 12px;
  top: 50%;
  transform: translateY(-50%);
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
}

.password-strength {
  margin-top: 8px;
}

.strength-bar {
  height: 4px;
  border-radius: 2px;
  margin-bottom: 4px;
  transition: all 0.3s ease;
}

.strength-bar.weak {
  background: #e53e3e;
  width: 33%;
}

.strength-bar.medium {
  background: #d69e2e;
  width: 66%;
}

.strength-bar.strong {
  background: #38a169;
  width: 100%;
}

.strength-text {
  font-size: 0.85rem;
  color: #718096;
}

.security-tips {
  background: #f7fafc;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 24px;
}

.security-tips h4 {
  margin: 0 0 12px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.security-tips ul {
  margin: 0;
  padding-left: 20px;
  color: #718096;
}

.security-tips li {
  margin-bottom: 4px;
}

/* Статистика активности */
.activity-stats {
  margin-bottom: 32px;
}

.stat-cards {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-bottom: 24px;
}

.stat-card {
  padding: 20px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 16px;
}

.stat-icon {
  font-size: 2rem;
  color: #4361ee;
}

.stat-content h3 {
  margin: 0;
  font-size: 1.8rem;
  color: #2d3748;
}

.stat-content p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
}

/* Активность */
.recent-activity {
  background: white;
  border-radius: 16px;
  padding: 24px;
}

.recent-activity h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.activity-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.activity-item {
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-radius: 8px;
  background: #f7fafc;
  transition: all 0.3s ease;
}

.activity-item:hover {
  background: #edf2f7;
  transform: translateX(4px);
}

.activity-item i {
  color: #4361ee;
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.activity-content {
  flex: 1;
}

.activity-content p {
  margin: 0 0 4px 0;
  color: #2d3748;
}

.activity-time {
  font-size: 0.85rem;
  color: #718096;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
}

.empty-state i {
  font-size: 3rem;
  margin-bottom: 16px;
  opacity: 0.5;
}

/* Настройки */
.settings-sections {
  display: flex;
  flex-direction: column;
  gap: 24px;
  margin-bottom: 32px;
}

.settings-section {
  padding: 24px;
  border-radius: 12px;
}

.settings-section h3 {
  margin: 0 0 20px 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.setting-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 16px 0;
  border-bottom: 1px solid #e2e8f0;
}

.setting-item:last-child {
  border-bottom: none;
}

.setting-item label {
  font-weight: 500;
  color: #2d3748;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  user-select: none;
}

.checkbox {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  position: relative;
  transition: all 0.3s ease;
}

.checkbox:checked + .checkmark {
  background: #4361ee;
  border-color: #4361ee;
}

.checkbox:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  color: white;
  font-size: 12px;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
}

.danger-zone {
  border-left: 4px solid #e53e3e;
}

.danger-zone h3 {
  color: #e53e3e;
}

/* Кнопки */
.form-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-start;
}

.save-btn {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.save-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.save-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
}

.reset-btn {
  background: #718096;
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.reset-btn:hover {
  background: #4a5568;
}

.delete-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-btn:hover {
  background: #c53030;
  transform: translateY(-1px);
}

/* Уведомления */
.notification {
  position: fixed;
  top: 100px;
  right: 24px;
  padding: 16px 20px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  gap: 12px;
  z-index: 1000;
  max-width: 400px;
  animation: slideInRight 0.3s ease;
}

.notification.success {
  background: #f0fff4;
  color: #38a169;
  border-left: 4px solid #38a169;
}

.notification.error {
  background: #fff5f5;
  color: #e53e3e;
  border-left: 4px solid #e53e3e;
}

.notification-close {
  background: none;
  border: none;
  color: inherit;
  cursor: pointer;
  margin-left: auto;
}

/* Модальные окна */
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
  padding: 20px;
}

.modal-container {
  background: white;
  border-radius: 16px;
  padding: 0;
  max-width: 500px;
  width: 100%;
  animation: modalEnter 0.3s ease;
}

@keyframes modalEnter {
  from {
    opacity: 0;
    transform: scale(0.9) translateY(-20px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24px 24px 0;
  margin-bottom: 20px;
}

.modal-header h3 {
  margin: 0;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.close-btn {
  background: none;
  border: none;
  color: #718096;
  cursor: pointer;
  padding: 8px;
  border-radius: 50%;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background: #f7fafc;
  color: #2d3748;
}

.modal-content {
  padding: 0 24px 24px;
}

.modal-actions {
  display: flex;
  gap: 12px;
  justify-content: flex-end;
  margin-top: 20px;
}

.delete-confirm-btn {
  background: #e53e3e;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 8px;
}

.delete-confirm-btn:hover {
  background: #c53030;
}

.cancel-btn {
  background: #718096;
  color: white;
  border: none;
  padding: 10px 20px;
  border-radius: 6px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background: #4a5568;
}

/* Анимации */
.slide-down-enter-active,
.slide-down-leave-active {
  transition: all 0.3s ease;
}

.slide-down-enter-from {
  opacity: 0;
  transform: translateY(-20px);
}

.slide-down-leave-to {
  opacity: 0;
  transform: translateY(-20px);
}

@keyframes slideInRight {
  from {
    opacity: 0;
    transform: translateX(100%);
  }
  to {
    opacity: 1;
    transform: translateX(0);
  }
}

/* Адаптивность */
@media (max-width: 1024px) {
  .profile-layout {
    grid-template-columns: 1fr;
    gap: 16px;
  }
  
  .profile-sidebar {
    position: static;
  }
}

@media (max-width: 768px) {
  .profile-content {
    padding: 16px;
  }
  
  .top-nav {
    padding: 0 16px;
    height: 64px;
  }
  
  .logo {
    font-size: 1.3rem;
  }
  
  .nav-btn span {
    display: none;
  }
  
  .form-grid {
    grid-template-columns: 1fr;
  }
  
  .stat-cards {
    grid-template-columns: 1fr;
  }
  
  .form-actions {
    flex-direction: column;
  }
  
  .modal-actions {
    flex-direction: column;
  }
}

@media (max-width: 480px) {
  .profile-form,
  .security-form {
    padding: 20px;
  }
  
  .tab-header h1 {
    font-size: 1.5rem;
  }
  
  .notification {
    right: 16px;
    left: 16px;
    max-width: none;
  }
}

/* Эффект стекла */
.glassmorphism {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
}
</style>