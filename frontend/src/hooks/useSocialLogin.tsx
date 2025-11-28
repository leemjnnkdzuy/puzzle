import {useCallback} from "react";
import type {SocialLoginProvider} from "@/types/AuthTypes";

interface UseSocialLoginReturn {
	handleSocialLogin: (provider: SocialLoginProvider) => void;
}

export const useSocialLogin = (): UseSocialLoginReturn => {
	const handleSocialLogin = useCallback((provider: SocialLoginProvider) => {
		// TODO: Implement social login logic
		// This would typically redirect to OAuth provider or open popup
		console.log(`Social login with ${provider}`);

		// Example implementation:
		// const baseUrl = process.env.REACT_APP_API_URL || "http://localhost:3000";
		// window.location.href = `${baseUrl}/api/auth/${provider}`;
	}, []);

	return {
		handleSocialLogin,
	};
};
