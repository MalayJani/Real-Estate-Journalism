import { createRouter, createWebHistory } from 'vue-router';
import NewsFeed from '../views/NewsFeed.vue';
import ArticleDetail from '../views/ArticleDetail.vue';

const routes = [
    {
        path: '/',
        name: 'NewsFeed',
        component: NewsFeed
    },
    {
        path: '/article/:id',
        name: 'ArticleDetail',
        component: ArticleDetail
    }
];

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;
