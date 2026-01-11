<template>
  <div class="admin">
    <h1>Admin Panel</h1>
    
    <div class="create-article">
      <h2>Create New Article</h2>
      <form @submit.prevent="createArticle" class="article-form">
        <div class="form-group">
          <label>Title</label>
          <input v-model="newArticle.title" required />
        </div>
        
        <div class="form-group">
          <label>Content</label>
          <textarea v-model="newArticle.content" required rows="5"></textarea>
        </div>

        <div class="form-group">
          <label>Image</label>
          <input type="file" @change="handleFileUpload" accept="image/*" />
        </div>

        <button type="submit" :disabled="submitting">
          {{ submitting ? 'Publishing...' : 'Publish Article' }}
        </button>
      </form>
    </div>

    <div class="articles-list">
      <h2>Existing Articles</h2>
      <div v-for="article in articles" :key="article.id" class="article-item">
        <span>{{ article.title }}</span>
        <button @click="deleteArticle(article.id)" class="delete-btn">Delete</button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import pb from '../services/pocketbase'

const articles = ref([])
const submitting = ref(false)
const newArticle = ref({
  title: '',
  content: '',
  image: null
})

onMounted(fetchArticles)

async function fetchArticles() {
  try {
    const result = await pb.collection('articles').getList(1, 50, {
      sort: '-created'
    })
    articles.value = result.items
  } catch (error) {
    console.error('Error loading articles:', error)
  }
}

function handleFileUpload(event) {
  newArticle.value.image = event.target.files[0]
}

async function createArticle() {
  submitting.value = true
  try {
    const formData = new FormData()
    formData.append('title', newArticle.value.title)
    formData.append('content', newArticle.value.content)
    if (newArticle.value.image) {
      formData.append('image', newArticle.value.image)
    }

    await pb.collection('articles').create(formData)
    
    // Reset form
    newArticle.value = { title: '', content: '', image: null }
    // Refresh list
    await fetchArticles()
    alert('Article published successfully!')
  } catch (error) {
    console.error('Error creating article:', error)
    alert('Failed to create article')
  } finally {
    submitting.value = false
  }
}

async function deleteArticle(id) {
  if (!confirm('Are you sure you want to delete this article?')) return
  
  try {
    await pb.collection('articles').delete(id)
    await fetchArticles()
  } catch (error) {
    console.error('Error deleting article:', error)
    alert('Failed to delete article')
  }
}
</script>

<style scoped>
.admin {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-form {
  display: flex;
  flex-direction: column;
  gap: 15px;
  margin-bottom: 40px;
  background: #f5f5f5;
  padding: 20px;
  border-radius: 8px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

input, textarea {
  padding: 8px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

button {
  padding: 10px;
  background: #2c3e50;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

button:disabled {
  opacity: 0.7;
}

.article-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
  align-items: center;
}

.delete-btn {
  background: #dc3545;
  padding: 5px 10px;
}
</style>
