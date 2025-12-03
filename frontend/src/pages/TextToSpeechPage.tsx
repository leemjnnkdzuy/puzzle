import React, {useState, useEffect, useRef} from "react";
import {
	Volume2,
	Play,
	Pause,
	Square,
	Download,
	Trash2,
	X,
	ChevronDown,
	Loader2,
} from "lucide-react";
import {useLanguage} from "@/hooks/useLanguage";
import {useAuth} from "@/hooks/useAuth";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import textToSpeechService, {
	type Voice,
	type HistoryItem,
} from "@/services/TextToSpeechService";
import {formatCurrency} from "@/utils";

const MAX_TEXT_LENGTH = 5000;

const TextToSpeechPage: React.FC = () => {
	const {getNested} = useLanguage();
	const {isAuthenticated} = useAuth();
	const {showSuccess, showError} = useGlobalNotificationPopup();

	const tts = getNested?.("tts") as
		| {
				title?: string;
				description?: string;
				textInput?: string;
				textPlaceholder?: string;
				voice?: string;
				language?: string;
				speed?: string;
				pitch?: string;
				generate?: string;
				clear?: string;
				play?: string;
				pause?: string;
				stop?: string;
				download?: string;
				history?: string;
				noHistory?: string;
				charCount?: string;
				estimatedCost?: string;
				loading?: string;
				error?: {
					textRequired?: string;
					textTooLong?: string;
					voiceRequired?: string;
					generateFailed?: string;
					loadVoicesFailed?: string;
					loadHistoryFailed?: string;
					deleteFailed?: string;
				};
				success?: {
					generated?: string;
					deleted?: string;
				};
				noVoiceSelected?: string;
				selectVoice?: string;
				selectLanguage?: string;
				characters?: string;
				credits?: string;
				deleteConfirm?: string;
				delete?: string;
				cancel?: string;
		  }
		| undefined;

	const [text, setText] = useState("");
	const [selectedVoice, setSelectedVoice] = useState<Voice | null>(null);
	const [selectedLanguage, setSelectedLanguage] = useState<string>("");
	const [speed, setSpeed] = useState(1.0);
	const [pitch, setPitch] = useState(0);
	const [audioUrl, setAudioUrl] = useState<string | null>(null);
	const [isGenerating, setIsGenerating] = useState(false);
	const [isPlaying, setIsPlaying] = useState(false);
	const [history, setHistory] = useState<HistoryItem[]>([]);
	const [voices, setVoices] = useState<Voice[]>([]);
	const [isLoadingVoices, setIsLoadingVoices] = useState(false);
	const [isLoadingHistory, setIsLoadingHistory] = useState(false);
	const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
	const [currentTime, setCurrentTime] = useState(0);
	const [duration, setDuration] = useState(0);

	const audioRef = useRef<HTMLAudioElement | null>(null);
	const textareaRef = useRef<HTMLTextAreaElement>(null);

	const filteredVoices = selectedLanguage
		? voices.filter((v) => v.language === selectedLanguage)
		: voices;

	const estimatedCost = textToSpeechService.calculateCost(
		text.length,
		selectedVoice?.id
	);

	useEffect(() => {
		const loadVoices = async () => {
			try {
				setIsLoadingVoices(true);
				const response = await textToSpeechService.getVoices();
				if (response.success && response.data?.voices) {
					setVoices(response.data.voices);
				} else {
					showError(
						tts?.error?.loadVoicesFailed || "Failed to load voices"
					);
				}
			} catch {
				showError(
					tts?.error?.loadVoicesFailed || "Failed to load voices"
				);
			} finally {
				setIsLoadingVoices(false);
			}
		};

		loadVoices();
	}, [showError, tts]);

	useEffect(() => {
		if (voices.length > 0 && !selectedVoice) {
			setSelectedVoice(voices[0]);
			setSelectedLanguage(voices[0].language);
		}
	}, [voices, selectedVoice]);

	useEffect(() => {
		const loadHistory = async () => {
			try {
				setIsLoadingHistory(true);
				const response = await textToSpeechService.getHistory(1, 20);
				if (response.success && response.data?.items) {
					setHistory(response.data.items);
				} else {
					showError(
						tts?.error?.loadHistoryFailed ||
							"Failed to load history"
					);
				}
			} catch {
				showError(
					tts?.error?.loadHistoryFailed || "Failed to load history"
				);
			} finally {
				setIsLoadingHistory(false);
			}
		};

		loadHistory();
	}, [showError, tts]);

	useEffect(() => {
		if (textareaRef.current) {
			textareaRef.current.style.height = "auto";
			textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`;
		}
	}, [text]);

	useEffect(() => {
		const audio = audioRef.current;
		if (!audio) return;

		const handleTimeUpdate = () => {
			setCurrentTime(audio.currentTime);
			setDuration(audio.duration || 0);
		};

		const handleEnded = () => {
			setIsPlaying(false);
			setCurrentTime(0);
		};

		const handlePlay = () => setIsPlaying(true);
		const handlePause = () => setIsPlaying(false);

		audio.addEventListener("timeupdate", handleTimeUpdate);
		audio.addEventListener("ended", handleEnded);
		audio.addEventListener("play", handlePlay);
		audio.addEventListener("pause", handlePause);

		return () => {
			audio.removeEventListener("timeupdate", handleTimeUpdate);
			audio.removeEventListener("ended", handleEnded);
			audio.removeEventListener("play", handlePlay);
			audio.removeEventListener("pause", handlePause);
		};
	}, [audioUrl]);

	useEffect(() => {
		return () => {
			if (audioUrl) {
				URL.revokeObjectURL(audioUrl);
			}
		};
	}, [audioUrl]);

	const handleGenerate = async () => {
		if (!text.trim()) {
			showError(tts?.error?.textRequired || "Please enter text");
			return;
		}

		if (text.length > MAX_TEXT_LENGTH) {
			showError(
				(tts?.error?.textTooLong || "Text is too long").replace(
					"{max}",
					MAX_TEXT_LENGTH.toString()
				)
			);
			return;
		}

		if (!selectedVoice) {
			showError(tts?.error?.voiceRequired || "Please select a voice");
			return;
		}

		try {
			setIsGenerating(true);
			const response = await textToSpeechService.generateSpeech({
				text: text.trim(),
				voiceId: selectedVoice.id,
				language: selectedLanguage || selectedVoice.language,
				speed,
				pitch,
			});

			if (response.success && response.data?.audioUrl) {
				if (audioUrl) {
					URL.revokeObjectURL(audioUrl);
				}

				setAudioUrl(response.data.audioUrl);
				showSuccess(
					tts?.success?.generated || "Speech generated successfully"
				);

				const historyResponse = await textToSpeechService.getHistory(
					1,
					20
				);
				if (historyResponse.success && historyResponse.data?.items) {
					setHistory(historyResponse.data.items);
				}
			} else {
				showError(
					response.message ||
						tts?.error?.generateFailed ||
						"Failed to generate speech"
				);
			}
		} catch (error) {
			showError(
				error instanceof Error
					? error.message
					: tts?.error?.generateFailed || "Failed to generate speech"
			);
		} finally {
			setIsGenerating(false);
		}
	};

	const handleClear = () => {
		setText("");
		if (audioUrl) {
			URL.revokeObjectURL(audioUrl);
			setAudioUrl(null);
		}
		setIsPlaying(false);
		setCurrentTime(0);
		setDuration(0);
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
		}
	};

	const handlePlay = () => {
		if (audioRef.current) {
			if (isPlaying) {
				audioRef.current.pause();
			} else {
				audioRef.current.play().catch((error) => {
					console.error("Error playing audio:", error);
					showError("Failed to play audio");
				});
			}
		}
	};

	const handleStop = () => {
		if (audioRef.current) {
			audioRef.current.pause();
			audioRef.current.currentTime = 0;
			setIsPlaying(false);
			setCurrentTime(0);
		}
	};

	const handleDownload = () => {
		if (audioUrl && audioRef.current) {
			const link = document.createElement("a");
			link.href = audioUrl;
			link.download = `tts-${Date.now()}.mp3`;
			document.body.appendChild(link);
			link.click();
			document.body.removeChild(link);
		}
	};

	const handleDeleteHistory = async (id: string) => {
		try {
			const response = await textToSpeechService.deleteHistoryItem(id);
			if (response.success) {
				setHistory(history.filter((item) => item.id !== id));
				showSuccess(tts?.success?.deleted || "Deleted successfully");
			} else {
				showError(
					response.message ||
						tts?.error?.deleteFailed ||
						"Failed to delete"
				);
			}
		} catch {
			showError(tts?.error?.deleteFailed || "Failed to delete item");
		} finally {
			setDeleteConfirmId(null);
		}
	};

	const handleSelectHistoryItem = (item: HistoryItem) => {
		setText(item.text);
		const voice = voices.find((v) => v.id === item.voiceId);
		if (voice) {
			setSelectedVoice(voice);
			setSelectedLanguage(voice.language);
		}
		setAudioUrl(item.audioUrl);
	};

	const formatTime = (seconds: number): string => {
		if (isNaN(seconds)) return "0:00";
		const mins = Math.floor(seconds / 60);
		const secs = Math.floor(seconds % 60);
		return `${mins}:${secs.toString().padStart(2, "0")}`;
	};

	const handleLanguageChange = (language: string) => {
		setSelectedLanguage(language);
		// Auto-select first voice of the language
		const firstVoice = voices.find((v) => v.language === language);
		if (firstVoice) {
			setSelectedVoice(firstVoice);
		} else {
			setSelectedVoice(null);
		}
	};

	// Get unique languages from voices
	const languages = Array.from(new Set(voices.map((v) => v.language))).sort();

	if (!isAuthenticated) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<p className='text-muted-foreground'>
						Please log in to use Text-to-Speech
					</p>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background p-4 md:p-8'>
			<div className='max-w-6xl mx-auto'>
				{/* Header Section */}
				<div className='mb-8'>
					<h1 className='text-3xl font-bold text-foreground mb-2'>
						{tts?.title || "Text-to-Speech"}
					</h1>
					<p className='text-muted-foreground'>
						{tts?.description ||
							"Convert text to natural speech with advanced AI technology"}
					</p>
				</div>

				{/* Main Content Grid */}
				<div className='grid grid-cols-1 lg:grid-cols-3 gap-6'>
					{/* Left Column - Input & Controls */}
					<div className='lg:col-span-2 space-y-6'>
						{/* Text Input Section */}
						<div className='rounded-lg border border-input bg-card p-6'>
							<label className='block text-sm font-medium text-foreground mb-2'>
								{tts?.textInput || "Enter text"}
							</label>
							<textarea
								ref={textareaRef}
								value={text}
								onChange={(e) => setText(e.target.value)}
								placeholder={
									tts?.textPlaceholder ||
									"Enter the text you want to convert to speech..."
								}
								className='w-full min-h-[200px] p-3 bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
								maxLength={MAX_TEXT_LENGTH}
							/>
							<div className='flex justify-between items-center mt-4'>
								<span className='text-sm text-muted-foreground'>
									{text.length} / {MAX_TEXT_LENGTH}{" "}
									{tts?.characters || "characters"}
								</span>
								<span className='text-sm text-muted-foreground'>
									{tts?.estimatedCost || "Estimated cost"}:{" "}
									<span className='font-semibold text-foreground'>
										{formatCurrency(estimatedCost)}{" "}
										{tts?.credits || "credits"}
									</span>
								</span>
							</div>
						</div>

						{/* Voice & Language Selection */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Language Selection */}
							<div>
								<label className='block text-sm font-medium text-foreground mb-2'>
									{tts?.language || "Language"}
								</label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button
											type='button'
											className='w-full flex items-center justify-between px-3 py-2 text-sm bg-accent/50 border border-input rounded-md hover:bg-accent transition-colors'
										>
											<span className='text-foreground'>
												{selectedLanguage ||
													tts?.selectLanguage ||
													"Select language"}
											</span>
											<ChevronDown className='w-4 h-4 text-muted-foreground' />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto'>
										{languages.map((lang) => (
											<DropdownMenuItem
												key={lang}
												onClick={() =>
													handleLanguageChange(lang)
												}
											>
												{lang}
											</DropdownMenuItem>
										))}
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							{/* Voice Selection */}
							<div>
								<label className='block text-sm font-medium text-foreground mb-2'>
									{tts?.voice || "Select voice"}
								</label>
								{isLoadingVoices ? (
									<div className='flex items-center justify-center px-3 py-2 border border-input rounded-md'>
										<Loading size='sm' />
									</div>
								) : (
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												type='button'
												className='w-full flex items-center justify-between px-3 py-2 text-sm bg-accent/50 border border-input rounded-md hover:bg-accent transition-colors'
											>
												<span className='text-foreground'>
													{selectedVoice?.name ||
														tts?.noVoiceSelected ||
														"No voice selected"}
												</span>
												<ChevronDown className='w-4 h-4 text-muted-foreground' />
											</button>
										</DropdownMenuTrigger>
										<DropdownMenuContent className='w-[var(--radix-dropdown-menu-trigger-width)] max-h-[300px] overflow-y-auto'>
											{filteredVoices.length === 0 ? (
												<div className='px-2 py-1.5 text-sm text-muted-foreground'>
													No voices available
												</div>
											) : (
												filteredVoices.map((voice) => (
													<DropdownMenuItem
														key={voice.id}
														onClick={() => {
															setSelectedVoice(
																voice
															);
															setSelectedLanguage(
																voice.language
															);
														}}
													>
														<div className='flex flex-col'>
															<span>
																{voice.name}
															</span>
															{voice.gender && (
																<span className='text-xs text-muted-foreground'>
																	{
																		voice.gender
																	}
																</span>
															)}
														</div>
													</DropdownMenuItem>
												))
											)}
										</DropdownMenuContent>
									</DropdownMenu>
								)}
							</div>
						</div>

						{/* Speed & Pitch Controls */}
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							{/* Speed Control */}
							<div className='rounded-lg border border-input bg-card p-4'>
								<label className='block text-sm font-medium text-foreground mb-2'>
									{tts?.speed || "Speed"}: {speed.toFixed(2)}x
								</label>
								<input
									type='range'
									min='0.5'
									max='2.0'
									step='0.1'
									value={speed}
									onChange={(e) =>
										setSpeed(parseFloat(e.target.value))
									}
									className='w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer'
								/>
							</div>

							{/* Pitch Control */}
							<div className='rounded-lg border border-input bg-card p-4'>
								<label className='block text-sm font-medium text-foreground mb-2'>
									{tts?.pitch || "Pitch"}:{" "}
									{pitch > 0 ? "+" : ""}
									{pitch}
								</label>
								<input
									type='range'
									min='-12'
									max='12'
									step='1'
									value={pitch}
									onChange={(e) =>
										setPitch(parseInt(e.target.value))
									}
									className='w-full h-2 bg-secondary rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:cursor-pointer'
								/>
							</div>
						</div>

						{/* Action Buttons */}
						<div className='flex gap-3'>
							<Button
								variant='primary'
								onClick={handleGenerate}
								loading={isGenerating}
								disabled={isGenerating || !text.trim()}
								className='flex-1'
							>
								{isGenerating ? (
									<>
										<Loader2 className='w-4 h-4 animate-spin mr-2' />
										{tts?.loading || "Generating..."}
									</>
								) : (
									<>
										<Volume2 className='w-4 h-4 mr-2' />
										{tts?.generate || "Generate speech"}
									</>
								)}
							</Button>
							<Button
								variant='outline'
								onClick={handleClear}
								disabled={isGenerating}
							>
								<X className='w-4 h-4 mr-2' />
								{tts?.clear || "Clear"}
							</Button>
						</div>
					</div>

					{/* Right Column - Audio Player & History */}
					<div className='space-y-6'>
						{/* Audio Player */}
						<div className='rounded-lg border border-input bg-card p-6'>
							<h3 className='text-lg font-semibold text-foreground mb-4'>
								{tts?.title || "Audio Player"}
							</h3>
							{audioUrl ? (
								<>
									<audio
										ref={audioRef}
										src={audioUrl}
										className='hidden'
									/>
									<div className='space-y-4'>
										{/* Progress Bar */}
										<div>
											<div className='flex justify-between text-xs text-muted-foreground mb-1'>
												<span>
													{formatTime(currentTime)}
												</span>
												<span>
													{formatTime(duration)}
												</span>
											</div>
											<div className='w-full h-2 bg-secondary rounded-full overflow-hidden'>
												<div
													className='h-full bg-primary transition-all'
													style={{
														width: `${
															duration > 0
																? (currentTime /
																		duration) *
																  100
																: 0
														}%`,
													}}
												/>
											</div>
										</div>

										{/* Controls */}
										<div className='flex gap-2'>
											<Button
												variant='outline'
												size='sm'
												onClick={handlePlay}
												disabled={!audioUrl}
											>
												{isPlaying ? (
													<>
														<Pause className='w-4 h-4 mr-2' />
														{tts?.pause || "Pause"}
													</>
												) : (
													<>
														<Play className='w-4 h-4 mr-2' />
														{tts?.play || "Play"}
													</>
												)}
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={handleStop}
												disabled={
													!audioUrl || !isPlaying
												}
											>
												<Square className='w-4 h-4 mr-2' />
												{tts?.stop || "Stop"}
											</Button>
											<Button
												variant='outline'
												size='sm'
												onClick={handleDownload}
												disabled={!audioUrl}
												className='flex-1'
											>
												<Download className='w-4 h-4 mr-2' />
												{tts?.download || "Download"}
											</Button>
										</div>
									</div>
								</>
							) : (
								<div className='text-center py-8 text-muted-foreground'>
									<Volume2 className='w-12 h-12 mx-auto mb-2 opacity-50' />
									<p>No audio generated yet</p>
								</div>
							)}
						</div>

						{/* History Section */}
						<div className='rounded-lg border border-input bg-card p-6'>
							<h3 className='text-lg font-semibold text-foreground mb-4'>
								{tts?.history || "History"}
							</h3>
							{isLoadingHistory ? (
								<div className='flex items-center justify-center py-8'>
									<Loading size='sm' />
								</div>
							) : history.length === 0 ? (
								<div className='text-center py-8 text-muted-foreground'>
									<p>{tts?.noHistory || "No history yet"}</p>
								</div>
							) : (
								<div className='space-y-2 max-h-[400px] overflow-y-auto'>
									{history.map((item) => (
										<div
											key={item.id}
											className='p-3 rounded-md border border-input bg-background hover:bg-accent/50 transition-colors'
										>
											<div className='flex items-start justify-between gap-2'>
												<div
													className='flex-1 cursor-pointer'
													onClick={() =>
														handleSelectHistoryItem(
															item
														)
													}
												>
													<p className='text-sm font-medium text-foreground line-clamp-2'>
														{item.text}
													</p>
													<div className='flex items-center gap-2 mt-1'>
														<span className='text-xs text-muted-foreground'>
															{item.voiceName ||
																item.voiceId}
														</span>
														<span className='text-xs text-muted-foreground'>
															•
														</span>
														<span className='text-xs text-muted-foreground'>
															{new Date(
																item.createdAt
															).toLocaleDateString()}
														</span>
													</div>
												</div>
												<Button
													variant='outline'
													size='icon'
													onClick={() =>
														setDeleteConfirmId(
															item.id
														)
													}
													className='shrink-0'
												>
													<Trash2 className='w-4 h-4' />
												</Button>
											</div>
										</div>
									))}
								</div>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Delete Confirmation Dialog */}
			<ConfirmDialog
				isOpen={deleteConfirmId !== null}
				onClose={() => setDeleteConfirmId(null)}
				onConfirm={() => {
					if (deleteConfirmId) {
						handleDeleteHistory(deleteConfirmId);
					}
				}}
				title={tts?.delete || "Delete"}
				message={
					tts?.deleteConfirm ||
					"Are you sure you want to delete this item?"
				}
				confirmText={tts?.delete || "Delete"}
				cancelText={tts?.cancel || "Cancel"}
				confirmVariant='destructive'
			/>
		</div>
	);
};

export default TextToSpeechPage;
