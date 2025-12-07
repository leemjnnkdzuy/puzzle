import axios from 'axios';
import { DEV_TO_API, HACKER_NEWS_API, GNEWS_API } from '@/configs/AppConfig';

export interface BlogPost {
    id: number;
    title: string;
    description: string;
    cover_image: string | null;
    published_at: string;
    url: string;
    user: {
        name: string;
        profile_image: string;
    };
    body_html?: string;
    tag_list: string[];
    reading_time_minutes: number;
}

export interface HackerNewsStory {
    id: number;
    title: string;
    url?: string;
    time: number;
    score: number;
    by: string;
}

export interface GNewsArticle {
    title: string;
    description: string;
    content: string;
    url: string;
    image: string;
    publishedAt: string;
    source: {
        name: string;
        url: string;
    };
}

class BlogService {
    static async getDevToArticles(tag: string = 'technology', top: number = 7): Promise<BlogPost[]> {
        try {
            const response = await axios.get(DEV_TO_API, {
                params: {
                    tag,
                    top,
                    per_page: 10
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Dev.to articles:', error);
            return [];
        }
    }

    static async getDevToLatest(tag: string = 'python'): Promise<BlogPost[]> {
         try {
            const response = await axios.get(DEV_TO_API, {
                params: {
                    tag,
                    per_page: 5
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching Dev.to latest:', error);
            return [];
        }
    }

    static async getHackerNewsStories(limit: number = 20): Promise<HackerNewsStory[]> {
        try {
            const idsResponse = await axios.get(`${HACKER_NEWS_API}/topstories.json`);
            const topIds = idsResponse.data.slice(0, limit);

            const storyPromises = topIds.map((id: number) => 
                axios.get(`${HACKER_NEWS_API}/item/${id}.json`).then(res => res.data)
            );

            const stories = await Promise.all(storyPromises);
            return stories.filter(story => story && story.title);
        } catch (error) {
            console.error('Error fetching Hacker News stories:', error);
            return [];
        }
    }

    static async getGNewsArticles(query: string = 'technology', lang: string = 'en', max: number = 5): Promise<GNewsArticle[]> {
        const apiKey = import.meta.env.VITE_GNEWS_API_KEY;
        if (!apiKey) {
            console.warn('GNews API Key is missing (VITE_GNEWS_API_KEY). GNews section will be empty.');
            return [];
        }

        try {
            const response = await axios.get(GNEWS_API, {
                params: {
                    q: query,
                    lang: lang,
                    apikey: apiKey,
                    max: max
                }
            });
            return response.data.articles;
        } catch (error) {
            console.error('Error fetching GNews articles:', error);
            return [];
        }
    }
}

export default BlogService;
