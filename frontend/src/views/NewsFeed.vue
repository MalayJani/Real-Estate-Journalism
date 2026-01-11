<template>
  <div class="news-container">
    <!-- Header -->
    <header class="news-header">
      <div class="header-content">
        <h1 class="logo">Real Estate News</h1>
        <span class="tagline">Latest Property Insights</span>
      </div>
    </header>

    <!-- Articles Grid -->
    <main class="articles-grid">
      <article 
        v-for="article in articles" 
        :key="article.id" 
        class="article-card"
        @click="openArticle(article.id)"
      >
        <!-- Image thumbnail -->
        <div class="card-image" v-if="article.image">
          <img :src="getImageUrl(article)" :alt="article.title" />
        </div>
        <div class="card-image placeholder" v-else>
          <span class="placeholder-icon">📰</span>
        </div>

        <!-- Content -->
        <div class="card-content">
          <h2 class="card-title">{{ article.title }}</h2>
          <p class="card-preview">{{ getPreview(article.content) }}</p>
          <div class="card-meta">
            <span class="card-date">{{ formatDate(article.date || article.created) }}</span>
          </div>
        </div>
      </article>

      <!-- Empty state -->
      <div v-if="articles.length === 0 && !loading" class="empty-state">
        <span class="empty-icon">📭</span>
        <p>No articles yet. Create one in the admin panel!</p>
        <a href="http://127.0.0.1:8090/_/" target="_blank" class="admin-link">Open Admin Panel →</a>
      </div>

      <!-- Loading state -->
      <div v-if="loading" class="loading-state">
        <div class="spinner"></div>
        <p>Loading articles...</p>
      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import pb from '../services/pocketbase';

const router = useRouter();
const articles = ref([]);
const loading = ref(true);

// Fetch all published articles
const fetchArticles = async () => {
  try {
    loading.value = true;
    const records = await pb.collection('articles').getList(1, 50, {
      filter: 'published = true',
      sort: '-created',
    });
    articles.value = records.items;
  } catch (error) {
    console.error('Error fetching articles:', error);
    // Try without filter in case published field doesn't exist
    try {
      const records = await pb.collection('articles').getList(1, 50, {
        sort: '-created',
      });
      articles.value = records.items;
    } catch (e) {
      console.error('Error fetching articles without filter:', e);
    }
  } finally {
    loading.value = false;
  }
};

// Get image URL from PocketBase
const getImageUrl = (article) => {
  if (!article.image) return '';
  return pb.files.getURL(article, article.image, { thumb: '200x120' });
};

// Get preview text from content (strip HTML)
const getPreview = (content) => {
  if (!content) return '';
  const text = content.replace(/<[^>]*>/g, '');
  return text.length > 120 ? text.substring(0, 120) + '...' : text;
};

// Format date
const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  const now = new Date();
  const diffMs = now - date;
  const diffHrs = Math.floor(diffMs / (1000 * 60 * 60));
  
  if (diffHrs < 1) return 'Just now';
  if (diffHrs < 24) return `${diffHrs}h ago`;
  if (diffHrs < 48) return 'Yesterday';
  
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
  });
};

// Navigate to article detail
const openArticle = (id) => {
  router.push(`/article/${id}`);
};

// Real-time subscription
let unsubscribe;

onMounted(async () => {
  await fetchArticles();
  
  // Subscribe to real-time changes
  unsubscribe = await pb.collection('articles').subscribe('*', (e) => {
    console.log('Real-time update:', e.action);
    fetchArticles(); // Refresh list on any change
  });
});

onUnmounted(() => {
  if (unsubscribe) {
    pb.collection('articles').unsubscribe('*');
  }
});
</script>

<style scoped>
.news-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 100%);
  padding-bottom: 2rem;
}

/* Header */
.news-header {
  background: linear-gradient(90deg, #1e3a5f 0%, #2d5a87 100%);
  padding: 1rem 1.5rem;
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
}

.header-content {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.logo {
  font-size: 1.5rem;
  font-weight: 700;
  color: #fff;
  margin: 0;
  background: linear-gradient(90deg, #4fc3f7, #81d4fa);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.tagline {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
}

/* Articles Grid */
.articles-grid {
  max-width: 800px;
  margin: 0 auto;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

/* Article Card - Google News Style */
.article-card {
  display: flex;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  overflow: hidden;
  cursor: pointer;
  transition: all 0.3s ease;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.article-card:hover {
  background: rgba(255, 255, 255, 0.1);
  transform: translateY(-2px);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.3);
}

/* Card Image - Compact like Google News */
.card-image {
  width: 120px;
  height: 80px;
  flex-shrink: 0;
  overflow: hidden;
  background: rgba(255, 255, 255, 0.05);
}

.card-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.card-image.placeholder {
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #2d3748 0%, #1a202c 100%);
}

.placeholder-icon {
  font-size: 2rem;
  opacity: 0.5;
}

/* Card Content */
.card-content {
  flex: 1;
  padding: 0.75rem 1rem;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-width: 0;
}

.card-title {
  font-size: 1rem;
  font-weight: 600;
  color: #e2e8f0;
  margin: 0 0 0.25rem 0;
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-preview {
  font-size: 0.8rem;
  color: rgba(255, 255, 255, 0.5);
  margin: 0;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  margin-top: 0.5rem;
}

.card-date {
  font-size: 0.75rem;
  color: #4fc3f7;
}

/* Empty State */
.empty-state {
  text-align: center;
  padding: 3rem 1rem;
  color: rgba(255, 255, 255, 0.5);
}

.empty-icon {
  font-size: 3rem;
  display: block;
  margin-bottom: 1rem;
}

.admin-link {
  display: inline-block;
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: linear-gradient(90deg, #4fc3f7, #29b6f6);
  color: #0f0f1a;
  border-radius: 8px;
  text-decoration: none;
  font-weight: 600;
  transition: all 0.3s ease;
}

.admin-link:hover {
  transform: scale(1.05);
  box-shadow: 0 4px 20px rgba(79, 195, 247, 0.3);
}

/* Loading State */
.loading-state {
  text-align: center;
  padding: 3rem;
  color: rgba(255, 255, 255, 0.5);
}

.spinner {
  width: 40px;
  height: 40px;
  border: 3px solid rgba(255, 255, 255, 0.1);
  border-top-color: #4fc3f7;
  border-radius: 50%;
  margin: 0 auto 1rem;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 480px) {
  .card-image {
    width: 100px;
    height: 70px;
  }
  
  .card-title {
    font-size: 0.9rem;
  }
  
  .card-preview {
    display: none;
  }
}
</style>
