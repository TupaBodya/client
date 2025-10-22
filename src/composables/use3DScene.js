import { ref, onUnmounted } from 'vue';
import * as THREE from 'three';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { useErrorHandler } from './useErrorHandler';
import { useAnalytics } from './useAnalytics';

export function use3DScene() {
  const { handleError } = useErrorHandler();
  const { trackEvent, trackPerformance } = useAnalytics();

  // Состояния
  const threeDScene = ref(null);
  const hoveredAudience3D = ref(null);
  const isLoadingFloor = ref(false);
  const loadProgress = ref(0);
  const isInitialized = ref(false);

  // Three.js переменные
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

  // LOD системы
  const lodSystems = new Map();
  const modelCache = new Map();

  // Инициализация сцены
  const init3DScene = () => {
    if (!threeDScene.value || isInitialized.value) return;

    const startTime = performance.now();

    try {
      // Scene
      scene = new THREE.Scene();
      scene.background = new THREE.Color(0xf0f8ff);

      // Camera с LOD настройками
      camera = new THREE.PerspectiveCamera(
        20, 
        threeDScene.value.clientWidth / threeDScene.value.clientHeight, 
        0.1, 
        1000
      );
      camera.position.set(0, 15, 20);

      // Renderer с оптимизациями
      renderer = new THREE.WebGLRenderer({ 
        antialias: true,
        alpha: true,
        powerPreference: "high-performance"
      });
      renderer.setSize(threeDScene.value.clientWidth, threeDScene.value.clientHeight);
      renderer.shadowMap.enabled = true;
      renderer.shadowMap.type = THREE.PCFSoftShadowMap;
      renderer.gammaOutput = true;
      renderer.gammaFactor = 2.2;

      // Очистка предыдущего содержимого
      threeDScene.value.innerHTML = '';
      threeDScene.value.appendChild(renderer.domElement);

      // Controls с ограничениями для производительности
      controls = new OrbitControls(camera, renderer.domElement);
      controls.enableDamping = true;
      controls.dampingFactor = 0.05;
      controls.minDistance = 4;
      controls.maxDistance = 25;
      controls.minPolarAngle = 0;
      controls.maxPolarAngle = Math.PI * 0.8;

      // Оптимизированное освещение
      setupOptimizedLighting();

      // Raycaster для взаимодействий
      raycaster = new THREE.Raycaster();

      // Обработчики событий
      setupEventListeners();

      // Запуск анимации
      animate();

      isInitialized.value = true;

      const loadTime = performance.now() - startTime;
      trackPerformance('3d_scene_initialized', loadTime);
      trackEvent('3d_scene_initialized');

    } catch (error) {
      handleError(error, 'init_3d_scene');
    }
  };

  // Оптимизированная система освещения
  const setupOptimizedLighting = () => {
    ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    directionalLight = new THREE.DirectionalLight(0xffffff, 1.2);
    directionalLight.position.set(15, 25, 15);
    directionalLight.castShadow = true;
    
    // Оптимизированные тени
    directionalLight.shadow.mapSize.width = 2048;
    directionalLight.shadow.mapSize.height = 2048;
    directionalLight.shadow.camera.near = 0.5;
    directionalLight.shadow.camera.far = 50;
    directionalLight.shadow.camera.left = -20;
    directionalLight.shadow.camera.right = 20;
    directionalLight.shadow.camera.top = 20;
    directionalLight.shadow.camera.bottom = -20;
    
    scene.add(directionalLight);

    // Дополнительное освещение с меньшей детализацией
    const fillLight = new THREE.DirectionalLight(0xffffff, 0.4);
    fillLight.position.set(-10, 10, -10);
    scene.add(fillLight);
  };

  // Загрузка этажа с оптимизациями
  const load3DFloor = async (corpus, floor) => {
    if (isLoadingFloor.value) return;

    isLoadingFloor.value = true;
    loadProgress.value = 0;

    const startTime = performance.now();

    try {
      // Очистка предыдущих моделей
      cleanupPreviousFloor();

      // Проверка кэша
      const cacheKey = `${corpus}_${floor}`;
      if (modelCache.has(cacheKey)) {
        const cachedModel = modelCache.get(cacheKey);
        scene.add(cachedModel);
        floorModel = cachedModel;
      } else {
        // Загрузка новой модели
        await loadNewFloorModel(corpus, floor, cacheKey);
      }

      // Создание объектов аудиторий
      await createOptimizedAudienceObjects(corpus, floor);

      const loadTime = performance.now() - startTime;
      trackPerformance('3d_floor_loaded', loadTime);
      trackEvent('3d_floor_loaded', { corpus, floor });

    } catch (error) {
      handleError(error, 'load_3d_floor');
      createFallbackFloor();
    } finally {
      isLoadingFloor.value = false;
      loadProgress.value = 100;
      setTimeout(() => { loadProgress.value = 0; }, 1000);
    }
  };

  // Оптимизированная загрузка моделей
  const loadNewFloorModel = (corpus, floor, cacheKey) => {
    return new Promise((resolve, reject) => {
      const loader = new FBXLoader();
      const modelPath = `/models/${corpus}corpus/floor${floor}.fbx`;

      loader.load(
        modelPath,
        (object) => {
          object.scale.set(0.1, 0.1, 0.1);
          object.position.y = 0;
          
          // Оптимизация геометрии
          object.traverse((child) => {
            if (child.isMesh) {
              child.geometry.computeVertexNormals();
              if (child.material) {
                child.material = optimizeMaterial(child.material);
              }
            }
          });

          scene.add(object);
          floorModel = object;
          
          // Кэширование
          modelCache.set(cacheKey, object);
          resolve(object);
        },
        (progress) => {
          if (progress.lengthComputable) {
            loadProgress.value = (progress.loaded / progress.total) * 100;
          }
        },
        (error) => {
          reject(error);
        }
      );
    });
  };

  // Оптимизация материалов
  const optimizeMaterial = (material) => {
    if (Array.isArray(material)) {
      return material.map(mat => optimizeSingleMaterial(mat));
    }
    return optimizeSingleMaterial(material);
  };

  const optimizeSingleMaterial = (material) => {
    const optimized = material.clone();
    
    // Упрощение материалов для производительности
    if (optimized.isMeshStandardMaterial) {
      optimized.roughness = 0.8;
      optimized.metalness = 0.2;
    }
    
    optimized.needsUpdate = true;
    return optimized;
  };

  // Создание оптимизированных объектов аудиторий
  const createOptimizedAudienceObjects = async (corpus, floor) => {
    try {
      const response = await fetch(`/api/audiences-3d/${corpus}/${floor}`);
      const audience3DData = await response.json();

      // Очистка предыдущих объектов
      cleanupAudienceObjects();

      // Создание объектов с LOD
      for (const audienceData of audience3DData) {
        await createAudienceWithLOD(audienceData);
      }

    } catch (error) {
      console.error('Error loading 3D coordinates:', error);
      createFallback3DAudiences();
    }
  };

  // Создание аудитории с LOD
  const createAudienceWithLOD = async (audienceData) => {
    const lod = new THREE.LOD();

    // Высокодетализированная модель (близко)
    const highDetail = createAudienceMesh(audienceData, 0x4361ee, 0.3);
    lod.addLevel(highDetail, 0);

    // Упрощенная модель (далеко)
    const lowDetail = createAudienceMesh(audienceData, 0x4361ee, 0.1);
    lod.addLevel(lowDetail, 10);

    // Позиционирование
    lod.position.set(
      audienceData.position_x,
      audienceData.position_y,
      audienceData.position_z
    );

    lod.userData = { audience: audienceData };
    scene.add(lod);
    audienceObjects.set(audienceData.audience_id, lod);
  };

  const createAudienceMesh = (audienceData, color, opacity) => {
    const geometry = new THREE.BoxGeometry(
      audienceData.scale_x || 1,
      audienceData.scale_y || 2,
      audienceData.scale_z || 1
    );

    const material = new THREE.MeshLambertMaterial({ 
      color: color,
      transparent: true,
      opacity: opacity
    });

    const mesh = new THREE.Mesh(geometry, material);
    mesh.castShadow = true;
    mesh.receiveShadow = true;

    return mesh;
  };

  // Анимация
  const animate = () => {
    animationFrameId = requestAnimationFrame(animate);

    if (controls) {
      controls.update();
    }

    // Обновление LOD
    updateLOD();

    if (renderer && scene && camera) {
      renderer.render(scene, camera);
    }
  };

  // Обновление LOD
  const updateLOD = () => {
    if (!camera) return;

    audienceObjects.forEach((object) => {
      if (object.isLOD) {
        object.update(camera);
      }
    });
  };

  // Очистка
  const cleanup3D = () => {
    if (animationFrameId) {
      cancelAnimationFrame(animationFrameId);
    }

    cleanupScene();
    cleanupEventListeners();

    audienceObjects.clear();
    modelCache.clear();
    lodSystems.clear();

    isInitialized.value = false;
  };

  const cleanupScene = () => {
    if (scene) {
      scene.traverse(disposeObject);
      scene.clear();
      scene = null;
    }

    if (renderer) {
      renderer.dispose();
      renderer.forceContextLoss();
      renderer = null;
    }

    if (controls) {
      controls.dispose();
      controls = null;
    }

    camera = null;
  };

  const disposeObject = (object) => {
    if (object.geometry) object.geometry.dispose();
    
    if (object.material) {
      if (Array.isArray(object.material)) {
        object.material.forEach(material => material.dispose());
      } else {
        object.material.dispose();
      }
    }
  };

  // Остальные методы (setupEventListeners, cleanupPreviousFloor, и т.д.)
  const setupEventListeners = () => {
    window.addEventListener('resize', onWindowResize);
    if (renderer) {
      renderer.domElement.addEventListener('mousemove', onMouseMove);
      renderer.domElement.addEventListener('click', onCanvasClick);
    }
  };

  const cleanupEventListeners = () => {
    window.removeEventListener('resize', onWindowResize);
    if (renderer && renderer.domElement) {
      renderer.domElement.removeEventListener('mousemove', onMouseMove);
      renderer.domElement.removeEventListener('click', onCanvasClick);
    }
  };

  const onWindowResize = () => {
    if (camera && renderer && threeDScene.value) {
      camera.aspect = threeDScene.value.clientWidth / threeDScene.value.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(threeDScene.value.clientWidth, threeDScene.value.clientHeight);
    }
  };

  const onMouseMove = (event) => {
    // Обработка перемещения мыши
  };

  const onCanvasClick = (event) => {
    // Обработка кликов
  };

  const cleanupPreviousFloor = () => {
    if (floorModel) {
      scene.remove(floorModel);
      disposeObject(floorModel);
      floorModel = null;
    }
    cleanupAudienceObjects();
  };

  const cleanupAudienceObjects = () => {
    audienceObjects.forEach((obj) => {
      scene.remove(obj);
      disposeObject(obj);
    });
    audienceObjects.clear();
  };

  const createFallbackFloor = () => {
    // Резервный пол
  };

  const createFallback3DAudiences = () => {
    // Резервные аудитории
  };

  // Публичные методы
  const optimize3DScene = () => {
    // Дополнительные оптимизации
    if (renderer) {
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
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

  return {
    // Состояния
    threeDScene,
    hoveredAudience3D,
    isLoadingFloor,
    loadProgress,

    // Методы
    init3DScene,
    load3DFloor,
    cleanup3D,
    optimize3DScene,
    reset3DView,
    toggleGrid,
    toggleLights
  };
}