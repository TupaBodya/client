<template>
  <div class="edit-container">
    <h2>Edit Schedule</h2>
    
    <form @submit.prevent="updateSchedule" v-if="schedule">
      <div class="form-group">
        <label>Lesson:</label>
        <select v-model="schedule.lesson_id" required>
          <option v-for="lesson in lessons" :key="lesson.id" :value="lesson.id">
            {{ lesson.name_lesson }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Teacher:</label>
        <select v-model="schedule.teacher_id" required>
          <option v-for="teacher in teachers" :key="teacher.id" :value="teacher.id">
            {{ teacher.surname }} {{ teacher.name }} {{ teacher.patronymic }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Group:</label>
        <select v-model="schedule.group_id" required>
          <option v-for="group in groups" :key="group.id" :value="group.id">
            {{ group.name_group }}
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Audience:</label>
        <select v-model="schedule.audience_id">
          <option :value="null">None</option>
          <option v-for="audience in audiences" :key="audience.id" :value="audience.id">
            {{ audience.num_audiences }} (Corpus {{ audience.corpus }})
          </option>
        </select>
      </div>
      
      <div class="form-group">
        <label>Start Time:</label>
        <input v-model="schedule.time_start" type="time" required>
      </div>
      
      <div class="form-group">
        <label>End Time:</label>
        <input v-model="schedule.time_over" type="time" required>
      </div>
      
      <div class="form-group">
        <label>Day of Week:</label>
        <select v-model="schedule.day_week" required>
          <option value="Monday">Monday</option>
          <option value="Tuesday">Tuesday</option>
          <option value="Wednesday">Wednesday</option>
          <option value="Thursday">Thursday</option>
          <option value="Friday">Friday</option>
          <option value="Saturday">Saturday</option>
          <option value="Sunday">Sunday</option>
        </select>
      </div>
      
      <button type="submit">Save Changes</button>
      <button type="button" @click="goBack">Cancel</button>
    </form>
    
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="loading" class="loading">Loading...</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'EditScheduleView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const schedule = ref(null);
    const lessons = ref([]);
    const teachers = ref([]);
    const groups = ref([]);
    const audiences = ref([]);
    const error = ref('');
    const loading = ref(false);

    const fetchData = async () => {
      try {
        loading.value = true;
        
        // Fetch schedule item
        const scheduleResponse = await axios.get(`/api/admin/schedule/${route.params.id}`);
        schedule.value = scheduleResponse.data;
        
        // Fetch all related data
        const [lessonsRes, teachersRes, groupsRes, audiencesRes] = await Promise.all([
          axios.get('/api/admin/lessons'),
          axios.get('/api/admin/teachers'),
          axios.get('/api/admin/groups'),
          axios.get('/api/admin/audiences')
        ]);
        
        lessons.value = lessonsRes.data;
        teachers.value = teachersRes.data;
        groups.value = groupsRes.data;
        audiences.value = audiencesRes.data;
        
      } catch (err) {
        error.value = 'Failed to load data';
        console.error(err);
      } finally {
        loading.value = false;
      }
    };

    const updateSchedule = async () => {
      try {
        await axios.put(`/api/admin/schedule/${route.params.id}`, schedule.value);
        router.push('/admin');
      } catch (err) {
        error.value = 'Failed to update schedule';
        console.error(err);
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    onMounted(fetchData);

    return {
      schedule,
      lessons,
      teachers,
      groups,
      audiences,
      error,
      loading,
      updateSchedule,
      goBack
    };
  }
};
</script>

<style scoped>
.edit-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.form-group {
  margin-bottom: 15px;
}

.form-group label {
  display: block;
  margin-bottom: 5px;
  font-weight: 500;
}

.form-group input,
.form-group select {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 8px 15px;
  margin-right: 10px;
  margin-top: 10px;
  cursor: pointer;
  background-color: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
}

button[type="button"] {
  background-color: #95a5a6;
}

.error {
  color: #e74c3c;
  margin-top: 15px;
}

.loading {
  color: #3498db;
  margin-top: 15px;
}
</style>