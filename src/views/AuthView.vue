Я поменял ссылку, при переходе на ссылку у меня сразу грузит видео, а на странице бесконечно крутится сообщение о загрузке видео
<template>
  <div class="auth-container">
    <!-- Видео фон -->
    <video 
      ref="videoRef"
      autoplay 
      muted 
      loop 
      playsinline
      class="background-video"
      @loadeddata="onVideoLoaded"
      @error="onVideoError"
    >
      <source :src="videoUrl" type="video/mp4">
      Ваш браузер не поддерживает видео.
    </video>
    
    <!-- Затемнение поверх видео -->
    <div class="video-overlay"></div>
    
    <!-- Загрузочный экран для видео -->
    <div v-if="videoLoading" class="video-loading glassmorphism">
      <i class="fas fa-spinner fa-spin"></i>
      <p>Загрузка видео...</p>
    </div>
    
    <div class="auth-card glassmorphism">
      <div class="auth-header">
        <div class="logo">
          <img src="/img/logo.jpg" class="logo_img" alt="Логотип БГИТУ">
          <h2>{{ isLoginMode ? 'Вход в систему' : 'Регистрация' }}</h2>
        </div>
        <p class="auth-subtitle">
          {{ isLoginMode ? 'Войдите в свой аккаунт' : 'Создайте новый аккаунт' }}
        </p>
      </div>
      
      <form @submit.prevent="handleSubmit" class="auth-form">
        <div class="form-group">
          <label class="form-label">Имя пользователя:</label>
          <div class="input-with-icon">
            <i class="fas fa-user"></i>
            <input 
              v-model="formData.username" 
              type="text" 
              required 
              minlength="3"
              placeholder="Введите имя пользователя"
              class="form-input"
            >
          </div>
        </div>
        
        <div v-if="!isLoginMode" class="form-group">
          <label class="form-label">Email:</label>
          <div class="input-with-icon">
            <i class="fas fa-envelope"></i>
            <input 
              v-model="formData.email" 
              type="email" 
              required
              placeholder="Введите ваш email"
              class="form-input"
            >
          </div>
        </div>
        
        <div class="form-group">
          <label class="form-label">Пароль:</label>
          <div class="input-with-icon">
            <i class="fas fa-lock"></i>
            <input 
              v-model="formData.password" 
              type="password" 
              required 
              minlength="5"
              placeholder="Введите пароль"
              class="form-input"
            >
          </div>
        </div>
        
        <div v-if="!isLoginMode" class="form-group">
          <label class="form-label">Группа:</label>
          <div class="input-with-icon">
            <i class="fas fa-users"></i>
            <input 
              v-model="formData.group" 
              type="text" 
              required
              placeholder="Введите вашу группу"
              class="form-input"
            >
          </div>
        </div>
        
        <button 
          type="submit" 
          :disabled="loading" 
          class="submit-btn gradient-btn"
        >
          <i class="fas" :class="loading ? 'fa-spinner fa-spin' : isLoginMode ? 'fa-sign-in-alt' : 'fa-user-plus'"></i>
          {{ loading ? 'Обработка...' : isLoginMode ? 'Войти' : 'Зарегистрироваться' }}
        </button>
        
        <button 
          type="button" 
          @click="toggleMode" 
          :disabled="loading" 
          class="toggle-btn"
        >
          <i class="fas" :class="isLoginMode ? 'fa-user-plus' : 'fa-sign-in-alt'"></i>
          {{ isLoginMode ? 'Нет аккаунта? Зарегистрироваться' : 'Уже есть аккаунт? Войти' }}
        </button>
      </form>
      
      <div v-if="error" class="error-message glassmorphism">
        <i class="fas fa-exclamation-circle"></i>
        {{ error }}
      </div>

      <div v-if="videoError" class="error-message glassmorphism">
        <i class="fas fa-video-slash"></i>
        Не удалось загрузить видео. Работаем над этим!
      </div>

      <div class="auth-footer">
        <p>Карта БГИТУ &copy; 2025</p>
      </div>
    </div>
    
    <!-- Кнопка управления звуком -->
    <button 
      @click="toggleMute" 
      class="mute-btn glassmorphism"
      :title="isMuted ? 'Включить звук' : 'Выключить звук'"
    >
      <i class="fas" :class="isMuted ? 'fa-volume-mute' : 'fa-volume-up'"></i>
    </button>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'AuthView',
  setup() {
    const router = useRouter();
    const isLoginMode = ref(true);
    const error = ref('');
    const loading = ref(false);
    const isMuted = ref(true);
    const videoLoading = ref(true);
    const videoError = ref(false);
    const videoRef = ref(null);
    
    // Прямая ссылка на видео с Яндекс.Диска
    const videoUrl = ref('http://www.youtube.com/embed/ARSp4JOuq1o');
    // Альтернативные ссылки на случай проблем с основной
    const fallbackVideoUrls = [
      'https://storage.yandexcloud.net/video-backgrounds/university-campus.mp4',
      'https://drive.google.com/uc?export=download&id=YOUR_GOOGLE_DRIVE_ID'
    ];
    
    const formData = ref({
      username: '',
      email: '',
      password: '',
      group: ''
    });
    
    const toggleMode = () => {
      isLoginMode.value = !isLoginMode.value;
      error.value = '';
      formData.value = {
        username: '',
        email: '',
        password: '',
        group: ''
      };
    };
    
    const toggleMute = () => {
      isMuted.value = !isMuted.value;
      if (videoRef.value) {
        videoRef.value.muted = isMuted.value;
      }
    };
    
    const onVideoLoaded = () => {
      console.log('Видео успешно загружено');
      videoLoading.value = false;
      videoError.value = false;
    };
    
    const onVideoError = (event) => {
      console.error('Ошибка загрузки видео:', event);
      videoLoading.value = false;
      videoError.value = true;
      
      // Попробовать альтернативные источники
      if (fallbackVideoUrls.length > 0) {
        const nextUrl = fallbackVideoUrls.shift();
        console.log('Пробуем альтернативный источник:', nextUrl);
        videoUrl.value = nextUrl;
        videoLoading.value = true;
        videoError.value = false;
      }
    };
    
    const handleSubmit = async () => {
      error.value = '';
      loading.value = true;
      
      try {
        const endpoint = isLoginMode.value ? '/api/auth/login' : '/api/auth/register';
        const payload = isLoginMode.value 
          ? { 
              username: formData.value.username, 
              password: formData.value.password 
            }
          : {
              username: formData.value.username,
              email: formData.value.email,
              password: formData.value.password,
              group: formData.value.group
            };

        const response = await axios.post(endpoint, payload);
        
        localStorage.setItem('token', response.data.token);
        localStorage.setItem('user', JSON.stringify(response.data.user));
        
        await router.push('/');
        window.location.reload();
        
      } catch (err) {
        console.error('Auth error:', err);
        
        if (err.response?.data?.error) {
          const serverError = err.response.data.error;
          
          if (serverError.includes('User already exists')) {
            error.value = 'Пользователь с таким именем или email уже существует';
          } else if (serverError.includes('Invalid credentials')) {
            error.value = 'Неверное имя пользователя или пароль';
          } else if (serverError.includes('Registration failed')) {
            error.value = 'Ошибка регистрации. Попробуйте еще раз';
          } else if (serverError.includes('Login failed')) {
            error.value = 'Ошибка входа. Попробуйте еще раз';
          } else {
            error.value = serverError;
          }
        } else if (err.code === 'NETWORK_ERROR' || err.message === 'Network Error') {
          error.value = 'Ошибка сети. Проверьте подключение к интернету';
        } else {
          error.value = 'Произошла ошибка. Попробуйте еще раз';
        }
      } finally {
        loading.value = false;
      }
    };
    
    onMounted(() => {
      if (videoRef.value) {
        videoRef.value.muted = isMuted.value;
        
        const playVideo = async () => {
          try {
            await videoRef.value.play();
          } catch (err) {
            console.log('Автовоспроизведение видео заблокировано:', err);
          }
        };
        
        // Ждем загрузки видео перед попыткой воспроизведения
        if (videoRef.value.readyState >= 3) {
          playVideo();
        } else {
          videoRef.value.addEventListener('loadeddata', playVideo);
        }
      }
    });
    
    onUnmounted(() => {
      if (videoRef.value) {
        videoRef.value.pause();
        videoRef.value = null;
      }
    });
    
    return {
      isLoginMode,
      formData,
      error,
      loading,
      isMuted,
      videoLoading,
      videoError,
      videoRef,
      videoUrl,
      toggleMode,
      toggleMute,
      handleSubmit,
      onVideoLoaded,
      onVideoError
    };
  }
};
</script>

