<template>
  <div class="article-container">
    <!-- Back button -->
    <header class="article-header">
      <button class="back-btn" @click="goBack">
        ← Back
      </button>
      <span class="source">Real Estate News</span>
    </header>

    <!-- Article content -->
    <article v-if="article" class="article-content">
      <!-- Featured image -->
      <div class="article-image" v-if="article.image">
        <img :src="getImageUrl()" :alt="article.title" />
      </div>

      <!-- Article body -->
      <div class="article-body">
        <h1 class="article-title">{{ article.title }}</h1>
        
        <div class="article-meta">
          <span class="article-date">{{ formatDate(article.date || article.created) }}</span>
        </div>

        <div class="article-text" v-html="article.content"></div>
      </div>
    </article>

    <!-- Loading state -->
    <div v-if="loading" class="loading-state">
      <div class="spinner"></div>
      <p>Loading article...</p>
    </div>

    <!-- Error state -->
    <div v-if="error" class="error-state">
      <span class="error-icon">⚠️</span>
      <p>{{ error }}</p>
      <button class="retry-btn" @click="fetchArticle">Try Again</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import pb from '../services/pocketbase';

const route = useRoute();
const router = useRouter();

const article = ref(null);
const loading = ref(true);
const error = ref('');

// Fetch article by ID
const fetchArticle = async () => {
  try {
    loading.value = true;
    error.value = '';
    const id = route.params.id;
    article.value = await pb.collection('articles').getOne(id);
  } catch (e) {
    console.error('Error fetching article:', e);
    error.value = 'Article not found or could not be loaded.';
  } finally {
    loading.value = false;
  }
};

// Get image URL
const getImageUrl = () => {
  if (!article.value?.image) return '';
  return pb.files.getURL(article.value, article.value.image);
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

// Go back to feed
const goBack = () => {
  router.push('/');
};

onMounted(() => {
  fetchArticle();
});
</script>

<style scoped>
.article-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
}

/* Header */
.article-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem 1.5rem;
  background: rgba(30, 58, 95, 0.9);
  position: sticky;
  top: 0;
  z-index: 100;
  backdrop-filter: blur(10px);
}

.back-btn {
  background: rgba(255, 255, 255, 0.1);
  border: none;
  color: #4fc3f7;
  padding: 0.5rem 1rem;
  border-radius: 8px;
  cursor: pointer;
  font-size: 0.9rem;
  font-weight: 500;
  transition: all 0.3s ease;
}

.back-btn:hover {
  background: rgba(255, 255, 255, 0.2);
}

.source {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* Article Image */
.article-image {
  width: 100%;
  max-height: 400px;
  overflow: hidden;
}

.article-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

/* Article Body */
.article-body {
  max-width: 700px;
  margin: 0 auto;
  padding: 2rem 1.5rem;
}

.article-title {
  font-size: 2rem;
  font-weight: 700;
  color: #e2e8f0;
  line-height: 1.3;
  margin: 0 0 1rem 0;
}

.article-meta {
  margin-bottom: 2rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.article-date {
  color: #4fc3f7;
  font-size: 0.9rem;
}

.article-text {
  color: rgba(255, 255, 255, 0.85);
  font-size: 1.1rem;
  line-height: 1.8;
}

.article-text :deep(p) {
  margin-bottom: 1.5rem;
}

.article-text :deep(h2),
.article-text :deep(h3) {
  color: #e2e8f0;
  margin: 2rem 0 1rem;
}

.article-text :deep(a) {
  color: #4fc3f7;
}

.article-text :deep(img) {
  max-width: 100%;
  border-radius: 8px;
  margin: 1rem 0;
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 5rem 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 50px;
  height: 50px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4fc3f7;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error State */
.error-state {
  text-align: center;
  padding: 5rem 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.error-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.retry-btn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: #4fc3f7;
  color: #0f0f1a;
  border: none;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s ease;
}

.retry-btn:hover {
  transform: scale(1.05);
}

/* Responsive */
@media (max-width: 480px) {
  .article-title {
    font-size: 1.5rem;
  }
  
  .article-text {
    font-size: 1rem;
  }
}
</style>
