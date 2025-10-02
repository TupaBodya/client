<template>
  <div class="edit-container">
    <h2>Edit Lesson</h2>
    
    <form @submit.prevent="updateLesson" v-if="lesson">
      <div class="form-group">
        <label>Lesson Name:</label>
        <input v-model="lesson.name_lesson" required>
      </div>
      
      <button type="submit">Save Changes</button>
      <button type="button" @click="goBack">Cancel</button>
    </form>
    
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'EditLessonView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const lesson = ref(null);
    const error = ref('');

    const fetchLesson = async () => {
      try {
        const response = await axios.get(`/api/admin/lessons/${route.params.id}`);
        lesson.value = response.data;
      } catch (err) {
        error.value = 'Failed to load lesson data';
        console.error(err);
      }
    };

    const updateLesson = async () => {
      try {
        await axios.put(`/api/admin/lessons/${route.params.id}`, lesson.value);
        router.push('/admin');
      } catch (err) {
        error.value = 'Failed to update lesson';
        console.error(err);
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    onMounted(fetchLesson);

    return {
      lesson,
      error,
      updateLesson,
      goBack
    };
  }
};
</script>

<style scoped>
/* Same styles as EditAudienceView */
.edit-container {
  max-width: 600px;
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

.form-group input {
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
</style>