<style scoped>
.auth-container {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 100vh;
  position: relative;
  overflow: hidden;
  padding: 20px;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Стили для видео фона */
.background-video {
  position: absolute;
  top: 50%;
  left: 50%;
  min-width: 100%;
  min-height: 100%;
  width: auto;
  height: auto;
  transform: translateX(-50%) translateY(-50%);
  object-fit: cover;
  z-index: -2;
  opacity: 1;
  transition: opacity 0.5s ease;
}

/* Затемнение поверх видео для лучшей читаемости */
.video-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.4);
  z-index: -1;
}

/* Индикатор загрузки видео */
.video-loading {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  padding: 20px 30px;
  border-radius: 12px;
  text-align: center;
  z-index: 1;
  color: #4361ee;
  font-weight: 500;
}

.video-loading i {
  font-size: 1.5rem;
  margin-bottom: 8px;
}

.video-loading p {
  margin: 0;
  font-size: 0.9rem;
}

.glassmorphism {
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border: 1px solid rgba(255, 255, 255, 0.3);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.1);
}

.auth-card {
  width: 100%;
  max-width: 440px;
  padding: 40px;
  border-radius: 24px;
  animation: slideUp 0.6s ease-out;
  position: relative;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(40px) scale(0.95);
  }
  to {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

.auth-header {
  text-align: center;
  margin-bottom: 32px;
}

.logo {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 12px;
}

.logo_img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #4361ee;
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.auth-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
  letter-spacing: -0.5px;
  text-shadow: 0 2px 4px rgba(255, 255, 255, 0.5);
}

