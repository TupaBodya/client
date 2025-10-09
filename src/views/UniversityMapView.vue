<template>
  <div class="main-container">
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
        <button @click="goToBuildingsMap" class="nav-btn">
          <i class="fas fa-university"></i>
          <span class="btn-text">Корпус</span>
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
              <i class="fas fa-building"></i>
              <input 
                type="text" 
                v-model="buildingSearch" 
                @input="debounceSearchBuildings" 
                placeholder="Название здания..."
                class="search-input"
              />
            </div>
          </div>
          
          <div class="search-group">
            <div class="input-with-icon">
              <i class="fas fa-monument"></i>
              <input 
                type="text" 
                v-model="landmarkSearch" 
                @input="debounceSearchLandmarks" 
                placeholder="Название памятника..."
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
          <p v-else class="empty-message">История поиска пуста</p>
        </div>

        <div v-if="activePanel === 'filters'" class="filters-panel">
          <div class="filter-group">
            <h3 class="panel-title"><i class="fas fa-filter"></i> Тип объекта</h3>
            <div class="filter-options">
              <label v-for="filter in buildingFilters" :key="filter.value" class="filter-option">
                <input 
                  type="checkbox" 
                  v-model="selectedFilters" 
                  :value="filter.value" 
                  class="filter-checkbox"
                />
                <i class="fas" :class="filter.icon"></i>
                <span class="filter-label">{{ filter.label }}</span>
              </label>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <div class="map-container">
      <div class="map-controls">
        <button class="control-btn zoom-in" @click="zoomIn" title="Увеличить">
          <i class="fas fa-plus"></i>
        </button>
        <button class="control-btn zoom-out" @click="zoomOut" title="Уменьшить">
          <i class="fas fa-minus"></i>
        </button>
      </div>

      <div class="map-content" ref="mapContent" :style="{ backgroundImage: `url(${mapImage})` }">
        <svg id="territory-svg" ref="svgElement">
          <!-- Здания -->
            <g v-for="building in scaledBuildings" :key="'building-' + building.id">
              <rect 
                :x="building.scaledX" 
                :y="building.scaledY" 
                :width="building.scaledWidth" 
                :height="building.scaledHeight"
                :class="['building-rect', { 
                  'highlighted': building.highlighted, 
                  'pulse': building.highlighted
                }]"
                :fill="getBuildingColor(building.type, 0.7)"
                :stroke="getBuildingColor(building.type)"
                @click="openBuildingModal(building)"
                rx="4"
              />
              
              <!-- Белый фон для названия здания (относительные размеры) -->
              <rect 
                :x="building.scaledX + building.scaledWidth/2 - building.scaledWidth * 0.2" 
                :y="building.scaledY + building.scaledHeight/2 - building.scaledHeight * 0.15" 
                :width="building.scaledWidth * 0.4" 
                :height="building.scaledHeight * 0.3"
                rx="4"
                fill="#b3d996"
                opacity="0.7"
                radius="30"
              />
              
              <!-- Название здания -->
              <text 
                :x="building.scaledX + building.scaledWidth/2" 
                :y="building.scaledY + building.scaledHeight/2 + 2" 
                text-anchor="middle"
                dominant-baseline="middle"
                :font-size="Math.max(6, Math.min(12, building.scaledWidth * 0.1))"
                fill="#48682f"
                font-weight="600"
                class="building-label"
              >
                {{ building.name }}
              </text>
            </g>


          <!-- Памятники (круги) -->
            <g v-for="landmark in scaledLandmarks" :key="'landmark-' + landmark.id">
              <circle
                :cx="landmark.scaledX"
                :cy="landmark.scaledY"
                :r="landmark.scaledRadius"
                :class="['landmark-circle', { 
                  'highlighted': landmark.highlighted, 
                  'pulse': landmark.highlighted
                }]"
                :fill="getLandmarkColor(landmark.type, 0.7)"
                :stroke="getLandmarkColor(landmark.type)"
                @click="openLandmarkModal(landmark)"
              />
              
              <!-- Белый фон для названия памятника (относительные размеры) -->
              <rect 
                :x="landmark.scaledX - landmark.scaledRadius * 0.8" 
                :y="landmark.scaledY - landmark.scaledRadius - landmark.scaledRadius * 0.5" 
                :width="landmark.scaledRadius * 1.6" 
                :height="landmark.scaledRadius * 0.5"
                rx="3"
                fill="white"
                opacity="0.9"
              />
              
              <!-- Название памятника -->
              <text 
                :x="landmark.scaledX" 
                :y="landmark.scaledY - landmark.scaledRadius - landmark.scaledRadius * 0.25" 
                text-anchor="middle"
                dominant-baseline="middle"
                :font-size="Math.max(8, Math.min(12, landmark.scaledRadius * 0.3))"
                fill="#2d3748"
                font-weight="600"
                class="landmark-label"
              >
                {{ landmark.name }}
              </text>
            </g>
        </svg>
      </div>
    </div>

    <!-- Модальное окно для здания -->
    <transition name="modal">
      <div class="modal-overlay" v-if="showBuildingModal" @click.self="closeModal">
        <div class="modal-container glassmorphism">
          <div class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </div>
          <div class="modal-header">
            <h2>{{ currentBuilding.name }}</h2>
            <div class="building-meta">
              <span class="meta-item">
                <i class="fas fa-building"></i> Тип: {{ getBuildingTypeName(currentBuilding.type) }}
              </span>
              <span class="meta-item" v-if="currentBuilding.corpus">
                <i class="fas fa-hashtag"></i> Корпус: {{ currentBuilding.corpus }}
              </span>
            </div>
          </div>
          
          <div class="modal-content">
            <div class="description-section" v-if="currentBuilding.description">
              <h3 class="section-title">
                <i class="fas fa-align-left"></i> Описание
              </h3>
              <p class="description-text">{{ currentBuilding.description }}</p>
            </div>

            <div class="gallery-section" v-if="currentImages.length">
              <h3 class="section-title">
                <i class="fas fa-images"></i> Фотографии
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
              <i class="fas fa-image"></i> Фотографии отсутствуют
            </p>

            <!-- Расписание для спортивного зала -->
            <div class="schedule-section" v-if="currentBuilding.type === 'sport' && sportSchedule.length">
              <h3 class="section-title">
                <i class="fas fa-calendar-alt"></i> Расписание занятий
              </h3>
              <div class="day-selector">
                <div class="select-wrapper">
                  <i class="fas fa-calendar-day"></i>
                  <select v-model="selectedDay" @change="filterSportSchedule" class="day-select">
                    <option v-for="day in days" :key="day" :value="day">
                      {{ day }}
                    </option>
                  </select>
                </div>
              </div>
              
              <div class="schedule-table-container">
                <table class="schedule-table">
                  <thead>
                    <tr>
                      <th>Время</th>
                      <th>Вид спорта</th>
                      <th>Тренер</th>
                      <th>Группа</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="item in filteredSportSchedule" :key="item.id">
                      <td class="time-cell">{{ item.time_start }} - {{ item.time_over }}</td>
                      <td>{{ item.sport_type }}</td>
                      <td class="teacher-cell">{{ item.coach }}</td>
                      <td class="groups-cell">{{ item.group_name }}</td>
                    </tr>
                  </tbody>
                </table>
                <p v-if="!filteredSportSchedule.length" class="empty-message">
                  <i class="fas fa-calendar-times"></i> Занятий в этот день нет
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно для памятника -->
    <transition name="modal">
      <div class="modal-overlay" v-if="showLandmarkModal" @click.self="closeModal">
        <div class="modal-container glassmorphism">
          <div class="close-btn" @click="closeModal">
            <i class="fas fa-times"></i>
          </div>
          <div class="modal-header">
            <h2>{{ currentLandmark.name }}</h2>
            <div class="landmark-meta">
              <span class="meta-item">
                <i class="fas fa-monument"></i> Тип: {{ getLandmarkTypeName(currentLandmark.type) }}
              </span>
              <span class="meta-item" v-if="currentLandmark.year">
                <i class="fas fa-calendar"></i> Год установки: {{ currentLandmark.year }}
              </span>
            </div>
          </div>
          
          <div class="modal-content">
            <div class="description-section" v-if="currentLandmark.description">
              <h3 class="section-title">
                <i class="fas fa-align-left"></i> Описание
              </h3>
              <p class="description-text">{{ currentLandmark.description }}</p>
            </div>

            <div class="gallery-section" v-if="currentImages.length">
              <h3 class="section-title">
                <i class="fas fa-images"></i> Фотографии
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
              <i class="fas fa-image"></i> Фотографии отсутствуют
            </p>
          </div>
        </div>
      </div>
    </transition>

    <transition name="fade">
      <div class="fullscreen-overlay" v-if="showFullscreen" @click="closeFullscreen">
        <div class="close-btn" @click="closeFullscreen">
          <i class="fas fa-times"></i>
        </div>
        <img :src="fullscreenImage" alt="Фото объекта" class="fullscreen-image" />
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import panzoom from 'panzoom';
import '@fortawesome/fontawesome-free/css/all.css'

