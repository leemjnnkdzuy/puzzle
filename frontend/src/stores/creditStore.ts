import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import paymentService from "@/services/PaymentService";

interface CreditState {
	credit: number;
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

interface CreditActions {
	fetchCredit: () => Promise<void>;
	setCredit: (credit: number) => void;
	updateFromSSE: (credit: number) => void;
	reset: () => void;
}

type CreditStore = CreditState & CreditActions;

const STORAGE_KEY = "credit-storage";

const initialState: CreditState = {
	credit: 0,
	loading: false,
	error: null,
	lastUpdated: null,
};

export const useCreditStore = create<CreditStore>()(
	persist(
		(set) => ({
			...initialState,

			fetchCredit: async () => {
				try {
					set({loading: true, error: null});
					const response = await paymentService.getBalance();
					if (response.success && response.data) {
						set({
							credit: response.data.credit,
							loading: false,
							lastUpdated: Date.now(),
						});
					} else {
						set({
							loading: false,
							error: response.message || "Failed to fetch credit",
						});
					}
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "Failed to fetch credit",
					});
				}
			},

			setCredit: (credit: number) => {
				set({
					credit,
					lastUpdated: Date.now(),
				});
			},

			updateFromSSE: (credit: number) => {
				set({
					credit,
					lastUpdated: Date.now(),
				});
			},

			reset: () => {
				set(initialState);
			},
		}),
		{
			name: STORAGE_KEY,
			storage: createJSONStorage(() => localStorage),
			partialize: (state) => ({
				credit: state.credit,
				lastUpdated: state.lastUpdated,
			}),
		}
	)
);
