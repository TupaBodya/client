<template>
  <div class="mobile-container">
    <!-- Верхняя панель навигации -->
    <nav class="mobile-nav" :class="{ 'scrolled': isScrolled }">
      <div class="nav-header">
        <button class="burger-menu" @click="toggleMobileMenu" :class="{ active: showMobileMenu }">
          <div class="burger-line"></div>
          <div class="burger-line"></div>
          <div class="burger-line"></div>
        </button>
        
        <div class="logo" @click="goToUniversityMap">
          <img src="/img/logo.jpg" class="logo_img" alt="Логотип">
          <span class="logo-text">Карта БГИТУ</span>
        </div>
        
        <div class="nav-actions">
          <button class="nav-action-btn" @click="toggleViewMode" :title="viewModeText">
            <i class="fas" :class="viewModeIcon"></i>
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
                
                <button @click="goToUniversityMap" class="menu-item">
                  <div class="menu-icon">
                    <i class="fas fa-map-marked-alt"></i>
                  </div>
                  <span class="menu-label">Территория</span>
                </button>
              </div>
            </div>

            <!-- Управление картой -->
            <div class="menu-section">
              <h3 class="section-title">Вид карты</h3>
              <button @click="toggleViewMode" class="menu-btn large">
                <div class="btn-content">
                  <i class="fas" :class="viewModeIcon"></i>
                  <span>{{ viewModeText }}</span>
                </div>
                <div class="btn-badge" v-if="viewMode === '3d'">3D</div>
              </button>
            </div>

            <!-- Корпус и этаж -->
            <div class="menu-section">
              <h3 class="section-title">Расположение</h3>
              <div class="location-controls">
                <div class="location-group">
                  <label>Корпус</label>
                  <div class="chip-group">
                    <button 
                      v-for="corpus in corpuses" 
                      :key="corpus" 
                      :class="{ 'active': selectedCorpus === corpus }"
                      @click="selectCorpus(corpus)"
                      class="location-chip"
                    >
                      <i class="fas fa-building"></i>
                      {{ corpus }}
                    </button>
                  </div>
                </div>
                <div class="location-group">
                  <label>Этаж</label>
                  <div class="chip-group">
                    <button 
                      v-for="floor in floors" 
                      :key="floor" 
                      :class="{ 'active': selectedFloor === floor }"
                      @click="selectFloor(floor)"
                      class="location-chip"
                    >
                      <i class="fas fa-layer-group"></i>
                      {{ floor }}
                    </button>
                  </div>
                </div>
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
        <button v-if="showQuickActions && user" class="floating-btn action-btn" @click="toggleFavoriteMode" key="favorite"
                :class="{ active: favoriteMode }">
          <i class="fas fa-heart"></i>
          <span class="btn-tooltip">Избранное</span>
        </button>
      </transition-group>
      
      <button class="floating-btn main-btn" @click="toggleQuickActions" :class="{ active: showQuickActions }">
        <i class="fas" :class="showQuickActions ? 'fa-times' : 'fa-plus'"></i>
      </button>
    </div>

    <!-- Контейнер карты -->
    <div class="map-view-container" :class="{ 'panel-open': activePanel, 'menu-open': showMobileMenu }">
      <!-- 2D View -->
      <div class="map-container" v-if="viewMode === '2d'" 
           @touchstart="onTouchStart" 
           @touchmove="onTouchMove" 
           @touchend="onTouchEnd"
           @touchcancel="onTouchEnd"
           @dblclick="onDoubleTap">
        <div class="map-content" ref="mapContent" :style="{ 
          backgroundImage: `url(${currentMapImage})`,
          transform: `scale(${scale}) translate(${position.x}px, ${position.y}px)`
        }">
          <!-- SVG для аудиторий -->
          <svg class="audience-svg" :width="svgWidth" :height="svgHeight" ref="svgElement">
            <rect 
              v-for="audience in filteredAudiences" 
              :key="audience.id"
              :x="audience.x" 
              :y="audience.y" 
              :width="audience.width" 
              :height="audience.height"
              :class="['audience-rect', { 
                'highlighted': audience.highlighted, 
                'pulse': audience.highlighted,
                'favorite': isFavorite(audience),
                'search-result': isSearchResult(audience)
              }]"
              :fill="getAudienceColor(audience.audience_type, 0.05)"
              :stroke="getAudienceStrokeColor(audience)"
              stroke-width="2"
              @click="openModal(audience)"
              rx="2"
            />
            
            <text 
              v-for="audience in filteredAudiences" 
              :key="'text-' + audience.id"
              :x="audience.x + audience.width/2" 
              :y="audience.y + audience.height/2 + 2" 
              text-anchor="middle"
              dominant-baseline="middle"
              :fill="getAudienceStrokeColor(audience)"
              font-weight="900"
              font-size="14"
              class="audience-label"
              @click="openModal(audience)"
            >
              {{ audience.num_audiences }}
            </text>
          </svg>
        </div>

        <!-- Индикатор масштаба и положения -->
        <div class="map-status">
          <div class="scale-indicator">
            Масштаб: {{ Math.round(scale * 100) }}%
          </div>
        </div>
      </div>

      <!-- 3D View -->
      <div class="three-d-container" v-if="viewMode === '3d'">
        <div class="three-d-scene" ref="threeDScene"></div>
        
        <div class="loading-overlay" v-if="isLoadingFloor">
          <div class="loading-content">
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

        <div class="audience-info-3d" v-if="hoveredAudience3D">
          <div class="info-header">
            <h4>Аудитория {{ hoveredAudience3D.num_audiences }}</h4>
            <button @click="openModal(hoveredAudience3D)" class="info-more-btn">
              <i class="fas fa-chevron-right"></i>
            </button>
          </div>
          <p>{{ getAudienceTypeName(hoveredAudience3D.audience_type) }}</p>
        </div>
      </div>

      <div class="corpus-selector-enhanced">
        <div class="corpus-header">
          <i class="fas fa-building"></i>
          <span>Корпус</span>
        </div>
        <div class="corpus-buttons">
          <button 
            v-for="corpus in corpuses" 
            :key="corpus" 
            :class="{ 'active': selectedCorpus === corpus }"
            @click="selectCorpus(corpus)"
            class="corpus-btn"
          >
            <span class="corpus-number">{{ corpus }}</span>
          </button>
        </div>
      </div>

      <!-- Улучшенный переключатель этажей -->
      <div class="floor-selector-horizontal">
        <div class="floor-buttons">
          <button 
            v-for="floor in floors" 
            :key="floor" 
            :class="{ 'active': selectedFloor === floor }"
            @click="selectFloor(floor)"
            class="floor-btn"
          >
            <div class="floor-icon">
              <i class="fas" :class="getFloorIcon(floor)"></i>
            </div>
          </button>
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
              <h4>Типы аудиторий</h4>
              <div class="filter-chips">
                <button 
                  v-for="filter in filters" 
                  :key="filter.value"
                  :class="{ 'active': selectedFilters.includes(filter.value) }"
                  @click="toggleFilter(filter.value)"
                  class="filter-chip"
                >
                  <i class="fas" :class="getAudienceIcon(filter.value)"></i>
                  <span>{{ filter.label }}</span>
                </button>
              </div>
            </div>

            <div class="filter-section">
              <h4>Дополнительно</h4>
              <div class="filter-options">
                <label class="filter-option">
                  <input type="checkbox" v-model="showOnlyAvailable" />
                  <span class="checkmark"></span>
                  <span>Только доступные</span>
                </label>
                <label class="filter-option">
                  <input type="checkbox" v-model="showEquipment" />
                  <span class="checkmark"></span>
                  <span>С оборудованием</span>
                </label>
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

    <!-- Модальное окно аудитории -->
    <transition name="modal-slide">
      <div class="modal-mobile" v-if="showModal">
        <div class="modal-content">
          <div class="modal-header">
            <button class="modal-close" @click="closeModal">
              <i class="fas fa-arrow-left"></i>
            </button>
            <h2>Аудитория {{ currentAudience.num_audiences }}</h2>
            <button class="modal-action" @click="toggleFavorite(currentAudience)" 
                    :class="{ active: isFavorite(currentAudience) }">
              <i class="fas fa-heart"></i>
            </button>
          </div>

          <div class="modal-body" ref="modalBody">
            <div class="audience-meta">
              <div class="meta-item">
                <i class="fas fa-building"></i>
                <span>Корпус {{ currentAudience.corpus }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-layer-group"></i>
                <span>Этаж {{ currentAudience.floor }}</span>
              </div>
              <div class="meta-item">
                <i class="fas fa-door-open"></i>
                <span>{{ getAudienceTypeName(currentAudience.audience_type) }}</span>
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
              <div class="description-section" v-if="currentAudience.description">
                <h3>Описание</h3>
                <p>{{ currentAudience.description }}</p>
              </div>

              <!-- Оборудование -->
              <div class="equipment-section" v-if="currentAudience.equipment">
                <h3>Оборудование</h3>
                <div class="equipment-list">
                  <span v-for="item in currentAudience.equipment" :key="item" class="equipment-tag">
                    {{ item }}
                  </span>
                </div>
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
                    <img :src="image" alt="Аудитория" />
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

            <!-- Меню буфета -->
            <div class="tab-content" v-if="activeModalTab === 'menu' && currentAudience.audience_type === 'cafe'">
              <div class="menu-section" v-if="buffetMenu.length">
                <div class="menu-categories-scroll">
                  <button 
                    v-for="category in menuCategories" 
                    :key="category"
                    :class="{ 'active': selectedCategory === category }"
                    @click="selectedCategory = category"
                    class="menu-category-btn"
                  >
                    {{ getCategoryName(category) }}
                  </button>
                </div>
                <div class="menu-items">
                  <div 
                    v-for="item in getMenuByCategory" 
                    :key="item.id"
                    class="menu-item"
                  >
                    <div class="menu-item-image" @click="openFullscreen(item.image_url || '/img/menu/default-food.jpg')">
                      <img :src="item.image_url || '/img/menu/default-food.jpg'" :alt="item.name" />
                    </div>
                    <div class="menu-item-info">
                      <h4>{{ item.name }}</h4>
                      <p v-if="item.description" class="item-desc">{{ item.description }}</p>
                      <div class="item-footer">
                        <span class="item-price">{{ formatPrice(item.price) }}</span>
                        <span class="item-availability" :class="{ 'available': item.is_available }">
                          {{ item.is_available ? 'В наличии' : 'Нет в наличии' }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div v-else class="empty-state">
                <i class="fas fa-utensils"></i>
                <p>Меню временно недоступно</p>
              </div>
            </div>

            <!-- Расписание -->
            <div class="tab-content" v-if="activeModalTab === 'schedule' && showScheduleSection">
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
                    v-for="item in groupedSchedule" 
                    :key="item.key"
                    class="schedule-item"
                  >
                    <div class="schedule-time">
                      {{ item.time_start }} - {{ item.time_over }}
                    </div>
                    <div class="schedule-details">
                      <strong>{{ item.name_lesson }}</strong>
                      <p>{{ item.surname }} {{ item.name }} {{ item.patronymic }}</p>
                      <div class="schedule-groups">
                        <span v-for="group in item.groups" :key="group.id" class="group-tag">
                          {{ group.name_group }}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
                <div v-if="!groupedSchedule.length" class="empty-state">
                  <i class="fas fa-calendar-times"></i>
                  <p>Занятий в этот день нет</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Кнопки действий -->
          <div class="modal-actions">
            <button class="action-btn secondary" @click="shareAudience">
              <i class="fas fa-share-alt"></i>
              Поделиться
            </button>
            <button class="action-btn primary" @click="navigateToAudience">
              <i class="fas fa-route"></i>
              Построить маршрут
            </button>
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
        <img :src="fullscreenImage" alt="Фото аудитории" class="fullscreen-image" />
      </div>
    </transition>
  </div>
</template>

<script>
import { ref, computed, onMounted, nextTick, watch, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

// Three.js imports
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

export default {
  name: 'MobileMapView',
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
    const searchResultAudiences = ref(new Set());
    const buffetMenu = ref([]);
    const selectedCategory = ref('все');
    
    // UI состояния
    const showModal = ref(false);
    const showFullscreen = ref(false);
    const showMobileMenu = ref(false);
    const activePanel = ref(null);
    const activeSearchTab = ref('audience');
    const activeModalTab = ref('info');
    const user = ref(JSON.parse(localStorage.getItem('user')) || null);
    const isScrolled = ref(false);
    const showQuickActions = ref(false);
    const favoriteMode = ref(false);
    const hasNotifications = ref(false);
    
    // Поиск и фильтры
    const audienceSearch = ref('');
    const groupSearch = ref('');
    const teacherSearch = ref('');
    const selectedCorpus = ref('1');
    const selectedFloor = ref('1');
    const selectedDay = ref('Понедельник');
    const selectedFilters = ref([]);
    const showOnlyAvailable = ref(false);
    const showEquipment = ref(false);
    
    // 2D карта состояния
    const mapContent = ref(null);
    const svgElement = ref(null);
    const scale = ref(0.22);
    const position = ref({ x: 0, y: 0 });
    const svgWidth = ref(2000);
    const svgHeight = ref(1440);

    // Система пресетов масштабирования
    const zoomPresets = ref([
      { scale: 0.20, position: { x: -3942, y: -1559 } },
      { scale: 0.25, position: { x: -3139, y: -1220 } },
      { scale: 0.30, position: { x: -2624, y: -932 } },
      { scale: 0.35, position: { x: -2215, y: -728 } },
      { scale: 0.40, position: { x: -1945, y: -682 } },
      { scale: 0.45, position: { x: -1728, y: -575 } },
      { scale: 0.50, position: { x: -1564, y: -453 } },
      { scale: 0.55, position: { x: -1412, y: -518 } },
    ]);

    // Настройки масштабирования
    const zoomConfig = ref({
      min: 0.2,
      max: 0.55,
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
    
    // 3D View State
    const viewMode = ref('2d');
    const threeDScene = ref(null);
    const hoveredAudience3D = ref(null);
    const isLoadingFloor = ref(false);
    const loadProgress = ref(0);
    
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

    const searchTabs = [
      { id: 'audience', label: 'Аудитория', icon: 'fa-door-open' },
      { id: 'group', label: 'Группа', icon: 'fa-users' },
      { id: 'teacher', label: 'Преподаватель', icon: 'fa-chalkboard-teacher' }
    ];

    const modalTabs = [
      { id: 'schedule', label: 'Расписание' },
      { id: 'gallery', label: 'Фотографии' },
      { id: 'info', label: 'Информация' },
      { id: 'menu', label: 'Меню' }
    ];

    // ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ДЛЯ МАСШТАБИРОВАНИЯ
    const getPositionForScale = (targetScale) => {
      // Находим ближайшие пресеты для интерполяции
      const presets = [...zoomPresets.value].sort((a, b) => a.scale - b.scale);
      
      // Если точное совпадение
      const exactMatch = presets.find(p => Math.abs(p.scale - targetScale) < 0.001);
      if (exactMatch) return { ...exactMatch.position };
      
      // Находим границы для интерполяции
      let lower = null;
      let upper = null;
      
      for (let i = 0; i < presets.length - 1; i++) {
        if (targetScale >= presets[i].scale && targetScale <= presets[i + 1].scale) {
          lower = presets[i];
          upper = presets[i + 1];
          break;
        }
      }
      
      // Если за пределами диапазона, возвращаем крайние значения
      if (!lower || !upper) {
        if (targetScale <= presets[0].scale) return { ...presets[0].position };
        if (targetScale >= presets[presets.length - 1].scale) return { ...presets[presets.length - 1].position };
      }
      
      // Линейная интерполяция
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

    // ОСНОВНЫЕ МЕТОДЫ ДЛЯ ЦЕНТРИРОВАНИЯ И МАСШТАБИРОВАНИЯ
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
        
        // Интерполируем позицию на основе текущего масштаба
        const currentPosition = getPositionForScale(scale.value);
        position.value = currentPosition;
        
        if (progress < 1) {
          requestAnimationFrame(animateZoom);
        } else {
          // Финальная корректировка
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

    const setZoomConfig = (config) => {
      if (config.min !== undefined) zoomConfig.value.min = Math.max(0.1, config.min);
      if (config.max !== undefined) zoomConfig.value.max = Math.min(10, config.max);
      if (config.initial !== undefined) zoomConfig.value.initial = Math.max(zoomConfig.value.min, Math.min(zoomConfig.value.max, config.initial));
      if (config.step !== undefined) zoomConfig.value.step = Math.max(0.05, config.step);
      
      if (config.initial !== undefined) {
        scale.value = zoomConfig.value.initial;
        centerMap();
      }
    };

    const getZoomConfig = () => {
      return { ...zoomConfig.value };
    };

    // ОБРАБОТЧИКИ ЖЕСТОВ ДЛЯ МАСШТАБИРОВАНИЯ
    const onTouchStart = (event) => {
      if (event.touches.length === 1) {
        // Одиночное касание - перемещение
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
        // Два пальца - масштабирование
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
          
          // Плавно изменяем позицию в соответствии с масштабом
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
      if (viewMode.value !== '2d') return;
      
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
      if (viewMode.value === '2d') {
        nextTick(() => {
          centerMap();
        });
      } else if (viewMode.value === '3d') {
        if (camera && renderer && threeDScene.value) {
          camera.aspect = threeDScene.value.clientWidth / threeDScene.value.clientHeight;
          camera.updateProjectionMatrix();
          renderer.setSize(threeDScene.value.clientWidth, threeDScene.value.clientHeight);
        }
      }
    };

    // Новые методы для улучшенного интерфейса
    const getFloorIcon = (floor) => {
      const icons = {
        '1': 'fa-1',
        '2': 'fa-2', 
        '3': 'fa-3',
        '4': 'fa-4'
      };
      return icons[floor] || 'fa-layer-group';
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

    const searchResults = computed(() => {
      const searchValue = getSearchValue(activeSearchTab.value);
      if (!searchValue) return [];

      switch (activeSearchTab.value) {
        case 'audience':
          return audiences.value
            .filter(aud => aud.num_audiences.toLowerCase().includes(searchValue.toLowerCase()))
            .map(aud => ({
              id: aud.id,
              title: `Аудитория ${aud.num_audiences}`,
              subtitle: `${aud.corpus} корпус, ${aud.floor} этаж`,
              type: 'audience',
              data: aud
            }));
        case 'group':
          return groups.value
            .filter(group => group.name_group.toLowerCase().includes(searchValue.toLowerCase()))
            .map(group => ({
              id: group.id,
              title: group.name_group,
              subtitle: 'Учебная группа',
              type: 'group',
              data: group
            }));
        case 'teacher':
          return teachers.value
            .filter(teacher => 
              `${teacher.surname} ${teacher.name} ${teacher.patronymic}`.toLowerCase().includes(searchValue.toLowerCase())
            )
            .map(teacher => ({
              id: teacher.id,
              title: `${teacher.surname} ${teacher.name} ${teacher.patronymic}`,
              subtitle: teacher.post,
              type: 'teacher',
              data: teacher
            }));
        default:
          return [];
      }
    });

    // Methods
    const toggleViewMode = async () => {
      if (viewMode.value === '2d') {
        viewMode.value = '3d';
        await nextTick();
        init3DScene();
        load3DFloor();
      } else {
        viewMode.value = '2d';
        cleanup3D();
        nextTick(() => {
          centerMap();
        });
      }
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

    const toggleFavoriteMode = () => {
      favoriteMode.value = !favoriteMode.value;
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
        case 'audience': return audienceSearch.value;
        case 'group': return groupSearch.value;
        case 'teacher': return teacherSearch.value;
        default: return '';
      }
    };

    const getSearchPlaceholder = (tab) => {
      switch (tab) {
        case 'audience': return 'Номер аудитории...';
        case 'group': return 'Название группы...';
        case 'teacher': return 'ФИО преподавателя...';
        default: return 'Поиск...';
      }
    };

    const onSearchInput = (tab, event) => {
      const value = event.target.value;
      switch (tab) {
        case 'audience':
          audienceSearch.value = value;
          debounceSearchAudiences();
          break;
        case 'group':
          groupSearch.value = value;
          debounceSearchGroups();
          break;
        case 'teacher':
          teacherSearch.value = value;
          debounceSearchTeachers();
          break;
      }
    };

    const clearSearch = (tab) => {
      switch (tab) {
        case 'audience':
          audienceSearch.value = '';
          break;
        case 'group':
          groupSearch.value = '';
          break;
        case 'teacher':
          teacherSearch.value = '';
          break;
      }
      highlightedAudiences.value.clear();
      searchResultAudiences.value.clear();
    };

    const getQuickSearchItems = (tab) => {
      switch (tab) {
        case 'audience':
          return ['228', 'туалет', '226', 'буфет'];
        case 'group':
          return ['ПИ-401', 'ПИ-301', 'ИСТ-401', 'ИСТ-101'];
        case 'teacher':
          return ['Казаков', 'Кондратенко', 'Кулачков'];
        default:
          return [];
      }
    };

    const applyQuickSearch = (tab, item) => {
      switch (tab) {
        case 'audience':
          audienceSearch.value = item;
          searchAudiences();
          break;
        case 'group':
          groupSearch.value = item;
          searchGroups();
          break;
        case 'teacher':
          teacherSearch.value = item;
          searchTeachers();
          break;
      }
    };

    const getResultIcon = (result) => {
      const icons = {
        'audience': 'fa-door-open',
        'group': 'fa-users',
        'teacher': 'fa-chalkboard-teacher'
      };
      return icons[result.type] || 'fa-search';
    };

    const handleSearchResultClick = (result) => {
      switch (result.type) {
        case 'audience':
          centerToAudience(result.data);
          // Закрываем панель поиска после выбора результата
          closePanel();
          break;
        case 'group':
          groupSearch.value = result.data.name_group;
          searchGroups();
          break;
        case 'teacher':
          teacherSearch.value = `${result.data.surname} ${result.data.name}`;
          searchTeachers();
          break;
      }
    };

    const getHistoryIcon = (type) => {
      const icons = {
        'Аудитория': 'fa-door-open',
        'Группа': 'fa-users',
        'Преподаватель': 'fa-chalkboard-teacher'
      };
      return icons[type] || 'fa-search';
    };

    const getHistoryTypeName = (type) => {
      const names = {
        'Аудитория': 'Аудитория',
        'Группа': 'Группа',
        'Преподаватель': 'Преподаватель'
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
      showOnlyAvailable.value = false;
      showEquipment.value = false;
    };

    const applyFilters = () => {
      closePanel();
    };

    const handleMenuNavigation = (panel) => {
      togglePanel(panel);
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

    const getAudienceColor = (type, opacity = 1) => {
      const colors = {
        lecture: `rgba(67, 97, 238, ${opacity})`,
        lab: `rgba(67, 97, 238, ${opacity})`,
        study: `rgba(67, 97, 238, ${opacity})`,
        computer: `rgba(67, 97, 238, ${opacity})`,
        conference: `rgba(67, 97, 238, ${opacity})`,
        toilet: `rgba(67, 97, 238, ${opacity})`,
        cafe: `rgba(67, 97, 238, ${opacity})`,
        library: `rgba(67, 97, 238, ${opacity})`,
        cabinet: `rgba(67, 97, 238, ${opacity})`
      };
      return colors[type] || colors.study;
    };

    const getAudienceStrokeColor = (audience) => {
      if (isSearchResult(audience)) {
        return '#10b981';
      }
      return getAudienceColor(audience.audience_type);
    };

    const isSearchResult = (audience) => {
      return searchResultAudiences.value.has(audience.id);
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
      
      return highlightedAudiences.value.has(audience.id) || searchResultAudiences.value.has(audience.id);
    };

    const searchAudiences = () => {
      if (audienceSearch.value.trim().length >= 3) {
        addToSearchHistory(audienceSearch.value, 'Аудитория');
        
        // Очищаем предыдущие результаты
        searchResultAudiences.value.clear();
        
        // Находим все аудитории по поиску
        const foundAudiences = audiences.value.filter(aud => 
          aud.num_audiences.toLowerCase().includes(audienceSearch.value.toLowerCase())
        );
        
        if (foundAudiences.length > 0) {
          // Добавляем найденные аудитории в результаты
          foundAudiences.forEach(aud => {
            searchResultAudiences.value.add(aud.id);
          });
          
          // Если есть результаты на текущем этаже - центрируем на первом
          const currentFloorResults = foundAudiences.filter(aud => 
            aud.corpus === selectedCorpus.value && aud.floor === selectedFloor.value
          );
          
          if (currentFloorResults.length > 0) {
            centerToAudience(currentFloorResults[0]);
          } else {
            // Если на текущем этаже нет результатов, переключаемся на этаж первого найденного
            const firstResult = foundAudiences[0];
            selectedCorpus.value = firstResult.corpus;
            selectedFloor.value = firstResult.floor;
            
            // Центрируем после смены этажа
            nextTick(() => {
              centerToAudience(firstResult);
            });
          }
          
          // Очищаем поисковую строку после нахождения результатов
          audienceSearch.value = '';
        }
      } else {
        searchResultAudiences.value.clear();
      }
    };

    const centerToAudience = (audience) => {
      const audienceCenterX = audience.x + audience.width / 2;
      const audienceCenterY = audience.y + audience.height / 2;
      zoomToPoint(audienceCenterX, audienceCenterY, zoomConfig.value.initial);
    };

    const searchGroups = async () => {
      if (groupSearch.value.trim().length < 2) {
        highlightedAudiences.value.clear();
        searchResultAudiences.value.clear();
        return;
      }

      try {
        const response = await axios.get(`/api/schedule/group/${encodeURIComponent(groupSearch.value.trim())}`);
        const groupSchedule = response.data;
        
        highlightedAudiences.value.clear();
        searchResultAudiences.value.clear();
        
        groupSchedule.forEach(item => {
          if (item.audience_id) {
            highlightedAudiences.value.add(item.audience_id);
            searchResultAudiences.value.add(item.audience_id);
          }
        });
        
        // Если есть результаты, переключаемся на первый этаж с результатами
        if (groupSchedule.length > 0) {
          const firstResult = groupSchedule[0];
          if (firstResult.audience_id) {
            const audience = audiences.value.find(a => a.id === firstResult.audience_id);
            if (audience) {
              selectedCorpus.value = audience.corpus;
              selectedFloor.value = audience.floor;
              
              nextTick(() => {
                centerToAudience(audience);
              });
            }
          }
        }
        
        addToSearchHistory(groupSearch.value, 'Группа');
        // Очищаем поисковую строку после нахождения результатов
        groupSearch.value = '';
      } catch (error) {
        console.error('Ошибка поиска по группам:', error);
        highlightedAudiences.value.clear();
        searchResultAudiences.value.clear();
      }
    };

    const searchTeachers = async () => {
      if (teacherSearch.value.trim().length < 3) {
        highlightedAudiences.value.clear();
        searchResultAudiences.value.clear();
        return;
      }

      try {
        const response = await axios.get(`/api/schedule/teacher/${encodeURIComponent(teacherSearch.value.trim())}`);
        const teacherSchedule = response.data;
        
        highlightedAudiences.value.clear();
        searchResultAudiences.value.clear();
        
        teacherSchedule.forEach(item => {
          if (item.audience_id) {
            highlightedAudiences.value.add(item.audience_id);
            searchResultAudiences.value.add(item.audience_id);
          }
        });
        
        // Если есть результаты, переключаемся на первый этаж с результатами
        if (teacherSchedule.length > 0) {
          const firstResult = teacherSchedule[0];
          if (firstResult.audience_id) {
            const audience = audiences.value.find(a => a.id === firstResult.audience_id);
            if (audience) {
              selectedCorpus.value = audience.corpus;
              selectedFloor.value = audience.floor;
              
              nextTick(() => {
                centerToAudience(audience);
              });
            }
          }
        }
        
        addToSearchHistory(teacherSearch.value, 'Преподаватель');
        // Очищаем поисковую строку после нахождения результатов
        teacherSearch.value = '';
      } catch (error) {
        console.error('Ошибка поиска по преподавателям:', error);
        highlightedAudiences.value.clear();
        searchResultAudiences.value.clear();
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
      closePanel();
    };

    // Добавить состояние загрузки для лучшего UX
    const isLoadingModalData = ref(false);
    
    const openModal = async (audience) => {
      currentAudience.value = audience;
      currentImages.value = [
        audience.image1,
        audience.image2,
        audience.image3
      ].filter(img => img);
      
      // Показываем модальное окно сразу
      showModal.value = true;
      activeModalTab.value = 'schedule';
      
      // Показываем индикатор загрузки для дополнительных данных
      isLoadingModalData.value = true;
      
      try {
        // Параллельная загрузка данных
        const promises = [];
        
        const scheduleAllowedTypes = ['lecture', 'computer', 'study'];
        if (scheduleAllowedTypes.includes(audience.audience_type)) {
          promises.push(fetchSchedule(audience.id));
        }
        
        if (audience.audience_type === 'cafe') {
          promises.push(fetchBuffetMenu());
        }
        
        // Ждем завершения всех запросов
        if (promises.length > 0) {
          await Promise.all(promises);
        }
      } catch (error) {
        console.error('Ошибка загрузки данных модального окна:', error);
      } finally {
        isLoadingModalData.value = false;
      }
    };
    
    const closeModal = () => {
      showModal.value = false;
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

    const goToUniversityMap = () => {
      router.push('/');
    };

    const isFavorite = (audience) => {
      return false;
    };

    const toggleFavorite = (audience) => {
      // Заглушка для функционала избранного
    };

    const shareAudience = () => {
      if (navigator.share) {
        navigator.share({
          title: `Аудитория ${currentAudience.value.num_audiences}`,
          text: `Аудитория ${currentAudience.value.num_audiences} в БГИТУ`,
          url: window.location.href
        });
      }
    };

    const navigateToAudience = () => {
      alert('Функция навигации будет реализована в будущем');
    };

    const shareLocation = () => {
      if (navigator.share) {
        navigator.share({
          title: 'Мое местоположение в БГИТУ',
          text: 'Я нахожусь в БГИТУ',
          url: window.location.href
        });
      }
    };

    const selectCorpus = (corpus) => {
      selectedCorpus.value = corpus;
      selectedFloor.value = '1';
      if (viewMode.value === '3d') {
        load3DFloor();
      } else {
        nextTick(() => {
          resetView();
        });
      }
    };

    const selectFloor = async (floor) => {
      selectedFloor.value = floor;
      if (viewMode.value === '3d') {
        load3DFloor();
      } else {
        nextTick(() => {
          resetView();
        });
      }
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

    // Panel drag methods
    const startPanelDrag = (event) => {
      // Заглушка для перетаскивания панели
    };

    // 3D Methods
    const init3DScene = () => {
      if (!threeDScene.value) return;

      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f8ff);

      camera = new THREE.PerspectiveCamera(35, threeDScene.value.clientWidth / threeDScene.value.clientHeight, 0.1, 1000);
      camera.position.set(0, 15, 20);

      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true
      });
      renderer.setSize(threeDScene.value.clientWidth, threeDScene.value.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;

      threeDScene.value.innerHTML = '';
      threeDScene.value.appendChild(renderer.domElement);

      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      
      controls.minDistance = 4;
      controls.maxDistance = 25;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI * 0.8;
      controls.enablePan = true;
      controls.panSpeed = 0.5;

      ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
      scene.add(ambientLight);

      directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
      directionalLight.position.set(15, 25, 15);
      directionalLight.castShadow = true;
      scene.add(directionalLight);

      const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
      fillLight.position.set(-10, 10, -10);
      scene.add(fillLight);

      gridHelper = new THREE.GridHelper(50, 50, 0x000000, 0x000000);
      gridHelper.visible = false;
      scene.add(gridHelper);

      raycaster = new THREE.Raycaster();

      window.addEventListener('resize', onWindowResize);
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onCanvasClick);

      animate();
    };

    const load3DFloor = () => {
      if (isLoadingFloor.value) return;
      
      isLoadingFloor.value = true;
      loadProgress.value = 0;

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
          createAudienceObjects3D();
        }
      );
    };

    const createFallbackFloor = () => {
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
        const response = await axios.get(`/api/audiences-3d/${selectedCorpus.value}/${selectedFloor.value}`);
        const audience3DData = response.data;
        
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

        audience3DData.forEach(audience3D => {
          const audience = audiences.value.find(a => a.id === audience3D.audience_id);
          if (!audience) return;

          const color = new THREE.Color(getAudienceColor(audience.audience_type).replace('rgba(', '').replace(')', '').split(',')[0]);
          
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
          
          cube.position.set(
            audience3D.position_x,
            audience3D.position_y,
            audience3D.position_z
          );
          
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
              position_x: audience3D.position_x,
              position_y: audience3D.position_y,
              position_z: audience3D.position_z
            }
          };
          cube.castShadow = true;
          cube.receiveShadow = true;
          
          scene.add(cube);
          audienceObjects.set(audience.id, cube);

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
        const color = new THREE.Color(getAudienceColor(audience.audience_type).replace('rgba(', '').replace(')', '').split(',')[0]);
        
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
          
          object.material.emissive = new THREE.Color(0x333333);
          object.material.needsUpdate = true;
        }
      } else {
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

    const cleanup3D = () => {
      if (animationFrameId) {
        cancelAnimationFrame(animationFrameId);
        animationFrameId = null;
      }

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

      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
        if (renderer.domElement) {
          renderer.domElement.remove();
        }
        renderer = null;
      }

      if (controls) {
        controls.dispose();
        controls = null;
      }

      camera = null;
      audienceObjects.clear();

      window.removeEventListener('resize', onWindowResize);
      if (threeDScene.value) {
        threeDScene.value.innerHTML = '';
      }

      hoveredAudience3D.value = null;
      isLoadingFloor.value = false;
      loadProgress.value = 0;
    };

    // Инициализация
    onMounted(async () => {
      await fetchAudiences();
      await fetchGroups();
      await fetchTeachers();
      
      // Устанавливаем начальный масштаб и позицию
      scale.value = zoomConfig.value.initial;
      // ВАЖНО: Вызываем centerMap() для установки правильной начальной позиции
      centerMap();
      
      // Добавляем обработчик изменения размера окна
      window.addEventListener('resize', onWindowResize);
      
      // Обработка скролла для навигационной панели
      const handleScroll = () => {
        isScrolled.value = window.scrollY > 10;
      };
      
      window.addEventListener('scroll', handleScroll);
      
      return () => {
        window.removeEventListener('scroll', handleScroll);
        window.removeEventListener('resize', onWindowResize);
      };
    });

    onUnmounted(() => {
      cleanup3D();
    });

    // Watchers
    watch([selectedCorpus, selectedFloor], async () => {
      if (viewMode.value === '2d') {
        nextTick(() => {
          resetView();
        });
      }
    });

    watch(activePanel, () => {
      if (viewMode.value === '2d') {
        setTimeout(() => {
          centerMap();
        }, 300);
      }
    });

    watch(showMobileMenu, () => {
      if (viewMode.value === '2d') {
        setTimeout(() => {
          centerMap();
        }, 300);
      }
    });

    return {
      // Реактивные данные
      audiences,
      currentAudience,
      currentImages,
      fullscreenImage,
      searchHistory,
      user,
      hoveredAudience3D,
      viewMode,
      showModal,
      showFullscreen,
      showMobileMenu,
      showScheduleSection,
      activePanel,
      activeSearchTab,
      activeModalTab,
      isLoadingFloor,
      loadProgress,
      audienceSearch,
      groupSearch,
      teacherSearch,
      selectedCorpus,
      selectedFloor,
      selectedDay,
      selectedFilters,
      showOnlyAvailable,
      showEquipment,
      isScrolled,
      showQuickActions,
      favoriteMode,
      hasNotifications,
      scale,
      position,
      svgWidth,
      svgHeight,
      buffetMenu,
      menuCategories,
      getMenuByCategory,
      selectedCategory,
      
      // Константы
      corpuses,
      floors,
      days,
      filters,
      searchTabs,
      modalTabs,
      
      // Computed
      currentMapImage,
      filteredAudiences,
      groupedSchedule,
      searchResults,
      viewModeIcon,
      viewModeText,
      
      // Refs
      zoomPresets,
      mapContent,
      svgElement,
      threeDScene,

      // МЕТОДЫ МАСШТАБИРОВАНИЯ И ЦЕНТРИРОВАНИЯ
      setZoomConfig,
      zoomInCenter,
      zoomOutCenter,
      resetView,
      zoomToPoint,
      setZoom,
      getZoomConfig,
      centerMap,
      centerToPoint,
      
      // Обработчики жестов
      onTouchStart,
      onTouchMove,
      onTouchEnd,
      onDoubleTap,
      
      // Новые методы
      getFloorIcon,
      getAudienceStrokeColor,
      isSearchResult,
      centerToAudience,

      // Остальные методы
      toggleViewMode,
      toggleMobileMenu,
      closeMobileMenu,
      togglePanel,
      closePanel,
      toggleQuickActions,
      toggleFavoriteMode,
      selectCorpus,
      selectFloor,
      goToAuth,
      logout,
      goToProfile,
      toggleUserMenu,
      goToUniversityMap,
      isFavorite,
      toggleFavorite,
      shareAudience,
      navigateToAudience,
      shareLocation,
      getPanelIcon,
      getPanelTitle,
      getSearchTabIcon,
      getSearchValue,
      getSearchPlaceholder,
      onSearchInput,
      clearSearch,
      getQuickSearchItems,
      applyQuickSearch,
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
      getAudienceTypeName,
      getAudienceIcon,
      getAudienceColor,
      getCurrentZoomPreset,
      getCategoryName,
      formatPrice,
      startPanelDrag,
      openModal,
      closeModal,
      openFullscreen,
      closeFullscreen
    };
  }
};
</script>

<style scoped>
/* Базовые стили для мобильных */
.mobile-container {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: #f8fafc;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  overflow: hidden;
}

/* Навигационная панель */
.mobile-nav {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  height: 60px;
  background: rgba(255, 255, 255, 0.98);
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(0, 0, 0, 0.08);
  z-index: 1000;
  padding: 0 16px;
  transition: all 0.3s ease;
}

.mobile-nav.scrolled {
  background: rgba(255, 255, 255, 0.95);
  box-shadow: 0 2px 20px rgba(0, 0, 0, 0.1);
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

.nav-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 12px;
  border: none;
  background: #f7fafc;
  color: #4a5568;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  font-size: 16px;
}

.nav-action-btn:active {
  background: #edf2f7;
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
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  border-radius: 2px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  transform-origin: center;
}

.burger-menu span {
  display: block;
  height: 2px;
  width: 100%;
  background: #2d3748;
  border-radius: 1px;
  transition: all 0.3s ease;
  transform-origin: center;
}

.burger-menu.active .burger-line:nth-child(1) {
  transform: rotate(45deg) translate(8px, 8px);
  background: #4361ee;
}

.burger-menu.active .burger-line:nth-child(2) {
  opacity: 0;
  transform: scale(0);
}

.burger-menu.active .burger-line:nth-child(3) {
  transform: rotate(-45deg) translate(8px, -8px);
  background: #4361ee;
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
  color: #1a202c;
  cursor: pointer;
  flex: 1;
  justify-content: center;
}

.logo-text {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
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
  border: 2px solid white;
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
  background: white;
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
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
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
  border: 3px solid rgba(255, 255, 255, 0.2);
}

.user-avatar-large.guest {
  background: rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
}

.user-info {
  flex: 1;
}

.username {
  display: block;
  font-size: 18px;
  font-weight: 600;
  margin-bottom: 4px;
}

.user-status {
  display: block;
  font-size: 14px;
  opacity: 0.8;
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
  color: #718096;
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
  background: #f8fafc;
  border: 2px solid transparent;
  border-radius: 16px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-item:active {
  transform: scale(0.98);
}

.menu-item.active {
  background: #4361ee;
  color: white;
  border-color: #4361ee;
}

.menu-item.active .menu-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.menu-icon {
  width: 48px;
  height: 48px;
  border-radius: 14px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4361ee;
  font-size: 18px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.08);
}

.menu-label {
  font-size: 13px;
  font-weight: 600;
  text-align: center;
}

.menu-btn {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 16px;
  background: #f8fafc;
  border: none;
  border-radius: 16px;
  color: #2d3748;
  font-size: 16px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-btn:active {
  transform: scale(0.98);
}

.menu-btn.large {
  padding: 20px;
}

.btn-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.btn-badge {
  background: #4361ee;
  color: white;
  padding: 4px 8px;
  border-radius: 8px;
  font-size: 12px;
  font-weight: 600;
}

/* Location controls */
.location-controls {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.location-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.location-group label {
  font-size: 14px;
  color: #718096;
  font-weight: 500;
}

.chip-group {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
}

.location-chip {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.location-chip.active {
  background: #4361ee;
  color: white;
  border-color: #4361ee;
}

/* Action grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #f8fafc;
  border: none;
  border-radius: 16px;
  color: #4a5568;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn i {
  font-size: 18px;
  color: #4361ee;
}

.menu-footer {
  padding: 20px;
  border-top: 1px solid #f1f5f9;
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
}

.menu-footer-btn:active {
  transform: scale(0.98);
}

.menu-footer-btn.primary {
  background: #4361ee;
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
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.main-btn {
  background: #4361ee;
  color: white;
  font-size: 20px;
  z-index: 10;
}

.main-btn.active {
  transform: rotate(135deg);
  background: #f94144;
}

.action-btn {
  background: white;
  color: #4361ee;
  font-size: 18px;
}

.action-btn.active {
  background: #4361ee;
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
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.map-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-color: #1a202cfa;
  width: 700px;
  height: 1440px;
}

.map-content {
  width: 2000px;
  height: 1440px;
  background-size: cover;
  position: relative;
  transition: background-image 0.5s ease-in-out;
}

.audience-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Аудитории на карте */
.audience-rect {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  pointer-events: all;
}

.audience-rect:hover {
  stroke-width: 1.5;
}

.audience-rect.highlighted {
  stroke-width: 3;
  animation: pulse 2s infinite;
}

.audience-rect.favorite {
  stroke: #f94144;
  stroke-width: 3;
}

.audience-rect.search-result {
  stroke: #10b981;
  stroke-width: 3;
  animation: pulse-green 2s infinite;
}

.audience-label {
  pointer-events: all;
  cursor: pointer;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes pulse-green {
  0% { 
    stroke: #10b981;
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
  }
  50% { 
    stroke: #34d399;
    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.8));
  }
  100% { 
    stroke: #10b981;
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
  }
}

/* Улучшенный переключатель корпусов */
.corpus-selector-enhanced {
  position: absolute;
  top: 80px;
  left: 12px;
  z-index: 50;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 80px;
}

.corpus-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #4361ee;
  font-weight: 600;
  font-size: 12px;
  justify-content: center;
}

.corpus-header i {
  font-size: 12px;
}

.corpus-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.corpus-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border: 2px solid #1a202c;
  border-radius: 12px;
  background-color: #2d3748;
  color:#4361ee;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 40px;
  font-size: 14px;
}

.corpus-btn.active {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border-color: #4361ee;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.corpus-btn:active {
  transform: scale(0.95);
}

.corpus-number {
  font-size: 14px;
  font-weight: 700;
}

/* Горизонтальный переключатель этажей */
.floor-selector-horizontal {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
}

.floor-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.floor-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border: 2px solid #1a202c;
  border-radius: 12px;
  background-color: #2d3748;
  color:#4361ee;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 50px;
  justify-content: center
}

.floor-btn.active {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border-color: #4361ee;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(67, 97, 238, 0.3);
}

.floor-btn:active {
  transform: scale(0.95);
}

.floor-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(67, 97, 238, 0.1);
  border-radius: 6px;
  color: #4361ee;
  transition: all 0.3s ease;
  font-size: 10px;
}

.floor-btn.active .floor-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.floor-number {
  font-size: 12px;
  font-weight: 700;
}

/* Кнопки действий на карте (справа сверху) */
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.map-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #1a202c;
  background-color: #2d3748;
  color:#4361ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.map-action-btn:active {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  border-color: #4361ee;
  transform: scale(0.9);
}

.map-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

.scale-indicator {
  font-weight: 500;
}

/* 3D контейнер */
.three-d-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-d-scene {
  width: 100%;
  height: 100%;
}

/* Текущее местоположение */
.current-location {
  position: absolute;
  bottom: 100px;
  left: 20px;
  z-index: 50;
}

.location-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.location-chip.active {
  background: #4361ee;
  color: white;
  border-color: #4361ee;
}

/* Action grid */
.action-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 12px;
}

.action-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding: 16px 12px;
  background: #f8fafc;
  border: none;
  border-radius: 16px;
  color: #4a5568;
  font-size: 13px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn i {
  font-size: 18px;
  color: #4361ee;
}

.menu-footer {
  padding: 20px;
  border-top: 1px solid #f1f5f9;
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
}

.menu-footer-btn:active {
  transform: scale(0.98);
}

.menu-footer-btn.primary {
  background: #4361ee;
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
  width: 56px;
  height: 56px;
  border-radius: 28px;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.main-btn {
  background: #4361ee;
  color: white;
  font-size: 20px;
  z-index: 10;
}

.main-btn.active {
  transform: rotate(135deg);
  background: #f94144;
}

.action-btn {
  background: white;
  color: #4361ee;
  font-size: 18px;
}

.action-btn.active {
  background: #4361ee;
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
  box-shadow: -10px 0 30px rgba(0, 0, 0, 0.1);
}

.map-container {
  position: relative;
  flex: 1;
  overflow: hidden;
  background-color: #1a202cfa;
  width: 700px;
  height: 1440px;
}

.map-content {
  width: 2000px;
  height: 1440px;
  background-size: cover;
  position: relative;
  transition: background-image 0.5s ease-in-out;
}

.audience-svg {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}

/* Аудитории на карте */
.audience-rect {
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  filter: drop-shadow(0 2px 4px rgba(0,0,0,0.1));
  pointer-events: all;
}

.audience-rect:hover {
  stroke-width: 1.5;
}

.audience-rect.highlighted {
  stroke-width: 3;
  fill: rgba(0, 255, 8, 0.2);
  animation: pulse 2s infinite;
}

.audience-rect.favorite {
  stroke: #f94144;
  stroke-width: 3;
}

.audience-rect.search-result {
  stroke: #22fc29;
  stroke-width: 4;
  animation: pulse-green 1s infinite;
}

.audience-label {
  pointer-events: all;
  cursor: pointer;
  user-select: none;
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
}

@keyframes pulse {
  0% { opacity: 0.6; }
  50% { opacity: 1; }
  100% { opacity: 0.6; }
}

@keyframes pulse-green {
  0% { 
    stroke: #10b981;
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
  }
  50% { 
    stroke: #34d399;
    filter: drop-shadow(0 0 10px rgba(16, 185, 129, 0.8));
  }
  100% { 
    stroke: #10b981;
    filter: drop-shadow(0 0 5px rgba(16, 185, 129, 0.5));
  }
}

/* Улучшенный переключатель корпусов */
.corpus-selector-enhanced {
  position: absolute;
  top: 80px;
  left: 12px;
  z-index: 50;
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 12px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 80px;
}

.corpus-header {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  color: #4361ee;
  font-weight: 600;
  font-size: 12px;
  justify-content: center;
}

.corpus-header i {
  font-size: 12px;
}

.corpus-buttons {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.corpus-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border: 2px solid #1a202c;
  border-radius: 12px;
  background-color: #2d3748;
  color:#4361ee;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 40px;
  font-size: 14px;
}

.corpus-btn.active {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border-color: #4361ee;
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(67, 97, 238, 0.3);
}

.corpus-btn:active {
  transform: scale(0.95);
}

.corpus-number {
  font-size: 14px;
  font-weight: 700;
}

/* Горизонтальный переключатель этажей */
.floor-selector-horizontal {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 50;
  backdrop-filter: blur(20px);
  border-radius: 20px;
  padding: 12px 16px;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
  min-width: 200px;
}

.floor-buttons {
  display: flex;
  gap: 8px;
  justify-content: center;
}

.floor-btn {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 8px 10px;
  border: 2px solid #1a202c;
  border-radius: 12px;
  background-color: #2d3748;
  color:#4361ee;
  font-weight: 600;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
  min-width: 50px;
  justify-content: center
}

.floor-btn.active {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  color: white;
  border-color: #4361ee;
  transform: translateY(-2px);
  box-shadow: 0 6px 20px rgba(67, 97, 238, 0.3);
}

.floor-btn:active {
  transform: scale(0.95);
}

.floor-icon {
  width: 20px;
  height: 20px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(67, 97, 238, 0.1);
  border-radius: 6px;
  color: #4361ee;
  transition: all 0.3s ease;
  font-size: 10px;
}

.floor-btn.active .floor-icon {
  background: rgba(255, 255, 255, 0.2);
  color: white;
}

.floor-number {
  font-size: 12px;
  font-weight: 700;
}

/* Кнопки действий на карте (справа сверху) */
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
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.15);
  border: 1px solid rgba(255, 255, 255, 0.2);
}

.map-action-btn {
  width: 40px;
  height: 40px;
  border-radius: 10px;
  border: 2px solid #1a202c;
  background-color: #2d3748;
  color:#4361ee;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  cursor: pointer;
}

.map-action-btn:active {
  background: linear-gradient(135deg, #4361ee, #3a0ca3);
  border-color: #4361ee;
  transform: scale(0.9);
}

.map-action-btn:hover {
  transform: translateY(-1px);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
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

.scale-indicator {
  font-weight: 500;
}

/* 3D контейнер */
.three-d-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-d-scene {
  width: 100%;
  height: 100%;
}

/* Текущее местоположение */
.current-location {
  position: absolute;
  bottom: 100px;
  left: 20px;
  z-index: 50;
}

.location-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.location-chip.active {
  background: #4361ee;
  color: white;
  border-color: #4361ee;
}

.location-chip i {
  font-size: 12px;
}

.location-btn {
  width: 50px;
  height: 50px;
  border-radius: 25px;
  border: none;
  background: white;
  color: #4361ee;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 18px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.location-btn:active {
  transform: scale(0.95);
}

/* Нижние панели */
.bottom-panel {
  position: fixed;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
  border-radius: 24px 24px 0 0;
  box-shadow: 0 -4px 30px rgba(0, 0, 0, 0.15);
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

.panel-handle:active {
  cursor: grabbing;
}

.handle-bar {
  width: 40px;
  height: 4px;
  background: #e2e8f0;
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
  font-size: 14px;
  padding: 0px 20px;
  border-bottom: 1px solid #f1f5f9;
}

.panel-title {
  font-size: 18px;
  font-weight: 600;
  color: #2d3748;
  display: flex;
  align-items: center;
  gap: 8px;
}

.panel-title i {
  color: #4361ee;
}

.close-panel {
  width: 36px;
  height: 36px;
  border-radius: 18px;
  border: none;
  background: #f1f5f9;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.close-panel:active {
  transform: scale(0.95);
}

.panel-content {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

/* Стили для панели поиска */
.search-tabs {
  display: flex;
  background: #f8fafc;
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
  color: #718096;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.search-tab.active {
  background: white;
  color: #4361ee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
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
  z-index: 1;
}

.search-input {
  width: 100%;
  padding: 16px 16px 16px 48px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  font-size: 16px;
  background: white;
  transition: all 0.2s ease;
}

.search-input:focus {
  outline: none;
  border-color: #4361ee;
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.clear-btn {
  position: absolute;
  right: 16px;
  background: none;
  border: none;
  color: #cbd5e0;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.clear-btn:active {
  background: #f1f5f9;
}

/* Быстрый поиск */
.quick-search {
  margin-top: 20px;
}

.quick-search h4 {
  font-size: 14px;
  color: #718096;
  margin-bottom: 12px;
  font-weight: 600;
}

.quick-search-chips {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.quick-search-chip {
  padding: 8px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.quick-search-chip:active {
  background: #f7fafc;
  transform: scale(0.95);
}

/* Результаты поиска */
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
  color: #718096;
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
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.result-item:active {
  background: #edf2f7;
  transform: scale(0.98);
}

.result-item i:first-child {
  color: #4361ee;
  width: 16px;
}

.result-content {
  flex: 1;
}

.result-title {
  display: block;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
}

.result-subtitle {
  display: block;
  font-size: 12px;
  color: #718096;
}

.result-item i:last-child {
  color: #cbd5e0;
  font-size: 12px;
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
  color: #718096;
  font-size: 14px;
  padding: 8px;
  border-radius: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.clear-history:active {
  background: #f1f5f9;
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
  background: #f8fafc;
  border-radius: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.history-item:active {
  background: #edf2f7;
  transform: scale(0.98);
}

.history-icon {
  width: 32px;
  height: 32px;
  border-radius: 8px;
  background: white;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #4361ee;
  font-size: 14px;
}

.history-content {
  flex: 1;
}

.history-term {
  display: block;
  font-weight: 500;
  color: #2d3748;
  margin-bottom: 2px;
}

.history-type {
  display: block;
  font-size: 12px;
  color: #718096;
}

.history-time {
  font-size: 11px;
  color: #a0aec0;
}

/* Стили для фильтров */
.filter-section {
  margin-bottom: 24px;
}

.filter-section h4 {
  font-size: 16px;
  color: #2d3748;
  margin-bottom: 12px;
  font-weight: 600;
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
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.filter-chip.active {
  background: #4361ee;
  color: white;
  border-color: #4361ee;
}

.filter-chip i {
  font-size: 12px;
}

.filter-options {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-option {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
}

.filter-option input {
  display: none;
}

.checkmark {
  width: 20px;
  height: 20px;
  border: 2px solid #e2e8f0;
  border-radius: 6px;
  position: relative;
  transition: all 0.2s ease;
}

.filter-option input:checked + .checkmark {
  background: #4361ee;
  border-color: #4361ee;
}

.filter-option input:checked + .checkmark::after {
  content: '✓';
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  color: white;
  font-size: 12px;
  font-weight: bold;
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
  background: #f8fafc;
  color: #4a5568;
}

.filter-btn.primary {
  background: #4361ee;
  color: white;
}

/* Модальное окно */
.modal-mobile {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: white;
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
  background: white;
  display: flex;
  align-items: center;
  gap: 16px;
  padding: 16px;
  border-bottom: 1px solid #f1f5f9;
  z-index: 10;
}

.modal-close {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.2s ease;
  cursor: pointer;
}

.modal-close:active {
  transform: scale(0.95);
}

.modal-header h2 {
  flex: 1;
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #2d3748;
}

.modal-action {
  width: 40px;
  height: 40px;
  border-radius: 20px;
  border: none;
  background: #f1f5f9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #cbd5e0;
  transition: all 0.2s ease;
  cursor: pointer;
}

.modal-action.active {
  color: #f94144;
  background: #fff5f5;
}

.modal-action:active {
  transform: scale(0.95);
}

.modal-body {
  flex: 1;
  overflow-y: auto;
  padding: 20px;
}

.audience-meta {
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
  background: #f8fafc;
  border-radius: 12px;
}

.meta-item i {
  color: #4361ee;
  width: 16px;
}

.modal-tabs {
  display: flex;
  background: #f8fafc;
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
  color: #718096;
  font-size: 12px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.modal-tab.active {
  background: white;
  color: #4361ee;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.tab-content {
  animation: fadeIn 0.3s ease;
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

/* Оборудование */
.equipment-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.equipment-tag {
  padding: 6px 12px;
  background: #f7fafc;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  font-size: 12px;
  color: #4a5568;
}

/* Меню */
.menu-categories-scroll {
  display: flex;
  gap: 8px;
  overflow-x: auto;
  margin: 0 -20px;
  padding: 0 20px 16px;
  scrollbar-width: none;
}

.menu-categories-scroll::-webkit-scrollbar {
  display: none;
}

.menu-category-btn {
  flex-shrink: 0;
  padding: 10px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 20px;
  background: white;
  color: #4a5568;
  font-size: 14px;
  font-weight: 500;
  transition: all 0.2s ease;
  cursor: pointer;
}

.menu-category-btn.active {
  background: #4361ee;
  color: white;
  border-color: #4361ee;
}

.menu-items {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.menu-item {
  display: flex;
  gap: 12px;
  padding: 16px;
  background: #f8fafc;
  border-radius: 12px;
}

.menu-item-image {
  width: 80px;
  height: 80px;
  border-radius: 8px;
  overflow: hidden;
  flex-shrink: 0;
  cursor: pointer;
}

.menu-item-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.menu-item-info {
  flex: 1;
}

.menu-item-info h4 {
  margin: 0 0 4px 0;
  font-size: 16px;
  font-weight: 600;
  color: #2d3748;
}

.item-desc {
  margin: 0 0 8px 0;
  color: #718096;
  font-size: 14px;
  line-height: 1.4;
}

.item-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.item-price {
  font-weight: 600;
  color: #4361ee;
  font-size: 16px;
}

.item-availability {
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 8px;
  background: #fff5f5;
  color: #e53e3e;
  font-weight: 500;
}

.item-availability.available {
  background: #f0fff4;
  color: #38a169;
}

/* Расписание */
.schedule-controls {
  margin-bottom: 16px;
}

.day-select {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #e2e8f0;
  border-radius: 12px;
  background: white;
  font-size: 16px;
  appearance: none;
  background-image: url("data:image/svg+xml;charset=US-ASCII,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 4 5'><path fill='%236B7280' d='M2 0L0 2h4zm0 5L0 3h4z'/></svg>");
  background-repeat: no-repeat;
  background-position: right 12px center;
  background-size: 12px;
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
  background: #f8fafc;
  border-radius: 12px;
}

.schedule-time {
  font-weight: 600;
  color: #4361ee;
  min-width: 80px;
  font-size: 14px;
}

.schedule-details {
  flex: 1;
}

.schedule-details strong {
  display: block;
  margin-bottom: 4px;
  color: #2d3748;
}

.schedule-details p {
  margin: 0 0 8px 0;
  color: #718096;
  font-size: 14px;
}

.schedule-groups {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
}

.group-tag {
  padding: 4px 8px;
  background: white;
  border-radius: 8px;
  font-size: 12px;
  color: #4a5568;
  border: 1px solid #e2e8f0;
}

.modal-actions {
  position: sticky;
  bottom: 0;
  background: white;
  padding: 16px 20px;
  border-top: 1px solid #f1f5f9;
  display: flex;
  gap: 12px;
}

.action-btn {
  flex: 1;
  padding: 16px;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.action-btn:active {
  transform: scale(0.98);
}

.action-btn.secondary {
  background: #f8fafc;
  color: #4a5568;
}

.action-btn.primary {
  background: #4361ee;
  color: white;
}

/* Уведомления */
.notifications {
  position: fixed;
  top: 80px;
  right: 16px;
  z-index: 10000;
  display: flex;
  flex-direction: column;
  gap: 8px;
  max-width: 320px;
}

.notification {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  background: white;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  border-left: 4px solid #4361ee;
  animation: slideInRight 0.3s ease;
}

.notification.success {
  border-left-color: #48bb78;
}

.notification.warning {
  border-left-color: #ed8936;
}

.notification.error {
  border-left-color: #f56565;
}

.notification i {
  color: #4361ee;
  font-size: 16px;
}

.notification.success i {
  color: #48bb78;
}

.notification.warning i {
  color: #ed8936;
}

.notification.error i {
  color: #f56565;
}

.notification-content {
  flex: 1;
}

.notification-content p {
  margin: 0;
  font-size: 14px;
  color: #2d3748;
  font-weight: 500;
}

.notification-close {
  background: none;
  border: none;
  color: #cbd5e0;
  padding: 4px;
  border-radius: 6px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.notification-close:active {
  background: #f1f5f9;
}

.notification-enter-active,
.notification-leave-active {
  transition: all 0.3s ease;
}

.notification-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.notification-leave-to {
  transform: translateX(100%);
  opacity: 0;
}

/* Анимации */
@keyframes slideIn {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.corpus-selector-enhanced,
.floor-selector-horizontal,
.map-actions-top-right {
  animation: slideIn 0.3s ease-out;
}

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
  
  .floor-selector-horizontal {
    bottom: max(20px, env(safe-area-inset-bottom) + 20px);
  }
  
  .floating-controls {
    bottom: max(100px, env(safe-area-inset-bottom) + 20px);
    right: max(20px, env(safe-area-inset-right) + 20px);
  }
  
  .bottom-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .modal-actions {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}

/* Улучшение touch-интерфейса */
button {
  min-height: 44px;
  min-width: 44px;
  -webkit-tap-highlight-color: transparent;
}

/* Оптимизация производительности */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* Темная тема поддержка */
@media (prefers-color-scheme: dark) {
  .mobile-container {
    background: #1a202c;
  }
  
  .mobile-nav {
    background: rgba(26, 32, 44, 0.98);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
  
  .burger-menu span {
    background: #e2e8f0;
  }
  
  .nav-action-btn {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .logo-text {
    color: #e2e8f0;
  }
}

/* Состояния загрузки и пустые состояния */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-spinner-large {
  width: 50px;
  height: 50px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.loading-progress {
  margin-top: 16px;
}

.progress-bar {
  width: 200px;
  height: 4px;
  background: #e2e8f0;
  border-radius: 2px;
  overflow: hidden;
  margin-bottom: 8px;
}

.progress-fill {
  height: 100%;
  background: #4361ee;
  transition: width 0.3s ease;
}

.progress-text {
  font-size: 12px;
  color: #718096;
}

.loading-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

.empty-state {
  text-align: center;
  padding: 40px 20px;
  color: #718096;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
}

.empty-state i {
  font-size: 48px;
  color: #cbd5e0;
  margin-bottom: 8px;
}

.empty-state p {
  margin: 0;
  font-size: 16px;
  font-weight: 500;
  color: #4a5568;
}

.empty-state span {
  font-size: 14px;
  color: #a0aec0;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.fullscreen-header {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  padding: 20px;
  z-index: 10;
  display: flex;
  justify-content: flex-end;
}

.close-fullscreen {
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
}

.close-fullscreen:active {
  transform: scale(0.95);
}

.fullscreen-image {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.three-d-container {
  width: 100%;
  height: 100%;
  position: relative;
}

.three-d-scene {
  width: 100%;
  height: 100%;
}

/* Индикатор загрузки */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 50;
  backdrop-filter: blur(4px);
}

.loading-content {
  text-align: center;
  padding: 30px;
  background: white;
  border-radius: 20px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
}

.loading-spinner-large {
  width: 50px;
  height: 50px;
  border: 3px solid #f1f5f9;
  border-top: 3px solid #4361ee;
  border-radius: 50%;
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

.audience-info-3d {
  position: absolute;
  top: 80px;
  left: 12px;
  background: rgba(255, 255, 255, 0.95);
  backdrop-filter: blur(20px);
  border-radius: 16px;
  padding: 16px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
  max-width: 200px;
  z-index: 50;
}

.info-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
}

.info-header h4 {
  margin: 0;
  font-size: 16px;
  color: #2d3748;
}

.info-more-btn {
  width: 28px;
  height: 28px;
  border-radius: 14px;
  border: none;
  background: #f1f5f9;
  color: #718096;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  transition: all 0.2s ease;
  cursor: pointer;
}

.info-more-btn:active {
  background: #4361ee;
  color: white;
}

.audience-info-3d p {
  margin: 0;
  font-size: 14px;
  color: #718096;
}

/* Адаптация для разных размеров экранов */
@media (max-width: 360px) {
  .mobile-nav {
    padding: 0 12px;
  }
  
  .logo-text {
    font-size: 15px;
  }
  
  .modal-body {
    padding: 16px;
  }

  .corpus-buttons,
  .floor-buttons {
    padding: 8px;
  }
  
  .corpus-btn {
    width: 36px;
    height: 36px;
    font-size: 12px;
  }
  
  .floor-btn {
    min-width: 45px;
    padding: 6px 8px;
  }
  
  .gallery-grid {
    grid-template-columns: 1fr;
  }
  
  .menu-grid {
    grid-template-columns: 1fr;
  }
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
  
  .floor-selector-horizontal {
    bottom: max(20px, env(safe-area-inset-bottom) + 20px);
  }
  
  .floating-controls {
    bottom: max(100px, env(safe-area-inset-bottom) + 20px);
    right: max(20px, env(safe-area-inset-right) + 20px);
  }
  
  .bottom-panel {
    padding-bottom: env(safe-area-inset-bottom);
  }
  
  .modal-actions {
    padding-bottom: calc(16px + env(safe-area-inset-bottom));
  }
}

/* Улучшение touch-интерфейса */
button {
  min-height: 44px;
  min-width: 44px;
  -webkit-tap-highlight-color: transparent;
}

/* Оптимизация производительности */
@media (prefers-reduced-motion: reduce) {
  * {
    transition: none !important;
    animation: none !important;
  }
}

/* Темная тема поддержка */
@media (prefers-color-scheme: dark) {
  .mobile-container {
    background: #1a202c;
  }
  
  .mobile-nav {
    background: rgba(26, 32, 44, 0.98);
    border-bottom-color: rgba(255, 255, 255, 0.08);
  }
  
  .burger-menu span {
    background: #e2e8f0;
  }
  
  .nav-action-btn {
    background: #2d3748;
    color: #e2e8f0;
  }
  
  .logo-text {
    color: #e2e8f0;
  }
}
</style>