export default {
  name: 'UniversityMapView',
  setup() {
    const router = useRouter();
    
    // Состояние приложения
    const buildings = ref([]);
    const landmarks = ref([]);
    const sportSchedule = ref([]);
    const currentBuilding = ref({});
    const currentLandmark = ref({});
    const currentImages = ref([]);
    const fullscreenImage = ref('');
    const searchHistory = ref([]);
    const highlightedBuildings = ref(new Set());
    const highlightedLandmarks = ref(new Set());
    
    // Поиск и фильтры
    const activePanel = ref(null);
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const buildingSearch = ref('');
    const landmarkSearch = ref('');
    const selectedDay = ref('Понедельник');
    const selectedFilters = ref([]);
    const mapContent = ref(null);
    const svgElement = ref(null);
    let panzoomInstance = null;
    let swiperInstance = null;
    
    // UI состояния
    const showBuildingModal = ref(false);
    const showLandmarkModal = ref(false);
    const showFullscreen = ref(false);
    const mapLoaded = ref(false);
    
    // Таймеры для debounce
    let searchBuildingTimeout = null;
    let searchLandmarkTimeout = null;
    
    // Константы
    const days = [
      'Понедельник', 'Вторник', 'Среда', 
      'Четверг', 'Пятница', 'Суббота', 'Воскресеньe'
    ];

    const buildingFilters = [
      { value: 'academic', label: 'Учебный корпус', icon: 'fa-school' },
      { value: 'dormitory', label: 'Общежитие', icon: 'fa-bed' },
      { value: 'sport', label: 'Спортивный зал', icon: 'fa-running' },
      { value: 'cafe', label: 'Столовая', icon: 'fa-utensils' },
      { value: 'admin', label: 'Администрация', icon: 'fa-user-tie' }
    ];

    const landmarkFilters = [
      { value: 'monument', label: 'Памятник', icon: 'fa-monument' },
      { value: 'sculpture', label: 'Скульптура', icon: 'fa-monument' },
      { value: 'fountain', label: 'Фонтан', icon: 'fa-fountain' },
      { value: 'garden', label: 'Сад', icon: 'fa-tree' }
    ];

    // Цвета для типов зданий
    const buildingColors = {
      academic: '#4361ee',
      dormitory: '#f72585',
      sport: '#4cc9f0',
      cafe: '#f94144',
      admin: '#7209b7',
      other: '#43aa8b'
    };

    // Цвета для типов памятников
    const landmarkColors = {
      monument: '#f8961e',
      sculpture: '#577590',
      fountain: '#4cc9f0',
      garden: '#43aa8b',
      other: '#a4ca32'
    };

    // Методы
    const togglePanel = (panel) => {
      if (activePanel.value === panel) {
        activePanel.value = null;
      } else {
        activePanel.value = panel;
      }
    };

    const getBuildingTypeName = (type) => {
      const types = {
        'academic': 'Учебный корпус',
        'dormitory': 'Общежитие',
        'sport': 'Спортивный зал',
        'cafe': 'Столовая',
        'admin': 'Административное здание',
        'other': 'Другое'
      };
      return types[type] || type;
    };

    const getLandmarkTypeName = (type) => {
      const types = {
        'monument': 'Памятник',
        'sculpture': 'Скульптура',
        'fountain': 'Фонтан',
        'garden': 'Сад',
        'other': 'Другое'
      };
      return types[type] || type;
    };

    const getBuildingColor = (type, opacity = 1) => {
      const colors = {
        academic: `rgba(67, 97, 238, ${opacity})`,
        dormitory: `rgba(247, 37, 133, ${opacity})`,
        sport: `rgba(76, 201, 240, ${opacity})`,
        cafe: `rgba(249, 65, 68, ${opacity})`,
        admin: `rgba(114, 9, 183, ${opacity})`,
        other: `rgba(67, 170, 139, ${opacity})`
      };
      return colors[type] || colors.other;
    };

    const scaledBuildings = computed(() => {
      return filteredBuildings.value.map(building => ({
        ...building,
        scaledX: building.x,
        scaledY: building.y,
        scaledWidth: building.width,
        scaledHeight: building.height,
        highlighted: shouldHighlightBuilding(building)
      }));
    });

    const scaledLandmarks = computed(() => {
      return filteredLandmarks.value.map(landmark => ({
        ...landmark,
        scaledX: landmark.x,
        scaledY: landmark.y,
        scaledRadius: landmark.radius || 15,
        highlighted: shouldHighlightLandmark(landmark)
      }));
    });

    const getLandmarkColor = (type, opacity = 1) => {
      const colors = {
        monument: `rgba(248, 150, 30, ${opacity})`,
        sculpture: `rgba(87, 117, 144, ${opacity})`,
        fountain: `rgba(76, 201, 240, ${opacity})`,
        garden: `rgba(67, 170, 139, ${opacity})`,
        other: `rgba(164, 202, 50, ${opacity})`
      };
      return colors[type] || colors.other;
    };

    const getHistoryIcon = (type) => {
      const icons = {
        'Здание': 'fa-building',
        'Памятник': 'fa-monument'
      };
      return icons[type] || 'fa-search';
    };

    const fetchBuildings = async () => {
      try {
        const response = await axios.get('/api/territory/buildings');
        buildings.value = response.data;
        console.log('Загружены здания:', buildings.value);
        console.log('Масштабированные координаты:', scaledBuildings.value);
      } catch (error) {
        console.error('Ошибка загрузки зданий:', error);
      }
    };

    const fetchLandmarks = async () => {
      try {
        const response = await axios.get('/api/territory/landmarks');
        landmarks.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки памятников:', error);
      }
    };

    const fetchSportSchedule = async (buildingId) => {
      try {
        const response = await axios.get(`/api/sport-schedule/${buildingId}`);
        sportSchedule.value = response.data;
      } catch (error) {
        console.error('Ошибка загрузки расписания:', error);
        sportSchedule.value = [];
      }
    };

    const shouldHighlightBuilding = (building) => {
      if (buildingSearch.value.length >= 3 && 
          building.name.toLowerCase().includes(buildingSearch.value.toLowerCase())) {
        return true;
      }
      
      return highlightedBuildings.value.has(building.id);
    };

    const shouldHighlightLandmark = (landmark) => {
      if (landmarkSearch.value.length >= 3 && 
          landmark.name.toLowerCase().includes(landmarkSearch.value.toLowerCase())) {
        return true;
      }
      
      return highlightedLandmarks.value.has(landmark.id);
    };

    const searchBuildings = async () => {
      if (buildingSearch.value.trim().length < 3) {
        highlightedBuildings.value.clear();
        return;
      }

      try {
        const response = await axios.get(`/api/territory/buildings/search?query=${encodeURIComponent(buildingSearch.value.trim())}`);
        const foundBuildings = response.data;
        
        highlightedBuildings.value.clear();
        
        foundBuildings.forEach(building => {
          highlightedBuildings.value.add(building.id);
        });
        
        addToSearchHistory(buildingSearch.value, 'Здание');
      } catch (error) {
        console.error('Ошибка поиска по зданиям:', error);
        highlightedBuildings.value.clear();
      }
    };

    const searchLandmarks = async () => {
      if (landmarkSearch.value.trim().length < 3) {
        highlightedLandmarks.value.clear();
        return;
      }

      try {
        const response = await axios.get(`/api/territory/landmarks/search?query=${encodeURIComponent(landmarkSearch.value.trim())}`);
        const foundLandmarks = response.data;
        
        highlightedLandmarks.value.clear();
        
        foundLandmarks.forEach(landmark => {
          highlightedLandmarks.value.add(landmark.id);
        });
        
        addToSearchHistory(landmarkSearch.value, 'Памятник');
      } catch (error) {
        console.error('Ошибка поиска по памятникам:', error);
        highlightedLandmarks.value.clear();
      }
    };

    const debounceSearchBuildings = () => {
      clearTimeout(searchBuildingTimeout);
      searchBuildingTimeout = setTimeout(searchBuildings, 500);
    };

    const debounceSearchLandmarks = () => {
      clearTimeout(searchLandmarkTimeout);
      searchLandmarkTimeout = setTimeout(searchLandmarks, 500);
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
        case 'Здание':
          buildingSearch.value = item.term;
          searchBuildings();
          break;
        case 'Памятник':
          landmarkSearch.value = item.term;
          searchLandmarks();
          break;
      }
    };

    const openBuildingModal = async (building) => {
      currentBuilding.value = building;
      
      // Загрузка изображений здания
      if (building.images && Array.isArray(building.images)) {
        currentImages.value = building.images.filter(img => img);
      } else {
        currentImages.value = [];
      }
      
      // Загрузка расписания для спортивного зала
      if (building.type === 'sport') {
        await fetchSportSchedule(building.id);
      }
      
      showBuildingModal.value = true;
      
      nextTick(() => {
        if (swiperInstance) swiperInstance.destroy();
        if (currentImages.value.length > 0) {
          swiperInstance = new Swiper('.swiper-container', {
            modules: [Navigation],
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            slidesPerView: Math.min(3, currentImages.value.length),
            spaceBetween: 10
          });
        }
      });
    };

    const openLandmarkModal = async (landmark) => {
      currentLandmark.value = landmark;
      
      // Загрузка изображений памятника
      if (landmark.images && Array.isArray(landmark.images)) {
        currentImages.value = landmark.images.filter(img => img);
      } else {
        currentImages.value = [];
      }
      
      showLandmarkModal.value = true;
      
      nextTick(() => {
        if (swiperInstance) swiperInstance.destroy();
        if (currentImages.value.length > 0) {
          swiperInstance = new Swiper('.swiper-container', {
            modules: [Navigation],
            navigation: {
              nextEl: '.swiper-button-next',
              prevEl: '.swiper-button-prev',
            },
            slidesPerView: Math.min(3, currentImages.value.length),
            spaceBetween: 10
          });
        }
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
      showBuildingModal.value = false;
      showLandmarkModal.value = false;
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

    const goToBuildingsMap = () => {
      router.push('/buildings');
    };

    const filterSportSchedule = () => {
      // Фильтрация происходит в computed свойстве
    };

    const checkImage = (url) => {
      return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve(true);
        img.onerror = () => resolve(false);
        img.src = url;
      });
    };

    // Вычисляемые свойства
    const mapImage = computed(() => {
      return 'img/maps/university-territory.png';
    });

    const filteredBuildings = computed(() => {
      return buildings.value
        .filter(building => 
          (selectedFilters.value.length === 0 || selectedFilters.value.includes(building.type))
        )
        .map(building => ({
          ...building,
          highlighted: shouldHighlightBuilding(building)
        }));
    });

    const filteredLandmarks = computed(() => {
      return landmarks.value
        .filter(landmark => 
          (selectedFilters.value.length === 0 || selectedFilters.value.includes(landmark.type))
        )
        .map(landmark => ({
          ...landmark,
          highlighted: shouldHighlightLandmark(landmark)
        }));
    });

    const filteredSportSchedule = computed(() => {
      if (!sportSchedule.value.length) return [];
      return sportSchedule.value.filter(item => 
        item.day_week === selectedDay.value
      );
    });

    onMounted(async () => {
      await fetchBuildings();
      await fetchLandmarks();
      
      if (mapContent.value) {
        panzoomInstance = panzoom(mapContent.value, {
          maxZoom: 4,
          minZoom: 0.38,
          initialZoom: 0.6,
          bounds: true,
          boundsPadding: 0.6
        });
        
        setTimeout(() => {
          panzoomInstance.moveTo(271.9, 15.8333);
          panzoomInstance.zoomAbs(271.9, 15.8333, 0.5);
        }, 0);
      }
      
      mapLoaded.value = await checkImage(mapImage.value);
    });

    return {
      buildings,
      landmarks,
      sportSchedule,
      currentBuilding,
      currentLandmark,
      currentImages,
      fullscreenImage,
      searchHistory,
      mapLoaded,
      user,
      
      showBuildingModal,
      showLandmarkModal,
      showFullscreen,
      activePanel,
      
      buildingSearch,
      landmarkSearch,
      selectedDay,
      selectedFilters,
      
      days,
      buildingFilters,
      landmarkFilters,
      
      mapImage,
      filteredBuildings,
      filteredLandmarks,
      filteredSportSchedule,
      
      mapContent,
      svgElement,

      scaledBuildings,
      scaledLandmarks,
      
      // Методы
      openBuildingModal,
      openLandmarkModal,
      closeModal,
      openFullscreen,
      closeFullscreen,
      zoomIn,
      zoomOut,
      togglePanel,
      goToAuth,
      logout,
      debounceSearchBuildings,
      debounceSearchLandmarks,
      applySearchHistory,
      getBuildingTypeName,
      getLandmarkTypeName,
      getBuildingColor,
      getLandmarkColor,
      getHistoryIcon,
      goToBuildingsMap,
      filterSportSchedule
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
  background-color: #f8fafc;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
}

/* Эффект стекла */
.glassmorphism {
  background: rgba(255, 255, 255, 0.92);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.1);
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
  letter-spacing: -0.5px;
  line-height: normal;
}

.logo i {
  font-size: 1.8rem;
  color: #4361ee;
  transition: transform 0.3s ease;
}

.logo:hover i {
  transform: rotate(15deg);
}

/* Стили для вкладок */
.nav-buttons {
  display: flex;
  gap: 4px;
  background: rgba(237, 242, 247, 0.7);
  padding: 4px;
  border-radius: 12px;
  box-shadow: inset 0 1px 2px rgba(0,0,0,0.05);
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
  background: rgba(255, 255, 255, 0.6);
}

.nav-btn.active {
  background: white;
  color: #4361ee;
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.15);
}