.auth-subtitle {
  margin: 0;
  color: #4a5568;
  font-size: 1rem;
  font-weight: 500;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.auth-form {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.form-label {
  font-weight: 600;
  color: #2d3748;
  font-size: 0.95rem;
  margin-bottom: 4px;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 16px;
  color: #718096;
  font-size: 1rem;
  z-index: 1;
}

.form-input {
  width: 100%;
  padding: 14px 16px 14px 48px;
  border: 1.5px solid rgba(226, 232, 240, 0.8);
  border-radius: 12px;
  font-size: 1rem;
  transition: all 0.3s ease;
  background-color: rgba(255, 255, 255, 0.9);
  color: #2d3748;
  font-family: inherit;
  backdrop-filter: blur(10px);
}

.form-input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.15);
  background-color: white;
  transform: translateY(-1px);
}

.form-input::placeholder {
  color: #a0aec0;
}

.form-input:disabled {
  background-color: rgba(247, 250, 252, 0.8);
  color: #a0aec0;
  cursor: not-allowed;
}

.gradient-btn {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border: none;
  padding: 16px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 1rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  box-shadow: 0 6px 12px rgba(67, 97, 238, 0.25);
  font-family: inherit;
  position: relative;
  overflow: hidden;
}

.gradient-btn::before {
  content: '';
  position: absolute;
  top: 0;
  left: -100%;
  width: 100%;
  height: 100%;
  background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
  transition: left 0.5s;
}

.gradient-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 16px rgba(67, 97, 238, 0.35);
}

.gradient-btn:hover:not(:disabled)::before {
  left: 100%;
}

.gradient-btn:active:not(:disabled) {
  transform: translateY(0);
}

.gradient-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
  transform: none;
  box-shadow: none;
}

