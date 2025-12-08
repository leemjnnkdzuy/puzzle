import { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { GNEWS_API_KEY } from "@/configs/AppConfig";
import BlogService, { type GNewsArticle } from '@/services/BlogService';
import { ArrowLeft, Newspaper, ExternalLink } from 'lucide-react';
import Loading from '@/components/ui/Loading';
import Button from "@/components/ui/Button";
import { useLanguage } from '@/hooks/useLanguage';

const TrendingPage = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { language, t } = useLanguage();
    const [articles, setArticles] = useState<GNewsArticle[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }, [location.pathname]);

    useEffect(() => {
        const fetchTrending = async () => {
            setLoading(true);
            try {
                const data = await BlogService.getGNewsArticles('technology', language, 20);
                setArticles(data);
            } catch (error) {
                console.error("Failed to load trending news", error);
            } finally {
                setLoading(false);
            }
        };

        fetchTrending();
    }, [language]);

    return (
        <div className="min-h-screen bg-background p-6">
            <div className="max-w-[1300px] mx-auto">
                <Button
                    size='sm'
                    className='mb-6 -ml-3 text-muted-foreground hover:text-foreground hover:opacity-100 bg-transparent border-none shadow-none transition-colors duration-200'
                    onClick={() => navigate("/blog")}
                    variant='text'
                >
                    <ArrowLeft className="mr-2 h-4 w-4" />
                    {t('blog.backToBlog')}
                </Button>

                <div className="flex items-center mb-8">
                    <div className="p-3 bg-primary/10 rounded-full mr-4">
                        <Newspaper className="w-8 h-8 text-primary" />
                    </div>
                    <div>
                        <h1 className="text-3xl font-bold text-foreground">{t('blog.globalTechTrends')}</h1>
                        <p className="text-muted-foreground mt-1">{t('blog.globalTechTrendsDesc')}</p>
                    </div>
                </div>

                {loading ? (
                    <div className="flex justify-center items-center h-96">
                        <Loading size={40} />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {articles.length > 0 ? (
                            articles.map((article, idx) => (
                                <div key={idx} className="bg-card border border-border rounded-xl overflow-hidden hover:shadow-lg transition-all duration-300 group flex flex-col h-full">
                                    <div onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")} className="block h-48 overflow-hidden relative cursor-pointer">
                                        {article.image ? (
                                            <img 
                                                src={article.image} 
                                                alt={article.title} 
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
                                            />
                                        ) : (
                                            <div className="w-full h-full bg-muted flex items-center justify-center">
                                                <Newspaper className="w-12 h-12 text-muted-foreground/30" />
                                            </div>
                                        )}
                                        <div className="absolute top-2 right-2 bg-background/90 backdrop-blur text-foreground text-xs px-2 py-1 rounded-md font-medium shadow-sm">
                                            {article.source.name}
                                        </div>
                                    </div>
                                    
                                    <div className="p-5 flex flex-col flex-grow">
                                        <div className="text-xs text-muted-foreground mb-2 flex items-center">
                                            {new Date(article.publishedAt).toLocaleDateString(undefined, { 
                                                year: 'numeric', 
                                                month: 'long', 
                                                day: 'numeric' 
                                            })}
                                        </div>
                                        
                                        <h3 className="text-lg font-bold mb-3 line-clamp-3 group-hover:text-primary transition-colors">
                                            <div onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")} className="cursor-pointer">
                                                {article.title}
                                            </div>
                                        </h3>
                                        
                                        <p className="text-sm text-muted-foreground line-clamp-3 mb-4 flex-grow">
                                            {article.description}
                                        </p>
                                        
                                        <div className="pt-4 mt-auto border-t border-border">
                                            <div 
                                                onClick={() => window.open(article.url, "_blank", "noopener,noreferrer")}
                                                className="text-sm font-medium text-primary flex items-center hover:underline cursor-pointer"
                                            >
                                                {t('blog.readFullArticle')} <ExternalLink className="w-3 h-3 ml-1" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="col-span-full text-center py-12 text-muted-foreground">
                                {GNEWS_API_KEY ? t('blog.noTrendingNews') : t('blog.checkApiKey')}
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
};

export default TrendingPage;
