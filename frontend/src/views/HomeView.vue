<template>
  <div class="home">
    <h1>Latest Articles</h1>
    <div v-if="loading" class="loading">Loading...</div>
    <div v-else class="articles-list">
      <div v-for="article in articles" :key="article.id" class="article-card">
        <router-link :to="{ name: 'article', params: { id: article.id } }" class="article-link">
          <img v-if="article.image" :src="getImageUrl(article)" :alt="article.title" class="article-image" />
          <div class="article-content">
            <h2>{{ article.title }}</h2>
            <p class="date">{{ formatDate(article.created) }}</p>
            <div class="preview">{{ article.content.substring(0, 100) }}...</div>
          </div>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import pb from '../services/pocketbase'

const articles = ref([])
const loading = ref(true)

onMounted(async () => {
  try {
    const result = await pb.collection('articles').getList(1, 50, {
      sort: '-created',
    });
    articles.value = result.items
  } catch (error) {
    console.error('Error fetching articles:', error)
  } finally {
    loading.value = false
  }
})

function getImageUrl(article) {
  if (!article.image) return '';
  return pb.files.getUrl(article, article.image);
}

function formatDate(dateString) {
  return new Date(dateString).toLocaleDateString()
}
</script>

<style scoped>
.home {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.article-card {
  border-bottom: 1px solid #eee;
  padding: 20px 0;
}

.article-link {
  display: flex;
  gap: 20px;
  text-decoration: none;
  color: inherit;
}

.article-link:hover h2 {
  color: #646cff;
}

.article-image {
  width: 120px;
  height: 80px;
  object-fit: cover;
  border-radius: 8px;
}

.article-content h2 {
  margin: 0 0 10px 0;
  font-size: 1.2rem;
}

.date {
  color: #666;
  font-size: 0.9rem;
}
</style>
