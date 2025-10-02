<template>
  <div class="admin-container">
    <header class="admin-header">
      <h1>Панель администрирования</h1>
      <nav>
        <router-link to="/">На главную</router-link>
        <button @click="logout">Выйти</button>
      </nav>
    </header>

    <div class="admin-content">
      <aside class="admin-sidebar">
        <ul>
          <li @click="activeTab = 'users'" :class="{ active: activeTab === 'users' }">
            Пользователи
          </li>
          <li @click="activeTab = 'teachers'" :class="{ active: activeTab === 'teachers' }">
            Преподаватели
          </li>
          <li @click="activeTab = 'groups'" :class="{ active: activeTab === 'groups' }">
            Группы
          </li>
          <li @click="activeTab = 'audiences'" :class="{ active: activeTab === 'audiences' }">
            Аудитории
          </li>
          <li @click="activeTab = 'lessons'" :class="{ active: activeTab === 'lessons' }">
            Учебные предметы
          </li>
          <li @click="activeTab = 'schedule'" :class="{ active: activeTab === 'schedule' }">
            Расписание
          </li>
          <!-- Новые вкладки для территории -->
          <li @click="activeTab = 'buildings'" :class="{ active: activeTab === 'buildings' }">
            Здания территории
          </li>
          <li @click="activeTab = 'landmarks'" :class="{ active: activeTab === 'landmarks' }">
            Памятники и объекты
          </li>
          <li @click="activeTab = 'sport-schedule'" :class="{ active: activeTab === 'sport-schedule' }">
            Спортивное расписание
          </li>
        </ul>
      </aside>

      <main class="admin-main">
        <!-- Users Section -->
        <section v-if="activeTab === 'users'" class="admin-section">
          <h2>Users Management</h2>
          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Created At</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="user in users" :key="user.id">
                <td>{{ user.id }}</td>
                <td>{{ user.username }}</td>
                <td>{{ user.email }}</td>
                <td>
                  <select v-model="user.role" @change="updateUserRole(user)">
                    <option value="user">User</option>
                    <option value="admin">Admin</option>
                  </select>
                </td>
                <td>{{ formatDate(user.created_at) }}</td>
                <td>
                  <button @click="deleteItem('users', user.id)" class="danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Teachers Section -->
        <section v-if="activeTab === 'teachers'" class="admin-section">
          <h2>Teachers</h2>
          <button @click="showTeacherForm = true">Add Teacher</button>
          
          <div v-if="showTeacherForm" class="admin-form">
            <h3>Add New Teacher</h3>
            <form @submit.prevent="addTeacher">
              <div class="form-group">
                <label>First Name:</label>
                <input v-model="newTeacher.name" required>
              </div>
              <div class="form-group">
                <label>Last Name:</label>
                <input v-model="newTeacher.surname" required>
              </div>
              <div class="form-group">
                <label>Patronymic:</label>
                <input v-model="newTeacher.patronymic">
              </div>
              <div class="form-group">
                <label>Position:</label>
                <input v-model="newTeacher.post" required>
              </div>
              <button type="submit">Save</button>
              <button type="button" @click="showTeacherForm = false">Cancel</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Name</th>
                <th>Surname</th>
                <th>Patronymic</th>
                <th>Position</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="teacher in teachers" :key="teacher.id">
                <td>{{ teacher.id }}</td>
                <td>{{ teacher.name }}</td>
                <td>{{ teacher.surname }}</td>
                <td>{{ teacher.patronymic || '-' }}</td>
                <td>{{ teacher.post }}</td>
                <td>
                  <router-link :to="`/admin/edit/teachers/${teacher.id}`">Edit</router-link>
                  <button @click="deleteItem('teachers', teacher.id)" class="danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Groups Section -->
        <section v-if="activeTab === 'groups'" class="admin-section">
          <h2>Groups</h2>
          <button @click="showGroupForm = true">Add Group</button>
          
          <div v-if="showGroupForm" class="admin-form">
            <h3>Add New Group</h3>
            <form @submit.prevent="addGroup">
              <div class="form-group">
                <label>Group Name:</label>
                <input v-model="newGroup.name_group" required>
              </div>
              <button type="submit">Save</button>
              <button type="button" @click="showGroupForm = false">Cancel</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Group Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="group in groups" :key="group.id">
                <td>{{ group.id }}</td>
                <td>{{ group.name_group }}</td>
                <td>
                  <router-link :to="`/admin/edit/groups/${group.id}`">Edit</router-link>
                  <button @click="deleteItem('groups', group.id)" class="danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Audiences Section -->
        <section v-if="activeTab === 'audiences'" class="admin-section">
          <h2>Audiences</h2>
          <button @click="showAudienceForm = true">Add Audience</button>
          
          <div v-if="showAudienceForm" class="admin-form">
            <h3>Add New Audience</h3>
            <form @submit.prevent="addAudience">
              <div class="form-group">
                <label>Audience Number:</label>
                <input v-model="newAudience.num_audiences" required>
              </div>
              <div class="form-group">
                <label>Corpus:</label>
                <input v-model="newAudience.corpus" required>
              </div>
              <div class="form-group">
                <label>Floor:</label>
                <input v-model="newAudience.floor" type="number" required>
              </div>
              <div class="form-group">
                <label>Description:</label>
                <textarea v-model="newAudience.description"></textarea>
              </div>
              <div class="form-group">
                <label>Type:</label>
                <select v-model="newAudience.audience_type">
                  <option value="lecture">Лекционный Зал</option>
                  <option value="lab">Лаборатория</option>
                  <option value="study">Учебный кабинет</option>
                  <option value="computer">Компьютерный класс</option>
                  <option value="conference">Конференц-зал</option>
                  <option value="toilet">Туалет</option>
                  <option value="cafe">Буфет</option>
                  <option value="library">Библиотека</option>
                  <option value="cabinet">Кабинет</option>
                  <option value="other">Другое</option>
                </select>
              </div>
              <div class="form-group">
                <label>X Coordinate:</label>
                <input v-model="newAudience.x" type="number" step="0.01" required>
              </div>
              <div class="form-group">
                <label>Y Coordinate:</label>
                <input v-model="newAudience.y" type="number" step="0.01" required>
              </div>
              <div class="form-group">
                <label>Width:</label>
                <input v-model="newAudience.width" type="number" step="0.01" required>
              </div>
              <div class="form-group">
                <label>Height:</label>
                <input v-model="newAudience.height" type="number" step="0.01" required>
              </div>
              <button type="submit">Save</button>
              <button type="button" @click="showAudienceForm = false">Cancel</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Number</th>
                <th>Corpus</th>
                <th>Floor</th>
                <th>Type</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="audience in audiences" :key="audience.id">
                <td>{{ audience.id }}</td>
                <td>{{ audience.num_audiences }}</td>
                <td>{{ audience.corpus }}</td>
                <td>{{ audience.floor }}</td>
                <td>{{ audience.audience_type }}</td>
                <td>
                  <router-link :to="`/admin/edit/audiences/${audience.id}`">Edit</router-link>
                  <button @click="deleteItem('audiences', audience.id)" class="danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Lessons Section -->
        <section v-if="activeTab === 'lessons'" class="admin-section">
          <h2>Lessons</h2>
          <button @click="showLessonForm = true">Add Lesson</button>
          
          <div v-if="showLessonForm" class="admin-form">
            <h3>Add New Lesson</h3>
            <form @submit.prevent="addLesson">
              <div class="form-group">
                <label>Lesson Name:</label>
                <input v-model="newLesson.name_lesson" required>
              </div>
              <button type="submit">Save</button>
              <button type="button" @click="showLessonForm = false">Cancel</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lesson Name</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="lesson in lessons" :key="lesson.id">
                <td>{{ lesson.id }}</td>
                <td>{{ lesson.name_lesson }}</td>
                <td>
                  <router-link :to="`/admin/edit/lessons/${lesson.id}`">Edit</router-link>
                  <button @click="deleteItem('lessons', lesson.id)" class="danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Schedule Section -->
        <section v-if="activeTab === 'schedule'" class="admin-section">
          <h2>Schedule</h2>
          <button @click="showScheduleForm = true">Add Schedule</button>
          
          <div v-if="showScheduleForm" class="admin-form">
            <h3>Add New Schedule</h3>
            <form @submit.prevent="addSchedule">
              <div class="form-group">
                <label>Lesson:</label>
                <select v-model="newSchedule.lesson_id" required>
                  <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
                    {{ lesson.name_lesson }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Teacher:</label>
                <select v-model="newSchedule.teacher_id" required>
                  <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                    {{ teacher.surname }} {{ teacher.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Group:</label>
                <select v-model="newSchedule.group_id" required>
                  <option v-for="group in groups" :key="group.id" :value="group.id">
                    {{ group.name_group }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Audience:</label>
                <select v-model="newSchedule.audience_id">
                  <option :value="null">None</option>
                  <option v-for="audience in audiences" :key="audience.id" :value="audience.id">
                    {{ audience.num_audiences }} ({{ audience.corpus }})
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Start Time:</label>
                <input v-model="newSchedule.time_start" type="time" required>
              </div>
              <div class="form-group">
                <label>End Time:</label>
                <input v-model="newSchedule.time_over" type="time" required>
              </div>
              <div class="form-group">
                <label>Day of Week:</label>
                <select v-model="newSchedule.day_week" required>
                  <option value="Monday">Monday</option>
                  <option value="Tuesday">Tuesday</option>
                  <option value="Wednesday">Wednesday</option>
                  <option value="Thursday">Thursday</option>
                  <option value="Friday">Friday</option>
                  <option value="Saturday">Saturday</option>
                  <option value="Sunday">Sunday</option>
                </select>
              </div>
              <button type="submit">Save</button>
              <button type="button" @click="showScheduleForm = false">Cancel</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Lesson</th>
                <th>Teacher</th>
                <th>Group</th>
                <th>Audience</th>
                <th>Time</th>
                <th>Day</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in schedule" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ item.name_lesson }}</td>
                <td>{{ item.surname }} {{ item.name }}</td>
                <td>{{ item.name_group }}</td>
                <td>{{ item.num_audiences || '-' }}</td>
                <td>{{ item.time_start }} - {{ item.time_over }}</td>
                <td>{{ item.day_week }}</td>
                <td>
                  <router-link :to="`/admin/edit/schedule/${item.id}`">Edit</router-link>
                  <button @click="deleteItem('schedule', item.id)" class="danger">Delete</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      <!-- Buildings Section -->
        <section v-if="activeTab === 'buildings'" class="admin-section">
          <h2>Здания территории университета</h2>
          <button @click="showBuildingForm = true">Добавить здание</button>
          
          <div v-if="showBuildingForm" class="admin-form">
            <h3>{{ editingBuilding ? 'Редактировать' : 'Добавить' }} здание</h3>
            <form @submit.prevent="saveBuilding">
              <div class="form-group">
                <label>Название:</label>
                <input v-model="currentBuilding.name" required>
              </div>
              <div class="form-group">
                <label>Тип:</label>
                <select v-model="currentBuilding.type" required>
                  <option value="academic">Учебный корпус</option>
                  <option value="sport">Спортивный объект</option>
                  <option value="admin">Административное здание</option>
                  <option value="dormitory">Общежитие</option>
                  <option value="cafe">Столовая/Кафе</option>
                  <option value="library">Библиотека</option>
                </select>
              </div>
              <div class="form-group">
                <label>Корпус:</label>
                <input v-model="currentBuilding.corpus">
              </div>
              <div class="form-group">
                <label>Координата X:</label>
                <input v-model="currentBuilding.x" type="number" required>
              </div>
              <div class="form-group">
                <label>Координата Y:</label>
                <input v-model="currentBuilding.y" type="number" required>
              </div>
              <div class="form-group">
                <label>Ширина:</label>
                <input v-model="currentBuilding.width" type="number" required>
              </div>
              <div class="form-group">
                <label>Высота:</label>
                <input v-model="currentBuilding.height" type="number" required>
              </div>
              <div class="form-group">
                <label>Описание:</label>
                <textarea v-model="currentBuilding.description"></textarea>
              </div>
              <div class="form-group">
                <label>Изображения (через запятую):</label>
                <textarea v-model="currentBuilding.imagesInput" 
                          placeholder="/img/buildings/image1.jpg, /img/buildings/image2.jpg"></textarea>
              </div>
              <button type="submit">Сохранить</button>
              <button type="button" @click="cancelBuildingForm">Отмена</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Тип</th>
                <th>Корпус</th>
                <th>Координаты</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="building in buildings" :key="building.id">
                <td>{{ building.id }}</td>
                <td>{{ building.name }}</td>
                <td>{{ getBuildingTypeName(building.type) }}</td>
                <td>{{ building.corpus || '-' }}</td>
                <td>({{ building.x }}, {{ building.y }})</td>
                <td>
                  <button @click="editBuilding(building)">Редактировать</button>
                  <button @click="deleteItem('buildings', building.id)" class="danger">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Landmarks Section -->
        <section v-if="activeTab === 'landmarks'" class="admin-section">
          <h2>Памятники и объекты территории</h2>
          <button @click="showLandmarkForm = true">Добавить объект</button>
          
          <div v-if="showLandmarkForm" class="admin-form">
            <h3>{{ editingLandmark ? 'Редактировать' : 'Добавить' }} объект</h3>
            <form @submit.prevent="saveLandmark">
              <div class="form-group">
                <label>Название:</label>
                <input v-model="currentLandmark.name" required>
              </div>
              <div class="form-group">
                <label>Тип:</label>
                <select v-model="currentLandmark.type" required>
                  <option value="monument">Памятник</option>
                  <option value="sculpture">Скульптура</option>
                  <option value="fountain">Фонтан</option>
                  <option value="garden">Сад</option>
                  <option value="art">Арт-объект</option>
                  <option value="sport">Спортивный объект</option>
                </select>
              </div>
              <div class="form-group">
                <label>Координата X:</label>
                <input v-model="currentLandmark.x" type="number" required>
              </div>
              <div class="form-group">
                <label>Координата Y:</label>
                <input v-model="currentLandmark.y" type="number" required>
              </div>
              <div class="form-group">
                <label>Радиус:</label>
                <input v-model="currentLandmark.radius" type="number" default="15">
              </div>
              <div class="form-group">
                <label>Год установки:</label>
                <input v-model="currentLandmark.year" type="number">
              </div>
              <div class="form-group">
                <label>Описание:</label>
                <textarea v-model="currentLandmark.description"></textarea>
              </div>
              <div class="form-group">
                <label>Изображения (через запятую):</label>
                <textarea v-model="currentLandmark.imagesInput" 
                          placeholder="/img/landmarks/image1.jpg, /img/landmarks/image2.jpg"></textarea>
              </div>
              <button type="submit">Сохранить</button>
              <button type="button" @click="cancelLandmarkForm">Отмена</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Название</th>
                <th>Тип</th>
                <th>Координаты</th>
                <th>Год</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="landmark in landmarks" :key="landmark.id">
                <td>{{ landmark.id }}</td>
                <td>{{ landmark.name }}</td>
                <td>{{ getLandmarkTypeName(landmark.type) }}</td>
                <td>({{ landmark.x }}, {{ landmark.y }})</td>
                <td>{{ landmark.year || '-' }}</td>
                <td>
                  <button @click="editLandmark(landmark)">Редактировать</button>
                  <button @click="deleteItem('landmarks', landmark.id)" class="danger">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>

        <!-- Sport Schedule Section -->
        <section v-if="activeTab === 'sport-schedule'" class="admin-section">
          <h2>Спортивное расписание</h2>
          <button @click="showSportScheduleForm = true">Добавить расписание</button>
          
          <div v-if="showSportScheduleForm" class="admin-form">
            <h3>{{ editingSportSchedule ? 'Редактировать' : 'Добавить' }} расписание</h3>
            <form @submit.prevent="saveSportSchedule">
              <div class="form-group">
                <label>Здание:</label>
                <select v-model="currentSportSchedule.building_id" required>
                  <option v-for="building in sportBuildings" :key="building.id" :value="building.id">
                    {{ building.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label>Вид спорта:</label>
                <input v-model="currentSportSchedule.sport_type" required>
              </div>
              <div class="form-group">
                <label>Тренер:</label>
                <input v-model="currentSportSchedule.coach" required>
              </div>
              <div class="form-group">
                <label>Группа:</label>
                <input v-model="currentSportSchedule.group_name" required>
              </div>
              <div class="form-group">
                <label>День недели:</label>
                <select v-model="currentSportSchedule.day_week" required>
                  <option value="Понедельник">Понедельник</option>
                  <option value="Вторник">Вторник</option>
                  <option value="Среда">Среда</option>
                  <option value="Четверг">Четверг</option>
                  <option value="Пятница">Пятница</option>
                  <option value="Суббота">Суббота</option>
                  <option value="Воскресенье">Воскресенье</option>
                </select>
              </div>
              <div class="form-group">
                <label>Время начала:</label>
                <input v-model="currentSportSchedule.time_start" type="time" required>
              </div>
              <div class="form-group">
                <label>Время окончания:</label>
                <input v-model="currentSportSchedule.time_over" type="time" required>
              </div>
              <button type="submit">Сохранить</button>
              <button type="button" @click="cancelSportScheduleForm">Отмена</button>
            </form>
          </div>

          <table class="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Здание</th>
                <th>Вид спорта</th>
                <th>Тренер</th>
                <th>Группа</th>
                <th>День</th>
                <th>Время</th>
                <th>Действия</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="item in sportSchedule" :key="item.id">
                <td>{{ item.id }}</td>
                <td>{{ getBuildingName(item.building_id) }}</td>
                <td>{{ item.sport_type }}</td>
                <td>{{ item.coach }}</td>
                <td>{{ item.group_name }}</td>
                <td>{{ item.day_week }}</td>
                <td>{{ item.time_start }} - {{ item.time_over }}</td>
                <td>
                  <button @click="editSportSchedule(item)">Редактировать</button>
                  <button @click="deleteItem('sport-schedule', item.id)" class="danger">Удалить</button>
                </td>
              </tr>
            </tbody>
          </table>
        </section>
      </main>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'AdminView',
  setup() {
    const router = useRouter();
    const activeTab = ref('users');
    
    // Data arrays
    const users = ref([]);
    const teachers = ref([]);
    const groups = ref([]);
    const audiences = ref([]);
    const lessons = ref([]);
    const schedule = ref([]);
    const buildings = ref([]);
    const landmarks = ref([]);
    const sportSchedule = ref([]);
    
    // Form states
    const showBuildingForm = ref(false);
    const showLandmarkForm = ref(false);
    const showSportScheduleForm = ref(false);
    const editingBuilding = ref(false);
    const editingLandmark = ref(false);
    const editingSportSchedule = ref(false);
    
    // Current item objects
    const currentBuilding = ref({
      id: null,
      name: '',
      type: 'academic',
      corpus: '',
      x: 0,
      y: 0,
      width: 100,
      height: 100,
      description: '',
      imagesInput: ''
    });
    
    const currentLandmark = ref({
      id: null,
      name: '',
      type: 'monument',
      x: 0,
      y: 0,
      radius: 15,
      year: null,
      description: '',
      imagesInput: ''
    });
    
    const currentSportSchedule = ref({
      id: null,
      building_id: '',
      sport_type: '',
      coach: '',
      group_name: '',
      day_week: 'Понедельник',
      time_start: '',
      time_over: ''
    });

    // Computed
    const sportBuildings = computed(() => {
      return buildings.value.filter(b => b.type === 'sport');
    });

    // Methods
    const getBuildingTypeName = (type) => {
      const types = {
        'academic': 'Учебный корпус',
        'sport': 'Спортивный объект',
        'admin': 'Административное',
        'dormitory': 'Общежитие',
        'cafe': 'Столовая/Кафе',
        'library': 'Библиотека'
      };
      return types[type] || type;
    };

    const getLandmarkTypeName = (type) => {
      const types = {
        'monument': 'Памятник',
        'sculpture': 'Скульптура',
        'fountain': 'Фонтан',
        'garden': 'Сад',
        'art': 'Арт-объект',
        'sport': 'Спортивный объект'
      };
      return types[type] || type;
    };

    const getBuildingName = (buildingId) => {
      const building = buildings.value.find(b => b.id === buildingId);
      return building ? building.name : 'Неизвестно';
    };

    // Fetch all data
    const fetchAllData = async () => {
      try {
        const [
          usersRes, teachersRes, groupsRes, audiencesRes, 
          lessonsRes, scheduleRes, buildingsRes, landmarksRes, sportScheduleRes
        ] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/teachers'),
          axios.get('/api/groups'),
          axios.get('/api/audiences'),
          axios.get('/api/lessons'),
          axios.get('/api/admin/schedule'),
          axios.get('/api/admin/buildings'),
          axios.get('/api/admin/landmarks'),
          axios.get('/api/admin/sport-schedule')
        ]);
        
        users.value = usersRes.data;
        teachers.value = teachersRes.data;
        groups.value = groupsRes.data;
        audiences.value = audiencesRes.data;
        lessons.value = lessonsRes.data;
        schedule.value = scheduleRes.data;
        buildings.value = buildingsRes.data;
        landmarks.value = landmarksRes.data;
        sportSchedule.value = sportScheduleRes.data;
      } catch (err) {
        console.error('Failed to fetch data:', err);
      }
    };

    // Building methods
    const editBuilding = (building) => {
      currentBuilding.value = {
        ...building,
        imagesInput: building.images ? building.images.join(', ') : ''
      };
      editingBuilding.value = true;
      showBuildingForm.value = true;
    };

    const saveBuilding = async () => {
      try {
        const buildingData = {
          ...currentBuilding.value,
          images: currentBuilding.value.imagesInput 
            ? currentBuilding.value.imagesInput.split(',').map(img => img.trim()).filter(img => img)
            : []
        };

        if (editingBuilding.value) {
          await axios.put(`/api/admin/buildings/${currentBuilding.value.id}`, buildingData);
        } else {
          await axios.post('/api/admin/buildings', buildingData);
        }
        
        cancelBuildingForm();
        await fetchAllData();
      } catch (err) {
        console.error('Failed to save building:', err);
      }
    };

    const cancelBuildingForm = () => {
      showBuildingForm.value = false;
      editingBuilding.value = false;
      currentBuilding.value = {
        id: null,
        name: '',
        type: 'academic',
        corpus: '',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        description: '',
        imagesInput: ''
      };
    };

    // Landmark methods
    const editLandmark = (landmark) => {
      currentLandmark.value = {
        ...landmark,
        imagesInput: landmark.images ? landmark.images.join(', ') : ''
      };
      editingLandmark.value = true;
      showLandmarkForm.value = true;
    };

    const saveLandmark = async () => {
      try {
        const landmarkData = {
          ...currentLandmark.value,
          images: currentLandmark.value.imagesInput 
            ? currentLandmark.value.imagesInput.split(',').map(img => img.trim()).filter(img => img)
            : []
        };

        if (editingLandmark.value) {
          await axios.put(`/api/admin/landmarks/${currentLandmark.value.id}`, landmarkData);
        } else {
          await axios.post('/api/admin/landmarks', landmarkData);
        }
        
        cancelLandmarkForm();
        await fetchAllData();
      } catch (err) {
        console.error('Failed to save landmark:', err);
      }
    };

    const cancelLandmarkForm = () => {
      showLandmarkForm.value = false;
      editingLandmark.value = false;
      currentLandmark.value = {
        id: null,
        name: '',
        type: 'monument',
        x: 0,
        y: 0,
        radius: 15,
        year: null,
        description: '',
        imagesInput: ''
      };
    };

    // Sport Schedule methods
    const editSportSchedule = (item) => {
      currentSportSchedule.value = { ...item };
      editingSportSchedule.value = true;
      showSportScheduleForm.value = true;
    };

    const saveSportSchedule = async () => {
      try {
        if (editingSportSchedule.value) {
          await axios.put(`/api/admin/sport-schedule/${currentSportSchedule.value.id}`, currentSportSchedule.value);
        } else {
          await axios.post('/api/admin/sport-schedule', currentSportSchedule.value);
        }
        
        cancelSportScheduleForm();
        await fetchAllData();
      } catch (err) {
        console.error('Failed to save sport schedule:', err);
      }
    };

    const cancelSportScheduleForm = () => {
      showSportScheduleForm.value = false;
      editingSportSchedule.value = false;
      currentSportSchedule.value = {
        id: null,
        building_id: '',
        sport_type: '',
        coach: '',
        group_name: '',
        day_week: 'Понедельник',
        time_start: '',
        time_over: ''
      };
    };

    // Delete method
    const deleteItem = async (type, id) => {
      if (confirm(`Вы уверены, что хотите удалить этот ${type}?`)) {
        try {
          const endpoint = `/api/admin/${type}/${id}`;
          await axios.delete(endpoint);
          await fetchAllData();
        } catch (err) {
          console.error(`Failed to delete ${type}:`, err);
        }
      }
    };

    // Check admin status on mount
    onMounted(() => {
      const user = JSON.parse(localStorage.getItem('user'));
      if (!user || user.role !== 'admin') {
        router.push('/');
      }
      fetchAllData();
    });

    return {
      activeTab,
      users,
      teachers,
      groups,
      audiences,
      lessons,
      schedule,
      buildings,
      landmarks,
      sportSchedule,
      sportBuildings,
      showBuildingForm,
      showLandmarkForm,
      showSportScheduleForm,
      currentBuilding,
      currentLandmark,
      currentSportSchedule,
      getBuildingTypeName,
      getLandmarkTypeName,
      getBuildingName,
      editBuilding,
      saveBuilding,
      cancelBuildingForm,
      editLandmark,
      saveLandmark,
      cancelLandmarkForm,
      editSportSchedule,
      saveSportSchedule,
      cancelSportScheduleForm,
      deleteItem
    };
  }
};
</script>

<style scoped>
.admin-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

.admin-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  background-color: #2c3e50;
  color: white;
}

.admin-header nav {
  display: flex;
  gap: 1rem;
}

.admin-header a {
  color: white;
  text-decoration: none;
}

.admin-header button {
  background-color: #e74c3c;
  color: white;
  border: none;
  padding: 0.5rem 1rem;
  border-radius: 4px;
  cursor: pointer;
}

.admin-content {
  display: flex;
  flex: 1;
}

.admin-sidebar {
  width: 200px;
  background-color: #34495e;
  color: white;
  padding: 1rem;
}

.admin-sidebar ul {
  list-style: none;
  padding: 0;
}

.admin-sidebar li {
  padding: 0.75rem;
  cursor: pointer;
  margin-bottom: 0.25rem;
  border-radius: 4px;
}

.admin-sidebar li:hover,
.admin-sidebar li.active {
  background-color: #2c3e50;
}

.admin-main {
  flex: 1;
  padding: 1rem;
  overflow-x: auto;
}

.admin-section {
  margin-bottom: 2rem;
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

.admin-table th,
.admin-table td {
  border: 1px solid #ddd;
  padding: 8px;
  text-align: left;
}

.admin-table th {
  background-color: #f2f2f2;
}

.admin-table tr:nth-child(even) {
  background-color: #f9f9f9;
}

.admin-table tr:hover {
  background-color: #f1f1f1;
}

.admin-form {
  background-color: #f9f9f9;
  padding: 1rem;
  margin-bottom: 1rem;
  border-radius: 4px;
  border: 1px solid #ddd;
}

.form-group {
  margin-bottom: 1rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 0.5rem 1rem;
  margin-right: 0.5rem;
  cursor: pointer;
  border: none;
  border-radius: 4px;
  background-color: #2c3e50;
  color: white;
}

button.danger {
  background-color: #e74c3c;
}

button[type="button"] {
  background-color: #95a5a6;
}

a {
  color: #3498db;
  text-decoration: none;
  margin-right: 0.5rem;
}

a:hover {
  text-decoration: underline;
}

select {
  padding: 0.5rem;
  border-radius: 4px;
  border: 1px solid #ddd;
  background-color: white;
}

input[type="time"] {
  padding: 0.5rem;
}

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
}
</style>