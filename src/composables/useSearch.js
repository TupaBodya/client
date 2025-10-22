import { ref, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { debounce } from 'lodash-es';
import axios from 'axios';
import { useErrorHandler } from './useErrorHandler';
import { useAnalytics } from './useAnalytics';
import { API_CONFIG } from '@/config';

export function useSearch() {
  const router = useRouter();
  const { handleError } = useErrorHandler();
  const { trackEvent } = useAnalytics();

  // Состояния
  const searchResults = ref([]);
  const searchHistory = ref([]);
  const quickSearch = ref('');
  const quickResults = ref([]);
  const loading = ref(false);

  // Computed
  const hasSearchResults = computed(() => searchResults.value.length > 0);
  const hasQuickResults = computed(() => quickResults.value.length > 0);

  // Методы поиска
  const performSearch = async (type, query, options = {}) => {
    if (!query.trim()) {
      searchResults.value = [];
      return;
    }

    loading.value = true;
    trackEvent('search_performed', { type, query });

    try {
      let endpoint = '';
      const params = {};

      switch (type) {
        case 'audience':
          endpoint = '/api/audiences/search';
          params.q = query;
          break;
        case 'group':
          endpoint = `/api/schedule/group/${encodeURIComponent(query)}`;
          break;
        case 'teacher':
          endpoint = `/api/schedule/teacher/${encodeURIComponent(query)}`;
          break;
        default:
          throw new Error(`Unknown search type: ${type}`);
      }

      const response = await axios.get(endpoint, { 
        params,
        timeout: API_CONFIG.TIMEOUT 
      });

      searchResults.value = response.data;
      
      // Сохранение в историю
      if (options.saveToHistory !== false) {
        await saveToSearchHistory(type, query, response.data.length);
      }

      trackEvent('search_completed', { 
        type, 
        query, 
        results: response.data.length 
      });

    } catch (error) {
      handleError(error, `search_${type}`);
      searchResults.value = [];
    } finally {
      loading.value = false;
    }
  };

  // Быстрый поиск
  const handleQuickSearch = debounce(async () => {
    const query = quickSearch.value.trim();
    if (query.length < 2) {
      quickResults.value = [];
      return;
    }

    try {
      const response = await axios.get('/api/audiences/search', {
        params: { q: query, limit: 5 },
        timeout: API_CONFIG.TIMEOUT
      });

      quickResults.value = response.data;
      trackEvent('quick_search', { query, results: response.data.length });
    } catch (error) {
      handleError(error, 'quick_search');
      quickResults.value = [];
    }
  }, 300);

  // Навигация к аудитории
  const goToAudience = (audience) => {
    trackEvent('audience_navigation', { 
      audienceId: audience.id, 
      audienceNumber: audience.num_audiences 
    });

    // Закрываем быстрый поиск
    quickSearch.value = '';
    quickResults.value = [];

    // Переходим к аудитории
    if (window.$vm) {
      window.$vm.selectCorpus(audience.corpus);
      window.$vm.selectFloor(audience.floor);
      window.$vm.highlightAudience(audience.id);
      window.$vm.openModal(audience);
    }
  };

  // История поиска
  const loadSearchHistory = async () => {
    try {
      const response = await axios.get('/api/profile/search-history', {
        timeout: API_CONFIG.TIMEOUT
      });
      searchHistory.value = response.data;
    } catch (error) {
      handleError(error, 'load_search_history');
      searchHistory.value = [];
    }
  };

  const saveToSearchHistory = async (type, query, resultsCount = 0) => {
    try {
      await axios.post('/api/profile/search-history', {
        search_type: type,
        query: query.trim(),
        results_count: resultsCount
      });
      
      // Обновляем локальную историю
      await loadSearchHistory();
    } catch (error) {
      console.error('Error saving search history:', error);
    }
  };

  const clearSearchHistory = async () => {
    try {
      await axios.delete('/api/profile/search-history');
      searchHistory.value = [];
      trackEvent('search_history_cleared');
    } catch (error) {
      handleError(error, 'clear_search_history');
    }
  };

  const applySearchHistory = async (item) => {
    trackEvent('search_history_applied', {
      type: item.search_type,
      query: item.query
    });

    // Очищаем текущие результаты
    searchResults.value = [];
    quickSearch.value = '';

    // Выполняем поиск
    await performSearch(item.search_type, item.query, { saveToHistory: false });
  };

  // Watchers
  watch(quickSearch, (newVal) => {
    if (newVal.trim().length === 0) {
      quickResults.value = [];
    }
  });

  return {
    // Состояния
    searchResults,
    searchHistory,
    quickSearch,
    quickResults,
    loading,

    // Computed
    hasSearchResults,
    hasQuickResults,

    // Методы
    performSearch,
    handleQuickSearch,
    goToAudience,
    loadSearchHistory,
    saveToSearchHistory,
    clearSearchHistory,
    applySearchHistory
  };
}