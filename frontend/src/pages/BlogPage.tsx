import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import BlogService, { type BlogPost, type HackerNewsStory, type GNewsArticle } from '@/services/BlogService';
import { ExternalLink, Clock, TrendingUp, Newspaper, ChevronRight, Hash, ArrowLeft } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import Button from "@/components/ui/Button";
import { useLanguage } from '@/hooks/useLanguage';

const BlogPage = () => {
    const navigate = useNavigate();
    const { language, t } = useLanguage();
    const [devToArticles, setDevToArticles] = useState<BlogPost[]>([]);
    const [hackerNewsStories, setHackerNewsStories] = useState<HackerNewsStory[]>([]);
    const [gNewsArticles, setGNewsArticles] = useState<GNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            setLoading(true);
            try {
                const [devTo, hackerNews, gNews] = await Promise.all([
                    BlogService.getDevToArticles('technology', 10),
                    BlogService.getHackerNewsStories(20),
                    BlogService.getGNewsArticles('technology', language)
                ]);

                setDevToArticles(devTo);
                setHackerNewsStories(hackerNews);
                setGNewsArticles(gNews);
            } catch (error) {
                console.error("Failed to load blog data", error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, [language]);

    const featuredArticle = devToArticles.length > 0 ? devToArticles[0] : null;
    const remainingArticles = devToArticles.length > 1 ? devToArticles.slice(1) : [];

    return (
        <div className="flex flex-col min-h-screen bg-background">
            <div className="w-full max-w-[1300px] mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <Button
                    size='sm'
                    className='mb-6 -ml-3 text-muted-foreground hover:text-foreground hover:opacity-100 bg-transparent border-none shadow-none transition-colors duration-200'
                    onClick={() => navigate("/")}
                    variant='text'
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('signIn.backToHome')}
                </Button>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loading size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
    
                        <div className="lg:col-span-8 xl:col-span-9 space-y-8">
                                                        {featuredArticle && (
                                <div className="group relative rounded-2xl overflow-hidden shadow-lg border border-border bg-card hover:shadow-xl transition-all duration-300">
                                    <div className="aspect-video w-full overflow-hidden relative">
                                        {featuredArticle.cover_image ? (
                                            <img 
                                                src={featuredArticle.cover_image} 
                                                alt={featuredArticle.title} 
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center">
                                                <span className="text-4xl">🚀</span>
                                            </div>
                                        )}
                                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent flex flex-col justify-end p-6 md:p-8">
                                            <div className="flex flex-wrap gap-2 mb-3">
                                                {featuredArticle.tag_list.map(tag => (
                                                    <span key={tag} className="text-xs font-semibold px-2 py-1 rounded-md bg-primary text-primary-foreground backdrop-blur-sm">
                                                        #{tag}
                                                    </span>
                                                ))}
                                            </div>
                                            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2 leading-tight group-hover:text-primary-foreground/90 transition-colors">
                                                <div 
                                                    className="hover:underline decoration-2 underline-offset-4 cursor-pointer"
                                                    onClick={() => window.open(featuredArticle.url, "_blank", "noopener,noreferrer")}
                                                >
                                                    {featuredArticle.title}
                                                </div>
                                            </h1>
                                            <p className="text-gray-200 line-clamp-2 md:line-clamp-3 mb-4 max-w-3xl text-sm md:text-base">
                                                {featuredArticle.description}
                                            </p>
                                            <div className="flex items-center text-gray-300 text-xs md:text-sm">
                                                <div className="flex items-center mr-4">
                                                    {featuredArticle.user.profile_image && (
                                                        <img src={featuredArticle.user.profile_image} alt={featuredArticle.user.name} className="w-6 h-6 rounded-full mr-2 border border-gray-500" />
                                                    )}
                                                    <span className="font-medium">{featuredArticle.user.name}</span>
                                                </div>
                                                <div className="flex items-center mr-4">
                                                    <Clock className="w-4 h-4 mr-1" />
                                                    {featuredArticle.reading_time_minutes} min read
                                                </div>
                                                <div className="flex items-center">
                                                    {new Date(featuredArticle.published_at).toLocaleDateString()}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {remainingArticles.map(article => (
                                    <div key={article.id} className="flex flex-col bg-card border border-border rounded-xl overflow-hidden hover:shadow-md transition-shadow group h-full">
                                        <div className="h-48 overflow-hidden relative">
                                            {article.cover_image ? (
                                                <img 
                                                    src={article.cover_image} 
                                                    alt={article.title} 
                                                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                                />
                                            ) : (
                                                <div className="w-full h-full bg-muted/50 flex items-center justify-center">
                                                    <Hash className="w-12 h-12 text-muted-foreground/30" />
                                                </div>
                                            )}
                                            <div className="absolute top-2 right-2 bg-background/80 backdrop-blur text-foreground text-xs px-2 py-1 rounded-full font-medium border border-border">
                                                {new Date(article.published_at).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                            </div>
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <div className="flex flex-wrap gap-1 mb-2">
                                                {article.tag_list.slice(0, 3).map(tag => (
                                                    <span key={tag} className="text-xs text-muted-foreground bg-muted px-1.5 py-0.5 rounded">#{tag}</span>
                                                ))}
                                            </div>
                                            <h3 className="text-lg font-bold mb-2 line-clamp-2 group-hover:text-primary transition-colors">
                                                <div 
                                                    className="cursor-pointer"
                                                    onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                                                >
                                                    {article.title}
                                                </div>
                                            </h3>
                                            <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                                                {article.description}
                                            </p>
                                            <div className="flex items-center justify-between pt-4 border-t border-border mt-auto">
                                                <div className="flex items-center text-xs text-muted-foreground">
                                                    {article.user.profile_image && (
                                                        <img src={article.user.profile_image} alt={article.user.name} className="w-5 h-5 rounded-full mr-2" />
                                                    )}
                                                    {article.user.name}
                                                </div>
                                                <div 
                                                    onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                                                    className="text-xs font-semibold text-primary flex items-center hover:underline cursor-pointer"
                                                >
                                                    {t('blog.readMore')} <ExternalLink className="w-3 h-3 ml-1" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="lg:col-span-4 xl:col-span-3 space-y-6">
                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-sm font-bold flex items-center text-foreground mb-4 uppercase tracking-wider text-red-500">
                                    <TrendingUp className="w-4 h-4 mr-2" />
                                    {t('blog.breakingNews')}
                                </h3>
                                <div className="space-y-4">
                                    {hackerNewsStories.length > 0 ? (
                                        hackerNewsStories.slice(0, 5).map((story) => (
                                            <div key={story.id} className="group relative pl-4 border-l-2 border-border hover:border-red-500 transition-colors duration-300">
                                                <div 
                                                    onClick={() => window.open(story.url, "_blank", "noopener,noreferrer")}
                                                    className="block cursor-pointer"
                                                >
                                                    <h4 className="text-sm font-medium text-foreground/90 group-hover:text-primary transition-colors line-clamp-2">
                                                        {story.title}
                                                    </h4>
                                                    <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground">
                                                        <span className="font-semibold text-primary/70">{story.score} pts</span>
                                                        <span>•</span>
                                                        <span>{new Date(story.time * 1000).toLocaleDateString()}</span>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-sm text-muted-foreground">{t('blog.loadingBreakingNews')}</div>
                                    )}
                                </div>
                            </div>
                            <div className="bg-card border border-border rounded-xl p-6 sticky top-24">
                                <div className="mb-6 pb-4 border-b border-border/50">
                                    <h2 className="text-lg font-bold flex items-center text-foreground mb-2">
                                        <Newspaper className="w-5 h-5 mr-2 text-primary" />
                                        {t('blog.globalTech')}
                                    </h2>
                                    <div className="flex items-center gap-2 pl-7">
                                        <span className="relative flex h-2 w-2">
                                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                                          <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
                                        </span>
                                        <span className="text-xs font-medium text-primary uppercase tracking-wide">
                                            {t('blog.trending')}
                                        </span>
                                    </div>
                                </div>
                                
                                <div className="space-y-6">
                                    {gNewsArticles.length > 0 ? (
                                        gNewsArticles.map((article, idx) => (
                                            <div key={idx} className="group">
                                                <div onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")} className="block cursor-pointer">
                                                    <div className="flex gap-3 mb-2">
                                                        {article.image && (
                                                            <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                                                                <img src={article.image} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300" />
                                                            </div>
                                                        )}
                                                        <div className="flex-1 min-w-0">
                                                            <h4 className="text-sm font-semibold leading-snug line-clamp-3 group-hover:text-primary transition-colors">
                                                                {article.title}
                                                            </h4>
                                                        </div>
                                                    </div>
                                                    
                                                    <div className="flex items-center justify-between text-xs text-muted-foreground mt-1 pl-19">
                                                        <span>{article.source.name}</span>
                                                        <span className="flex items-center">
                                                            {new Date(article.publishedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                                                        </span>
                                                    </div>
                                                </div>
                                                {idx < gNewsArticles.length - 1 && <div className="h-px bg-border mt-4" />}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-8 text-muted-foreground text-sm">
                                            {import.meta.env.VITE_GNEWS_API_KEY ? t('blog.noTrendingNews') : t('blog.addApiKey')}
                                        </div>
                                    )}
                                </div>

                                <button 
                                    className="w-full mt-6 py-2 text-sm font-medium text-primary hover:bg-primary/5 border border-primary/20 rounded-lg transition-colors flex items-center justify-center"
                                    onClick={() => navigate("/blog/trending")}
                                >
                                    {t('blog.viewAllTrending')} <ChevronRight className="w-4 h-4 ml-1" />
                                </button>
                            </div>

                            <div className="bg-card border border-border rounded-xl p-6">
                                <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider mb-4">{t('blog.popularTopics')}</h3>
                                <div className="flex flex-wrap gap-2">
                                    {['JavaScript', 'React', 'AI', 'Web3', 'Python', 'DevOps', 'Cybersecurity', 'Mobile'].map(topic => (
                                        <span 
                                            key={topic} 
                                            className="text-xs font-medium px-3 py-1.5 rounded-lg bg-secondary hover:bg-secondary/80 text-secondary-foreground cursor-pointer transition-colors"
                                        >
                                            {topic}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        </div>

                    </div>
                )}
            </div>
        </div>
    );
};

export default BlogPage;
