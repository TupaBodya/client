<template>
  <div class="edit-container">
    <h2>Edit Audience</h2>
    
    <form @submit.prevent="updateAudience" v-if="audience">
      <div class="form-group">
        <label>Audience Number:</label>
        <input v-model="audience.num_audiences" required>
      </div>
      
      <div class="form-group">
        <label>Corpus:</label>
        <input v-model="audience.corpus" required>
      </div>
      
      <div class="form-group">
        <label>Floor:</label>
        <input v-model="audience.floor" type="number" required>
      </div>
      
      <div class="form-group">
        <label>Description:</label>
        <textarea v-model="audience.description"></textarea>
      </div>

      <div class="form-group">
        <label>Audience Type:</label>
        <select v-model="audience.audience_type">
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
        <label>Image 1 URL:</label>
        <input v-model="audience.image1" type="url">
      </div>
      
      <div class="form-group">
        <label>Image 2 URL:</label>
        <input v-model="audience.image2" type="url">
      </div>
      
      <div class="form-group">
        <label>Image 3 URL:</label>
        <input v-model="audience.image3" type="url">
      </div>
      
      <div class="form-group">
        <label>X Coordinate:</label>
        <input v-model="audience.x" type="number" step="0.01" required>
      </div>
      
      <div class="form-group">
        <label>Y Coordinate:</label>
        <input v-model="audience.y" type="number" step="0.01" required>
      </div>
      
      <div class="form-group">
        <label>Width:</label>
        <input v-model="audience.width" type="number" step="0.01" required>
      </div>
      
      <div class="form-group">
        <label>Height:</label>
        <input v-model="audience.height" type="number" step="0.01" required>
      </div>
      
      <button type="submit">Сохранить</button>
      <button type="button" @click="goBack">Отменить</button>
    </form>
    
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

export default {
  name: 'EditAudienceView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const audience = ref(null);
    const error = ref('');

    const fetchAudience = async () => {
      try {
        const response = await axios.get(`/api/admin/audiences/${route.params.id}`);
        audience.value = response.data;
      } catch (err) {
        error.value = 'Failed to load audience data';
        console.error(err);
      }
    };

    const updateAudience = async () => {
      try {
        const response = await axios.put(
          `/api/admin/audiences/${route.params.id}`, 
          audience.value,
          {
            headers: {
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'Content-Type': 'application/json'
            }
          }
        );
        
        console.log('Успешное обновление:', response.data);
        router.push('/admin');
      } catch (err) {
        console.error('Полная ошибка:', err);
        
        if (err.response) {
          // Server responded with error status
          console.error('Данные ответа:', err.response.data);
          console.error('Статус:', err.response.status);
          console.error('Заголовки:', err.response.headers);
          
          error.value = err.response.data.error || 
                      err.response.data.message || 
                      'Ошибка при обновлении аудитории';
          
          if (err.response.data.details) {
            error.value += `: ${JSON.stringify(err.response.data.details)}`;
          }
        } else if (err.request) {
          // Request was made but no response
          error.value = 'Нет ответа от сервера';
        } else {
          // Other errors
          error.value = err.message || 'Неизвестная ошибка';
        }
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    onMounted(fetchAudience);

    return {
      audience,
      error,
      updateAudience,
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

textarea {
  width: 100%;
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
  min-height: 100px;
}
</style>