.nav-btn.active::before {
  background: linear-gradient(90deg, #4361ee, #4cc9f0);
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
  color: #2d3748;
  transition: all 0.2s ease;
}

.profile-link:hover {
  color: #4361ee;
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
  border: 2px solid white;
}

.logo_img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid white;
}

.username {
  font-weight: 500;
  font-size: 0.95rem;
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

.guest-actions {
  display: flex;
  align-items: center;
}

.gradient-btn {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
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
  box-shadow: 4px 0 15px rgba(0, 0, 0, 0.05);
}

.panel-title {
  font-size: 1.3rem;
  margin-bottom: 24px;
  color: #2d3748;
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
  background: linear-gradient(90deg, #4361ee, #4cc9f0);
  border-radius: 3px;
}

.panel-title i {
  color: #4361ee;
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
  color: #718096;
  font-size: 0.95rem;
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.search-input:focus {
  outline: none;
  border-color: #4361ee;
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
  background-color: white;
  display: flex;
  align-items: center;
  gap: 14px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-left: 3px solid transparent;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.03);
}

.history-item:hover {
  background-color: #f8fafc;
  border-left-color: #4361ee;
  transform: translateX(4px);
}

.history-item i {
  font-size: 1.1rem;
  color: #4361ee;
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
  color: #2d3748;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.history-type {
  font-size: 0.8rem;
  color: #718096;
  margin-top: 2px;
}

.history-time {
  font-size: 0.75rem;
  color: #a0aec0;
  margin-top: 4px;
}

.empty-message {
  color: #718096;
  text-align: center;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255,255,255,0.7);
  border-radius: 8px;
  margin-top: 10px;
}

.empty-message i {
  color: #cbd5e0;
  font-size: 1.5rem;
}

.description-section {
  margin-bottom: 20px;
}

.description-text {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 15px;
  border-radius: 8px;
  line-height: 1.6;
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
  background-color: white;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  color: #4a5568;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.95rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.corpus-btn:hover {
  background-color: #f8fafc;
  border-color: #cbd5e0;
}

.corpus-btn.active {
  background-color: #4361ee;
  color: white;
  border-color: #4361ee;
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
  background-color: white;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.03);
}

