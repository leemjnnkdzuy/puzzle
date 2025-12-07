import {create} from "zustand";
import {persist, createJSONStorage} from "zustand/middleware";
import StorageService, {type StorageInfo} from "@/services/StorageService";

interface StorageState {
	storageInfo: StorageInfo | null;
	loading: boolean;
	error: string | null;
	lastUpdated: number | null;
}

interface StorageActions {
	fetchStorageInfo: () => Promise<void>;
	setStorageInfo: (info: StorageInfo) => void;
	updateFromSSE: (info: StorageInfo) => void;
	reset: () => void;
}

type StorageStore = StorageState & StorageActions;

const STORAGE_KEY = "storage-storage";

const initialState: StorageState = {
	storageInfo: null,
	loading: false,
	error: null,
	lastUpdated: null,
};

export const useStorageStore = create<StorageStore>()(
	persist(
		(set) => ({
			...initialState,

			fetchStorageInfo: async () => {
				try {
					set({loading: true, error: null});
					const info = await StorageService.getStorageInfo();
					set({
						storageInfo: info,
						loading: false,
						lastUpdated: Date.now(),
					});
				} catch (error) {
					set({
						loading: false,
						error:
							error instanceof Error
								? error.message
								: "Failed to fetch storage info",
					});
				}
			},

			setStorageInfo: (info: StorageInfo) => {
				set({
					storageInfo: info,
					lastUpdated: Date.now(),
				});
			},

			updateFromSSE: (info: StorageInfo) => {
				set({
					storageInfo: info,
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
				storageInfo: state.storageInfo,
				lastUpdated: state.lastUpdated,
			}),
		}
	)
);

