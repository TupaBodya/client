<template>
  <div class="mobile-container" :class="theme">
    <!-- Верхняя панель навигации -->
    <nav class="mobile-nav" :class="{ 'scrolled': isScrolled }">
      <div class="nav-header">
        <button class="burger-menu" @click="toggleMobileMenu" :class="{ active: showMobileMenu }">
          <div class="burger-line"></div>
          <div class="burger-line"></div>
          <div class="burger-line"></div>
        </button>
        
        <div class="logo" @click="goToBuildingsMap">
          <img src="/img/logo.jpg" class="logo_img" alt="Логотип">
          <span class="logo-text">Карта БГИТУ</span>
        </div>
        
        <div class="nav-actions">
          <button class="theme-toggle" @click="toggleTheme" :title="themeButtonText">
            <i class="fas" :class="themeIcon"></i>
          </button>
          <div class="user-avatar-mini" @click="toggleUserMenu" :class="{ 'has-notification': hasNotifications }">
            <img :src="user?.avatar || '/img/default-avatar.png'" alt="Профиль">
          </div>
        </div>
      </div>
    </nav>

    <!-- Основное меню -->
    <transition name="menu-slide">
      <div class="mobile-menu-overlay" v-if="showMobileMenu" @click="closeMobileMenu">
        <div class="mobile-menu" @click.stop>
          <div class="menu-header">
            <div class="menu-user" v-if="user" @click="goToProfile">
              <img :src="user.avatar || '/img/default-avatar.png'" class="user-avatar-large">
              <div class="user-info">
                <span class="username">{{ user.username }}</span>
                <span class="user-status">Онлайн</span>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>
            <div class="menu-user" v-else @click="goToAuth">
              <div class="user-avatar-large guest">
                <i class="fas fa-user"></i>
              </div>
              <div class="user-info">
                <span class="username">Гость</span>
                <span class="user-status">Войдите в аккаунт</span>
              </div>
              <i class="fas fa-chevron-right"></i>
            </div>
          </div>

          <div class="menu-content">
            <!-- Основная навигация -->
            <div class="menu-section">
              <div class="menu-grid">
                <button @click="handleMenuNavigation('search')" class="menu-item" :class="{ active: activePanel === 'search' }">
                  <div class="menu-icon">
                    <i class="fas fa-search"></i>
                  </div>
                  <span class="menu-label">Поиск</span>
                </button>
                
                <button @click="handleMenuNavigation('history')" class="menu-item" :class="{ active: activePanel === 'history' }">
                  <div class="menu-icon">
                    <i class="fas fa-history"></i>
                  </div>
                  <span class="menu-label">История</span>
                </button>
                
                <button @click="handleMenuNavigation('filters')" class="menu-item" :class="{ active: activePanel === 'filters' }">
                  <div class="menu-icon">
                    <i class="fas fa-filter"></i>
                  </div>
                  <span class="menu-label">Фильтры</span>
                </button>
                
                <button @click="goToBuildingsMap" class="menu-item">
                  <div class="menu-icon">
                    <i class="fas fa-university"></i>
                  </div>
                  <span class="menu-label">Корпус</span>
                </button>
              </div>
            </div>

            <!-- Типы объектов -->
            <div class="menu-section">
              <h3 class="section-title">Типы объектов</h3>
              <div class="filter-chips">
                <button 
                  v-for="filter in buildingFilters" 
                  :key="filter.value"
                  :class="{ 'active': selectedFilters.includes(filter.value) }"
                  @click="toggleFilter(filter.value)"
                  class="filter-chip"
                >
                  <i class="fas" :class="filter.icon"></i>
                  <span>{{ filter.label }}</span>
                </button>
              </div>
            </div>
          </div>

          <div class="menu-footer">
            <button v-if="user" @click="logout" class="menu-footer-btn">
              <i class="fas fa-sign-out-alt"></i>
              <span>Выйти</span>
            </button>
            <button v-else @click="goToAuth" class="menu-footer-btn primary">
              <i class="fas fa-sign-in-alt"></i>
              <span>Войти</span>
            </button>
          </div>
        </div>
      </div>
    </transition>

    <!-- Плавающие кнопки управления -->
    <div class="floating-controls">
      <transition-group name="floating-btn">
        <button v-if="showQuickActions" class="floating-btn action-btn" @click="togglePanel('search')" key="search">
          <i class="fas fa-search"></i>
          <span class="btn-tooltip">Поиск</span>
        </button>
        <button v-if="showQuickActions" class="floating-btn action-btn" @click="togglePanel('filters')" key="filters">
          <i class="fas fa-filter"></i>
          <span class="btn-tooltip">Фильтры</span>
        </button>
        <button v-if="showQuickActions" class="floating-btn action-btn" @click="resetView" key="reset">
          <i class="fas fa-crosshairs"></i>
          <span class="btn-tooltip">Центр</span>
        </button>
        <button v-if="showQuickActions" class="floating-btn action-btn" @click="zoomInCenter" key="zoom-in">
          <i class="fas fa-search-plus"></i>
          <span class="btn-tooltip">Приблизить</span>
        </button>
      </transition-group>
      
      <button class="floating-btn main-btn" @click="toggleQuickActions" :class="{ active: showQuickActions }">
        <i class="fas" :class="showQuickActions ? 'fa-times' : 'fa-plus'"></i>
      </button>
    </div>

    <!-- Контейнер карты -->
    <div class="map-view-container" :class="{ 'panel-open': activePanel, 'menu-open': showMobileMenu }">
      <div class="map-container" 
           @touchstart="onTouchStart" 
           @touchmove="onTouchMove" 
           @touchend="onTouchEnd"
           @touchcancel="onTouchEnd"
           @dblclick="onDoubleTap">
        <div class="map-content" ref="mapContent" :style="{ 
          backgroundImage: `url(${mapImage})`,
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
        }">
          <!-- SVG для территории -->
          <svg class="territory-svg" :width="svgWidth" :height="svgHeight" ref="svgElement">
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
              
              <!-- Фон для названия здания -->
              <rect 
                :x="building.scaledX + building.scaledWidth/2 - building.scaledWidth * 0.2" 
                :y="building.scaledY + building.scaledHeight/2 - building.scaledHeight * 0.15" 
                :width="building.scaledWidth * 0.4" 
                :height="building.scaledHeight * 0.3"
                rx="4"
                fill="#b3d996"
                opacity="0.7"
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

            <!-- Памятники -->
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
              
              <!-- Фон для названия памятника -->
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

        <!-- Индикатор масштаба -->
        <div class="map-status">
          <div class="scale-indicator">
            Масштаб: {{ Math.round(scale * 100) }}%
          </div>
        </div>
      </div>

      <!-- Кнопки действий на карте -->
      <div class="map-actions-top-right">
        <button class="map-action-btn" @click="zoomInCenter" title="Приблизить">
          <i class="fas fa-search-plus"></i>
        </button>
        <button class="map-action-btn" @click="zoomOutCenter" title="Отдалить">
          <i class="fas fa-search-minus"></i>
        </button>
        <button class="map-action-btn" @click="resetView" title="Центрировать">
          <i class="fas fa-crosshairs"></i>
        </button>
      </div>
    </div>

    <!-- Нижние панели -->
    <transition name="slide-up">
      <div class="bottom-panel" v-if="activePanel" @click.stop>
        <div class="panel-handle" @touchstart="startPanelDrag" @mousedown="startPanelDrag">
          <div class="handle-bar"></div>
        </div>
        
        <div class="panel-header">
          <h3 class="panel-title">
            <i class="fas" :class="getPanelIcon(activePanel)"></i>
            {{ getPanelTitle(activePanel) }}
          </h3>
          <button class="close-panel" @click="closePanel">
            <i class="fas fa-times"></i>
          </button>
        </div>

        <div class="panel-content" ref="panelContent">
          <!-- Панель поиска -->
          <div v-if="activePanel === 'search'" class="search-panel">
            <div class="search-tabs">
              <button 
                v-for="tab in searchTabs" 
                :key="tab.id"
                :class="{ 'active': activeSearchTab === tab.id }"
                @click="activeSearchTab = tab.id"
                class="search-tab"
              >
                <i class="fas" :class="tab.icon"></i>
                <span>{{ tab.label }}</span>
              </button>
            </div>

            <div class="search-content">
              <div class="search-group">
                <div class="input-with-icon">
                  <i class="fas" :class="getSearchTabIcon(activeSearchTab)"></i>
                  <input 
                    type="text" 
                    :value="getSearchValue(activeSearchTab)"
                    @input="onSearchInput(activeSearchTab, $event)"
                    :placeholder="getSearchPlaceholder(activeSearchTab)"
                    class="search-input"
                    ref="searchInput"
                  />
                  <button v-if="getSearchValue(activeSearchTab)" @click="clearSearch(activeSearchTab)" class="clear-btn">
                    <i class="fas fa-times"></i>
                  </button>
                </div>
              </div>

              <!-- Результаты поиска -->
              <div class="search-results" v-if="getSearchValue(activeSearchTab) && searchResults.length">
                <div class="results-header">
                  <span>Найдено: {{ searchResults.length }}</span>
                </div>
                <div class="results-list">
                  <div 
                    v-for="result in searchResults" 
                    :key="result.id"
                    @click="handleSearchResultClick(result)"
                    class="result-item"
                  >
                    <i class="fas" :class="getResultIcon(result)"></i>
                    <div class="result-content">
                      <span class="result-title">{{ result.title }}</span>
                      <span class="result-subtitle">{{ result.subtitle }}</span>
                    </div>
                    <i class="fas fa-chevron-right"></i>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Панель истории -->
          <div v-if="activePanel === 'history'" class="history-panel">
            <div class="history-header">
              <span>История поиска</span>
              <button v-if="searchHistory.length" @click="clearHistory" class="clear-history">
                <i class="fas fa-trash"></i>
              </button>
            </div>
            <div class="history-list">
              <div 
                v-for="(item, index) in searchHistory" 
                :key="index"
                @click="applySearchHistory(item)"
                class="history-item"
              >
                <div class="history-icon">
                  <i class="fas" :class="getHistoryIcon(item.type)"></i>
                </div>
                <div class="history-content">
                  <span class="history-term">{{ item.term }}</span>
                  <span class="history-type">{{ getHistoryTypeName(item.type) }}</span>
                </div>
                <span class="history-time">{{ formatTime(item.timestamp) }}</span>
              </div>
            </div>
            <div v-if="!searchHistory.length" class="empty-state">
              <i class="fas fa-history"></i>
              <p>История поиска пуста</p>
              <span>Здесь появятся ваши недавние поиски</span>
            </div>
          </div>

          <!-- Панель фильтров -->
          <div v-if="activePanel === 'filters'" class="filters-panel">
            <div class="filter-section">
              <h4>Типы зданий</h4>
              <div class="filter-chips">
                <button 
                  v-for="filter in buildingFilters" 
                  :key="filter.value"
                  :class="{ 'active': selectedFilters.includes(filter.value) }"
                  @click="toggleFilter(filter.value)"
                  class="filter-chip"
                >
                  <i class="fas" :class="filter.icon"></i>
                  <span>{{ filter.label }}</span>
                </button>
              </div>
            </div>

            <div class="filter-section">
              <h4>Типы памятников</h4>
              <div class="filter-chips">
                <button 
                  v-for="filter in landmarkFilters" 
                  :key="filter.value"
                  :class="{ 'active': selectedFilters.includes(filter.value) }"
                  @click="toggleFilter(filter.value)"
                  class="filter-chip"
                >
                  <i class="fas" :class="filter.icon"></i>
                  <span>{{ filter.label }}</span>
                </button>
              </div>
            </div>

            <div class="filter-actions">
              <button @click="resetFilters" class="filter-btn secondary">
                Сбросить
              </button>
              <button @click="applyFilters" class="filter-btn primary">
                Применить
              </button>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно здания -->
    <transition name="modal-slide">
      <div class="modal-mobile" v-if="showBuildingModal">
        <div class="modal-content">
          <div class="modal-header">
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h2>{{ currentBuilding.name }}</h2>
            <button class="modal-action" @click="toggleFavorite(currentBuilding)" 
                    :class="{ active: isFavorite(currentBuilding) }">
              <i class="fas fa-heart"></i>
            </button>
          </div>

          <div class="modal-body" ref="modalBody">
            <div class="building-meta">
              <div class="meta-item">
                <i class="fas fa-building"></i>
                <span>Тип: {{ getBuildingTypeName(currentBuilding.type) }}</span>
              </div>
              <div class="meta-item" v-if="currentBuilding.corpus">
                <i class="fas fa-hashtag"></i>
                <span>Корпус: {{ currentBuilding.corpus }}</span>
              </div>
            </div>

            <!-- Навигация по контенту -->
            <div class="modal-tabs">
              <button v-for="tab in modalTabs" 
                      :key="tab.id"
                      :class="{ active: activeModalTab === tab.id }"
                      @click="activeModalTab = tab.id"
                      class="modal-tab">
                {{ tab.label }}
              </button>
            </div>

            <!-- Описание -->
            <div class="tab-content" v-if="activeModalTab === 'info'">
              <div class="description-section" v-if="currentBuilding.description">
                <h3>Описание</h3>
                <p>{{ currentBuilding.description }}</p>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-align-left"></i>
                <p>Описание отсутствует</p>
              </div>
            </div>

            <!-- Галерея -->
            <div class="tab-content" v-if="activeModalTab === 'gallery'">
              <div class="gallery-section" v-if="currentImages.length">
                <div class="gallery-grid">
                  <div 
                    v-for="(image, index) in currentImages" 
                    :key="index"
                    class="gallery-item"
                    @click="openFullscreen(image)"
                  >
                    <img :src="image" alt="Здание" />
                    <div class="gallery-overlay">
                      <i class="fas fa-expand"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-image"></i>
                <p>Фотографии отсутствуют</p>
              </div>
            </div>

            <!-- Расписание -->
            <div class="tab-content" v-if="activeModalTab === 'schedule' && currentBuilding.type === 'sport'">
              <div class="schedule-section">
                <div class="schedule-controls">
                  <select v-model="selectedDay" class="day-select">
                    <option v-for="day in days" :key="day" :value="day">
                      {{ day }}
                    </option>
                  </select>
                </div>
                <div class="schedule-list">
                  <div 
                    v-for="item in filteredSportSchedule" 
                    :key="item.id"
                    class="schedule-item"
                  >
                    <div class="schedule-time">
                      {{ item.time_start }} - {{ item.time_over }}
                    </div>
                    <div class="schedule-details">
                      <strong>{{ item.sport_type }}</strong>
                      <p>{{ item.coach }}</p>
                      <div class="schedule-groups">
                        <span class="group-tag">{{ item.group_name }}</span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!filteredSportSchedule.length" class="empty-state">
                  <i class="fas fa-calendar-times"></i>
                  <p>Занятий в этот день нет</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Модальное окно памятника -->
    <transition name="modal-slide">
      <div class="modal-mobile" v-if="showLandmarkModal">
        <div class="modal-content">
          <div class="modal-header">
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h2>{{ currentLandmark.name }}</h2>
            <button class="modal-action" @click="toggleFavorite(currentLandmark)" 
                    :class="{ active: isFavorite(currentLandmark) }">
              <i class="fas fa-heart"></i>
            </button>
          </div>

          <div class="modal-body" ref="modalBody">
            <div class="landmark-meta">
              <div class="meta-item">
                <i class="fas fa-monument"></i>
                <span>Тип: {{ getLandmarkTypeName(currentLandmark.type) }}</span>
              </div>
              <div class="meta-item" v-if="currentLandmark.year">
                <i class="fas fa-calendar"></i>
                <span>Год установки: {{ currentLandmark.year }}</span>
              </div>
            </div>

            <!-- Навигация по контенту -->
            <div class="modal-tabs">
              <button v-for="tab in modalTabs" 
                      :key="tab.id"
                      :class="{ active: activeModalTab === tab.id }"
                      @click="activeModalTab = tab.id"
                      class="modal-tab">
                {{ tab.label }}
              </button>
            </div>

            <!-- Описание -->
            <div class="tab-content" v-if="activeModalTab === 'info'">
              <div class="description-section" v-if="currentLandmark.description">
                <h3>Описание</h3>
                <p>{{ currentLandmark.description }}</p>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-align-left"></i>
                <p>Описание отсутствует</p>
              </div>
            </div>

            <!-- Галерея -->
            <div class="tab-content" v-if="activeModalTab === 'gallery'">
              <div class="gallery-section" v-if="currentImages.length">
                <div class="gallery-grid">
                  <div 
                    v-for="(image, index) in currentImages" 
                    :key="index"
                    class="gallery-item"
                    @click="openFullscreen(image)"
                  >
                    <img :src="image" alt="Памятник" />
                    <div class="gallery-overlay">
                      <i class="fas fa-expand"></i>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-image"></i>
                <p>Фотографии отсутствуют</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </transition>

    <!-- Полноэкранный просмотр -->
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
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import Swiper from 'swiper';
import { Navigation } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';