.filter-option i {
  color: #718096;
  font-size: 0.95rem;
  width: 20px;
  text-align: center;
}

.filter-option:hover i {
  color: #4361ee;
}

.filter-option:hover {
  background-color: #f8fafc;
}

.filter-checkbox {
  appearance: none;
  width: 18px;
  height: 18px;
  border: 2px solid #cbd5e0;
  border-radius: 4px;
  cursor: pointer;
  position: relative;
  transition: all 0.2s ease;
  flex-shrink: 0;
}

.filter-checkbox:checked {
  background-color: #4361ee;
  border-color: #4361ee;
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
  color: #4a5568;
  transition: color 0.2s ease;
}

.filter-option:hover .filter-label {
  color: #4361ee;
}

/* Контейнер карты */
.map-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-color: #ddedc3;
}

.map-content {
  width: 2000px;
  height: 2000px;
  background-size: contain;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
}

#territory-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 10;
}

.building-rect {
  fill: rgba(255, 255, 255, 0.1);
  stroke-width: 0;
  stroke: #b3d996;
  cursor: pointer;
  transition: all 0.5s ease;
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
}

.building-rect:hover {
  fill: rgba(255, 255, 255, 0.3);
  stroke-width: 2;
  filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2));
}

.building-rect.highlighted {
  fill: rgba(221 237 195 0.4);
  stroke-width: 3;
  animation: pulse 2s infinite;
}