.submit-btn {
  margin-top: 8px;
  height: 52px;
}

.toggle-btn {
  background: transparent;
  color: #4361ee;
  border: 1.5px solid #4361ee;
  padding: 14px 24px;
  border-radius: 12px;
  font-weight: 600;
  font-size: 0.95rem;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
  backdrop-filter: blur(10px);
}

.toggle-btn:hover:not(:disabled) {
  background: rgba(67, 97, 238, 0.08);
  transform: translateY(-1px);
  box-shadow: 0 4px 8px rgba(67, 97, 238, 0.15);
}

.toggle-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.error-message {
  margin-top: 20px;
  padding: 16px;
  border-radius: 12px;
  color: #e53e3e;
  font-weight: 500;
  display: flex;
  align-items: center;
  gap: 10px;
  animation: shake 0.5s ease-in-out;
  border-left: 4px solid #e53e3e;
  backdrop-filter: blur(20px);
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  25% { transform: translateX(-5px); }
  75% { transform: translateX(5px); }
}

.error-message i {
  font-size: 1.1rem;
  flex-shrink: 0;
}

.auth-footer {
  margin-top: 32px;
  text-align: center;
  padding-top: 20px;
  border-top: 1px solid rgba(226, 232, 240, 0.6);
}

.auth-footer p {
  margin: 0;
  color: #718096;
  font-size: 0.9rem;
  text-shadow: 0 1px 2px rgba(255, 255, 255, 0.5);
}

/* Кнопка управления звуком */
.mute-btn {
  position: fixed;
  bottom: 24px;
  right: 24px;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  color: #4a5568;
  font-size: 1.1rem;
  z-index: 10;
}

.mute-btn:hover {
  transform: scale(1.1);
  color: #4361ee;
}

/* Адаптивность */
@media (max-width: 768px) {
  .auth-container {
    padding: 16px;
  }
  
  .auth-card {
    padding: 32px 24px;
    max-width: 100%;
  }
  
  .auth-header h2 {
    font-size: 1.6rem;
  }
  
  .logo {
    flex-direction: column;
    gap: 12px;
  }
  
  .logo_img {
    width: 60px;
    height: 60px;
  }
  
  .mute-btn {
    bottom: 16px;
    right: 16px;
    width: 44px;
    height: 44px;
  }
}

@media (max-width: 480px) {
  .auth-card {
    padding: 24px 20px;
  }
  
  .auth-header h2 {
    font-size: 1.4rem;
  }
  
  .form-input {
    padding: 12px 14px 12px 44px;
  }
  
  .gradient-btn,
  .toggle-btn {
    padding: 14px 20px;
    font-size: 0.95rem;
  }
  
  .mute-btn {
    bottom: 12px;
    right: 12px;
    width: 40px;
    height: 40px;
    font-size: 1rem;
  }
}

/* Анимация загрузки */
.fa-spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Улучшение доступности */
.form-input:focus-visible {
  outline: 2px solid #4361ee;
  outline-offset: 2px;
}

button:focus-visible {
  outline: 2px solid #4361ee;
  outline-offset: 2px;
}

/* Поддержка темной темы */
@media (prefers-color-scheme: dark) {
  .auth-card {
    background: rgba(45, 55, 72, 0.85);
    color: #f7fafc;
  }
  
  .auth-header h2 {
    color: #f7fafc;
  }
  
  .auth-subtitle {
    color: #cbd5e0;
  }
  
  .form-label {
    color: #f7fafc;
  }
  
  .form-input {
    background-color: rgba(74, 85, 104, 0.9);
    border-color: #4a5568;
    color: #f7fafc;
  }
  
  .form-input:focus {
    background-color: #2d3748;
    border-color: #4361ee;
  }
  
  .form-input::placeholder {
    color: #a0aec0;
  }
  
  .toggle-btn {
    color: #63b3ed;
    border-color: #63b3ed;
  }
  
  .toggle-btn:hover:not(:disabled) {
    background: rgba(99, 179, 237, 0.1);
  }
  
  .auth-footer p {
    color: #a0aec0;
  }
}
</style>