export default {
  name: 'MobileUniversityMapView',
  // В компоненте MobileUniversityMapView заменяем логику управления картой

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
    
    // UI состояния
    const showBuildingModal = ref(false);
    const showLandmarkModal = ref(false);
    const showFullscreen = ref(false);
    const showMobileMenu = ref(false);
    const activePanel = ref(null);
    const activeSearchTab = ref('building');
    const activeModalTab = ref('info');
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const isScrolled = ref(false);
    const showQuickActions = ref(false);
    const hasNotifications = ref(false);
    
    // Тема
    const theme = ref(localStorage.getItem('mobile-theme') || 'light');
    const themeIcon = computed(() => theme.value === 'light' ? 'fa-moon' : 'fa-sun');
    const themeButtonText = computed(() => theme.value === 'light' ? 'Тёмная тема' : 'Светлая тема');

    // Поиск и фильтры
    const buildingSearch = ref('');
    const landmarkSearch = ref('');
    const selectedDay = ref('Понедельник');
    const selectedFilters = ref([]);
    
    // 2D карта состояния
    const mapContent = ref(null);
    const svgElement = ref(null);
    const scale = ref(0.2);
    const position = ref({ x: 0, y: 0 });
    const svgWidth = ref(2000);
    const svgHeight = ref(2000);

    // Система пресетов масштабирования (адаптированная для территории)
    const zoomPresets = ref([
        { scale: 0.20, position: { x: -3905, y: -3040 } },
        { scale: 0.25, position: { x: -3102, y: -2430} },
        { scale: 0.30, position: { x: -2550, y: -2000 } },
        { scale: 0.35, position: { x: -2220, y: -1670 } },
        { scale: 0.40, position: { x: -1950, y: -1450 } },
        { scale: 0.45, position: { x: -1732, y: -1360 } },
        { scale: 0.50, position: { x: -1570, y: -1320 } },
        { scale: 0.55, position: { x: -1480, y: -1170 } },
        { scale: 0.60, position: { x: -1330, y: -1020 } },
    ]);

    // Настройки масштабирования
    const zoomConfig = ref({
        min: 0.2,
        max: 0.6,
        step: 0.05,
        initial: 0.2
    });
    
    // Жесты для масштабирования
    const touchStart = ref({ 
        x: 0, 
        y: 0,
        distance: 0,
        scale: 1,
        positionX: 0,
        positionY: 0
    });
    const isDragging = ref(false);
    const isPinching = ref(false);
    const lastTouch = ref({ x: 0, y: 0 });
    
    // Таймеры для debounce
    let searchBuildingTimeout = null;
    let searchLandmarkTimeout = null;
    
    // === ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ МАСШТАБИРОВАНИЯ (ПЕРЕНЕСЕНЫ) ===
    const getPositionForScale = (targetScale) => {
        const presets = [...zoomPresets.value].sort((a, b) => a.scale - b.scale);
        
        const exactMatch = presets.find(p => Math.abs(p.scale - targetScale) < 0.001);
        if (exactMatch) return { ...exactMatch.position };
        
        let lower = null;
        let upper = null;
        
        for (let i = 0; i < presets.length - 1; i++) {
            if (targetScale >= presets[i].scale && targetScale <= presets[i + 1].scale) {
                lower = presets[i];
                upper = presets[i + 1];
                break;
            }
        }
        
        if (!lower || !upper) {
            if (targetScale <= presets[0].scale) return { ...presets[0].position };
            if (targetScale >= presets[presets.length - 1].scale) return { ...presets[presets.length - 1].position };
        }
        
        const ratio = (targetScale - lower.scale) / (upper.scale - lower.scale);
        
        return {
            x: lower.position.x + (upper.position.x - lower.position.x) * ratio,
            y: lower.position.y + (upper.position.y - lower.position.y) * ratio
        };
    };

    const getCurrentZoomPreset = () => {
        const currentScale = scale.value;
        const closest = zoomPresets.value.reduce((prev, curr) => {
            return (Math.abs(curr.scale - currentScale) < Math.abs(prev.scale - currentScale)) ? curr : prev;
        });
        
        return closest;
    };

    const updateMapStatus = () => {
        const preset = getCurrentZoomPreset();
        const percentage = Math.round(scale.value * 100);
        console.log(`Масштаб: ${percentage}%`);
    };

    // === ОСНОВНЫЕ МЕТОДЫ ДЛЯ ЦЕНТРИРОВАНИЯ И МАСШТАБИРОВАНИЯ (ПЕРЕНЕСЕНЫ) ===
    const centerMap = () => {
        const currentPreset = getPositionForScale(scale.value);
        position.value = { ...currentPreset };
        updateMapStatus();
    };

    const centerToPoint = (pointX, pointY) => {
        const currentPreset = getPositionForScale(scale.value);
        position.value = { ...currentPreset };
        updateMapStatus();
    };

    const zoomInCenter = () => {
        const newScale = Math.min(zoomConfig.value.max, scale.value + zoomConfig.value.step);
        if (newScale !== scale.value) {
            const newPosition = getPositionForScale(newScale);
            scale.value = newScale;
            position.value = newPosition;
            updateMapStatus();
        }
    };

    const zoomOutCenter = () => {
        const newScale = Math.max(zoomConfig.value.min, scale.value - zoomConfig.value.step);
        if (newScale !== scale.value) {
            const newPosition = getPositionForScale(newScale);
            scale.value = newScale;
            position.value = newPosition;
            updateMapStatus();
        }
    };

    const resetView = () => {
        const initialPreset = zoomPresets.value[0];
        scale.value = initialPreset.scale;
        position.value = { ...initialPreset.position };
        updateMapStatus();
    };

    const zoomToPoint = (pointX, pointY, targetScale = null) => {
        const targetZoom = targetScale || zoomConfig.value.max;
        const clampedZoom = Math.max(zoomConfig.value.min, Math.min(zoomConfig.value.max, targetZoom));
        
        const startScale = scale.value;
        const startPosition = { ...position.value };
        const targetPosition = getPositionForScale(clampedZoom);
        
        const duration = 300;
        const startTime = performance.now();
        
        const animateZoom = (currentTime) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            
            scale.value = startScale + (clampedZoom - startScale) * easeProgress;
            
            const currentPosition = getPositionForScale(scale.value);
            position.value = currentPosition;
            
            if (progress < 1) {
                requestAnimationFrame(animateZoom);
            } else {
                scale.value = clampedZoom;
                position.value = targetPosition;
                updateMapStatus();
            }
        };
        
        requestAnimationFrame(animateZoom);
    };

    const setZoom = (newScale) => {
        const clampedScale = Math.max(zoomConfig.value.min, Math.min(zoomConfig.value.max, newScale));
        const newPosition = getPositionForScale(clampedScale);
        scale.value = clampedScale;
        position.value = newPosition;
        updateMapStatus();
    };

    // === ОБРАБОТЧИКИ ЖЕСТОВ (ПЕРЕНЕСЕНЫ) ===
    const onTouchStart = (event) => {
        if (event.touches.length === 1) {
            const touch = event.touches[0];
            touchStart.value = { 
                x: touch.clientX, 
                y: touch.clientY,
                distance: 0,
                scale: scale.value,
                positionX: position.value.x,
                positionY: position.value.y
            };
            lastTouch.value = { x: touch.clientX, y: touch.clientY };
            isDragging.value = true;
            isPinching.value = false;
        } else if (event.touches.length === 2) {
            isPinching.value = true;
            isDragging.value = false;
            
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            const distance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            
            touchStart.value = {
                x: 0,
                y: 0,
                distance: distance,
                scale: scale.value,
                positionX: position.value.x,
                positionY: position.value.y
            };
            
            event.preventDefault();
        }
    };

    const onTouchMove = (event) => {
        if (isPinching.value && event.touches.length === 2) {
            const touch1 = event.touches[0];
            const touch2 = event.touches[1];
            
            const currentDistance = Math.hypot(
                touch1.clientX - touch2.clientX,
                touch1.clientY - touch2.clientY
            );
            
            if (touchStart.value.distance > 0) {
                const scaleFactor = currentDistance / touchStart.value.distance;
                const rawNewScale = touchStart.value.scale * scaleFactor;
                const newScale = Math.max(zoomConfig.value.min, Math.min(zoomConfig.value.max, rawNewScale));
                
                const newPosition = getPositionForScale(newScale);
                
                scale.value = newScale;
                position.value = newPosition;
                
                updateMapStatus();
            }
            
            event.preventDefault();
        } else if (isDragging.value && event.touches.length === 1) {
            const touch = event.touches[0];
            const deltaX = (touch.clientX - lastTouch.value.x) * 1.5;
            const deltaY = (touch.clientY - lastTouch.value.y) * 1.5;
            
            position.value.x += deltaX;
            position.value.y += deltaY;
            
            lastTouch.value = { x: touch.clientX, y: touch.clientY };
            event.preventDefault();
        }
    };

    const onTouchEnd = (event) => {
        isDragging.value = false;
        isPinching.value = false;
        touchStart.value.distance = 0;
    };

    // Двойной тап для приближения
    const onDoubleTap = (event) => {
        const rect = mapContent.value?.getBoundingClientRect();
        if (!rect) return;
        
        const pointX = (event.clientX - rect.left - position.value.x) / scale.value;
        const pointY = (event.clientY - rect.top - position.value.y) / scale.value;
        
        if (scale.value > zoomConfig.value.initial) {
            resetView();
        } else {
            zoomToPoint(pointX, pointY, zoomConfig.value.initial * 2);
        }
    };

    // Обработчик изменения размера окна
    const onWindowResize = () => {
        nextTick(() => {
            centerMap();
        });
    };

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

    const searchTabs = [
        { id: 'building', label: 'Здания', icon: 'fa-building' },
        { id: 'landmark', label: 'Памятники', icon: 'fa-monument' }
    ];

    const modalTabs = [
        { id: 'info', label: 'Информация' },
        { id: 'gallery', label: 'Фотографии' },
        { id: 'schedule', label: 'Расписание' }
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

    // Computed properties
    const mapImage = computed(() => {
        return 'img/maps/university-territory.png';
    });

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

    const searchResults = computed(() => {
        const searchValue = getSearchValue(activeSearchTab.value);
        if (!searchValue) return [];

        switch (activeSearchTab.value) {
            case 'building':
                return buildings.value
                    .filter(building => building.name.toLowerCase().includes(searchValue.toLowerCase()))
                    .map(building => ({
                        id: building.id,
                        title: building.name,
                        subtitle: getBuildingTypeName(building.type),
                        type: 'building',
                        data: building
                    }));
            case 'landmark':
                return landmarks.value
                    .filter(landmark => landmark.name.toLowerCase().includes(searchValue.toLowerCase()))
                    .map(landmark => ({
                        id: landmark.id,
                        title: landmark.name,
                        subtitle: getLandmarkTypeName(landmark.type),
                        type: 'landmark',
                        data: landmark
                    }));
            default:
                return [];
        }
    });

    // Methods
    const toggleTheme = () => {
        theme.value = theme.value === 'light' ? 'dark' : 'light';
        localStorage.setItem('mobile-theme', theme.value);
    };

    const toggleMobileMenu = () => {
        showMobileMenu.value = !showMobileMenu.value;
    };

    const closeMobileMenu = () => {
        showMobileMenu.value = false;
    };

    const togglePanel = (panel) => {
        if (activePanel.value === panel) {
            activePanel.value = null;
        } else {
            activePanel.value = panel;
            closeMobileMenu();
        }
    };

    const closePanel = () => {
        activePanel.value = null;
    };

    const toggleQuickActions = () => {
        showQuickActions.value = !showQuickActions.value;
    };

    const getPanelIcon = (panel) => {
        const icons = {
            'search': 'fa-search',
            'history': 'fa-history',
            'filters': 'fa-filter'
        };
        return icons[panel] || 'fa-cog';
    };

    const getPanelTitle = (panel) => {
        const titles = {
            'search': 'Поиск',
            'history': 'История',
            'filters': 'Фильтры'
        };
        return titles[panel] || 'Панель';
    };

    const getSearchTabIcon = (tab) => {
        const tabConfig = searchTabs.find(t => t.id === tab);
        return tabConfig ? tabConfig.icon : 'fa-search';
    };

    const getSearchValue = (tab) => {
        switch (tab) {
            case 'building': return buildingSearch.value;
            case 'landmark': return landmarkSearch.value;
            default: return '';
        }
    };

    const getSearchPlaceholder = (tab) => {
        switch (tab) {
            case 'building': return 'Название здания...';
            case 'landmark': return 'Название памятника...';
            default: return 'Поиск...';
        }
    };

    const onSearchInput = (tab, event) => {
        const value = event.target.value;
        switch (tab) {
            case 'building':
                buildingSearch.value = value;
                debounceSearchBuildings();
                break;
            case 'landmark':
                landmarkSearch.value = value;
                debounceSearchLandmarks();
                break;
        }
    };

    const clearSearch = (tab) => {
        switch (tab) {
            case 'building':
                buildingSearch.value = '';
                break;
            case 'landmark':
                landmarkSearch.value = '';
                break;
        }
        highlightedBuildings.value.clear();
        highlightedLandmarks.value.clear();
    };

    const getResultIcon = (result) => {
        const icons = {
            'building': 'fa-building',
            'landmark': 'fa-monument'
        };
        return icons[result.type] || 'fa-search';
    };

    const handleSearchResultClick = (result) => {
        switch (result.type) {
            case 'building':
                centerToBuilding(result.data);
                closePanel();
                break;
            case 'landmark':
                centerToLandmark(result.data);
                closePanel();
                break;
        }
    };

    const getHistoryIcon = (type) => {
        const icons = {
            'Здание': 'fa-building',
            'Памятник': 'fa-monument'
        };
        return icons[type] || 'fa-search';
    };

    const getHistoryTypeName = (type) => {
        const names = {
            'Здание': 'Здание',
            'Памятник': 'Памятник'
        };
        return names[type] || type;
    };

    const formatTime = (timestamp) => {
        return new Date(timestamp).toLocaleTimeString('ru-RU', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
    };

    const clearHistory = () => {
        searchHistory.value = [];
    };

    const toggleFilter = (filter) => {
        const index = selectedFilters.value.indexOf(filter);
        if (index > -1) {
            selectedFilters.value.splice(index, 1);
        } else {
            selectedFilters.value.push(filter);
        }
    };

    const resetFilters = () => {
        selectedFilters.value = [];
    };

    const applyFilters = () => {
        closePanel();
    };

    const handleMenuNavigation = (panel) => {
        togglePanel(panel);
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

    // === АДАПТИРОВАННЫЕ МЕТОДЫ ДЛЯ ТЕРРИТОРИИ ===
    const centerToBuilding = (building) => {
        const buildingCenterX = building.x + building.width / 2;
        const buildingCenterY = building.y + building.height / 2;
        zoomToPoint(buildingCenterX, buildingCenterY, zoomConfig.value.initial);
    };

    const centerToLandmark = (landmark) => {
        zoomToPoint(landmark.x, landmark.y, zoomConfig.value.initial);
    };

    // API методы
    const fetchBuildings = async () => {
        try {
            const response = await axios.get('/api/territory/buildings');
            buildings.value = response.data;
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
        closePanel();
    };

    const openBuildingModal = async (building) => {
        currentBuilding.value = building;
        
        if (building.images && Array.isArray(building.images)) {
            currentImages.value = building.images.filter(img => img);
        } else {
            currentImages.value = [];
        }
        
        if (building.type === 'sport') {
            await fetchSportSchedule(building.id);
        }
        
        showBuildingModal.value = true;
        activeModalTab.value = 'info';
    };

    const openLandmarkModal = async (landmark) => {
        currentLandmark.value = landmark;
        
        if (landmark.images && Array.isArray(landmark.images)) {
            currentImages.value = landmark.images.filter(img => img);
        } else {
            currentImages.value = [];
        }
        
        showLandmarkModal.value = true;
        activeModalTab.value = 'info';
    };

    const closeModal = () => {
        showBuildingModal.value = false;
        showLandmarkModal.value = false;
    };

    const openFullscreen = (image) => {
        fullscreenImage.value = image;
        showFullscreen.value = true;
    };

    const closeFullscreen = () => {
        showFullscreen.value = false;
    };

    const goToAuth = () => {
        router.push('/auth');
    };

    const logout = () => {
        localStorage.removeItem('user');
        user.value = null;
        router.push('/auth');
    };

    const goToProfile = () => {
        router.push('/profile');
        closeMobileMenu();
    };

    const toggleUserMenu = () => {
        goToProfile();
    };

    const goToBuildingsMap = () => {
        router.push('/buildings');
    };

    const isFavorite = (item) => {
        return false;
    };

    const toggleFavorite = (item) => {
        // Заглушка для функционала избранного
    };

    // Panel drag methods
    const startPanelDrag = (event) => {
        // Заглушка для перетаскивания панели
    };

    // Инициализация
    onMounted(async () => {
        await fetchBuildings();
        await fetchLandmarks();
        
        resetView();
        
        window.addEventListener('scroll', () => {
            isScrolled.value = window.scrollY > 10;
        });

        window.addEventListener('resize', onWindowResize);
    });

    onUnmounted(() => {
        window.removeEventListener('resize', onWindowResize);
    });

    return {
        // Реактивные данные
        buildings,
        landmarks,
        currentBuilding,
        currentLandmark,
        currentImages,
        fullscreenImage,
        searchHistory,
        user,
        showBuildingModal,
        showLandmarkModal,
        showFullscreen,
        showMobileMenu,
        activePanel,
        activeSearchTab,
        activeModalTab,
        buildingSearch,
        landmarkSearch,
        selectedDay,
        selectedFilters,
        isScrolled,
        showQuickActions,
        hasNotifications,
        scale,
        position,
        svgWidth,
        svgHeight,
        theme,
        themeIcon,
        themeButtonText,
        
        // Константы
        days,
        buildingFilters,
        landmarkFilters,
        searchTabs,
        modalTabs,
        
        // Computed
        mapImage,
        scaledBuildings,
        scaledLandmarks,
        filteredBuildings,
        filteredLandmarks,
        filteredSportSchedule,
        searchResults,
        
        // Refs
        mapContent,
        svgElement,

        // Методы
        toggleMobileMenu,
        closeMobileMenu,
        togglePanel,
        closePanel,
        toggleQuickActions,
        toggleTheme,
        getPanelIcon,
        getPanelTitle,
        getSearchTabIcon,
        getSearchValue,
        getSearchPlaceholder,
        onSearchInput,
        clearSearch,
        getResultIcon,
        handleSearchResultClick,
        getHistoryIcon,
        getHistoryTypeName,
        formatTime,
        clearHistory,
        applySearchHistory,
        toggleFilter,
        resetFilters,
        applyFilters,
        handleMenuNavigation,
        getBuildingTypeName,
        getLandmarkTypeName,
        getBuildingColor,
        getLandmarkColor,
        zoomInCenter,
        zoomOutCenter,
        resetView,
        centerToBuilding,
        centerToLandmark,
        onTouchStart,
        onTouchMove,
        onTouchEnd,
        onDoubleTap,
        startPanelDrag,
        openBuildingModal,
        openLandmarkModal,
        closeModal,
        openFullscreen,
        closeFullscreen,
        goToAuth,
        logout,
        goToProfile,
        toggleUserMenu,
        goToBuildingsMap,
        isFavorite,
        toggleFavorite
    };
}
};
</script>

<style scoped>
/* CSS переменные для тем */
.mobile-container.light {
  --bg-primary: #ffffff;
  --bg-secondary: #f8fafc;
  --bg-tertiary: #f1f5f9;
  --text-primary: #1a202c;
  --text-secondary: #4a5568;
  --text-tertiary: #718096;
  --accent-primary: #4361ee;
  --accent-secondary: #3a0ca3;
  --border-light: rgba(0, 0, 0, 0.08);
  --border-medium: rgba(0, 0, 0, 0.12);
  --shadow-light: rgba(0, 0, 0, 0.05);
  --shadow-medium: rgba(0, 0, 0, 0.1);
  --card-bg: rgba(255, 255, 255, 0.95);
  --menu-bg: #ffffff;
  --map-bg: #f8fafc;
}

.mobile-container.dark {
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
  --card-bg: rgba(26, 32, 44, 0.95);
  --menu-bg: #1a202c;
  --map-bg: #0f1419;
}

.mobile-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
  transition: background-color 0.3s ease, color 0.3s ease;
}

/* Навигационная панель */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: var(--card-bg);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid var(--border-light);
  z-index: 1000;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.mobile-nav.scrolled {
  background: var(--card-bg);
  box-shadow: 0 2px 20px var(--shadow-medium);
}

.nav-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  gap: 16px;
}

