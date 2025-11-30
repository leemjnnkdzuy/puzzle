import React, {useState, useEffect} from "react";
import {useParams, useNavigate} from "react-router-dom";
import {
	ArrowLeft,
	FileText,
	Loader2,
	CheckCircle,
	XCircle,
	Clock,
} from "lucide-react";
import Button from "@/components/ui/Button";
import ScriptGenerationService, {
	type ScriptGenerationProject,
} from "@/services/ScriptGenerationService";

const ScriptGenerationServiceProjectPage: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const navigate = useNavigate();
	const [project, setProject] = useState<ScriptGenerationProject | null>(
		null
	);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProject = async () => {
			if (!id) return;

			try {
				setLoading(true);
				setError(null);
				const data = await ScriptGenerationService.getProjectById(id);
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
				return (
					<Loader2 className='w-5 h-5 text-blue-500 animate-spin' />
				);
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

	if (loading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin text-primary' />
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
					{/* Header */}
					<div className='mb-6'>
						<div className='flex items-start justify-between gap-4 mb-4'>
							<div className='flex-1'>
								<div className='flex items-center gap-3 mb-2'>
									<FileText className='w-8 h-8 text-blue-600 dark:text-blue-400' />
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

					<div className='space-y-6'>
						{project.scriptContent && (
							<div className='bg-card border border-border rounded-lg p-6'>
								<h2 className='text-xl font-semibold text-foreground mb-4'>
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
									Cài đặt
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

						{/* Video Info */}
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

						{/* Empty State */}
						{!project.scriptContent &&
							project.status === "pending" && (
								<div className='bg-card border border-border rounded-lg p-12 text-center'>
									<Clock className='w-12 h-12 text-muted-foreground mx-auto mb-4' />
									<p className='text-muted-foreground'>
										Dự án đang chờ xử lý. Script sẽ được tạo
										tự động.
									</p>
								</div>
							)}
					</div>
				</div>
			</div>
		</div>
	);
};

ScriptGenerationServiceProjectPage.displayName =
	"ScriptGenerationServiceProjectPage";
export default ScriptGenerationServiceProjectPage;
