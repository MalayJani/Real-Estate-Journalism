<template>
  <div class="article-view">
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else-if="error" class="error">{{ error }}</div>
    <div v-else-if="article" class="article-container">
      <router-link to="/" class="back-link">&larr; Back to articles</router-link>
      <header class="article-header">
        <h1>{{ article.title }}</h1>
        <p class="date">{{ formatDate(article.created) }}</p>
      </header>
      
      <img v-if="article.image" :src="getImageUrl(article)" :alt="article.title" class="main-image" />
      
      <div class="content" v-html="article.content"></div>
    </div>
    <div v-else class="not-found">Article not found</div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import { useRoute } from 'vue-router'
import pb from '../services/pocketbase'

const route = useRoute()
const article = ref(null)
const loading = ref(true)
const error = ref(null)

onMounted(async () => {
  try {
    const id = route.params.id
    if (!id) throw new Error('No article ID provided')
    
    article.value = await pb.collection('articles').getOne(id)
  } catch (err) {
    console.error('Error fetching article:', err)
    error.value = 'Failed to load article'
  } finally {
    loading.value = false
  }
})

function getImageUrl(record) {
  if (!record.image) return '';
  return pb.files.getUrl(record, record.image);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString(undefined, {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}
</script>

<style scoped>
.article-view {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.back-link {
  display: inline-block;
  margin-bottom: 20px;
  color: #666;
  text-decoration: none;
}

.back-link:hover {
  text-decoration: underline;
}

.article-header {
  margin-bottom: 30px;
}

.article-header h1 {
  font-size: 2.5rem;
  margin-bottom: 10px;
  line-height: 1.2;
}

.main-image {
  width: 100%;
  max-height: 500px;
  object-fit: cover;
  border-radius: 12px;
  margin-bottom: 30px;
}

.content {
  line-height: 1.8;
  font-size: 1.1rem;
  color: #333;
  white-space: pre-wrap; /* Preserves newlines from the textarea */
}

/* Dark mode support inheriting from global styles */
@media (prefers-color-scheme: dark) {
  .content {
    color: #eee;
  }
  .back-link {
    color: #aaa;
  }
}
</style>