.nav-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.theme-toggle {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
}

.theme-toggle:active {
  background: var(--bg-secondary);
  transform: scale(0.95);
}

.burger-menu {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 28px;
  height: 28px;
  background: none;
  border: none;
  padding: 0;
  transition: transform 0.3s ease;
  position: relative;
}

.burger-line {
  display: block;
  height: 3px;
  width: 100%;
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.burger-menu.active .burger-line:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
  background: var(--accent-primary);
}

.burger-menu.active .burger-line:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.burger-menu.active .burger-line:nth-child(3) {
  transform: rotate(-45deg) translate(8px, -8px);
  background: var(--accent-primary);
}

.burger-menu:active {
  transform: scale(0.9);
}

.logo {
  display: flex;
  align-items: center;
  gap: 10px;
  font-weight: 700;
  font-size: 17px;
  color: var(--text-primary);
  cursor: pointer;
  flex: 1;
  justify-content: center;
}

.logo-text {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.logo_img {
  width: 34px;
  height: 34px;
  border-radius: 8px;
  object-fit: cover;
}

.user-avatar-mini {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  border: 2px solid transparent;
  transition: all 0.2s ease;
  position: relative;
}

.user-avatar-mini.has-notification::after {
  content: '';
  position: absolute;
  top: 2px;
  right: 2px;
  width: 8px;
  height: 8px;
  background: #f94144;
  border-radius: 50%;
  border: 2px solid var(--card-bg);
}

.user-avatar-mini:active {
  transform: scale(0.95);
}

.user-avatar-mini img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Основное меню */
.mobile-menu-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 2000;
  backdrop-filter: blur(4px);
}

