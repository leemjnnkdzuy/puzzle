import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
	ArrowLeft,
	Sparkles,
	CheckCircle,
	XCircle,
	Clock,
	FileText,
	Volume2,
	Video,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import FullServiceService, {
	type FullServiceProject,
} from "@/services/FullServiceService";
import {useLanguage} from "@/hooks/useLanguage";

const FullServiceProjectPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const {getNested} = useLanguage();
	const [project, setProject] = useState<FullServiceProject | null>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProject = async () => {
			if (!id) return;

			try {
				setLoading(true);
				setError(null);
				const data = await FullServiceService.getProjectById(id);
				setProject(data);
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Không thể tải dự án"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [id]);

	const getStatusIcon = (status: string) => {
		switch (status) {
			case "completed":
				return <CheckCircle className='w-5 h-5 text-green-500' />;
			case "failed":
				return <XCircle className='w-5 h-5 text-red-500' />;
			case "processing":
				return <Loading size={20} color='text-blue-500' />;
			default:
				return <Clock className='w-5 h-5 text-yellow-500' />;
		}
	};

	const getStatusText = (status: string) => {
		switch (status) {
			case "completed":
				return "Hoàn thành";
			case "failed":
				return "Thất bại";
			case "processing":
				return "Đang xử lý";
			default:
				return "Chờ xử lý";
		}
	};

	const getStepStatus = (stepStatus?: string) => {
		if (!stepStatus) return "Chưa bắt đầu";
		switch (stepStatus) {
			case "completed":
				return "Hoàn thành";
			case "failed":
				return "Thất bại";
			case "processing":
				return "Đang xử lý";
			default:
				return "Chờ xử lý";
		}
	};

	if (loading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Loading size='lg' />
			</div>
		);
	}

	if (error || !project) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-500 mb-4'>
						{error || "Không tìm thấy dự án"}
					</p>
					<Button onClick={() => navigate("/home")} variant='default'>
						Quay lại trang chủ
					</Button>
				</div>
			</div>
		);
	}

	return (
		<div className='min-h-screen bg-background'>
			<div className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
				<Button
					onClick={() => navigate("/home")}
					variant='text'
					className='mb-6 flex items-center gap-2'
				>
					<ArrowLeft className='w-4 h-4' />
					Quay lại
				</Button>

				<div className='max-w-4xl mx-auto'>
					<div className='mb-6'>
						<div className='flex items-start justify-between gap-4 mb-4'>
							<div className='flex-1'>
								<div className='flex items-center gap-3 mb-2'>
									<Sparkles className='w-8 h-8 text-cyan-600 dark:text-cyan-400' />
									<h1 className='text-3xl font-bold text-foreground'>
										{project.title}
									</h1>
								</div>
								<p className='text-muted-foreground mb-4'>
									{project.description || "Không có mô tả"}
								</p>
								<div className='flex items-center gap-4'>
									<div className='flex items-center gap-2'>
										{getStatusIcon(project.status)}
										<span className='text-sm font-medium text-foreground'>
											{getStatusText(project.status)}
										</span>
									</div>
									<span className='text-sm text-muted-foreground'>
										Tạo:{" "}
										{new Date(
											project.createdAt
										).toLocaleDateString("vi-VN")}
									</span>
									<span className='text-sm text-muted-foreground'>
										Cập nhật:{" "}
										{new Date(
											project.updatedAt
										).toLocaleDateString("vi-VN")}
									</span>
								</div>
							</div>
						</div>
					</div>

					{project.processingSteps && (
						<div className='bg-card border border-border rounded-lg p-6 mb-6'>
							<h2 className='text-xl font-semibold text-foreground mb-4'>
								Tiến trình xử lý
							</h2>
							<div className='space-y-3'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<FileText className='w-4 h-4 text-blue-500' />
										<span className='text-foreground'>
											{
												getNested?.(
													"packages.scriptGeneration.subtitle"
												) as string
											}
										</span>
									</div>
									<span className='text-sm text-muted-foreground'>
										{getStepStatus(
											project.processingSteps
												.scriptGeneration
										)}
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Volume2 className='w-4 h-4 text-purple-500' />
										<span className='text-foreground'>
											Voice Generation
										</span>
									</div>
									<span className='text-sm text-muted-foreground'>
										{getStepStatus(
											project.processingSteps
												.voiceGeneration
										)}
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2'>
										<Video className='w-4 h-4 text-cyan-500' />
										<span className='text-foreground'>
											Video Generation
										</span>
									</div>
									<span className='text-sm text-muted-foreground'>
										{getStepStatus(
											project.processingSteps
												.videoGeneration
										)}
									</span>
								</div>
							</div>
						</div>
					)}

					{/* Content */}
					<div className='space-y-6'>
						{/* Script Content */}
						{project.scriptContent && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-4 flex items-center gap-2'>
									<FileText className='w-5 h-5' />
									Nội dung Script
								</h2>
								<div className='prose dark:prose-invert max-w-none'>
									<p className='text-foreground whitespace-pre-wrap'>
										{project.scriptContent}
									</p>
								</div>
							</div>
						)}

						{/* Generation Settings */}
						{project.generationSettings && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-4'>
									Cài đặt Generation
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
									{project.generationSettings.tone && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Tone:
											</span>
											<p className='text-foreground font-medium'>
												{
													project.generationSettings
														.tone
												}
											</p>
										</div>
									)}
									{project.generationSettings.style && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Style:
											</span>
											<p className='text-foreground font-medium'>
												{
													project.generationSettings
														.style
												}
											</p>
										</div>
									)}
									{project.generationSettings.length && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Length:
											</span>
											<p className='text-foreground font-medium'>
												{
													project.generationSettings
														.length
												}
											</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Voice Settings */}
						{project.voiceSettings && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-4 flex items-center gap-2'>
									<Volume2 className='w-5 h-5' />
									Cài đặt Voice
								</h2>
								<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
									{project.voiceSettings.voiceName && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Voice:
											</span>
											<p className='text-foreground font-medium'>
												{
													project.voiceSettings
														.voiceName
												}
											</p>
										</div>
									)}
									{project.voiceSettings.speed !==
										undefined && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Tốc độ:
											</span>
											<p className='text-foreground font-medium'>
												{project.voiceSettings.speed}x
											</p>
										</div>
									)}
									{project.voiceSettings.pitch !==
										undefined && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Cao độ:
											</span>
											<p className='text-foreground font-medium'>
												{project.voiceSettings.pitch}
											</p>
										</div>
									)}
									{project.voiceSettings.volume !==
										undefined && (
										<div>
											<span className='text-sm text-muted-foreground'>
												Âm lượng:
											</span>
											<p className='text-foreground font-medium'>
												{project.voiceSettings.volume}%
											</p>
										</div>
									)}
								</div>
							</div>
						)}

						{/* Audio */}
						{project.audioUrl && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-4'>
									Audio
								</h2>
								<audio
									src={project.audioUrl}
									controls
									className='w-full'
								/>
								{project.audioDuration && (
									<p className='text-sm text-muted-foreground mt-2'>
										Thời lượng:{" "}
										{Math.floor(project.audioDuration / 60)}
										:
										{String(
											Math.floor(
												project.audioDuration % 60
											)
										).padStart(2, "0")}
									</p>
								)}
							</div>
						)}

						{/* Video */}
						{project.videoUrl && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-4'>
									Video
								</h2>
								<video
									src={project.videoUrl}
									controls
									className='w-full rounded-lg'
								/>
								{project.videoDuration && (
									<p className='text-sm text-muted-foreground mt-2'>
										Thời lượng:{" "}
										{Math.floor(project.videoDuration / 60)}
										:
										{String(
											Math.floor(
												project.videoDuration % 60
											)
										).padStart(2, "0")}
									</p>
								)}
							</div>
						)}

						{/* Language */}
						{project.language && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-2'>
									Ngôn ngữ
								</h2>
								<p className='text-foreground'>
									{project.language}
								</p>
							</div>
						)}

						{/* Empty State */}
						{!project.scriptContent &&
							project.status === "pending" && (
								<div className='bg-card border border-border rounded-lg p-12 text-center'>
									<Clock className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
									<p className='text-muted-foreground'>
										Dự án đang chờ xử lý. Toàn bộ quy trình
										sẽ được thực hiện tự động.
									</p>
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
};

FullServiceProjectPage.displayName = "FullServiceProjectPage";
export default FullServiceProjectPage;
