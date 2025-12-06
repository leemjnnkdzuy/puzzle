export interface GeoLocationResponse {
	countryCode: string;
	country: string;
}

class GeoLocationService {
	private getIPApiUrl(ip: string): string {
		return `https://ipinfo.io/${ip}/json`;
	}

	private readonly IPIFY_URL = "https://api.ipify.org/?format=json";
	private readonly cacheKey = "geo_location_cache";
	private readonly ipCacheKey = "client_ip_cache";
	private readonly cacheExpiry = 24 * 60 * 60 * 1000;

	async getClientIP(): Promise<string | null> {
		try {
			const cachedIP = localStorage.getItem(this.ipCacheKey);
			if (cachedIP) {
				const parsed = JSON.parse(cachedIP);
				if (parsed.expiry && Date.now() < parsed.expiry) {
					return parsed.ip;
				}
			}
		} catch (error) {
			console.warn("Failed to get cached IP:", error);
		}

		try {
			const response = await fetch(this.IPIFY_URL, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const ip = data.ip;

			if (ip) {
				try {
					localStorage.setItem(
						this.ipCacheKey,
						JSON.stringify({
							ip,
							expiry: Date.now() + this.cacheExpiry,
						})
					);
				} catch (e) {
					console.warn("Failed to cache IP:", e);
				}
				return ip;
			}

			return null;
		} catch (error) {
			console.warn("Failed to get client IP:", error);
			return null;
		}
	}

	private parseResponse(data: unknown): GeoLocationResponse | null {
		if (!data || typeof data !== "object") {
			return null;
		}

		const obj = data as Record<string, unknown>;
		const countryCode = obj.country as string;
		const city = obj.city as string;
		const region = obj.region as string;

		if (countryCode && countryCode.length === 2) {
			const countryName = city || region || countryCode;

			return {
				countryCode: countryCode.toUpperCase(),
				country: countryName,
			};
		}

		return null;
	}

	async getLocationFromIP(ip: string): Promise<GeoLocationResponse | null> {
		const cached = this.getCachedLocation();
		if (cached) {
			return cached;
		}

		try {
			const apiUrl = this.getIPApiUrl(ip);
			const response = await fetch(apiUrl, {
				method: "GET",
				headers: {
					Accept: "application/json",
				},
			});

			if (!response.ok) {
				throw new Error(`HTTP error! status: ${response.status}`);
			}

			const data = await response.json();
			const location = this.parseResponse(data);

			if (location) {
				this.setCachedLocation(location);
				return location;
			}

			return null;
		} catch (error) {
			console.warn("Failed to get location from IP:", error);
			return null;
		}
	}

	getLanguageFromCountryCode(countryCode: string): "en" | "vi" {
		if (countryCode === "VN") {
			return "vi";
		}
		return "en";
	}

	async detectLanguageFromIP(): Promise<"en" | "vi" | null> {
		try {
			const clientIP = await this.getClientIP();
			if (!clientIP) {
				return null;
			}

			const location = await this.getLocationFromIP(clientIP);
			if (location) {
				return this.getLanguageFromCountryCode(location.countryCode);
			}
			return null;
		} catch (error) {
			console.warn("Failed to detect language from IP:", error);
			return null;
		}
	}

	private getCachedLocation(): GeoLocationResponse | null {
		try {
			const cached = localStorage.getItem(this.cacheKey);
			if (!cached) {
				return null;
			}

			const parsed = JSON.parse(cached);
			const now = Date.now();

			if (parsed.expiry && now > parsed.expiry) {
				localStorage.removeItem(this.cacheKey);
				return null;
			}

			return parsed.data;
		} catch (error) {
			console.warn("Failed to get cached location:", error);
			return null;
		}
	}

	private setCachedLocation(location: GeoLocationResponse): void {
		try {
			const cacheData = {
				data: location,
				expiry: Date.now() + this.cacheExpiry,
			};
			localStorage.setItem(this.cacheKey, JSON.stringify(cacheData));
		} catch (error) {
			console.warn("Failed to cache location:", error);
		}
	}

	clearCache(): void {
		try {
			localStorage.removeItem(this.cacheKey);
		} catch (error) {
			console.warn("Failed to clear cache:", error);
		}
	}
}

const geoLocationService = new GeoLocationService();

export default geoLocationService;