.mobile-menu {
  position: absolute;
  top: 0;
  left: 0;
  bottom: 0;
  width: 85%;
  max-width: 320px;
  background: var(--menu-bg);
  color: var(--text-primary);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

.menu-slide-enter-active,
.menu-slide-leave-active {
  transition: all 0.3s ease;
}

.menu-slide-enter-from {
  transform: translateX(-100%);
}

.menu-slide-leave-to {
  transform: translateX(-100%);
}

.menu-header {
  padding: 20px;
  background: linear-gradient(135deg, var(--accent-secondary), var(--bg-tertiary));
  color: var(--text-primary);
}

.menu-user {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.user-avatar-large {
  width: 60px;
  height: 60px;
  border-radius: 20px;
  object-fit: cover;
  border: 3px solid var(--border-light);
}

.user-avatar-large.guest {
  background: var(--border-light);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: var(--text-primary);
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.user-status {
  display: block;
  font-size: 14px;
  opacity: 0.8;
  color: var(--text-primary);
}

.menu-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.menu-section {
  margin-bottom: 32px;
}

.section-title {
  font-size: 14px;
  color: var(--text-tertiary);
  margin-bottom: 16px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 600;
}

.menu-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.menu-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: var(--bg-tertiary);
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
  color: var(--text-primary);
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-item.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.menu-item.active .menu-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: var(--bg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-primary);
  font-size: 18px;
}

.menu-label {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
  color: var(--text-primary);
}

.filter-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.filter-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 10px 16px;
  border: 1px solid var(--accent-primary);
  border-radius: 20px;
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-chip.active {
  background: var(--accent-primary);
  color: white;
  border-color: var(--accent-primary);
}

.filter-chip i {
  font-size: 12px;
}

.menu-footer {
  padding: 20px;
  border-top: 1px solid var(--border-light);
}

.menu-footer-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  width: 100%;
  padding: 16px;
  border: none;
  border-radius: 16px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
  background: var(--bg-tertiary);
  color: var(--text-primary);
}

.menu-footer-btn:active {
  transform: scale(0.98);
}

.menu-footer-btn.primary {
  background: var(--accent-primary);
  color: white;
}

/* Плавающие кнопки */
.floating-controls {
  position: fixed;
  bottom: 100px;
  right: 20px;
  z-index: 100;
  display: flex;
  flex-direction: column-reverse;
  align-items: center;
  gap: 12px;
}

.floating-btn {
  width: 50px;
  height: 50px;
  border-radius: 28px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px var(--shadow-medium);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.main-btn {
  background: var(--accent-primary);
  color: white;
  font-size: 20px;
  z-index: 10;
}

.main-btn.active {
  transform: rotate(135deg);
  background: #6e0f10b3;
}

.action-btn {
  background: var(--card-bg);
  color: var(--accent-primary);
  font-size: 18px;
}

.action-btn.active {
  background: var(--accent-primary);
  color: white;
}

.floating-btn-enter-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.floating-btn-enter-to {
  transform: scale(1) translateY(0);
  opacity: 1;
}

.floating-btn-leave-active {
  transition: all 0.2s cubic-bezier(0.4, 0, 1, 1);
}

.floating-btn-leave-to {
  transform: scale(0) translateY(20px);
  opacity: 0;
}

.btn-tooltip {
  position: absolute;
  right: 100%;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(0, 0, 0, 0.8);
  color: white;
  padding: 8px 12px;
  border-radius: 8px;
  font-size: 12px;
  white-space: nowrap;
  margin-right: 12px;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease;
}

.action-btn:hover .btn-tooltip {
  opacity: 1;
}

/* Контейнер карты */
.map-view-container {
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  bottom: 0;
  transition: all 0.3s ease;
}

.map-view-container.panel-open {
  bottom: 300px;
}

.map-view-container.menu-open {
  transform: translateX(85%);
  border-radius: 20px;
  overflow: hidden;
  box-shadow: -10px 0 30px var(--shadow-medium);
}

.map-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-color: #ddedc3;
  width: 100%;
  height: 100%;
}

.map-content {
  width: 2000px;
  height: 2000px;
  background-size: cover;
  position: relative;
  transition: background-image 0.5s ease-in-out;
}

.territory-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

.building-rect {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  pointer-events: all;
}

.building-rect:hover {
  stroke-width: 1.5;
}

.building-rect.highlighted {
  stroke-width: 3;
  fill: rgba(221, 237, 195, 0.4);
  animation: pulse 2s infinite;
}

.landmark-circle {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  pointer-events: all;
}

.landmark-circle:hover {
  stroke-width: 2.5;
}

.landmark-circle.highlighted {
  stroke-width: 3;
  fill: rgba(221, 237, 195, 0.4);
  animation: pulse 2s infinite;
}

.building-label,
.landmark-label {
  pointer-events: none;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

/* Кнопки действий на карте */
.map-actions-top-right {
  position: absolute;
  top: 80px;
  right: 12px;
  z-index: 50;
  display: flex;
  flex-direction: column;
  gap: 8px;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 10px;
  box-shadow: 0 8px 32px var(--shadow-medium);
  border: 1px solid var(--border-light);
  background: var(--card-bg);
}

.map-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid var(--bg-secondary);
  background-color: var(--bg-tertiary);
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.map-action-btn:active {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  border-color: var(--accent-primary);
  transform: scale(0.9);
}

.map-status {
  position: absolute;
  top: 12px;
  left: 12px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 8px 12px;
  border-radius: 12px;
  font-size: 12px;
  backdrop-filter: blur(10px);
  z-index: 50;
}

/* Нижние панели */
.bottom-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--menu-bg);
  border-radius: 24px 24px 0 0;
  box-shadow: 0 0px 15px var(--accent-secondary);
  z-index: 200;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
  touch-action: pan-y;
}

