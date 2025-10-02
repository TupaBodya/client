<template>
  <div class="edit-container">
    <h2>Edit Group</h2>
    
    <form @submit.prevent="updateGroup" v-if="group">
      <div class="form-group">
        <label>Group Name:</label>
        <input v-model="group.name_group" required>
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
  name: 'EditGroupView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const group = ref(null);
    const error = ref('');

    const fetchGroup = async () => {
      try {
        const response = await axios.get(`/api/admin/groups/${route.params.id}`);
        group.value = response.data;
      } catch (err) {
        error.value = 'Failed to load group data';
        console.error(err);
      }
    };

    const updateGroup = async () => {
      try {
        await axios.put(`/api/admin/groups/${route.params.id}`, group.value);
        router.push('/admin');
      } catch (err) {
        error.value = 'Failed to update group';
        console.error(err);
      }
    };

    const goBack = () => {
      router.go(-1);
    };

    onMounted(fetchGroup);

    return {
      group,
      error,
      updateGroup,
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