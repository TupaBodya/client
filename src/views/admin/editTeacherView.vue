<template>
  <div class="edit-container">
    <h2>Edit Teacher</h2>
    
    <form @submit.prevent="updateTeacher" v-if="teacher">
      <div class="form-group">
        <label>First Name:</label>
        <input v-model="teacher.name" required>
      </div>
      
      <div class="form-group">
        <label>Last Name:</label>
        <input v-model="teacher.surname" required>
      </div>
      
      <div class="form-group">
        <label>Patronymic:</label>
        <input v-model="teacher.patronymic">
      </div>
      
      <div class="form-group">
        <label>Position:</label>
        <input v-model="teacher.post" required>
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
  name: 'EditTeacherView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const teacher = ref(null);
    const error = ref('');

    const fetchTeacher = async () => {
      try {
        const response = await axios.get(`/api/admin/teachers/${route.params.id}`);
        teacher.value = response.data;
      } catch (err) {
        error.value = 'Failed to load teacher data';
        console.error(err);
      }
    };

    const updateTeacher = async () => {
      try {
        await axios.put(`/api/admin/teachers/${route.params.id}`, teacher.value);
        router.push('/admin');
      } catch (err) {
        error.value = 'Failed to update teacher';
        console.error(err);
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    onMounted(fetchTeacher);

    return {
      teacher,
      error,
      updateTeacher,
      goBack
    };
  }
};
</script>

<style scoped>
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
  cursor: pointer;
}

.error {
  color: red;
  margin-top: 15px;
}
</style>