.panel-handle {
  padding: 12px;
  display: flex;
  justify-content: center;
  cursor: grab;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: var(--accent-secondary);
  border-radius: 2px;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 20px;
  border-bottom: 1px solid var(--border-light);
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: var(--accent-primary);
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title i {
  color: var(--accent-primary);
}

.close-panel {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: none;
  background: var(--bg-tertiary);
  color: var(--text-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.close-panel:active {
  transform: scale(0.95);
  color: var(--accent-primary);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Стили для панели поиска */
.search-tabs {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.search-tab {
  flex: 1;
  padding: 10px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-tertiary);
  font-size: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.search-tab.active {
  background: var(--accent-primary);
  color: white;
  box-shadow: 0 2px 4px var(--shadow-light);
}

.input-with-icon {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-icon i {
  position: absolute;
  left: 16px;
  color: var(--accent-primary);
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid var(--accent-primary);
  border-radius: 12px;
  font-size: 16px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.clear-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: var(--text-tertiary);
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.clear-btn:active {
  background: var(--bg-secondary);
}

.search-results {
  margin-top: 20px;
}

.results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 12px;
}

.results-header span {
  font-size: 14px;
  color: var(--text-tertiary);
  font-weight: 500;
}

.results-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.result-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-item:active {
  background: var(--bg-secondary);
  transform: scale(0.98);
}

.result-item i:first-child {
  color: var(--accent-primary);
  width: 16px;
}

.result-content {
  flex: 1;
}

.result-title {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.result-subtitle {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary);
}

/* Стили для истории */
.history-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
}

.clear-history {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.clear-history:active {
  background: var(--bg-secondary);
}

.history-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.history-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.history-item:active {
  background: var(--bg-secondary);
  transform: scale(0.98);
}

.history-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: var(--card-bg);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--accent-primary);
  font-size: 14px;
}

.history-content {
  flex: 1;
}

.history-term {
  display: block;
  font-weight: 500;
  color: var(--text-primary);
  margin-bottom: 2px;
}

.history-type {
  display: block;
  font-size: 12px;
  color: var(--text-tertiary);
}

.history-time {
  font-size: 11px;
  color: var(--text-tertiary);
}

/* Стили для фильтров */
.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  font-size: 16px;
  color: var(--text-tertiary);
  margin-bottom: 12px;
  font-weight: 600;
}

.filter-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.filter-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-btn:active {
  transform: scale(0.98);
}

.filter-btn.secondary {
  background: var(--bg-tertiary);
  color: var(--accent-primary);
}

.filter-btn.primary {
  background: var(--accent-primary);
  color: white;
}

/* Модальное окно */
.modal-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--bg-primary);
  z-index: 10000;
  overflow: hidden;
}

.modal-slide-enter-active,
.modal-slide-leave-active {
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
}

.modal-slide-enter-from {
  transform: translateX(100%);
}

.modal-slide-leave-to {
  transform: translateX(100%);
}

.modal-content {
  height: 100vh;
  display: flex;
  flex-direction: column;
}

.modal-header {
  position: sticky;
  top: 0;
  background: linear-gradient(135deg, var(--accent-secondary), var(--bg-tertiary));
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  z-index: 10;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
  color: var(--text-primary);
}

.modal-close:active {
  transform: scale(0.95);
}

.modal-header h2 {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--text-primary);
}

