<template>
  <div class="main-container" :class="theme">
    <nav class="top-nav glassmorphism">
      <div class="logo">
        <i><img src="/img/logo.jpg" class="logo_img"></i>
        <span>Панель администрирования</span>
      </div>
      <div class="nav-buttons">
        <button @click="goToMain" class="nav-btn">
          <i class="fas fa-home"></i>
          <span class="btn-text">На главную</span>
        </button>
      </div>
      <div class="user-actions">
        <button @click="logout" class="logout-btn gradient-btn">
          <i class="fas fa-sign-out-alt"></i>
          <span>Выйти</span>
        </button>
      </div>
    </nav>

    <div class="admin-content">
      <aside class="admin-sidebar glassmorphism">
        <ul>
          <li 
            v-for="tab in tabs" 
            :key="tab.id"
            @click="activeTab = tab.id" 
            :class="{ active: activeTab === tab.id }"
            class="sidebar-item"
          >
            <i :class="tab.icon"></i>
            <span>{{ tab.name }}</span>
          </li>
        </ul>
      </aside>

      <main class="admin-main">
        <!-- Users Section -->
        <section v-if="activeTab === 'users'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-users"></i> Управление пользователями</h2>
            <div class="section-actions">
              <button class="refresh-btn" @click="fetchAllData" title="Обновить">
                <i class="fas fa-sync-alt"></i>
              </button>
            </div>
          </div>
          
          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('users', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('users', 'id')"></i>
                  </th>
                  <th @click="sortTable('users', 'username')" class="sortable">
                    Имя пользователя
                    <i class="sort-icon" :class="getSortIcon('users', 'username')"></i>
                  </th>
                  <th @click="sortTable('users', 'email')" class="sortable">
                    Email
                    <i class="sort-icon" :class="getSortIcon('users', 'email')"></i>
                  </th>
                  <th @click="sortTable('users', 'role')" class="sortable">
                    Роль
                    <i class="sort-icon" :class="getSortIcon('users', 'role')"></i>
                  </th>
                  <th @click="sortTable('users', 'created_at')" class="sortable">
                    Дата регистрации
                    <i class="sort-icon" :class="getSortIcon('users', 'created_at')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="user in sortedUsers" :key="user.id">
                  <td>{{ user.id }}</td>
                  <td>{{ user.username }}</td>
                  <td>{{ user.email }}</td>
                  <td>
                    <select v-model="user.role" @change="updateUserRole(user)" class="role-select">
                      <option value="user">Пользователь</option>
                      <option value="admin">Администратор</option>
                    </select>
                  </td>
                  <td>{{ formatDate(user.created_at) }}</td>
                  <td>
                    <button @click="deleteItem('users', user.id)" class="danger-btn">
                      <i class="fas fa-trash"></i> Удалить
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Teachers Section -->
        <section v-if="activeTab === 'teachers'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-chalkboard-teacher"></i> Преподаватели</h2>
            <button @click="showTeacherForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить преподавателя
            </button>
          </div>

          <div v-if="showTeacherForm" class="admin-form glassmorphism">
            <h3>Добавить нового преподавателя</h3>
            <form @submit.prevent="addTeacher">
              <div class="form-row">
                <div class="form-group">
                  <label>Имя:</label>
                  <input v-model="newTeacher.name" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Фамилия:</label>
                  <input v-model="newTeacher.surname" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Отчество:</label>
                  <input v-model="newTeacher.patronymic" class="form-input">
                </div>
                <div class="form-group">
                  <label>Должность:</label>
                  <input v-model="newTeacher.post" required class="form-input">
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">Сохранить</button>
                <button type="button" @click="cancelTeacherForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('teachers', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('teachers', 'id')"></i>
                  </th>
                  <th @click="sortTable('teachers', 'surname')" class="sortable">
                    Фамилия
                    <i class="sort-icon" :class="getSortIcon('teachers', 'surname')"></i>
                  </th>
                  <th @click="sortTable('teachers', 'name')" class="sortable">
                    Имя
                    <i class="sort-icon" :class="getSortIcon('teachers', 'name')"></i>
                  </th>
                  <th @click="sortTable('teachers', 'patronymic')" class="sortable">
                    Отчество
                    <i class="sort-icon" :class="getSortIcon('teachers', 'patronymic')"></i>
                  </th>
                  <th @click="sortTable('teachers', 'post')" class="sortable">
                    Должность
                    <i class="sort-icon" :class="getSortIcon('teachers', 'post')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="teacher in sortedTeachers" :key="teacher.id">
                  <td>{{ teacher.id }}</td>
                  <td>{{ teacher.surname }}</td>
                  <td>{{ teacher.name }}</td>
                  <td>{{ teacher.patronymic || '-' }}</td>
                  <td>{{ teacher.post }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editTeacher(teacher)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('teachers', teacher.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Groups Section -->
        <section v-if="activeTab === 'groups'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-users"></i> Группы</h2>
            <button @click="showGroupForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить группу
            </button>
          </div>

          <div v-if="showGroupForm" class="admin-form glassmorphism">
            <h3>Добавить новую группу</h3>
            <form @submit.prevent="addGroup">
              <div class="form-group">
                <label>Название группы:</label>
                <input v-model="newGroup.name_group" required class="form-input">
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">Сохранить</button>
                <button type="button" @click="cancelGroupForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('groups', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('groups', 'id')"></i>
                  </th>
                  <th @click="sortTable('groups', 'name_group')" class="sortable">
                    Название группы
                    <i class="sort-icon" :class="getSortIcon('groups', 'name_group')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="group in sortedGroups" :key="group.id">
                  <td>{{ group.id }}</td>
                  <td>{{ group.name_group }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editGroup(group)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('groups', group.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Audiences Section -->
        <section v-if="activeTab === 'audiences'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-door-open"></i> Аудитории</h2>
            <button @click="showAudienceForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить аудиторию
            </button>
          </div>

          <div v-if="showAudienceForm" class="admin-form glassmorphism">
            <h3>{{ editingAudience ? 'Редактировать' : 'Добавить' }} аудиторию</h3>
            <form @submit.prevent="saveAudience">
              <div class="form-row">
                <div class="form-group">
                  <label>Номер аудитории:</label>
                  <input v-model="currentAudience.num_audiences" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Корпус:</label>
                  <input v-model="currentAudience.corpus" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Этаж:</label>
                  <input v-model="currentAudience.floor" type="number" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Тип:</label>
                  <select v-model="currentAudience.audience_type" class="form-input">
                    <option value="lecture">Лекционный зал</option>
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
              </div>
              <div class="form-group">
                <label>Описание:</label>
                <textarea v-model="currentAudience.description" class="form-textarea"></textarea>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Координата X:</label>
                  <input v-model="currentAudience.x" type="number" step="0.01" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Координата Y:</label>
                  <input v-model="currentAudience.y" type="number" step="0.01" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ширина:</label>
                  <input v-model="currentAudience.width" type="number" step="0.01" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Высота:</label>
                  <input v-model="currentAudience.height" type="number" step="0.01" required class="form-input">
                </div>
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">{{ editingAudience ? 'Обновить' : 'Сохранить' }}</button>
                <button type="button" @click="cancelAudienceForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('audiences', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('audiences', 'id')"></i>
                  </th>
                  <th @click="sortTable('audiences', 'num_audiences')" class="sortable">
                    Номер
                    <i class="sort-icon" :class="getSortIcon('audiences', 'num_audiences')"></i>
                  </th>
                  <th @click="sortTable('audiences', 'corpus')" class="sortable">
                    Корпус
                    <i class="sort-icon" :class="getSortIcon('audiences', 'corpus')"></i>
                  </th>
                  <th @click="sortTable('audiences', 'floor')" class="sortable">
                    Этаж
                    <i class="sort-icon" :class="getSortIcon('audiences', 'floor')"></i>
                  </th>
                  <th @click="sortTable('audiences', 'audience_type')" class="sortable">
                    Тип
                    <i class="sort-icon" :class="getSortIcon('audiences', 'audience_type')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="audience in sortedAudiences" :key="audience.id">
                  <td>{{ audience.id }}</td>
                  <td>{{ audience.num_audiences }}</td>
                  <td>{{ audience.corpus }}</td>
                  <td>{{ audience.floor }}</td>
                  <td>
                    <span class="badge" :class="getAudienceTypeClass(audience.audience_type)">
                      {{ getAudienceTypeName(audience.audience_type) }}
                    </span>
                  </td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editAudience(audience)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('audiences', audience.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Lessons Section -->
        <section v-if="activeTab === 'lessons'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-book"></i> Учебные предметы</h2>
            <button @click="showLessonForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить предмет
            </button>
          </div>

          <div v-if="showLessonForm" class="admin-form glassmorphism">
            <h3>{{ editingLesson ? 'Редактировать' : 'Добавить' }} предмет</h3>
            <form @submit.prevent="saveLesson">
              <div class="form-group">
                <label>Название предмета:</label>
                <input v-model="currentLesson.name_lesson" required class="form-input">
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">{{ editingLesson ? 'Обновить' : 'Сохранить' }}</button>
                <button type="button" @click="cancelLessonForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('lessons', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('lessons', 'id')"></i>
                  </th>
                  <th @click="sortTable('lessons', 'name_lesson')" class="sortable">
                    Название предмета
                    <i class="sort-icon" :class="getSortIcon('lessons', 'name_lesson')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="lesson in sortedLessons" :key="lesson.id">
                  <td>{{ lesson.id }}</td>
                  <td>{{ lesson.name_lesson }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editLesson(lesson)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('lessons', lesson.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Schedule Section -->
        <section v-if="activeTab === 'schedule'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-calendar-alt"></i> Расписание</h2>
            <button @click="showScheduleForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить расписание
            </button>
          </div>

          <div v-if="showScheduleForm" class="admin-form glassmorphism">
            <h3>{{ editingSchedule ? 'Редактировать' : 'Добавить' }} расписание</h3>
            <form @submit.prevent="saveSchedule">
              <div class="form-row">
                <div class="form-group">
                  <label>Предмет:</label>
                  <select v-model="currentSchedule.lesson_id" required class="form-input">
                    <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
                      {{ lesson.name_lesson }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Преподаватель:</label>
                  <select v-model="currentSchedule.teacher_id" required class="form-input">
                    <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
                      {{ teacher.surname }} {{ teacher.name }}
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Группа:</label>
                  <select v-model="currentSchedule.group_id" required class="form-input">
                    <option v-for="group in groups" :key="group.id" :value="group.id">
                      {{ group.name_group }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Аудитория:</label>
                  <select v-model="currentSchedule.audience_id" class="form-input">
                    <option :value="null">Не указана</option>
                    <option v-for="audience in audiences" :key="audience.id" :value="audience.id">
                      {{ audience.num_audiences }} ({{ audience.corpus }} корпус)
                    </option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Время начала:</label>
                  <input v-model="currentSchedule.time_start" type="time" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Время окончания:</label>
                  <input v-model="currentSchedule.time_over" type="time" required class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>День недели:</label>
                <select v-model="currentSchedule.day_week" required class="form-input">
                  <option value="Понедельник">Понедельник</option>
                  <option value="Вторник">Вторник</option>
                  <option value="Среда">Среда</option>
                  <option value="Четверг">Четверг</option>
                  <option value="Пятница">Пятница</option>
                  <option value="Суббота">Суббота</option>
                  <option value="Воскресенье">Воскресенье</option>
                </select>
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">{{ editingSchedule ? 'Обновить' : 'Сохранить' }}</button>
                <button type="button" @click="cancelScheduleForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('schedule', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('schedule', 'id')"></i>
                  </th>
                  <th @click="sortTable('schedule', 'name_lesson')" class="sortable">
                    Предмет
                    <i class="sort-icon" :class="getSortIcon('schedule', 'name_lesson')"></i>
                  </th>
                  <th @click="sortTable('schedule', 'surname')" class="sortable">
                    Преподаватель
                    <i class="sort-icon" :class="getSortIcon('schedule', 'surname')"></i>
                  </th>
                  <th @click="sortTable('schedule', 'name_group')" class="sortable">
                    Группа
                    <i class="sort-icon" :class="getSortIcon('schedule', 'name_group')"></i>
                  </th>
                  <th @click="sortTable('schedule', 'num_audiences')" class="sortable">
                    Аудитория
                    <i class="sort-icon" :class="getSortIcon('schedule', 'num_audiences')"></i>
                  </th>
                  <th @click="sortTable('schedule', 'time_start')" class="sortable">
                    Время
                    <i class="sort-icon" :class="getSortIcon('schedule', 'time_start')"></i>
                  </th>
                  <th @click="sortTable('schedule', 'day_week')" class="sortable">
                    День
                    <i class="sort-icon" :class="getSortIcon('schedule', 'day_week')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedSchedule" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ item.name_lesson }}</td>
                  <td>{{ item.surname }} {{ item.name }}</td>
                  <td>{{ item.name_group }}</td>
                  <td>{{ item.num_audiences || '-' }}</td>
                  <td>{{ item.time_start }} - {{ item.time_over }}</td>
                  <td>{{ item.day_week }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editSchedule(item)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('schedule', item.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Buildings Section -->
        <section v-if="activeTab === 'buildings'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-building"></i> Здания территории</h2>
            <button @click="showBuildingForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить здание
            </button>
          </div>

          <div v-if="showBuildingForm" class="admin-form glassmorphism">
            <h3>{{ editingBuilding ? 'Редактировать' : 'Добавить' }} здание</h3>
            <form @submit.prevent="saveBuilding">
              <div class="form-row">
                <div class="form-group">
                  <label>Название:</label>
                  <input v-model="currentBuilding.name" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Тип:</label>
                  <select v-model="currentBuilding.type" required class="form-input">
                    <option value="academic">Учебный корпус</option>
                    <option value="sport">Спортивный объект</option>
                    <option value="admin">Административное здание</option>
                    <option value="dormitory">Общежитие</option>
                    <option value="cafe">Столовая/Кафе</option>
                    <option value="library">Библиотека</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Корпус:</label>
                  <input v-model="currentBuilding.corpus" class="form-input">
                </div>
                <div class="form-group">
                  <label>Год постройки:</label>
                  <input v-model="currentBuilding.year" type="number" class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Координата X:</label>
                  <input v-model="currentBuilding.x" type="number" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Координата Y:</label>
                  <input v-model="currentBuilding.y" type="number" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Ширина:</label>
                  <input v-model="currentBuilding.width" type="number" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Высота:</label>
                  <input v-model="currentBuilding.height" type="number" required class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>Описание:</label>
                <textarea v-model="currentBuilding.description" class="form-textarea"></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">{{ editingBuilding ? 'Обновить' : 'Сохранить' }}</button>
                <button type="button" @click="cancelBuildingForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('buildings', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('buildings', 'id')"></i>
                  </th>
                  <th @click="sortTable('buildings', 'name')" class="sortable">
                    Название
                    <i class="sort-icon" :class="getSortIcon('buildings', 'name')"></i>
                  </th>
                  <th @click="sortTable('buildings', 'type')" class="sortable">
                    Тип
                    <i class="sort-icon" :class="getSortIcon('buildings', 'type')"></i>
                  </th>
                  <th @click="sortTable('buildings', 'corpus')" class="sortable">
                    Корпус
                    <i class="sort-icon" :class="getSortIcon('buildings', 'corpus')"></i>
                  </th>
                  <th @click="sortTable('buildings', 'x')" class="sortable">
                    Координаты
                    <i class="sort-icon" :class="getSortIcon('buildings', 'x')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="building in sortedBuildings" :key="building.id">
                  <td>{{ building.id }}</td>
                  <td>{{ building.name }}</td>
                  <td>
                    <span class="badge" :class="getBuildingTypeClass(building.type)">
                      {{ getBuildingTypeName(building.type) }}
                    </span>
                  </td>
                  <td>{{ building.corpus || '-' }}</td>
                  <td>({{ building.x }}, {{ building.y }})</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editBuilding(building)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('buildings', building.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Landmarks Section -->
        <section v-if="activeTab === 'landmarks'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-monument"></i> Памятники и объекты</h2>
            <button @click="showLandmarkForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить объект
            </button>
          </div>

          <div v-if="showLandmarkForm" class="admin-form glassmorphism">
            <h3>{{ editingLandmark ? 'Редактировать' : 'Добавить' }} объект</h3>
            <form @submit.prevent="saveLandmark">
              <div class="form-row">
                <div class="form-group">
                  <label>Название:</label>
                  <input v-model="currentLandmark.name" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Тип:</label>
                  <select v-model="currentLandmark.type" required class="form-input">
                    <option value="monument">Памятник</option>
                    <option value="sculpture">Скульптура</option>
                    <option value="fountain">Фонтан</option>
                    <option value="garden">Сад</option>
                    <option value="art">Арт-объект</option>
                    <option value="sport">Спортивный объект</option>
                  </select>
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Координата X:</label>
                  <input v-model="currentLandmark.x" type="number" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Координата Y:</label>
                  <input v-model="currentLandmark.y" type="number" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Радиус:</label>
                  <input v-model="currentLandmark.radius" type="number" class="form-input">
                </div>
                <div class="form-group">
                  <label>Год установки:</label>
                  <input v-model="currentLandmark.year" type="number" class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>Описание:</label>
                <textarea v-model="currentLandmark.description" class="form-textarea"></textarea>
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">{{ editingLandmark ? 'Обновить' : 'Сохранить' }}</button>
                <button type="button" @click="cancelLandmarkForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('landmarks', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('landmarks', 'id')"></i>
                  </th>
                  <th @click="sortTable('landmarks', 'name')" class="sortable">
                    Название
                    <i class="sort-icon" :class="getSortIcon('landmarks', 'name')"></i>
                  </th>
                  <th @click="sortTable('landmarks', 'type')" class="sortable">
                    Тип
                    <i class="sort-icon" :class="getSortIcon('landmarks', 'type')"></i>
                  </th>
                  <th @click="sortTable('landmarks', 'x')" class="sortable">
                    Координаты
                    <i class="sort-icon" :class="getSortIcon('landmarks', 'x')"></i>
                  </th>
                  <th @click="sortTable('landmarks', 'year')" class="sortable">
                    Год
                    <i class="sort-icon" :class="getSortIcon('landmarks', 'year')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="landmark in sortedLandmarks" :key="landmark.id">
                  <td>{{ landmark.id }}</td>
                  <td>{{ landmark.name }}</td>
                  <td>
                    <span class="badge" :class="getLandmarkTypeClass(landmark.type)">
                      {{ getLandmarkTypeName(landmark.type) }}
                    </span>
                  </td>
                  <td>({{ landmark.x }}, {{ landmark.y }})</td>
                  <td>{{ landmark.year || '-' }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editLandmark(landmark)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('landmarks', landmark.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <!-- Sport Schedule Section -->
        <section v-if="activeTab === 'sport-schedule'" class="admin-section glassmorphism">
          <div class="section-header">
            <h2><i class="fas fa-running"></i> Спортивное расписание</h2>
            <button @click="showSportScheduleForm = true" class="add-btn">
              <i class="fas fa-plus"></i> Добавить расписание
            </button>
          </div>

          <div v-if="showSportScheduleForm" class="admin-form glassmorphism">
            <h3>{{ editingSportSchedule ? 'Редактировать' : 'Добавить' }} расписание</h3>
            <form @submit.prevent="saveSportSchedule">
              <div class="form-row">
                <div class="form-group">
                  <label>Здание:</label>
                  <select v-model="currentSportSchedule.building_id" required class="form-input">
                    <option v-for="building in sportBuildings" :key="building.id" :value="building.id">
                      {{ building.name }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Вид спорта:</label>
                  <input v-model="currentSportSchedule.sport_type" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>Тренер:</label>
                  <input v-model="currentSportSchedule.coach" required class="form-input">
                </div>
                <div class="form-group">
                  <label>Группа:</label>
                  <input v-model="currentSportSchedule.group_name" required class="form-input">
                </div>
              </div>
              <div class="form-row">
                <div class="form-group">
                  <label>День недели:</label>
                  <select v-model="currentSportSchedule.day_week" required class="form-input">
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
                  <input v-model="currentSportSchedule.time_start" type="time" required class="form-input">
                </div>
              </div>
              <div class="form-group">
                <label>Время окончания:</label>
                <input v-model="currentSportSchedule.time_over" type="time" required class="form-input">
              </div>
              <div class="form-actions">
                <button type="submit" class="save-btn">{{ editingSportSchedule ? 'Обновить' : 'Сохранить' }}</button>
                <button type="button" @click="cancelSportScheduleForm" class="cancel-btn">Отмена</button>
              </div>
            </form>
          </div>

          <div class="table-container">
            <table class="admin-table">
              <thead>
                <tr>
                  <th @click="sortTable('sport-schedule', 'id')" class="sortable">
                    ID
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'id')"></i>
                  </th>
                  <th @click="sortTable('sport-schedule', 'building_id')" class="sortable">
                    Здание
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'building_id')"></i>
                  </th>
                  <th @click="sortTable('sport-schedule', 'sport_type')" class="sortable">
                    Вид спорта
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'sport_type')"></i>
                  </th>
                  <th @click="sortTable('sport-schedule', 'coach')" class="sortable">
                    Тренер
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'coach')"></i>
                  </th>
                  <th @click="sortTable('sport-schedule', 'group_name')" class="sortable">
                    Группа
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'group_name')"></i>
                  </th>
                  <th @click="sortTable('sport-schedule', 'day_week')" class="sortable">
                    День
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'day_week')"></i>
                  </th>
                  <th @click="sortTable('sport-schedule', 'time_start')" class="sortable">
                    Время
                    <i class="sort-icon" :class="getSortIcon('sport-schedule', 'time_start')"></i>
                  </th>
                  <th>Действия</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="item in sortedSportSchedule" :key="item.id">
                  <td>{{ item.id }}</td>
                  <td>{{ getBuildingName(item.building_id) }}</td>
                  <td>{{ item.sport_type }}</td>
                  <td>{{ item.coach }}</td>
                  <td>{{ item.group_name }}</td>
                  <td>{{ item.day_week }}</td>
                  <td>{{ item.time_start }} - {{ item.time_over }}</td>
                  <td>
                    <div class="action-buttons">
                      <button @click="editSportSchedule(item)" class="edit-btn">
                        <i class="fas fa-edit"></i>
                      </button>
                      <button @click="deleteItem('sport-schedule', item.id)" class="danger-btn">
                        <i class="fas fa-trash"></i>
                      </button>
                    </div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
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
    const theme = ref(localStorage.getItem('pc-theme') || 'light');
    
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
    
    // Sorting state
    const sortState = ref({
      users: { field: 'id', direction: 'asc' },
      teachers: { field: 'id', direction: 'asc' },
      groups: { field: 'id', direction: 'asc' },
      audiences: { field: 'id', direction: 'asc' },
      lessons: { field: 'id', direction: 'asc' },
      schedule: { field: 'id', direction: 'asc' },
      buildings: { field: 'id', direction: 'asc' },
      landmarks: { field: 'id', direction: 'asc' },
      'sport-schedule': { field: 'id', direction: 'asc' }
    });

    // Form states
    const showTeacherForm = ref(false);
    const showGroupForm = ref(false);
    const showAudienceForm = ref(false);
    const showLessonForm = ref(false);
    const showScheduleForm = ref(false);
    const showBuildingForm = ref(false);
    const showLandmarkForm = ref(false);
    const showSportScheduleForm = ref(false);
    
    // Editing states
    const editingAudience = ref(false);
    const editingLesson = ref(false);
    const editingSchedule = ref(false);
    const editingBuilding = ref(false);
    const editingLandmark = ref(false);
    const editingSportSchedule = ref(false);
    
    // Current item objects
    const currentAudience = ref(createEmptyAudience());
    const currentLesson = ref(createEmptyLesson());
    const currentSchedule = ref(createEmptySchedule());
    const currentBuilding = ref(createEmptyBuilding());
    const currentLandmark = ref(createEmptyLandmark());
    const currentSportSchedule = ref(createEmptySportSchedule());
    
    // New item objects
    const newTeacher = ref({
      name: '',
      surname: '',
      patronymic: '',
      post: ''
    });
    
    const newGroup = ref({
      name_group: ''
    });

    // Computed properties for sorted data
    const sortedUsers = computed(() => {
      return sortData(users.value, sortState.value.users.field, sortState.value.users.direction);
    });

    const sortedTeachers = computed(() => {
      return sortData(teachers.value, sortState.value.teachers.field, sortState.value.teachers.direction);
    });

    const sortedGroups = computed(() => {
      return sortData(groups.value, sortState.value.groups.field, sortState.value.groups.direction);
    });

    const sortedAudiences = computed(() => {
      return sortData(audiences.value, sortState.value.audiences.field, sortState.value.audiences.direction);
    });

    const sortedLessons = computed(() => {
      return sortData(lessons.value, sortState.value.lessons.field, sortState.value.lessons.direction);
    });

    const sortedSchedule = computed(() => {
      return sortData(schedule.value, sortState.value.schedule.field, sortState.value.schedule.direction);
    });

    const sortedBuildings = computed(() => {
      return sortData(buildings.value, sortState.value.buildings.field, sortState.value.buildings.direction);
    });

    const sortedLandmarks = computed(() => {
      return sortData(landmarks.value, sortState.value.landmarks.field, sortState.value.landmarks.direction);
    });

    const sortedSportSchedule = computed(() => {
      return sortData(sportSchedule.value, sortState.value['sport-schedule'].field, sortState.value['sport-schedule'].direction);
    });

    const sportBuildings = computed(() => {
      return buildings.value.filter(b => b.type === 'sport');
    });

    const tabs = computed(() => [
      { id: 'users', name: 'Пользователи', icon: 'fas fa-users' },
      { id: 'teachers', name: 'Преподаватели', icon: 'fas fa-chalkboard-teacher' },
      { id: 'groups', name: 'Группы', icon: 'fas fa-user-friends' },
      { id: 'audiences', name: 'Аудитории', icon: 'fas fa-door-open' },
      { id: 'lessons', name: 'Предметы', icon: 'fas fa-book' },
      { id: 'schedule', name: 'Расписание', icon: 'fas fa-calendar-alt' },
      { id: 'buildings', name: 'Здания', icon: 'fas fa-building' },
      { id: 'landmarks', name: 'Объекты', icon: 'fas fa-monument' },
      { id: 'sport-schedule', name: 'Спорт расписание', icon: 'fas fa-running' }
    ]);

    // Utility functions
    function createEmptyAudience() {
      return {
        id: null,
        num_audiences: '',
        corpus: '',
        floor: '',
        description: '',
        audience_type: 'lecture',
        x: 0,
        y: 0,
        width: 100,
        height: 100
      };
    }

    function createEmptyLesson() {
      return {
        id: null,
        name_lesson: ''
      };
    }

    function createEmptySchedule() {
      return {
        id: null,
        lesson_id: '',
        teacher_id: '',
        group_id: '',
        audience_id: null,
        time_start: '',
        time_over: '',
        day_week: 'Понедельник'
      };
    }

    function createEmptyBuilding() {
      return {
        id: null,
        name: '',
        type: 'academic',
        corpus: '',
        x: 0,
        y: 0,
        width: 100,
        height: 100,
        description: '',
        year: null
      };
    }

    function createEmptyLandmark() {
      return {
        id: null,
        name: '',
        type: 'monument',
        x: 0,
        y: 0,
        radius: 15,
        year: null,
        description: ''
      };
    }

    function createEmptySportSchedule() {
      return {
        id: null,
        building_id: '',
        sport_type: '',
        coach: '',
        group_name: '',
        day_week: 'Понедельник',
        time_start: '',
        time_over: ''
      };
    }

    // Sorting functions
    const sortData = (data, field, direction) => {
      if (!data || !field) return data;
      
      return [...data].sort((a, b) => {
        let aValue = a[field];
        let bValue = b[field];
        
        // Handle null/undefined values
        if (aValue === null || aValue === undefined) aValue = '';
        if (bValue === null || bValue === undefined) bValue = '';
        
        // Handle different data types
        if (typeof aValue === 'string' && typeof bValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }
        
        if (aValue < bValue) return direction === 'asc' ? -1 : 1;
        if (aValue > bValue) return direction === 'asc' ? 1 : -1;
        return 0;
      });
    };

    const sortTable = (table, field) => {
      const currentSort = sortState.value[table];
      
      if (currentSort.field === field) {
        // Toggle direction if same field
        sortState.value[table] = {
          field,
          direction: currentSort.direction === 'asc' ? 'desc' : 'asc'
        };
      } else {
        // New field, default to ascending
        sortState.value[table] = {
          field,
          direction: 'asc'
        };
      }
    };

    const getSortIcon = (table, field) => {
      const currentSort = sortState.value[table];
      
      if (currentSort.field !== field) {
        return 'fas fa-sort';
      }
      
      return currentSort.direction === 'asc' ? 'fas fa-sort-up' : 'fas fa-sort-down';
    };

    const formatDate = (dateString) => {
      if (!dateString) return '-';
      const date = new Date(dateString);
      return date.toLocaleDateString('ru-RU');
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

    const getAudienceTypeClass = (type) => {
      const classes = {
        'lecture': 'badge-primary',
        'lab': 'badge-danger',
        'study': 'badge-info',
        'computer': 'badge-purple',
        'conference': 'badge-warning',
        'toilet': 'badge-success',
        'cafe': 'badge-secondary',
        'library': 'badge-dark',
        'cabinet': 'badge-light'
      };
      return classes[type] || 'badge-secondary';
    };

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

    const getBuildingTypeClass = (type) => {
      const classes = {
        'academic': 'badge-primary',
        'sport': 'badge-success',
        'admin': 'badge-warning',
        'dormitory': 'badge-info',
        'cafe': 'badge-secondary',
        'library': 'badge-dark'
      };
      return classes[type] || 'badge-secondary';
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

    const getLandmarkTypeClass = (type) => {
      const classes = {
        'monument': 'badge-primary',
        'sculpture': 'badge-info',
        'fountain': 'badge-success',
        'garden': 'badge-warning',
        'art': 'badge-purple',
        'sport': 'badge-danger'
      };
      return classes[type] || 'badge-secondary';
    };

    const getBuildingName = (buildingId) => {
      const building = buildings.value.find(b => b.id === buildingId);
      return building ? building.name : 'Неизвестно';
    };

    const fetchAllData = async () => {
      try {
        const [
          usersRes, teachersRes, groupsRes, audiencesRes, 
          lessonsRes, scheduleRes, buildingsRes, landmarksRes, sportScheduleRes
        ] = await Promise.all([
          axios.get('/api/admin/users'),
          axios.get('/api/admin/teachers'),
          axios.get('/api/admin/groups'),
          axios.get('/api/admin/audiences'),
          axios.get('/api/admin/lessons'),
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

    // User methods
    const updateUserRole = async (user) => {
      try {
        await axios.put(`/api/admin/users/${user.id}/role`, { role: user.role });
      } catch (err) {
        console.error('Failed to update user role:', err);
      }
    };

    // Teacher methods
    const addTeacher = async () => {
      try {
        await axios.post('/api/teachers', newTeacher.value);
        showTeacherForm.value = false;
        newTeacher.value = { name: '', surname: '', patronymic: '', post: '' };
        await fetchAllData();
      } catch (err) {
        console.error('Failed to add teacher:', err);
      }
    };

    const cancelTeacherForm = () => {
      showTeacherForm.value = false;
      newTeacher.value = { name: '', surname: '', patronymic: '', post: '' };
    };

    const editTeacher = (teacher) => {
      router.push(`/admin/edit/teachers/${teacher.id}`);
    };

    // Group methods
    const addGroup = async () => {
      try {
        await axios.post('/api/groups', newGroup.value);
        showGroupForm.value = false;
        newGroup.value = { name_group: '' };
        await fetchAllData();
      } catch (err) {
        console.error('Failed to add group:', err);
      }
    };

    const cancelGroupForm = () => {
      showGroupForm.value = false;
      newGroup.value = { name_group: '' };
    };

    const editGroup = (group) => {
      router.push(`/admin/edit/groups/${group.id}`);
    };

    // Audience methods
    const editAudience = (audience) => {
      currentAudience.value = { ...audience };
      editingAudience.value = true;
      showAudienceForm.value = true;
    };

    const saveAudience = async () => {
      try {
        if (editingAudience.value) {
          await axios.put(`/api/admin/audiences/${currentAudience.value.id}`, currentAudience.value);
        } else {
          await axios.post('/api/admin/audiences', currentAudience.value);
        }
        cancelAudienceForm();
        await fetchAllData();
      } catch (err) {
        console.error('Failed to save audience:', err);
        alert(`Ошибка сохранения аудитории: ${err.response?.data?.error || err.message}`);
      }
    };

    const cancelAudienceForm = () => {
      showAudienceForm.value = false;
      editingAudience.value = false;
      currentAudience.value = createEmptyAudience();
    };

    // Lesson methods
    const editLesson = (lesson) => {
      currentLesson.value = { ...lesson };
      editingLesson.value = true;
      showLessonForm.value = true;
    };

    const saveLesson = async () => {
      try {
        if (editingLesson.value) {
          await axios.put(`/api/admin/lessons/${currentLesson.value.id}`, currentLesson.value);
        } else {
          await axios.post('/api/admin/lessons', currentLesson.value);
        }
        cancelLessonForm();
        await fetchAllData();
      } catch (err) {
        console.error('Failed to save lesson:', err);
        alert(`Ошибка сохранения предмета: ${err.response?.data?.error || err.message}`);
      }
    };

    const cancelLessonForm = () => {
      showLessonForm.value = false;
      editingLesson.value = false;
      currentLesson.value = createEmptyLesson();
    };

    // Schedule methods
    const editSchedule = (scheduleItem) => {
      currentSchedule.value = { ...scheduleItem };
      editingSchedule.value = true;
      showScheduleForm.value = true;
    };

    const saveSchedule = async () => {
      try {
        if (editingSchedule.value) {
          await axios.put(`/api/admin/schedule/${currentSchedule.value.id}`, currentSchedule.value);
        } else {
          await axios.post('/api/admin/schedule', currentSchedule.value);
        }
        cancelScheduleForm();
        await fetchAllData();
      } catch (err) {
        console.error('Failed to save schedule:', err);
      }
    };

    const cancelScheduleForm = () => {
      showScheduleForm.value = false;
      editingSchedule.value = false;
      currentSchedule.value = createEmptySchedule();
    };

    // Building methods
    const editBuilding = (building) => {
      currentBuilding.value = { ...building };
      editingBuilding.value = true;
      showBuildingForm.value = true;
    };

    const saveBuilding = async () => {
      try {
        if (editingBuilding.value) {
          await axios.put(`/api/admin/buildings/${currentBuilding.value.id}`, currentBuilding.value);
        } else {
          await axios.post('/api/admin/buildings', currentBuilding.value);
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
      currentBuilding.value = createEmptyBuilding();
    };

    // Landmark methods
    const editLandmark = (landmark) => {
      currentLandmark.value = { ...landmark };
      editingLandmark.value = true;
      showLandmarkForm.value = true;
    };

    const saveLandmark = async () => {
      try {
        if (editingLandmark.value) {
          await axios.put(`/api/admin/landmarks/${currentLandmark.value.id}`, currentLandmark.value);
        } else {
          await axios.post('/api/admin/landmarks', currentLandmark.value);
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
      currentLandmark.value = createEmptyLandmark();
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
      currentSportSchedule.value = createEmptySportSchedule();
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

    const goToMain = () => {
      router.push('/');
    };

    const logout = () => {
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      router.push('/auth');
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
      theme,
      // Original data arrays
      users,
      teachers,
      groups,
      audiences,
      lessons,
      schedule,
      buildings,
      landmarks,
      sportSchedule,
      // Sorted computed properties
      sortedUsers,
      sortedTeachers,
      sortedGroups,
      sortedAudiences,
      sortedLessons,
      sortedSchedule,
      sortedBuildings,
      sortedLandmarks,
      sortedSportSchedule,
      sportBuildings,
      tabs,
      showTeacherForm,
      showGroupForm,
      showAudienceForm,
      showLessonForm,
      showScheduleForm,
      showBuildingForm,
      showLandmarkForm,
      showSportScheduleForm,
      newTeacher,
      newGroup,
      currentAudience,
      currentLesson,
      currentSchedule,
      currentBuilding,
      currentLandmark,
      currentSportSchedule,
      editingAudience,
      editingLesson,
      editingSchedule,
      editingBuilding,
      editingLandmark,
      editingSportSchedule,
      formatDate,
      getAudienceTypeName,
      getAudienceTypeClass,
      getBuildingTypeName,
      getBuildingTypeClass,
      getLandmarkTypeName,
      getLandmarkTypeClass,
      getBuildingName,
      updateUserRole,
      addTeacher,
      cancelTeacherForm,
      editTeacher,
      addGroup,
      cancelGroupForm,
      editGroup,
      editAudience,
      saveAudience,
      cancelAudienceForm,
      editLesson,
      saveLesson,
      cancelLessonForm,
      editSchedule,
      saveSchedule,
      cancelScheduleForm,
      editBuilding,
      saveBuilding,
      cancelBuildingForm,
      editLandmark,
      saveLandmark,
      cancelLandmarkForm,
      editSportSchedule,
      saveSportSchedule,
      cancelSportScheduleForm,
      deleteItem,
      fetchAllData,
      goToMain,
      logout,
      sortTable,
      getSortIcon
    };
  }
};
</script>

<style scoped>
.sortable {
  cursor: pointer;
  user-select: none;
  position: relative;
  transition: background-color 0.2s ease;
}

.sortable:hover {
  background-color: var(--bg-tertiary);
}

.sort-icon {
  margin-left: 8px;
  font-size: 0.8rem;
  color: var(--text-tertiary);
  transition: color 0.2s ease;
}

.sortable:hover .sort-icon {
  color: var(--accent-primary);
}

/* Остальные стили остаются без изменений */
/* CSS переменные для тем */
.main-container {
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
}

/* Эффект стекла */
.glassmorphism {
  background: var(--glass-bg);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  border: 1px solid var(--glass-border);
  box-shadow: 0 8px 32px 0 var(--shadow-light);
}

.main-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: var(--bg-primary);
  color: var(--text-primary);
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  transition: background-color 0.3s ease, color 0.3s ease;
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

.logo_img {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid var(--card-bg);
}

.nav-buttons {
  display: flex;
  gap: 4px;
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

.nav-btn:hover {
  background: var(--bg-secondary);
}

.nav-btn i {
  font-size: 1rem;
  transition: transform 0.3s ease;
}

.btn-text {
  display: inline-block;
}

.user-actions {
  display: flex;
  align-items: center;
  gap: 16px;
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

/* Основной контент */
.admin-content {
  display: flex;
  flex: 1;
  overflow: hidden;
}

.admin-sidebar {
  width: 280px;
  background: var(--glass-bg);
  border-right: 1px solid var(--border-light);
  padding: 20px 0;
  overflow-y: auto;
}

.admin-sidebar ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.sidebar-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 24px;
  color: var(--text-secondary);
  cursor: pointer;
  transition: all 0.3s ease;
  border-left: 3px solid transparent;
}

.sidebar-item:hover {
  background-color: var(--bg-tertiary);
  color: var(--text-primary);
}

.sidebar-item.active {
  background-color: var(--card-bg);
  color: var(--accent-primary);
  border-left-color: var(--accent-primary);
  box-shadow: 0 2px 8px rgba(67, 97, 238, 0.15);
}

.sidebar-item i {
  font-size: 1.1rem;
  width: 20px;
  text-align: center;
}

.admin-main {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
  background-color: var(--bg-tertiary);
}

.admin-section {
  margin-bottom: 24px;
  border-radius: 16px;
  padding: 24px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 24px;
  padding-bottom: 16px;
  border-bottom: 1px solid var(--border-medium);
}

.section-header h2 {
  margin: 0;
  font-size: 1.5rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 12px;
}

.section-header h2 i {
  color: var(--accent-primary);
}

.section-actions {
  display: flex;
  gap: 12px;
}

.refresh-btn {
  background: none;
  border: none;
  color: var(--text-tertiary);
  font-size: 1.1rem;
  cursor: pointer;
  padding: 8px;
  border-radius: 6px;
  transition: all 0.2s ease;
}

.refresh-btn:hover {
  background-color: var(--bg-tertiary);
  color: var(--accent-primary);
}

.add-btn {
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
}

.add-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(67, 97, 238, 0.3);
}

/* Таблицы */
.table-container {
  overflow-x: auto;
  border-radius: 12px;
  box-shadow: 0 2px 8px var(--shadow-light);
}

.admin-table {
  width: 100%;
  border-collapse: collapse;
  background-color: var(--card-bg);
  border-radius: 12px;
  overflow: hidden;
}

.admin-table th {
  background-color: var(--bg-tertiary);
  color: var(--text-secondary);
  font-weight: 600;
  padding: 16px;
  text-align: left;
  border-bottom: 1px solid var(--border-medium);
  white-space: nowrap;
}

.admin-table td {
  padding: 14px 16px;
  border-bottom: 1px solid var(--border-medium);
  color: var(--text-secondary);
  vertical-align: middle;
}

.admin-table tr:last-child td {
  border-bottom: none;
}

.admin-table tr:hover td {
  background-color: var(--bg-tertiary);
}

/* Бейджи */
.badge {
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.badge-primary {
  background-color: #4361ee;
  color: white;
}

.badge-danger {
  background-color: #e53e3e;
  color: white;
}

.badge-info {
  background-color: #4299e1;
  color: white;
}

.badge-purple {
  background-color: #805ad5;
  color: white;
}

.badge-warning {
  background-color: #ed8936;
  color: white;
}

.badge-success {
  background-color: #38a169;
  color: white;
}

.badge-secondary {
  background-color: #a0aec0;
  color: white;
}

.badge-dark {
  background-color: #2d3748;
  color: white;
}

.badge-light {
  background-color: #f7fafc;
  color: #2d3748;
}

/* Кнопки действий */
.action-buttons {
  display: flex;
  gap: 8px;
}

.edit-btn {
  background: none;
  border: none;
  color: var(--accent-primary);
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: rgba(67, 97, 238, 0.1);
}

.danger-btn {
  background: none;
  border: none;
  color: #e53e3e;
  cursor: pointer;
  padding: 6px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.danger-btn:hover {
  background-color: rgba(229, 62, 62, 0.1);
}

/* Формы */
.admin-form {
  margin-bottom: 24px;
  border-radius: 12px;
  padding: 24px;
}

.admin-form h3 {
  margin: 0 0 20px 0;
  font-size: 1.3rem;
  font-weight: 600;
  color: var(--text-primary);
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-bottom: 16px;
}

.form-group {
  display: flex;
  flex-direction: column;
}

.form-group label {
  margin-bottom: 6px;
  font-weight: 500;
  color: var(--text-secondary);
  font-size: 0.9rem;
}

.form-input {
  padding: 12px;
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: var(--input-bg);
  color: var(--text-primary);
}

.form-input:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.form-textarea {
  padding: 12px;
  border: 1px solid var(--border-medium);
  border-radius: 8px;
  font-size: 0.95rem;
  transition: all 0.3s ease;
  background-color: var(--input-bg);
  color: var(--text-primary);
  min-height: 100px;
  resize: vertical;
  font-family: inherit;
}

.form-textarea:focus {
  outline: none;
  border-color: var(--accent-primary);
  box-shadow: 0 0 0 3px rgba(67, 97, 238, 0.1);
}

.role-select {
  padding: 8px 12px;
  border: 1px solid var(--border-medium);
  border-radius: 6px;
  background-color: var(--input-bg);
  color: var(--text-primary);
  font-size: 0.9rem;
}

.form-actions {
  display: flex;
  gap: 12px;
  margin-top: 24px;
}

.save-btn {
  background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
  color: white;
  border: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 6px rgba(67, 97, 238, 0.2);
}

.save-btn:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 8px rgba(67, 97, 238, 0.3);
}

.cancel-btn {
  background: none;
  border: 1px solid var(--border-medium);
  color: var(--text-secondary);
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s ease;
}

.cancel-btn:hover {
  background-color: var(--bg-tertiary);
  border-color: var(--border-light);
}

/* Адаптивность */
@media (max-width: 1024px) {
  .admin-content {
    flex-direction: column;
  }
  
  .admin-sidebar {
    width: 100%;
    height: auto;
  }
  
  .admin-sidebar ul {
    display: flex;
    overflow-x: auto;
    padding: 0 16px;
  }
  
  .sidebar-item {
    white-space: nowrap;
    border-left: none;
    border-bottom: 3px solid transparent;
  }
  
  .sidebar-item.active {
    border-left: none;
    border-bottom-color: var(--accent-primary);
  }
}

@media (max-width: 768px) {
  .top-nav {
    padding: 0 16px;
  }
  
  .logo span {
    display: none;
  }
  
  .section-header {
    flex-direction: column;
    gap: 16px;
    align-items: flex-start;
  }
  
  .form-row {
    grid-template-columns: 1fr;
  }
  
  .admin-main {
    padding: 16px;
  }
  
  .admin-section {
    padding: 16px;
  }
}
</style>