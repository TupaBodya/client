<template>
    <div class="main-container" :class="theme">
      <nav class="top-nav glassmorphism">
        <div class="logo">
          <i><img src="/img/logo.jpg" class="logo_img"></i>
          <span>Карта БГИТУ</span>
        </div>
        <div class="nav-buttons">
          <button @click="togglePanel('search')" :class="{ active: activePanel === 'search' }" class="nav-btn">
            <i class="fas fa-search"></i> 
            <span class="btn-text">Поиск</span>
          </button>
          <button @click="togglePanel('history')" :class="{ active: activePanel === 'history' }" class="nav-btn">
            <i class="fas fa-history"></i>
            <span class="btn-text">История</span>
          </button>
          <button @click="togglePanel('filters')" :class="{ active: activePanel === 'filters' }" class="nav-btn">
            <i class="fas fa-filter"></i>
            <span class="btn-text">Фильтры</span>
          </button>
          <button @click="goToUniversityMap" class="nav-btn">
            <i class="fas fa-map-marked-alt"></i>
            <span class="btn-text">Территория</span>
          </button>
          <button @click="toggleViewMode" class="nav-btn">
            <i class="fas" :class="viewModeIcon"></i>
            <span class="btn-text">{{ viewModeText }}</span>
          </button>
          <button @click="toggleTheme" class="nav-btn" :title="themeButtonText">
            <i class="fas" :class="themeIcon"></i>
            <span class="btn-text">{{ themeButtonText }}</span>
          </button>
        </div>
        <div class="user-actions">
          <div class="user-profile" v-if="user">
            <router-link to="/profile" class="profile-link">
              <div class="avatar-wrapper">
                <img :src="user.avatar || '/img/default-avatar.png'" class="user-avatar" alt="Аватар">
              </div>
              <span class="username">{{ user.username }}</span>
            </router-link>
            <button @click="logout" class="logout-btn">
              <i class="fas fa-sign-out-alt"></i>
            </button>
          </div>
          <div v-else class="guest-actions">
            <button @click="goToAuth" class="login-btn gradient-btn">
              <i class="fas fa-sign-in-alt"></i>
              <span>Войти</span>
            </button>
          </div>
        </div>
      </nav>

      <transition name="slide-fade">
        <div class="side-panel glassmorphism" v-if="activePanel">
          <div v-if="activePanel === 'search'" class="search-panel">
            <h3 class="panel-title"><i class="fas fa-search"></i> Поиск</h3>
            <div class="search-group">
              <div class="input-with-icon">
                <i class="fas fa-door-open"></i>
                <input 
                  type="text" 
                  v-model="audienceSearch" 
                  @input="debounceSearchAudiences" 
                  placeholder="Аудитория..."
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="search-group">
              <div class="input-with-icon">
                <i class="fas fa-users"></i>
                <input 
                  type="text" 
                  v-model="groupSearch" 
                  @input="debounceSearchGroups" 
                  placeholder="Группа..."
                  class="search-input"
                />
              </div>
            </div>
            
            <div class="search-group">
              <div class="input-with-icon">
                <i class="fas fa-chalkboard-teacher"></i>
                <input 
                  type="text" 
                  v-model="teacherSearch" 
                  @input="debounceSearchTeachers" 
                  placeholder="Преподаватель..."
                  class="search-input"
                />
              </div>
            </div>
          </div>

          <div v-if="activePanel === 'history'" class="history-panel">
            <h3 class="panel-title"><i class="fas fa-history"></i> История поиска</h3>
            <ul v-if="searchHistory.length" class="history-list">
              <li 
                v-for="(item, index) in searchHistory" 
                :key="index"
                @click="applySearchHistory(item)"
                class="history-item"
              >
                <i class="fas" :class="getHistoryIcon(item.type)"></i>
                <div class="history-content">
                  <span class="history-term">"{{ item.term }}"</span>
                  <span class="history-type">{{ item.type }}</span>
                  <span class="history-time">{{ item.timestamp }}</span>
                </div>
              </li>
            </ul>
            <p v-else class="empty-message">
              <i class="fas fa-history"></i> История поиска пуста
            </p>
          </div>

          <div v-if="activePanel === 'filters'" class="filters-panel">
            <div class="filter-group">
              <h3 class="panel-title"><i class="fas fa-building"></i> Корпус</h3>
              <div class="corpus-buttons">
                <button 
                  v-for="corpus in corpuses" 
                  :key="corpus" 
                  :class="{ 'active': selectedCorpus === corpus }"
                  @click="selectCorpus(corpus)"
                  class="corpus-btn"
                >
                  {{ corpus }} корпус
                </button>
              </div>
            </div>
          
            <div class="filter-group">
              <h3 class="panel-title"><i class="fas fa-door-closed"></i> Тип аудитории</h3>
              <div class="filter-options">
                <label v-for="filter in filters" :key="filter.value" class="filter-option">
                  <input 
                    type="checkbox" 
                    v-model="selectedFilters" 
                    :value="filter.value" 
                    class="filter-checkbox"
                  />
                  <i class="fas" :class="getAudienceIcon(filter.value)"></i>
                  <span class="filter-label">{{ filter.label }}</span>
                </label>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <!-- 2D View -->
      <div class="map-container" v-if="viewMode === '2d'">
        <div class="map-controls">
          <button class="control-btn zoom-in" @click="zoomIn" title="Увеличить">
            <i class="fas fa-plus"></i>
          </button>
          <button class="control-btn zoom-out" @click="zoomOut" title="Уменьшить">
            <i class="fas fa-minus"></i>
          </button>
          <button class="control-btn reset-view" @click="resetView" title="Сбросить вид">
            <i class="fas fa-crosshairs"></i>
          </button>
        </div>
        
        <div class="floor-controls glassmorphism">
          <button 
            v-for="floor in floors" 
            :key="floor" 
            :class="{ 'active': selectedFloor === floor }"
            @click="selectFloor(floor)"
            class="floor-btn"
          >
            {{ floor }} этаж
          </button>
        </div>

        <div class="map-content" ref="mapContent" :style="{ backgroundImage: `url(${currentMapImage})` }">
          <svg id="audience-svg" ref="svgElement">
            <g v-for="audience in filteredAudiences" :key="audience.id">
              <rect 
                :x="audience.x" 
                :y="audience.y" 
                :width="audience.width" 
                :height="audience.height"
                :class="['audience-rect', { 
                  'highlighted': audience.highlighted, 
                  'pulse': audience.highlighted
                }]"
                :fill="getAudienceFill()"
                :stroke="getAudienceStroke()"
                stroke-width="2"
                @click="openModal(audience)"
                rx="4"
              />
              
              <text 
                :x="audience.x + audience.width/2" 
                :y="audience.y + audience.height/2 + 2" 
                text-anchor="middle"
                dominant-baseline="middle"
                font-weight="800"
                font-size="14"
                class="audience-label"
                :fill="getLabelColor()"
              >
                {{ audience.num_audiences }}
              </text>
            </g>
          </svg>
        </div>
      </div>

      <!-- 3D View -->
      <div class="three-d-container" v-if="viewMode === '3d'">
        <div class="three-d-controls">
          <button class="control-btn reset-3d" @click="reset3DView" title="Сбросить вид">
            <i class="fas fa-crosshairs"></i>
          </button>
          <button class="control-btn toggle-grid" @click="toggleGrid" title="Сетка">
            <i class="fas fa-th"></i>
          </button>
          <button class="control-btn toggle-lights" @click="toggleLights" title="Освещение">
            <i class="fas fa-lightbulb"></i>
          </button>
        </div>
        
        <div class="floor-controls-3d glassmorphism">
          <button 
            v-for="floor in floors" 
            :key="floor" 
            :class="{ 'active': selectedFloor === floor, 'loading': isLoadingFloor && selectedFloor === floor }"
            @click="selectFloor(floor)"
            class="floor-btn"
            :disabled="isLoadingFloor"
          >
            <span v-if="isLoadingFloor && selectedFloor === floor" class="loading-spinner"></span>
            <span v-else>{{ floor }} этаж</span>
          </button>
        </div>

        <!-- Индикатор загрузки -->
        <div v-if="isLoadingFloor" class="loading-overlay">
          <div class="loading-content glassmorphism">
            <div class="loading-spinner-large"></div>
            <p>Загрузка {{ selectedFloor }} этажа...</p>
            <div class="loading-progress" v-if="loadProgress > 0">
              <div class="progress-bar">
                <div class="progress-fill" :style="{ width: loadProgress + '%' }"></div>
              </div>
              <span class="progress-text">{{ Math.round(loadProgress) }}%</span>
            </div>
          </div>
        </div>

        <div class="three-d-scene" ref="threeDScene"></div>
        
        <div class="audience-info-3d glassmorphism" v-if="hoveredAudience3D">
          <h4>Аудитория {{ hoveredAudience3D.num_audiences }}</h4>
          <p>Тип: {{ getAudienceTypeName(hoveredAudience3D.audience_type) }}</p>
          <button @click="openModal(hoveredAudience3D)" class="info-btn">
            <i class="fas fa-info-circle"></i> Подробнее
          </button>
        </div>
      </div>

      <transition name="modal">
        <div class="modal-overlay" v-if="showModal" @click.self="closeModal">
          <div class="modal-container glassmorphism">
            <div class="close-btn" @click="closeModal">
              <i class="fas fa-times"></i>
            </div>
            <div class="modal-header">
              <h2>Аудитория №{{ currentAudience.num_audiences }}</h2>
              <div class="audience-meta">
                <span class="meta-item">
                  <i class="fas fa-building"></i> Корпус: {{ currentAudience.corpus }}
                </span>
                <span class="meta-item">
                  <i class="fas fa-layer-group"></i> Этаж: {{ currentAudience.floor }}
                </span>
                <span class="meta-item">
                  <i class="fas fa-door-open"></i> Тип: {{ getAudienceTypeName(currentAudience.audience_type) }}
                </span>
              </div>
            </div>
            
            <div class="modal-content">
              <div class="description-section" v-if="currentAudience.description">
                <h3 class="section-title">
                  <i class="fas fa-align-left"></i> Описание
                </h3>
                <p class="description-text">{{ currentAudience.description }}</p>
              </div>
              <div class="gallery-section" v-if="currentImages.length">
                <h3 class="section-title">
                  <i class="fas fa-images"></i> Фотографии аудитории
                </h3>
                <div class="swiper-container">
                  <div class="swiper-wrapper">
                    <div 
                      class="swiper-slide" 
                      v-for="(image, index) in currentImages" 
                      :key="index"
                    >
                      <img :src="image" @click="openFullscreen(image)" class="gallery-image" />
                    </div>
                  </div>
                  <div class="swiper-button-next"></div>
                  <div class="swiper-button-prev"></div>
                </div>
              </div>
              <p v-else class="empty-message">
                <i class="fas fa-image"></i> Фотографии аудитории отсутствуют
              </p>
              <div class="menu-section" v-if="currentAudience.audience_type === 'cafe' && buffetMenu.length">
                <h3 class="section-title">
                  <i class="fas fa-utensils"></i> Меню буфета
                </h3>
                
                <div class="menu-categories">
                  <button 
                    v-for="category in menuCategories" 
                    :key="category"
                    :class="{ 'active': selectedCategory === category }"
                    @click="selectedCategory = category"
                    class="category-btn"
                  >
                    {{ getCategoryName(category) }}
                  </button>
                </div>
                
                <div class="menu-grid">
                  <div 
                    v-for="item in getMenuByCategory" 
                    :key="item.id"
                    class="menu-item"
                  >
                    <div class="menu-item-image">
                      <img 
                        :src="item.image_url || '/img/menu/default-food.jpg'" 
                        :alt="item.name"
                        @click="openFullscreen(item.image_url || '/img/menu/default-food.jpg')"
                      />
                    </div>
                    <div class="menu-item-content">
                      <h4 class="item-name">{{ item.name }}</h4>
                      <p class="item-description" v-if="item.description">{{ item.description }}</p>
                      <div class="item-meta">
                        <span class="item-category">{{ getCategoryName(item.category) }}</span>
                        <span class="item-price">{{ formatPrice(item.price) }}</span>
                      </div>
                      <div class="item-availability" :class="{ 'available': item.is_available, 'unavailable': !item.is_available }">
                        {{ item.is_available ? 'В наличии' : 'Нет в наличии' }}
                      </div>
                    </div>
                  </div>
                </div>
                
                <p v-if="!getMenuByCategory.length" class="empty-message">
                  <i class="fas fa-search"></i> Товары в категории "{{ getCategoryName(selectedCategory) }}" не найдены
                </p>
              </div>

              <p v-else-if="currentAudience.audience_type === 'cafe' && !buffetMenu.length" class="empty-message">
                <i class="fas fa-utensils"></i> Меню временно недоступно
              </p>
              <div class="schedule-section" v-if="showScheduleSection">
                <h3 class="section-title">
                  <i class="fas fa-calendar-alt"></i> Расписание занятий
                </h3>
                <div class="day-selector">
                  <div class="select-wrapper">
                    <i class="fas fa-calendar-day"></i>
                    <select v-model="selectedDay" @change="filterSchedule" class="day-select">
                      <option v-for="day in days" :key="day" :value="day">
                        {{ day }}
                      </option>
                    </select>
                  </div>
                </div>
                
                <div class="schedule-table-container">
                  <table v-if="groupedSchedule.length" class="schedule-table">
                    <thead>
                      <tr>
                        <th>Время</th>
                        <th>Предмет</th>
                        <th>Преподаватель</th>
                        <th>Группы</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr v-for="item in groupedSchedule" :key="item.key">
                        <td class="time-cell">{{ item.time_start }} - {{ item.time_over }}</td>
                        <td>{{ item.name_lesson }}</td>
                        <td class="teacher-cell">{{ item.surname }} {{ item.name }} {{ item.patronymic }}</td>
                        <td class="groups-cell">
                          <span v-for="(group, index) in item.groups" :key="group.id">
                            {{ group.name_group }}<span v-if="index < item.groups.length - 1">, </span>
                          </span>
                        </td>
                      </tr>
                    </tbody>
                  </table>
                  <p v-else class="empty-message">
                    <i class="fas fa-calendar-times"></i> Занятий в этот день нет
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </transition>

      <transition name="fade">
        <div class="fullscreen-overlay" v-if="showFullscreen" @click="closeFullscreen">
          <div class="close-btn" @click="closeFullscreen">
            <i class="fas fa-times"></i>
          </div>
          <img :src="fullscreenImage" alt="Фото аудитории" class="fullscreen-image" />
        </div>
      </transition>
    </div>
  </template>

  <script>
  import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
  import { useRouter } from 'vue-router';
  import axios from 'axios';
  import Swiper from 'swiper';
  import { Navigation } from 'swiper/modules';
  import 'swiper/css';
  import 'swiper/css/navigation';
  import panzoom from 'panzoom';

  // Three.js imports
  import * as THREE from 'three';
  import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
  import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

  export default {
    name: 'MainView',
    setup() {
      const router = useRouter();
      
      // Состояние приложения
      const audiences = ref([]);
      const schedule = ref([]);
      const groups = ref([]);
      const teachers = ref([]);
      const currentAudience = ref({});
      const currentImages = ref([]);
      const fullscreenImage = ref('');
      const searchHistory = ref([]);
      const highlightedAudiences = ref(new Set());
      const buffetMenu = ref([]);
      const selectedCategory = ref('все');
      
      // Поиск и фильтры
      const activePanel = ref(null);
      const user = ref(JSON.parse(localStorage.getItem('user')) || null);
      const audienceSearch = ref('');
      const groupSearch = ref('');
      const teacherSearch = ref('');
      const selectedCorpus = ref('1');
      const selectedFloor = ref('1');
      const selectedDay = ref('Понедельник');
      const selectedFilters = ref([]);
      const mapContent = ref(null);
      const svgElement = ref(null);
      let panzoomInstance = null;
      let swiperInstance = null;
      
      // 3D View State
      const viewMode = ref('2d'); // '2d' or '3d'
      const threeDScene = ref(null);
      const hoveredAudience3D = ref(null);
      const isLoadingFloor = ref(false);
      const loadProgress = ref(0);
      
      // Тема
      const theme = ref(localStorage.getItem('pc-theme') || 'light');
      const themeIcon = computed(() => theme.value === 'light' ? 'fa-moon' : 'fa-sun');
      const themeButtonText = computed(() => theme.value === 'light' ? 'Тёмная тема' : 'Светлая тема');

      const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        localStorage.setItem('pc-theme', theme.value);
      };

      // Three.js variables
      let scene = null;
      let camera = null;
      let renderer = null;
      let controls = null;
      let floorModel = null;
      let audienceObjects = new Map();
      let raycaster = null;
      let mouse = new THREE.Vector2();
      let gridHelper = null;
      let directionalLight = null;
      let ambientLight = null;
      let animationFrameId = null;
      
      // UI состояния
      const showModal = ref(false);
      const showFullscreen = ref(false);
      const floorTransition = ref(false);
      const mapLoaded = ref(false);
      
      // Таймеры для debounce
      let searchAudienceTimeout = null;
      let searchGroupTimeout = null;
      let searchTeacherTimeout = null;
      
      // Константы
      const corpuses = ['1', '2'];
      const floors = ['1', '2', '3', '4'];
      const days = [
        'Понедельник', 'Вторник', 'Среда', 
        'Четверг', 'Пятница', 'Суббота', 'Воскресеньe'
      ];
      const filters = [
        { value: 'lecture', label: 'Лекционный зал' },
        { value: 'lab', label: 'Лаборатория' },
        { value: 'study', label: 'Учебный кабинет' },
        { value: 'computer', label: 'Компьютерный класс' },
        { value: 'conference', label: 'Конференц-зал' },
        { value: 'toilet', label: 'Туалет' },
        { value: 'cafe', label: 'Буфет' },
        { value: 'library', label: 'Библиотека' },
        { value: 'cabinet', label: 'Кабинет' }
      ];

      // Начальные трансформации для разных корпусов
      const initialTransforms = {
        '1': { x: 282.333, y: 4.66667, zoom: 0.5 },
        '2': { x: 282.333, y: 4.66667, zoom: 0.5 }
      };

      // Цвета для типов аудиторий
      const audienceColors = {
        lecture: '#4361ee',
        lab: '#f72585',
        study: '#4cc9f0',
        computer: '#7209b7',
        conference: '#f8961e',
        toilet: '#43aa8b',
        cafe: '#f94144',
        library: '#577590',
        cabinet: '#a4ca32'
      };

      // Computed properties
      const viewModeIcon = computed(() => {
        return viewMode.value === '2d' ? 'fa-cube' : 'fa-map';
      });

      const viewModeText = computed(() => {
        return viewMode.value === '2d' ? '3D Вид' : '2D Вид';
      });

      const currentMapImage = computed(() => {
        return `/img/maps/${selectedCorpus.value}corpus/${selectedFloor.value}floor.png`;
      });

      const filteredAudiences = computed(() => {
        return audiences.value
          .filter(audience => 
            audience.corpus === selectedCorpus.value && 
            audience.floor === selectedFloor.value &&
            (selectedFilters.value.length === 0 || selectedFilters.value.includes(audience.audience_type))
          )
          .map(audience => ({
            ...audience,
            highlighted: shouldHighlightAudience(audience)
          }));
      });

      const showScheduleSection = computed(() => {
        if (!currentAudience.value.audience_type) return false;
        const scheduleAllowedTypes = ['lecture', 'computer', 'study'];
        return scheduleAllowedTypes.includes(currentAudience.value.audience_type);
      });

      const filteredSchedule = computed(() => {
        if (!currentAudience.value.id) return [];
        return schedule.value.filter(item => 
          item.day_week === selectedDay.value
        );
      });

      const groupedSchedule = computed(() => {
        if (!filteredSchedule.value.length) return [];
        
        const groupsMap = new Map();
        
        filteredSchedule.value.forEach(item => {
          const key = `${item.time_start}-${item.time_over}-${item.lesson_id}-${item.teacher_id}`;
          
          if (groupsMap.has(key)) {
            const existing = groupsMap.get(key);
            const groupExists = existing.groups.some(g => g.id === item.group_id);
            if (!groupExists) {
              existing.groups.push({
                id: item.group_id,
                name_group: item.name_group
              });
            }
          } else {
            groupsMap.set(key, {
              key,
              time_start: item.time_start,
              time_over: item.time_over,
              name_lesson: item.name_lesson,
              surname: item.surname,
              name: item.name,
              patronymic: item.patronymic,
              lesson_id: item.lesson_id,
              teacher_id: item.teacher_id,
              groups: [{
                id: item.group_id,
                name_group: item.name_group
              }]
            });
          }
        });
        
        return Array.from(groupsMap.values());
      });

      const getMenuByCategory = computed(() => {
        if (selectedCategory.value === 'все') {
          return buffetMenu.value;
        }
        return buffetMenu.value.filter(item => item.category === selectedCategory.value);
      });

      const menuCategories = computed(() => {
        const categories = ['все', ...new Set(buffetMenu.value.map(item => item.category))];
        return categories;
      });

      // Methods
      const toggleViewMode = async () => {
        if (viewMode.value === '2d') {
          // Переход в 3D режим
          viewMode.value = '3d';
          
          // Ждем обновления DOM
          await nextTick();
          
          // Инициализируем 3D сцену
          init3DScene();
          load3DFloor();
        } else {
          // Переход в 2D режим
          viewMode.value = '2d';
          
          // Тщательно очищаем 3D ресурсы
          cleanup3D();
          
          // Восстанавливаем panzoom
          await nextTick();
          restorePanzoom();
        }
      };

      const initializePanzoom = () => {
        if (mapContent.value && !panzoomInstance) {
          panzoomInstance = panzoom(mapContent.value, {
            maxZoom: 5,
            minZoom: 0.5,
            initialZoom: 0.6,
            bounds: true,
            boundsPadding: 0.6
          });
          
          // Устанавливаем начальный вид
          setTimeout(() => {
            resetView();
          }, 0);
        }
      };

      const restorePanzoom = () => {
        if (panzoomInstance && mapContent.value) {
          panzoomInstance.dispose();
          
          panzoomInstance = panzoom(mapContent.value, {
            maxZoom: 5,
            minZoom: 0.5,
            bounds: true,
            boundsPadding: 0.6
          });
          
          setTimeout(() => {
            resetView();
          }, 0);
        } else if (mapContent.value) {
          initializePanzoom();
        }
      };

      const togglePanel = (panel) => {
        if (activePanel.value === panel) {
          activePanel.value = null;
        } else {
          activePanel.value = panel;
        }
      };

      const getAudienceTypeName = (type) => {
        const types = {
          'lecture': 'Лекционный зал',
          'lab': 'Лаборатория',
          'study': 'Учебный кабинет',
          'computer': 'Компьютерный класс',
          'conference': 'Конференц-зал',
          'toilet': 'Туалет',
          'cafe': 'Буфет',
          'library': 'Библиотека',
          'cabinet': 'Кабинет',
          'other': 'Другое'
        };
        return types[type] || type;
      };

      const getAudienceIcon = (type) => {
        const icons = {
          'lecture': 'fa-chalkboard',
          'lab': 'fa-flask',
          'study': 'fa-book',
          'computer': 'fa-laptop-code',
          'conference': 'fa-users',
          'toilet': 'fa-toilet',
          'cafe': 'fa-coffee',
          'library': 'fa-book-open',
          'cabinet': 'fa-door-closed'
        };
        return icons[type] || 'fa-door-open';
      };

      const getCategoryName = (category) => {
        const categoryNames = {
          'все': 'Все категории',
          'выпечка': 'Выпечка',
          'напитки': 'Напитки',
          'салат': 'Салаты',
          'первое блюдо': 'Первые блюда',
          'второе блюдо': 'Вторые блюда',
          'гарнир': 'Гарниры',
          'десерт': 'Десерты'
        };
        return categoryNames[category] || category;
      };

      const formatPrice = (price) => {
        return new Intl.NumberFormat('ru-RU', {
          style: 'currency',
          currency: 'RUB',
          minimumFractionDigits: 0
        }).format(price);
      };

      const getAudienceFill = () => {
      return theme.value === 'light' ? 'rgba(67, 97, 238, 0.1)' : 'rgba(67, 97, 238, 0.2)';
    };

    const getAudienceStroke = () => {
      return '#4361ee';
    };

    const getLabelColor = () => {
      return theme.value === 'light' ? '#2d3748' : '#f7fafc';
    };

      const getHistoryIcon = (type) => {
        const icons = {
          'Аудитория': 'fa-door-open',
          'Группа': 'fa-users',
          'Преподаватель': 'fa-chalkboard-teacher'
        };
        return icons[type] || 'fa-search';
      };

      const fetchAudiences = async () => {
        try {
          const response = await axios.get('/api/audiences');
          audiences.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки аудиторий:', error);
        }
      };

      const fetchGroups = async () => {
        try {
          const response = await axios.get('/api/groups');
          groups.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки групп:', error);
          groups.value = [];
        }
      };

      const fetchTeachers = async () => {
        try {
          const response = await axios.get('/api/teachers');
          teachers.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки преподавателей:', error);
          teachers.value = [];
        }
      };

      const fetchSchedule = async (audienceId) => {
        try {
          const response = await axios.get(`/api/schedule/${audienceId}`);
          schedule.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки расписания:', error);
        }
      };

      const shouldHighlightAudience = (audience) => {
        if (audienceSearch.value.length >= 3 && 
            audience.num_audiences.toLowerCase().includes(audienceSearch.value.toLowerCase())) {
          return true;
        }
        
        return highlightedAudiences.value.has(audience.id);
      };

      const searchAudiences = () => {
        if (audienceSearch.value.trim().length >= 3) {
          addToSearchHistory(audienceSearch.value, 'Аудитория');
        }
      };

      const searchGroups = async () => {
        if (groupSearch.value.trim().length < 2) {
          highlightedAudiences.value.clear();
          return;
        }

        try {
          const response = await axios.get(`/api/schedule/group/${encodeURIComponent(groupSearch.value.trim())}`);
          const groupSchedule = response.data;
          
          highlightedAudiences.value.clear();
          
          groupSchedule.forEach(item => {
            if (item.audience_id) {
              highlightedAudiences.value.add(item.audience_id);
            }
          });
          
          addToSearchHistory(groupSearch.value, 'Группа');
        } catch (error) {
          console.error('Ошибка поиска по группам:', error);
          highlightedAudiences.value.clear();
        }
      };

      const searchTeachers = async () => {
        if (teacherSearch.value.trim().length < 3) {
          highlightedAudiences.value.clear();
          return;
        }

        try {
          const response = await axios.get(`/api/schedule/teacher/${encodeURIComponent(teacherSearch.value.trim())}`);
          const teacherSchedule = response.data;
          
          highlightedAudiences.value.clear();
          
          teacherSchedule.forEach(item => {
            if (item.audience_id) {
              highlightedAudiences.value.add(item.audience_id);
            }
          });
          
          addToSearchHistory(teacherSearch.value, 'Преподаватель');
        } catch (error) {
          console.error('Ошибка поиска по преподавателям:', error);
          highlightedAudiences.value.clear();
        }
      };

      const debounceSearchAudiences = () => {
        clearTimeout(searchAudienceTimeout);
        searchAudienceTimeout = setTimeout(searchAudiences, 500);
      };

      const debounceSearchGroups = () => {
        clearTimeout(searchGroupTimeout);
        searchGroupTimeout = setTimeout(searchGroups, 500);
      };

      const debounceSearchTeachers = () => {
        clearTimeout(searchTeacherTimeout);
        searchTeacherTimeout = setTimeout(searchTeachers, 500);
      };

      const addToSearchHistory = (term, type) => {
        const existingIndex = searchHistory.value.findIndex(
          item => item.term === term && item.type === type
        );
        
        if (existingIndex !== -1) {
          searchHistory.value[existingIndex].timestamp = new Date().toLocaleTimeString();
        } else {
          searchHistory.value.unshift({
            term,
            type,
            timestamp: new Date().toLocaleTimeString()
          });
        }
        
        if (searchHistory.value.length > 10) {
          searchHistory.value = searchHistory.value.slice(0, 10);
        }
      };

      const applySearchHistory = (item) => {
        switch (item.type) {
          case 'Аудитория':
            audienceSearch.value = item.term;
            searchAudiences();
            break;
          case 'Группа':
            groupSearch.value = item.term;
            searchGroups();
            break;
          case 'Преподаватель':
            teacherSearch.value = item.term;
            searchTeachers();
            break;
        }
      };

      const openModal = async (audience) => {
        currentAudience.value = audience;
        currentImages.value = [
          audience.image1,
          audience.image2,
          audience.image3
        ].filter(img => img);
        
        const scheduleAllowedTypes = ['lecture', 'computer', 'study'];
        if (scheduleAllowedTypes.includes(audience.audience_type)) {
          await fetchSchedule(audience.id);
        } else {
          schedule.value = [];
        }
        
        // Загружаем меню если это буфет
        if (audience.audience_type === 'cafe') {
          await fetchBuffetMenu();
        }
        
        showModal.value = true;
        
        nextTick(() => {
          if (swiperInstance) swiperInstance.destroy();
          swiperInstance = new Swiper('.swiper-container', {
            modules: [Navigation],
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            slidesPerView: 3,
            spaceBetween: 10
          });
        });
      };

      const goToAuth = () => {
        router.push('/auth');
      };

      const logout = () => {
        localStorage.removeItem('user');
        user.value = null;
        router.push('/auth');
      };

      const closeModal = () => {
        showModal.value = false;
        if (swiperInstance) {
          swiperInstance.destroy();
          swiperInstance = null;
        }
      };

      const openFullscreen = (image) => {
        fullscreenImage.value = image;
        showFullscreen.value = true;
      };

      const closeFullscreen = () => {
        showFullscreen.value = false;
      };

      const zoomIn = () => {
        if (panzoomInstance) {
          const transform = panzoomInstance.getTransform();
          panzoomInstance.smoothZoom(transform.x, transform.y, 1.2);
        }
      };

      const zoomOut = () => {
        if (panzoomInstance) {
          const transform = panzoomInstance.getTransform();
          panzoomInstance.smoothZoom(transform.x, transform.y, 0.8);
        }
      };

      const resetView = () => {
        if (panzoomInstance) {
          const transform = initialTransforms[selectedCorpus.value] || initialTransforms['1'];
          panzoomInstance.moveTo(transform.x, transform.y);
          panzoomInstance.zoomAbs(transform.x, transform.y, transform.zoom);
        }
      };

      const selectCorpus = (corpus) => {
        selectedCorpus.value = corpus;
        selectedFloor.value = '1';
        if (viewMode.value === '3d') {
          load3DFloor();
        } else {
          setTimeout(() => {
            resetView();
          }, 100);
        }
      };

      const selectFloor = async (floor) => {
        floorTransition.value = true;
        await nextTick();
        selectedFloor.value = floor;
        setTimeout(() => {
          floorTransition.value = false;
        }, 300);
        
        if (viewMode.value === '3d') {
          load3DFloor();
        }
      };

      const checkImage = (url) => {
        return new Promise((resolve) => {
          const img = new Image();
          img.onload = () => resolve(true);
          img.onerror = () => resolve(false);
          img.src = url;
        });
      };

      const fetchBuffetMenu = async () => {
        try {
          const response = await axios.get('/api/buffet-menu');
          buffetMenu.value = response.data;
        } catch (error) {
          console.error('Ошибка загрузки меню:', error);
          buffetMenu.value = [];
        }
      };

      const goToUniversityMap = () => {
        router.push('/');
      };

      // 3D Methods
      const init3DScene = () => {
        if (!threeDScene.value) return;

        // Scene
        scene = new THREE.Scene();
        scene.background = new THREE.Color(0xf0f8ff);

        // Camera
        camera = new THREE.PerspectiveCamera(20, threeDScene.value.clientWidth / threeDScene.value.clientHeight, 0.1, 1000);
        camera.position.set(0, 15, 20);

        // Renderer
        renderer = new THREE.WebGLRenderer({ 
          antialias: true,
          alpha: true
        });
        renderer.setSize(threeDScene.value.clientWidth, threeDScene.value.clientHeight);
        renderer.shadowMap.enabled = true;
        renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        renderer.gammaOutput = true;
        renderer.gammaFactor = 2.2;

        // Clear existing content
        threeDScene.value.innerHTML = '';
        threeDScene.value.appendChild(renderer.domElement);

        // Controls
        controls = new OrbitControls(camera, renderer.domElement);
        controls.enableDamping = true;
        controls.dampingFactor = 0.05;
        
        controls.minDistance = 4;
        controls.maxDistance = 25;
        controls.minPolarAngle = 0;
        controls.maxPolarAngle = Math.PI * 0.8;
        controls.enablePan = true;
        controls.panSpeed = 0.5;

        // Освещение
        ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
        scene.add(ambientLight);

        directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
        directionalLight.position.set(15, 25, 15);
        directionalLight.castShadow = true;
        directionalLight.shadow.mapSize.width = 4096;
        directionalLight.shadow.mapSize.height = 4096;
        directionalLight.shadow.camera.near = 0.5;
        directionalLight.shadow.camera.far = 50;
        directionalLight.shadow.camera.left = -20;
        directionalLight.shadow.camera.right = 20;
        directionalLight.shadow.camera.top = 20;
        directionalLight.shadow.camera.bottom = -20;
        scene.add(directionalLight);

        const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
        fillLight.position.set(-10, 10, -10);
        scene.add(fillLight);

        const backLight = new THREE.DirectionalLight(0xffffff, 0.3);
        backLight.position.set(0, 5, -15);
        scene.add(backLight);

        const topLight = new THREE.DirectionalLight(0xffffff, 0.5);
        topLight.position.set(0, 20, 0);
        scene.add(topLight);

        const bottomLight = new THREE.DirectionalLight(0xffffff, 0.2);
        bottomLight.position.set(0, -10, 0);
        scene.add(bottomLight);

        // Grid helper
        gridHelper = new THREE.GridHelper(50, 50, 0x000000, 0x000000);
        gridHelper.visible = false;
        scene.add(gridHelper);

        // Raycaster for mouse interactions
        raycaster = new THREE.Raycaster();

        // Event listeners
        window.addEventListener('resize', onWindowResize);
        renderer.domElement.addEventListener('mousemove', onMouseMove);
        renderer.domElement.addEventListener('click', onCanvasClick);

        // Start animation loop
        animate();
      };

      const load3DFloor = () => {
        if (isLoadingFloor.value) return;
        
        isLoadingFloor.value = true;
        loadProgress.value = 0;

        // Очистка предыдущей модели и объектов
        if (floorModel) {
          scene.remove(floorModel);
          if (floorModel.geometry) floorModel.geometry.dispose();
          if (floorModel.material) {
            if (Array.isArray(floorModel.material)) {
              floorModel.material.forEach(material => material.dispose());
            } else {
              floorModel.material.dispose();
            }
          }
          floorModel = null;
        }

        // Очистка аудиторий
        audienceObjects.forEach((obj) => {
          scene.remove(obj);
          if (obj.geometry) obj.geometry.dispose();
          if (obj.material) {
            if (Array.isArray(obj.material)) {
              obj.material.forEach(material => material.dispose());
            } else {
              obj.material.dispose();
            }
          }
        });
        audienceObjects.clear();

        // Загрузка модели этажа и 3D координат
        const loader = new FBXLoader();
        const modelPath = `/models/${selectedCorpus.value}corpus/floor${selectedFloor.value}.fbx`;
        
        loader.load(
          modelPath,
          async (object) => {
            isLoadingFloor.value = false;
            loadProgress.value = 100;
            
            floorModel = object;
            floorModel.scale.set(0.1, 0.1, 0.1);
            floorModel.position.y = 0;
            floorModel.name = `floor_${selectedCorpus.value}_${selectedFloor.value}`;
            
            scene.add(floorModel);
            
            // Загружаем и создаем объекты аудиторий с 3D координатами
            await createAudienceObjects3D();
            
            setTimeout(() => {
              loadProgress.value = 0;
            }, 1000);
          },
          (progress) => {
            if (progress.lengthComputable) {
              loadProgress.value = (progress.loaded / progress.total) * 100;
            }
          },
          (error) => {
            isLoadingFloor.value = false;
            loadProgress.value = 0;
            console.error('Error loading 3D model:', error);
            createFallbackFloor();
            createAudienceObjects3D(); // Используем fallback
          }
        );
      };

      const createFallbackFloor = () => {
        // Сначала удаляем старый пол, если он есть
        const oldFloor = scene.getObjectByName('fallback_floor');
        if (oldFloor) {
          scene.remove(oldFloor);
          if (oldFloor.geometry) oldFloor.geometry.dispose();
          if (oldFloor.material) oldFloor.material.dispose();
        }

        const floorGeometry = new THREE.PlaneGeometry(50, 50);
        const floorMaterial = new THREE.MeshLambertMaterial({ color: 0x808080 });
        floorModel = new THREE.Mesh(floorGeometry, floorMaterial);
        floorModel.name = 'fallback_floor';
        floorModel.rotation.x = -Math.PI / 2;
        scene.add(floorModel);
      };

      const createAudienceObjects3D = async () => {
        try {
          // Загружаем 3D координаты из новой таблицы
          const response = await axios.get(`/api/audiences-3d/${selectedCorpus.value}/${selectedFloor.value}`);
          const audience3DData = response.data;
          
          // Очищаем предыдущие объекты
          audienceObjects.forEach((obj) => {
            scene.remove(obj);
            if (obj.geometry) obj.geometry.dispose();
            if (obj.material) {
              if (Array.isArray(obj.material)) {
                obj.material.forEach(material => material.dispose());
              } else {
                obj.material.dispose();
              }
            }
          });
          audienceObjects.clear();

          // Создаем объекты на основе 3D координат
          audience3DData.forEach(audience3D => {
            const audience = audiences.value.find(a => a.id === audience3D.audience_id);
            if (!audience) return;

            // Заменил цвет на стандартный голубой
            const color = new THREE.Color(0x4361ee);
            
            // Используем данные из таблицы 3D координат
            const geometry = new THREE.BoxGeometry(
              audience3D.scale_x || 1,
              audience3D.scale_y || 2,
              audience3D.scale_z || 1
            );
            
            const material = new THREE.MeshLambertMaterial({ 
              color: color,
              transparent: true,
              opacity: 0.2
            });
            
            const cube = new THREE.Mesh(geometry, material);
            
            // Позиционируем используя данные из 3D таблицы
            cube.position.set(
              audience3D.position_x,
              audience3D.position_y,
              audience3D.position_z
            );
            
            // Применяем поворот если указан
            if (audience3D.rotation_x || audience3D.rotation_y || audience3D.rotation_z) {
              cube.rotation.set(
                audience3D.rotation_x || 0,
                audience3D.rotation_y || 0,
                audience3D.rotation_z || 0
              );
            }
            
            cube.userData = { 
              audience: {
                ...audience,
                // Добавляем 3D данные для использования в интерфейсе
                position_x: audience3D.position_x,
                position_y: audience3D.position_y,
                position_z: audience3D.position_z
              }
            };
            cube.castShadow = true;
            cube.receiveShadow = true;
            
            scene.add(cube);
            audienceObjects.set(audience.id, cube);

            // Добавляем метку с номером аудитории
            createAudienceLabel(audience, audience3D, color);
          });
        } catch (error) {
          console.error('Ошибка загрузки 3D координат:', error);
          createFallback3DAudiences();
        }
      };

      const createAudienceLabel = (audience, audience3D, color) => {
        const canvas = document.createElement('canvas');
        const context = canvas.getContext('2d');
        canvas.width = 256;
        canvas.height = 128;
        
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.fillStyle = color.getStyle();
        context.font = 'bold 48px Arial';
        context.textAlign = 'center';
        context.fillText(audience.num_audiences, canvas.width / 2, canvas.height / 2 + 16);
        
        const texture = new THREE.CanvasTexture(canvas);
        const labelMaterial = new THREE.SpriteMaterial({ map: texture });
        const sprite = new THREE.Sprite(labelMaterial);
        sprite.scale.set(3, 1.5, 1);
        
        // Позиционируем метку над аудиторией
        sprite.position.set(
          audience3D.position_x,
          audience3D.position_y + 2,
          audience3D.position_z
        );
        sprite.userData = { audience };
        
        scene.add(sprite);
        audienceObjects.set(audience.id + '_label', sprite);
      };

      const createFallback3DAudiences = () => {
        const floorAudiences = filteredAudiences.value;
        
        floorAudiences.forEach(audience => {
          const color = new THREE.Color(0x4361ee);
          
          const geometry = new THREE.BoxGeometry(
            audience.width / 100, 
            2, 
            audience.height / 100
          );
          
          const material = new THREE.MeshLambertMaterial({ 
            color: color,
            transparent: true,
            opacity: 0.2
          });
          
          const cube = new THREE.Mesh(geometry, material);
          cube.position.set(
            audience.x / 100 - 25, 
            1, 
            audience.y / 100 - 25
          );
          cube.userData = { audience };
          cube.castShadow = true;
          cube.receiveShadow = true;
          
          scene.add(cube);
          audienceObjects.set(audience.id, cube);

          createAudienceLabel(audience, {
            position_x: audience.x / 100 - 25,
            position_y: 3,
            position_z: audience.y / 100 - 25
          }, color);
        });
      };

      const onWindowResize = () => {
        if (viewMode.value === '3d') {
          if (camera && renderer && threeDScene.value) {
            camera.aspect = threeDScene.value.clientWidth / threeDScene.value.clientHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(threeDScene.value.clientWidth, threeDScene.value.clientHeight);
          }
        }
      };

      const onMouseMove = (event) => {
        if (!raycaster || !camera || viewMode.value !== '3d') return;

        const rect = renderer.domElement.getBoundingClientRect();
        mouse.x = ((event.clientX - rect.left) / rect.width) * 2 - 1;
        mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

        raycaster.setFromCamera(mouse, camera);
        
        const intersects = raycaster.intersectObjects(Array.from(audienceObjects.values()));
        
        if (intersects.length > 0) {
          const object = intersects[0].object;
          if (object.userData.audience) {
            hoveredAudience3D.value = object.userData.audience;
            
            // Highlight effect
            object.material.emissive = new THREE.Color(0x333333);
            object.material.needsUpdate = true;
          }
        } else {
          // Reset all materials
          audienceObjects.forEach((obj) => {
            if (obj.material && obj.material.emissive) {
              obj.material.emissive.set(0x000000);
              obj.material.needsUpdate = true;
            }
          });
          hoveredAudience3D.value = null;
        }
      };

      const onCanvasClick = (event) => {
        if (!raycaster || !camera || viewMode.value !== '3d') return;

        raycaster.setFromCamera(mouse, camera);
        const intersects = raycaster.intersectObjects(Array.from(audienceObjects.values()));
        
        if (intersects.length > 0) {
          const object = intersects[0].object;
          if (object.userData.audience) {
            openModal(object.userData.audience);
          }
        }
      };

      const animate = () => {
        animationFrameId = requestAnimationFrame(animate);
        
        if (controls) {
          if (camera.position.y < 1) {
            camera.position.y = 1;
          }
          controls.update();
        }
        
        if (renderer && scene && camera) {
          renderer.render(scene, camera);
        }
      };

      const reset3DView = () => {
        if (controls && camera) {
          controls.reset();
          camera.position.set(0, 10, 15);
          controls.update();
        }
      };

      const toggleGrid = () => {
        if (gridHelper) {
          gridHelper.visible = !gridHelper.visible;
        }
      };

      const toggleLights = () => {
        if (directionalLight && ambientLight) {
          directionalLight.visible = !directionalLight.visible;
          ambientLight.intensity = directionalLight.visible ? 0.6 : 1.0;
        }
      };

      const cleanup3D = () => {
        // Останавливаем анимацию
        if (animationFrameId) {
          cancelAnimationFrame(animationFrameId);
          animationFrameId = null;
        }

        // Очищаем сцену
        if (scene) {
          scene.traverse((object) => {
            if (object.geometry) object.geometry.dispose();
            if (object.material) {
              if (Array.isArray(object.material)) {
                object.material.forEach(material => material.dispose());
              } else {
                object.material.dispose();
              }
            }
            if (object.texture) object.texture.dispose();
          });
          scene.clear();
          scene = null;
        }

        // Очищаем рендерер
        if (renderer) {
          renderer.dispose();
          renderer.forceContextLoss();
          if (renderer.domElement) {
            renderer.domElement.remove();
          }
          renderer = null;
        }

        // Очищаем контролы
        if (controls) {
          controls.dispose();
          controls = null;
        }

        // Очищаем камеру
        camera = null;

        // Очищаем коллекции
        audienceObjects.clear();

        // Удаляем обработчики событий
        window.removeEventListener('resize', onWindowResize);
        if (threeDScene.value) {
          threeDScene.value.innerHTML = '';
        }

        // Сбрасываем состояние
        hoveredAudience3D.value = null;
        isLoadingFloor.value = false;
        loadProgress.value = 0;
      };

      // Инициализация
      onMounted(async () => {
        await fetchAudiences();
        await fetchGroups();
        await fetchTeachers();
        
        initializePanzoom();
        
        mapLoaded.value = await checkImage(currentMapImage.value);
      });

      onUnmounted(() => {
        cleanup3D();
        if (panzoomInstance) {
          panzoomInstance.dispose();
        }
      });

      // Watchers
      watch([selectedCorpus, selectedFloor], async () => {
        mapLoaded.value = await checkImage(currentMapImage.value);
        
        // Сбрасываем вид только в 2D режиме
        if (viewMode.value === '2d') {
          setTimeout(() => {
            resetView();
          }, 0);
        }
      });

      return {
        audiences,
        currentAudience,
        currentImages,
        fullscreenImage,
        searchHistory,
        mapLoaded,
        user,
        floorTransition,
        hoveredAudience3D,
        viewMode,
        theme,
        themeIcon,
        themeButtonText,
        
        showModal,
        showFullscreen,
        showScheduleSection,
        activePanel,
        isLoadingFloor,
        loadProgress,
        audienceSearch,
        groupSearch,
        teacherSearch,
        selectedCorpus,
        selectedFloor,
        selectedDay,
        selectedFilters,
        
        corpuses,
        floors,
        days,
        filters,
        
        currentMapImage,
        filteredAudiences,
        groupedSchedule,
        
        mapContent,
        svgElement,
        threeDScene,
        buffetMenu,
        menuCategories,
        getMenuByCategory,
        selectedCategory,
        
        viewModeIcon,
        viewModeText,
        
        // Методы
        openModal,
        closeModal,
        openFullscreen,
        closeFullscreen,
        zoomIn,
        togglePanel,
        zoomOut,
        resetView,
        selectCorpus,
        goToAuth,
        logout,
        selectFloor,
        debounceSearchAudiences,
        debounceSearchGroups,
        debounceSearchTeachers,
        applySearchHistory,
        getAudienceTypeName,
        getAudienceIcon,
        getAudienceFill,
        getAudienceStroke,
        getLabelColor,
        getHistoryIcon,
        goToUniversityMap,
        fetchBuffetMenu,
        getCategoryName,
        formatPrice,
        toggleViewMode,
        reset3DView,
        toggleGrid,
        toggleLights,
        toggleTheme
      };
    }
  };
  </script>

  <style scoped>
  /* Основные стили */
  .main-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
    background-color: var(--bg-primary);
    color: var(--text-primary);
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
    transition: background-color 0.3s ease, color 0.3s ease;
  }

  .main-container * {
    transition: background-color 0.3s ease, border-color 0.3s ease, color 0.3s ease;
  }

  /* CSS переменные для тем */
  .main-container.light {
    --bg-primary: #f8fafc;
    --bg-secondary: #ffffff;
    --bg-tertiary: #f1f5f9;
    --text-primary: #2d3748;
    --text-secondary: #4a5568;
    --text-tertiary: #718096;
    --accent-primary: #4361ee;
    --accent-secondary: #3a0ca3;
    --border-light: rgba(0, 0, 0, 0.08);
    --border-medium: rgba(0, 0, 0, 0.12);
    --shadow-light: rgba(0, 0, 0, 0.05);
    --shadow-medium: rgba(0, 0, 0, 0.1);
    --glass-bg: rgba(255, 255, 255, 0.92);
    --glass-border: rgba(255, 255, 255, 0.2);
    --card-bg: #ffffff;
    --input-bg: #ffffff;
    --audience-fill: rgba(67, 97, 238, 0.05);
    --audience-stroke: rgba(67, 97, 238, 0.7);
    --label-color: #0047c1;
  }

  .main-container.dark {
    --bg-primary: #0f1419;
    --bg-secondary: #1a202c;
    --bg-tertiary: #2d3748;
    --text-primary: #f7fafc;
    --text-secondary: #e2e8f0;
    --text-tertiary: #a0aec0;
    --accent-primary: #4f46e5;
    --accent-secondary: #6366f1;
    --border-light: rgba(255, 255, 255, 0.08);
    --border-medium: rgba(255, 255, 255, 0.12);
    --shadow-light: rgba(0, 0, 0, 0.3);
    --shadow-medium: rgba(0, 0, 0, 0.4);
    --glass-bg: rgba(26, 32, 44, 0.92);
    --glass-border: rgba(255, 255, 255, 0.1);
    --card-bg: #1a202c;
    --input-bg: #2d3748;
    --audience-fill: rgba(67, 97, 238, 0.2);
    --audience-stroke: #4361ee;
    --label-color: #9dd8ff;
  }

  /* Эффект стекла */
  .glassmorphism {
    background: var(--glass-bg);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid var(--glass-border);
    box-shadow: 0 8px 32px 0 var(--shadow-light);
  }

  /* Навигационная панель */
  .top-nav {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 0 24px;
    height: 72px;
    z-index: 50;
    transition: all 0.3s ease;
  }

  .logo {
    display: flex;
    align-items: center;
    gap: 12px;
    font-size: 1.5rem;
    font-weight: 700;
    color: var(--text-primary);
    letter-spacing: -0.5px;
  }

  .logo i {
    font-size: 1.8rem;
    color: var(--accent-primary);
    transition: transform 0.3s ease;
  }

  .logo:hover i {
    transform: rotate(15deg);
  }

  /* Стили для вкладок */
  .nav-buttons {
    display: flex;
    gap: 4px;
    background: var(--bg-tertiary);
    padding: 4px;
    border-radius: 12px;
    box-shadow: inset 0 1px 2px var(--shadow-light);
  }

  .nav-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 10px 20px;
    background: transparent;
    border: none;
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    font-weight: 500;
    position: relative;
    overflow: hidden;
    font-size: 0.95rem;
  }

  .nav-btn::before {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 100%;
    height: 3px;
    background: transparent;
    transition: all 0.3s ease;
    border-radius: 3px 3px 0 0;
  }

  .nav-btn:hover {
    background: var(--bg-secondary);
  }

  .nav-btn.active {
    background: var(--card-bg);
    color: var(--accent-primary);
    box-shadow: 0 2px 8px rgba(67, 97, 238, 0.15);
  }

  .nav-btn.active::before {
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
  }

  .nav-btn i {
    font-size: 1rem;
    transition: transform 0.3s ease;
  }

  .nav-btn.active i {
    transform: translateY(-2px);
  }

  .btn-text {
    display: inline-block;
  }

  /* Стили пользовательского профиля */
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

  .profile-link {
    display: flex;
    align-items: center;
    gap: 10px;
    text-decoration: none;
    color: var(--text-primary);
    transition: all 0.2s ease;
  }

  .profile-link:hover {
    color: var(--accent-primary);
  }

  .avatar-wrapper {
    width: 42px;
    height: 42px;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    padding: 2px;
    transition: transform 0.3s ease;
  }

  .avatar-wrapper:hover {
    transform: scale(1.05);
  }

  .user-avatar {
    width: 100%;
    height: 100%;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--card-bg);
  }

  .logo_img {
    width: 50px;
    height: 50px;
    border-radius: 50%;
    object-fit: cover;
    border: 2px solid var(--card-bg);
  }

  .username {
    font-weight: 500;
    font-size: 0.95rem;
  }

  .logout-btn {
    background: none;
    border: none;
    color: var(--text-tertiary);
    font-size: 1.1rem;
    cursor: pointer;
    transition: all 0.2s ease;
    padding: 8px;
    border-radius: 50%;
  }

  .logout-btn:hover {
    background-color: var(--bg-tertiary);
    color: #e53e3e;
  }

  .guest-actions {
    display: flex;
    align-items: center;
  }

  .gradient-btn {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    border: none;
    padding: 10px 20px;
    border-radius: 8px;
    font-weight: 500;
    display: flex;
    align-items: center;
    gap: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 6px rgba(67, 97, 238, 0.2);
    font-size: 0.95rem;
  }

  .gradient-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 8px rgba(67, 97, 238, 0.3);
  }

  .gradient-btn:active {
    transform: translateY(0);
  }

  /* Боковые панели */
  .slide-fade-enter-active {
    transition: all 0.3s ease-out;
  }

  .slide-fade-leave-active {
    transition: all 0.2s cubic-bezier(1, 0.5, 0.8, 1);
  }

  .slide-fade-enter-from,
  .slide-fade-leave-to {
    transform: translateX(-20px);
    opacity: 0;
  }

  .side-panel {
    position: fixed;
    top: 72px;
    left: 0;
    width: 340px;
    height: calc(100vh - 72px);
    z-index: 40;
    overflow-y: auto;
    padding: 24px;
    border-radius: 0 16px 16px 0;
    box-shadow: 4px 0 15px var(--shadow-light);
  }

  .panel-title {
    font-size: 1.3rem;
    margin-bottom: 24px;
    color: var(--text-primary);
    display: flex;
    align-items: center;
    gap: 10px;
    position: relative;
    padding-bottom: 12px;
  }

  .panel-title::after {
    content: '';
    position: absolute;
    bottom: 0;
    left: 0;
    width: 40px;
    height: 3px;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    border-radius: 3px;
  }

  .panel-title i {
    color: var(--accent-primary);
    font-size: 1.1rem;
  }

  /* Стили для поиска */
  .search-group {
    margin-bottom: 20px;
  }

  .input-with-icon {
    position: relative;
    display: flex;
    align-items: center;
  }

  .input-with-icon i {
    position: absolute;
    left: 14px;
    color: var(--text-tertiary);
    font-size: 0.95rem;
    z-index: 1;
  }

  .search-input {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    font-size: 0.95rem;
    transition: all 0.3s ease;
    background-color: var(--input-bg);
    color: var(--text-primary);
    box-shadow: 0 1px 2px var(--shadow-light);
  }

  .search-input:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }

  /* Стили для истории поиска */
  .history-list {
    list-style: none;
    padding: 0;
    margin: 0;
  }

  .history-item {
    padding: 14px;
    margin-bottom: 8px;
    border-radius: 8px;
    background-color: var(--card-bg);
    display: flex;
    align-items: center;
    gap: 14px;
    cursor: pointer;
    transition: all 0.2s ease;
    border-left: 3px solid transparent;
    box-shadow: 0 1px 3px var(--shadow-light);
  }

  .history-item:hover {
    background-color: var(--bg-tertiary);
    border-left-color: var(--accent-primary);
    transform: translateX(4px);
  }

  .history-item i {
    font-size: 1.1rem;
    color: var(--accent-primary);
    flex-shrink: 0;
  }

  .history-content {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    overflow: hidden;
  }

  .history-term {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }

  .history-type {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    margin-top: 2px;
  }

  .history-time {
    font-size: 0.75rem;
    color: var(--text-tertiary);
    margin-top: 4px;
  }

  .empty-message {
    color: var(--text-tertiary);
    text-align: center;
    padding: 24px 16px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 8px;
    background-color: var(--bg-tertiary);
    border-radius: 8px;
    margin-top: 10px;
  }

  .empty-message i {
    color: var(--text-tertiary);
    font-size: 1.5rem;
  }

  .description-section {
    margin-bottom: 20px;
  }

  .description-text {
    background-color: var(--bg-tertiary);
    padding: 15px;
    border-radius: 8px;
    line-height: 1.6;
    color: var(--text-secondary);
  }

  /* Стили для фильтров */
  .corpus-buttons {
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: 10px;
    margin-bottom: 20px;
  }

  .corpus-btn {
    padding: 10px;
    background-color: var(--card-bg);
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.95rem;
    font-weight: 500;
    box-shadow: 0 1px 2px var(--shadow-light);
  }

  .corpus-btn:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--border-light);
  }

  .corpus-btn.active {
    background-color: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
    box-shadow: 0 2px 6px rgba(67, 97, 238, 0.2);
    transform: translateY(-2px);
  }

  .filter-options {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .filter-option {
    display: flex;
    align-items: center;
    gap: 10px;
    cursor: pointer;
    padding: 10px;
    border-radius: 8px;
    transition: all 0.2s ease;
    background-color: var(--card-bg);
    box-shadow: 0 1px 2px var(--shadow-light);
  }

  .filter-option i {
    color: var(--text-tertiary);
    font-size: 0.95rem;
    width: 20px;
    text-align: center;
  }

  .filter-option:hover i {
    color: var(--accent-primary);
  }

  .filter-option:hover {
    background-color: var(--bg-tertiary);
  }

  .filter-checkbox {
    appearance: none;
    width: 18px;
    height: 18px;
    border: 2px solid var(--text-tertiary);
    border-radius: 4px;
    cursor: pointer;
    position: relative;
    transition: all 0.2s ease;
    flex-shrink: 0;
  }

  .filter-checkbox:checked {
    background-color: var(--accent-primary);
    border-color: var(--accent-primary);
  }

  .filter-checkbox:checked::after {
    content: '\f00c';
    font-family: 'Font Awesome 5 Free';
    font-weight: 900;
    position: absolute;
    color: white;
    font-size: 10px;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
  }

  .filter-label {
    font-size: 0.95rem;
    color: var(--text-secondary);
    transition: color 0.2s ease;
  }

  .filter-option:hover .filter-label {
    color: var(--accent-primary);
  }

  /* Контейнер 2D карты */
  .map-container {
    position: relative;
    flex: 1;
    overflow: hidden;
    background-color: var(--bg-tertiary);
  }

  .map-content {
    width: 2000px;
    height: 1440px;
    background-size: cover;
    position: relative;
    transition: background-image 0.5s ease-in-out;
  }

  #audience-svg {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
  }

  .audience-rect {
    fill: var(--audience-fill);
    stroke: var(--audience-stroke);
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    filter: drop-shadow(0 2px 4px rgba(67, 97, 238, 0.3));
  }

  .audience-rect:hover {
    fill: rgba(67, 97, 238, 0.3);
    stroke-width: 2.5;
  }

  .audience-rect.highlighted {
    fill: rgba(51, 255, 0, 0.4);
    stroke: rgba(51, 255, 0, 0.8);
    stroke-width: 3;
    animation: pulse 2s infinite;
  }

  .audience-label {
    pointer-events: none;
    user-select: none;
    font-family: 'Inter', sans-serif;
    fill: var(--label-color);
  }

  /* 3D контейнер */
  .three-d-container {
    position: relative;
    flex: 1;
    overflow: hidden;
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  }

  .three-d-scene {
    width: 100%;
    height: 100%;
    outline: none;
  }

  .three-d-controls {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .floor-controls-3d {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 12px;
    background: var(--glass-bg);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    box-shadow: 0 4px 6px var(--shadow-light);
  }

  .audience-info-3d {
    position: absolute;
    top: 24px;
    left: 24px;
    z-index: 20;
    padding: 16px;
    border-radius: 12px;
    max-width: 300px;
    animation: slideInLeft 0.3s ease;
  }

  .audience-info-3d h4 {
    margin: 0 0 8px 0;
    color: var(--text-primary);
    font-size: 1.1rem;
  }

  .audience-info-3d p {
    margin: 0 0 12px 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
  }

  .info-btn {
    background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
    color: white;
    border: none;
    padding: 8px 16px;
    border-radius: 6px;
    font-size: 0.9rem;
    cursor: pointer;
    transition: all 0.3s ease;
    display: flex;
    align-items: center;
    gap: 6px;
  }

  .info-btn:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 8px rgba(67, 97, 238, 0.3);
  }

  /* Элементы управления картой */
  .map-controls {
    position: absolute;
    top: 24px;
    right: 24px;
    z-index: 20;
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .control-btn {
    width: 42px;
    height: 42px;
    background-color: var(--card-bg);
    color: var(--accent-primary);
    border: none;
    border-radius: 50%;
    font-size: 1rem;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 4px 8px var(--shadow-medium);
  }

  .control-btn:hover {
    background-color: var(--accent-primary);
    color: white;
    transform: scale(1.1);
  }

  .floor-controls {
    position: absolute;
    bottom: 24px;
    left: 50%;
    transform: translateX(-50%);
    z-index: 20;
    display: flex;
    gap: 8px;
    padding: 8px;
    border-radius: 12px;
    background: var(--glass-bg);
    backdrop-filter: blur(4px);
    -webkit-backdrop-filter: blur(4px);
    box-shadow: 0 4px 6px var(--shadow-light);
  }

  .floor-btn {
    padding: 8px 16px;
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    border: none;
    border-radius: 8px;
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
    box-shadow: 0 1px 2px var(--shadow-light);
  }

  .floor-btn:hover {
    background-color: var(--bg-secondary);
  }

  .floor-btn.active {
    background-color: var(--accent-primary);
    color: white;
    box-shadow: 0 2px 4px rgba(67, 97, 238, 0.2);
    transform: translateY(-2px);
  }

  /* Модальные окна */
  .modal-enter-active,
  .modal-leave-active {
    transition: opacity 0.3s ease;
  }

  .modal-enter-from,
  .modal-leave-to {
    opacity: 0;
  }

  .modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.5);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    padding: 20px;
  }

  .modal-container {
    width: 100%;
    max-width: 900px;
    max-height: 90vh;
    overflow-y: auto;
    border-radius: 16px;
    padding: 28px;
    position: relative;
    animation: modalEnter 0.3s ease-out;
  }

  @keyframes modalEnter {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .close-btn {
    position: absolute;
    top: 20px;
    right: 20px;
    width: 36px;
    height: 36px;
    background-color: var(--bg-tertiary);
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.2s ease;
    z-index: 10;
    box-shadow: 0 2px 4px var(--shadow-light);
  }

  .close-btn:hover {
    background-color: #e53e3e;
    color: white;
    transform: rotate(90deg);
  }

  .close-btn i {
    font-size: 1.1rem;
  }

  .modal-header {
    margin-bottom: 24px;
    padding-bottom: 16px;
    border-bottom: 1px solid var(--border-medium);
  }

  .modal-header h2 {
    margin: 0;
    color: var(--text-primary);
    font-size: 1.8rem;
    font-weight: 700;
  }

  .audience-meta {
    display: flex;
    gap: 16px;
    margin-top: 12px;
    flex-wrap: wrap;
  }

  .meta-item {
    display: flex;
    align-items: center;
    gap: 6px;
    font-size: 0.95rem;
    color: var(--text-secondary);
    background-color: var(--bg-tertiary);
    padding: 6px 12px;
    border-radius: 6px;
  }

  .meta-item i {
    color: var(--accent-primary);
    font-size: 0.9rem;
  }

  .modal-content {
    display: flex;
    flex-direction: column;
    gap: 28px;
  }

  .section-title {
    font-size: 1.3rem;
    color: var(--text-primary);
    margin-bottom: 16px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .section-title i {
    color: var(--accent-primary);
    font-size: 1.1rem;
  }

  .gallery-section {
    margin-bottom: 16px;
  }

  .swiper-container {
    width: 100%;
    height: auto;
    border-radius: 12px;
    overflow: hidden;
    padding: 8px;
    margin: 0;
  }

  .swiper-slide {
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 8px;
    overflow: hidden;
    background-color: var(--bg-tertiary);
    transition: all 0.3s ease;
    box-shadow: 0 2px 4px var(--shadow-light);
  }

  .gallery-image {
    width: 100%;
    height: 200px;
    object-fit: cover;
    border-radius: 8px;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .gallery-image:hover {
    transform: scale(1.02);
  }

  .swiper-button-next,
  .swiper-button-prev {
    color: var(--accent-primary);
    background-color: var(--glass-bg);
    width: 36px;
    height: 36px;
    border-radius: 50%;
    box-shadow: 0 2px 6px var(--shadow-medium);
    transition: all 0.3s ease;
  }

  .swiper-button-next::after,
  .swiper-button-prev::after {
    font-size: 1rem;
  }

  .swiper-button-next:hover,
  .swiper-button-prev:hover {
    background-color: var(--card-bg);
    transform: scale(1.1);
  }

  .day-selector {
    margin-bottom: 20px;
  }

  .select-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    max-width: 300px;
  }

  .select-wrapper i {
    position: absolute;
    left: 14px;
    color: var(--text-tertiary);
    font-size: 0.95rem;
    z-index: 1;
  }

  .day-select {
    width: 100%;
    padding: 12px 16px 12px 42px;
    border: 1px solid var(--border-medium);
    border-radius: 8px;
    font-size: 0.95rem;
    appearance: none;
    background-color: var(--input-bg);
    color: var(--text-primary);
    cursor: pointer;
    transition: all 0.3s ease;
    box-shadow: 0 1px 2px var(--shadow-light);
  }

  .day-select:focus {
    outline: none;
    border-color: var(--accent-primary);
    box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
  }

  .schedule-table-container {
    overflow-x: auto;
    border-radius: 8px;
    box-shadow: 0 1px 3px var(--shadow-light);
    margin-top: 16px;
  }

  .schedule-table {
    width: 100%;
    border-collapse: separate;
    border-spacing: 0;
    background-color: var(--card-bg);
    border-radius: 8px;
    overflow: hidden;
    min-width: 600px;
  }

  .schedule-table th {
    background-color: var(--bg-tertiary);
    color: var(--text-secondary);
    font-weight: 600;
    padding: 14px 16px;
    text-align: left;
    border-bottom: 1px solid var(--border-medium);
    white-space: nowrap;
  }

  .schedule-table td {
    padding: 12px 16px;
    border-bottom: 1px solid var(--border-medium);
    color: var(--text-secondary);
    vertical-align: top;
  }

  .schedule-table tr:last-child td {
    border-bottom: none;
  }

  .schedule-table tr:hover td {
    background-color: var(--bg-tertiary);
  }

  .time-cell {
    font-weight: 500;
    color: var(--text-primary);
    white-space: nowrap;
  }

  .teacher-cell {
    min-width: 180px;
  }

  .groups-cell {
    min-width: 150px;
  }

  /* Полноэкранный просмотр */
  .fade-enter-active,
  .fade-leave-active {
    transition: opacity 0.3s ease;
  }

  .fade-enter-from,
  .fade-leave-to {
    opacity: 0;
  }

  .fullscreen-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background-color: rgba(0, 0, 0, 0.45);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
  }

  .fullscreen-image {
    max-width: 90%;
    max-height: 90%;
    object-fit: contain;
    animation: zoomIn 0.3s ease;
    border-radius: 4px;
    box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
  }

  .fullscreen-overlay .close-btn {
    position: fixed;
    top: 24px;
    right: 24px;
    width: 44px;
    height: 44px;
    background-color: rgba(255, 255, 255, 0.1);
    color: white;
    font-size: 1.2rem;
  }

  .fullscreen-overlay .close-btn:hover {
    background-color: rgba(255, 255, 255, 0.2);
  }

  /* Анимации */
  @keyframes pulse {
    0% { opacity: 0.6;}
    50% { opacity: 1;}
    100% { opacity: 0.6;}
  }

  @keyframes float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
    100% { transform: translateY(0); }
  }

  @keyframes zoomIn {
    from {
      transform: scale(0.95);
      opacity: 0;
    }
    to {
      transform: scale(1);
      opacity: 1;
    }
  }

  @keyframes slideInLeft {
    from {
      opacity: 0;
      transform: translateX(-20px);
    }
    to {
      opacity: 1;
      transform: translateX(0);
    }
  }

  .loading-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.3);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 30;
    backdrop-filter: blur(2px);
  }

  .loading-content {
    padding: 30px;
    border-radius: 16px;
    text-align: center;
    min-width: 280px;
    animation: slideInDown 0.3s ease;
  }

  .loading-content p {
    margin: 15px 0 20px 0;
    color: var(--text-secondary);
    font-weight: 500;
  }

  .loading-progress {
    margin-top: 15px;
  }

  .progress-bar {
    width: 100%;
    height: 6px;
    background: var(--bg-tertiary);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 8px;
  }

  .progress-fill {
    height: 100%;
    background: linear-gradient(90deg, var(--accent-primary), var(--accent-secondary));
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .progress-text {
    font-size: 0.85rem;
    color: var(--text-tertiary);
    font-weight: 500;
  }

  /* Анимации спиннеров */
  .loading-spinner {
    width: 16px;
    height: 16px;
    border: 2px solid transparent;
    border-top: 2px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    display: inline-block;
  }

  .loading-spinner-large {
    width: 50px;
    height: 50px;
    border: 3px solid var(--bg-tertiary);
    border-top: 3px solid var(--accent-primary);
    border-radius: 50%;
    animation: spin 1s linear infinite;
    margin: 0 auto;
  }

  .floor-btn.loading {
    opacity: 0.7;
    pointer-events: none;
  }

  .floor-btn.loading .loading-spinner {
    margin-right: 8px;
  }

  /* Стили для секции меню */
  .menu-section {
    margin-bottom: 20px;
  }

  .menu-categories {
    display: flex;
    flex-wrap: wrap;
    gap: 8px;
    margin-bottom: 20px;
  }

  .category-btn {
    padding: 8px 16px;
    background-color: var(--card-bg);
    border: 1px solid var(--border-medium);
    border-radius: 20px;
    color: var(--text-secondary);
    cursor: pointer;
    transition: all 0.3s ease;
    font-size: 0.9rem;
    font-weight: 500;
  }

  .category-btn:hover {
    background-color: var(--bg-tertiary);
    border-color: var(--border-light);
  }

  .category-btn.active {
    background-color: var(--accent-primary);
    color: white;
    border-color: var(--accent-primary);
    box-shadow: 0 2px 4px rgba(67, 97, 238, 0.2);
  }

  .menu-grid {
    display: grid;
    grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
    gap: 16px;
  }

  .menu-item {
    background-color: var(--card-bg);
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 2px 8px var(--shadow-medium);
    transition: all 0.3s ease;
    display: flex;
    flex-direction: column;
  }

  .menu-item:hover {
    transform: translateY(-2px);
    box-shadow: 0 4px 12px var(--shadow-medium);
  }

  .menu-item-image {
    width: 100%;
    height: 160px;
    overflow: hidden;
  }

  .menu-item-image img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    cursor: pointer;
    transition: transform 0.3s ease;
  }

  .menu-item-image img:hover {
    transform: scale(1.05);
  }

  .menu-item-content {
    padding: 16px;
    flex-grow: 1;
    display: flex;
    flex-direction: column;
  }

  .item-name {
    margin: 0 0 8px 0;
    font-size: 1.1rem;
    font-weight: 600;
    color: var(--text-primary);
  }

  .item-description {
    margin: 0 0 12px 0;
    color: var(--text-secondary);
    font-size: 0.9rem;
    line-height: 1.4;
    flex-grow: 1;
  }

  .item-meta {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 8px;
  }

  .item-category {
    font-size: 0.8rem;
    color: var(--text-tertiary);
    background-color: var(--bg-tertiary);
    padding: 4px 8px;
    border-radius: 12px;
  }

  .item-price {
    font-size: 1.2rem;
    font-weight: 700;
    color: var(--accent-primary);
  }

  .item-availability {
    font-size: 0.8rem;
    font-weight: 500;
    padding: 4px 8px;
    border-radius: 8px;
    text-align: center;
  }

  .item-availability.available {
    background-color: #f0fff4;
    color: #38a169;
  }

  .item-availability.unavailable {
    background-color: #fff5f5;
    color: #e53e3e;
  }

  /* Анимации */
  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }

  @keyframes slideInDown {
    from {
      opacity: 0;
      transform: translateY(-20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  /* Поддержка системных предпочтений */
  @media (prefers-color-scheme: dark) {
    .main-container:not(.light) {
      /* Применяем тёмную тему по умолчанию, если пользователь не выбрал светлую */
      --bg-primary: #0f1419;
      --bg-secondary: #1a202c;
      --bg-tertiary: #2d3748;
      --text-primary: #f7fafc;
      --text-secondary: #e2e8f0;
      --text-tertiary: #a0aec0;
      --accent-primary: #4f46e5;
      --accent-secondary: #6366f1;
      --border-light: rgba(255, 255, 255, 0.08);
      --border-medium: rgba(255, 255, 255, 0.12);
      --shadow-light: rgba(0, 0, 0, 0.3);
      --shadow-medium: rgba(0, 0, 0, 0.4);
      --glass-bg: rgba(26, 32, 44, 0.92);
      --glass-border: rgba(255, 255, 255, 0.1);
      --card-bg: #1a202c;
      --input-bg: #2d3748;
    }
  }

  /* Адаптивность */
  @media (max-width: 1024px) {
    .nav-buttons {
      gap: 2px;
    }
    
    .nav-btn {
      padding: 8px 12px;
      font-size: 0.9rem;
    }
    
    .btn-text {
      display: none;
    }
    
    .side-panel {
      width: 300px;
    }
  }

  @media (max-width: 768px) {
    .top-nav {
      padding: 0 16px;
    }
    
    .logo span {
      display: none;
    }
    
    .nav-buttons {
      gap: 1px;
    }
    
    .nav-btn {
      padding: 6px 8px;
    }
    
    .side-panel {
      width: 280px;
    }
    
    .modal-container {
      margin: 10px;
      padding: 20px;
    }
  }
  </style>