.modal-action {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background: var(--bg-tertiary);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--text-tertiary);
  transition: all 0.2s ease;
  cursor: pointer;
}

.modal-action.active {
  color: #f94144;
  background: var(--card-bg);
}

.modal-action:active {
  transform: scale(0.95);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
  background: var(--menu-bg);
}

.building-meta,
.landmark-meta {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 24px;
}

.meta-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--bg-tertiary);
  border-radius: 12px;
  color: var(--text-primary);
}

.meta-item i {
  color: var(--accent-primary);
  width: 16px;
}

.modal-tabs {
  display: flex;
  background: var(--bg-tertiary);
  border-radius: 12px;
  padding: 4px;
  margin-bottom: 20px;
}

.modal-tab {
  flex: 1;
  padding: 12px;
  border: none;
  background: transparent;
  border-radius: 8px;
  color: var(--text-tertiary);
  font-size: 11px;
  font-weight: 700;
  transition: all 0.2s ease;
  cursor: pointer;
}

.modal-tab.active {
  background: var(--bg-tertiary);
  color: var(--accent-primary);
  box-shadow: 0 2px 4px var(--shadow-light);
}

.tab-content {
  animation: fadeIn 0.3s ease;
  color: var(--text-secondary);
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}

/* Галерея */
.gallery-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.gallery-item {
  position: relative;
  border-radius: 12px;
  overflow: hidden;
  aspect-ratio: 4/3;
  cursor: pointer;
}