.landmark-circle {
  fill: rgba(255, 255, 255, 0.7);
  stroke-width: 2;
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
}

.landmark-circle:hover {
  fill: rgba(255, 255, 255, 0.9);
  stroke-width: 2.5;
}

.landmark-circle.highlighted {
  fill: rgba(221 237 195 0.4);
  stroke-width: 3;
  animation: pulse 2s infinite;
}

.building-label,
.landmark-label {
  pointer-events: none;
  user-select: none;
  font-family: 'Inter', sans-serif;
  text-shadow: 0 0 2px white, 0 0 2px white, 0 0 2px white;
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
  background-color: white;
  color: #4361ee;
  border: none;
  border-radius: 50%;
  font-size: 1rem;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.control-btn:hover {
  background-color: #4361ee;
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
  background: rgba(255, 255, 255, 0.85);
  backdrop-filter: blur(4px);
  -webkit-backdrop-filter: blur(4px);
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
}

.floor-btn {
  padding: 8px 16px;
  background-color: rgba(255, 255, 255, 0.8);
  color: #4a5568;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-size: 0.9rem;
  font-weight: 500;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.floor-btn:hover {
  background-color: rgba(255, 255, 255, 0.9);
}

.floor-btn.active {
  background-color: #4361ee;
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
  background-color: rgba(237, 242, 247, 0.9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  z-index: 10;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
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
  border-bottom: 1px solid #e2e8f0;
}

.modal-header h2 {
  margin: 0;
  color: #2d3748;
  font-size: 1.8rem;
  font-weight: 700;
}

.building-meta,
.landmark-meta {
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
  color: #718096;
  background-color: #f8fafc;
  padding: 6px 12px;
  border-radius: 6px;
}

.meta-item i {
  color: #4361ee;
  font-size: 0.9rem;
}

.modal-content {
  display: flex;
  flex-direction: column;
  gap: 28px;
}

.section-title {
  font-size: 1.3rem;
  color: #2d3748;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
}

.section-title i {
  color: #4361ee;
  font-size: 1.1rem;
}

.description-text {
  background-color: rgba(255, 255, 255, 0.7);
  padding: 15px;
  border-radius: 8px;
  line-height: 1.6;
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
  background-color: #f8fafc;
  transition: all 0.3s ease;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.gallery-image {
  width: 100%;
  height: 300px;
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
  color: #4361ee;
  background-color: rgba(255, 255, 255, 0.95);
  width: 36px;
  height: 36px;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.swiper-button-next::after,
.swiper-button-prev::after {
  font-size: 1rem;
}

.swiper-button-next:hover,
.swiper-button-prev:hover {
  background-color: white;
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
  color: #718096;
  font-size: 0.95rem;
  z-index: 1;
}

.day-select {
  width: 100%;
  padding: 12px 16px 12px 42px;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  font-size: 0.95rem;
  appearance: none;
  background-color: white;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05);
}

.day-select:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.schedule-table {
  width: 100%;
  border-collapse: separate;
  border-spacing: 0;
  background-color: white;
  border-radius: 8px;
  overflow: hidden;
  min-width: 600px;
}

.schedule-table th {
  background-color: #f7fafc;
  color: #4a5568;
  font-weight: 600;
  padding: 14px 16px;
  text-align: left;
  border-bottom: 1px solid #e2e8f0;
  white-space: nowrap;
}

.schedule-table td {
  padding: 12px 16px;
  border-bottom: 1px solid #e2e8f0;
  color: #4a5568;
  vertical-align: top;
}

.schedule-table tr:last-child td {
  border-bottom: none;
}

.schedule-table tr:hover td {
  background-color: #f8fafc;
}


.time-cell {
  font-weight: 500;
  color: #2d3748;
  white-space: nowrap;
}

.teacher-cell {
  min-width: 180px;
}

.groups-cell {
  min-width: 150px;
}

.empty-message {
  color: #718096;
  text-align: center;
  padding: 24px 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 8px;
  background-color: rgba(255,255,255,0.7);
  border-radius: 8px;
  margin-top: 10px;
}

.empty-message i {
  color: #cbd5e0;
  font-size: 1.5rem;
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

/* Адаптивность */
@media (max-width: 768px) {
  .map-content {
    width: 1200px;
    height: 900px;
  }
  
  .building-label {
    font-size: 10px;
  }
  
  .landmark-label {
    font-size: 8px;
  }
}

</style>