import apiClient from "@/utils/axiosInstance";

export interface Voice {
	id: string;
	name: string;
	language: string;
	gender?: "male" | "female" | "neutral";
	provider?: string;
}

export interface GenerateSpeechRequest {
	text: string;
	voiceId: string;
	language?: string;
	speed?: number;
	pitch?: number;
}

export interface GenerateSpeechResponse {
	success: boolean;
	message?: string;
	data?: {
		audioUrl: string;
		duration?: number;
		text?: string;
		voiceId?: string;
	};
}

export interface HistoryItem {
	id: string;
	text: string;
	voiceId: string;
	voiceName?: string;
	language?: string;
	audioUrl: string;
	createdAt: string;
	duration?: number;
}

export interface GetHistoryResponse {
	success: boolean;
	message?: string;
	data?: {
		items: HistoryItem[];
		total?: number;
		page?: number;
		limit?: number;
	};
}

export interface GetVoicesResponse {
	success: boolean;
	message?: string;
	data?: {
		voices: Voice[];
	};
}

class TextToSpeechService {
	async generateSpeech(
		request: GenerateSpeechRequest
	): Promise<GenerateSpeechResponse> {
		const response = await apiClient.post<GenerateSpeechResponse>(
			"/api/tts/generate",
			request
		);
		return response.data;
	}

	async getVoices(language?: string): Promise<GetVoicesResponse> {
		const params = language ? {language} : {};
		const response = await apiClient.get<GetVoicesResponse>(
			"/api/tts/voices",
			{params}
		);
		return response.data;
	}

	async getHistory(
		page: number = 1,
		limit: number = 10
	): Promise<GetHistoryResponse> {
		const response = await apiClient.get<GetHistoryResponse>(
			"/api/tts/history",
			{
				params: {page, limit},
			}
		);
		return response.data;
	}

	async deleteHistoryItem(id: string): Promise<{
		success: boolean;
		message?: string;
	}> {
		const response = await apiClient.delete<{
			success: boolean;
			message?: string;
		}>(`/api/tts/history/${id}`);
		return response.data;
	}

	calculateCost(textLength: number, voiceId?: string): number {
		const baseCost = Math.ceil(textLength / 100);
		void voiceId;
		return baseCost;
	}
}

const textToSpeechService = new TextToSpeechService();

export default textToSpeechService;