.gallery-item img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.gallery-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.3);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.2s ease;
}

.gallery-item:hover .gallery-overlay {
  opacity: 1;
}

.gallery-overlay i {
  color: white;
  font-size: 24px;
}

/* Расписание */
.schedule-controls {
  margin-bottom: 16px;
}

.day-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid var(--border-light);
  border-radius: 12px;
  background: var(--bg-tertiary);
  color: var(--text-primary);
  font-size: 16px;
  appearance: none;
}

.schedule-list {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.schedule-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: var(--bg-tertiary);
  border-radius: 12px;
}

.schedule-time {
  font-weight: 600;
  color: var(--accent-primary);
  min-width: 80px;
  font-size: 14px;
}

.schedule-details {
  flex: 1;
}

.schedule-details strong {
  display: block;
  margin-bottom: 4px;
  color: var(--text-primary);
}

.schedule-details p {
  margin: 0 0 8px 0;
  color: var(--text-secondary);
  font-size: 14px;
}

.schedule-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.group-tag {
  padding: 4px 8px;
  background: var(--bg-secondary);
  border-radius: 8px;
  font-size: 12px;
  color: var(--accent-primary);
  border: 1px solid var(--accent-primary);
}

.empty-state {
  text-align: center;
  padding: 120px 20px;
  color: var(--text-tertiary);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state i {
  font-size: 48px;
  color: var(--text-tertiary);
  margin-bottom: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: var(--text-secondary);
}

/* Полноэкранный просмотр */
.fullscreen-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: black;
  z-index: 100000;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-btn {
  position: absolute;
  top: 20px;
  right: 20px;
  width: 44px;
  height: 44px;
  border-radius: 22px;
  border: none;
  background: rgba(255, 255, 255, 0.2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  backdrop-filter: blur(10px);
  transition: all 0.2s ease;
  cursor: pointer;
  z-index: 10;
}

.close-btn:active {
  transform: scale(0.95);
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

/* Поддержка безопасных зон */
@supports(padding: max(0px)) {
  .mobile-nav {
    padding-left: max(16px, env(safe-area-inset-left));
    padding-right: max(16px, env(safe-area-inset-right));
    padding-top: env(safe-area-inset-top);
    height: calc(60px + env(safe-area-inset-top));
  }
  
  .map-view-container {
    top: calc(60px + env(safe-area-inset-top));
  }
  
  .floating-controls {
    bottom: max(32px, env(safe-area-inset-bottom) + 20px);
    right: max(20px, env(safe-area-inset-right) + 20px);
  }
  
  .bottom-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }
}

/* Улучшение touch-интерфейса */
button {
  min-height: 44px;
  min-width: 44px;
  -webkit-tap-highlight-color: transparent;
}
</style>