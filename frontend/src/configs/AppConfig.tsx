const DEFAULT_FPS = 30;
const DEFAULT_MEDIA_DURATION = 5;
const DEFAULT_TEXT_DURATION = 3;

const DEFAULT_API_URL = "http://localhost:5000";
const apiBaseUrl = `${DEFAULT_API_URL}/api`;

const IPIFY_API_URL = "https://api.ipify.org/?format=json";
const IPINFO_API_URL = (ip: string) => `https://ipinfo.io/${ip}/json`;

const DEFAULT_LANGUAGE = "en";
const SUPPORTED_LANGUAGES = ["en", "vi"];

const DEV_TO_API = 'https://dev.to/api/articles';
const HACKER_NEWS_API = 'https://hacker-news.firebaseio.com/v0';
const GNEWS_API = 'https://gnews.io/api/v4/search';

const apiConfig = {
	apiBaseUrl,
	ipifyApiUrl: IPIFY_API_URL,
	ipinfoApiUrl: IPINFO_API_URL,
};

export {
	DEFAULT_FPS,
	DEFAULT_MEDIA_DURATION,
	DEFAULT_TEXT_DURATION,
	DEFAULT_API_URL,
	DEFAULT_LANGUAGE,
	SUPPORTED_LANGUAGES,
	IPIFY_API_URL,
	IPINFO_API_URL,
	DEV_TO_API,
	HACKER_NEWS_API,
	GNEWS_API,
	apiConfig,
};

export default apiConfig;