import React, {useEffect, useState, useCallback} from "react";
import {useNavigate} from "react-router-dom";
import {HardDrive, FolderOpen, Plus, Cloud, X, AlertCircle, FileText, Sparkles, Mic} from "lucide-react";
import {useLanguage} from "@/hooks/useLanguage";
import {useStorageStore} from "@/stores/storageStore";
import {useCreditStore} from "@/stores/creditStore";
import StorageService, {type ProjectStorage} from "@/services/StorageService";
import Overlay from "@/components/ui/Overlay";
import Button from "@/components/ui/Button";
import Tooltip from "@/components/ui/Tooltip";
import Loading from "@/components/ui/Loading";
import {cn} from "@/utils";

const UPGRADE_PACKAGES = [
	{amountGB: 1, label: "1 GB"},
	{amountGB: 2, label: "2 GB"},
	{amountGB: 5, label: "5 GB"},
	{amountGB: 10, label: "10 GB"},
];

const StoragePage: React.FC = () => {
	const navigate = useNavigate();
	const {t} = useLanguage();
	const {storageInfo, loading, fetchStorageInfo} = useStorageStore();
	const {credit, fetchCredit} = useCreditStore();
	const [upgradeOverlayOpen, setUpgradeOverlayOpen] = useState(false);
	const [upgrading, setUpgrading] = useState(false);
	const [upgradeError, setUpgradeError] = useState<string | null>(null);
	const [selectedPackage, setSelectedPackage] = useState<number | null>(null);
	const [projects, setProjects] = useState<ProjectStorage[]>([]);
	const [projectsLoading, setProjectsLoading] = useState(false);

	const storage = t("storagePage") as
		| {
				title: string;
				description: string;
				totalSpace: string;
				usedSpace: string;
				freeSpace: string;
				upgradeStorage: string;
				noData: string;
				projectList: string;
				noProjects: string;
		  }
		| undefined;

	const fetchProjects = useCallback(async () => {
		try {
			setProjectsLoading(true);
			const data = await StorageService.getProjectsStorage();
			setProjects(data);
		} catch (error) {
			console.error("Failed to fetch projects:", error);
		} finally {
			setProjectsLoading(false);
		}
	}, []);

	useEffect(() => {
		fetchStorageInfo();
		fetchCredit();
		fetchProjects();
	}, [fetchStorageInfo, fetchCredit, fetchProjects]);

	const getUsagePercentage = (): number => {
		if (!storageInfo || storageInfo.limit === 0) return 0;
		return (storageInfo.used / storageInfo.limit) * 100;
	};

	const getProgressColor = (percentage: number): string => {
		if (percentage >= 90) return "bg-red-500";
		if (percentage >= 70) return "bg-yellow-500";
		return "bg-primary";
	};

	const getProjectTypeStyle = (type: string) => {
		switch (type) {
			case "script_generation":
				return {
					bgColor: "bg-blue-500/10",
					textColor: "text-blue-600 dark:text-blue-400",
					progressColor: "bg-blue-500",
					Icon: FileText
				};
			case "script_voice":
				return {
					bgColor: "bg-purple-500/10",
					textColor: "text-purple-600 dark:text-purple-400",
					progressColor: "bg-purple-500",
					Icon: Mic
				};
			case "full_service":
				return {
					bgColor: "bg-cyan-500/10",
					textColor: "text-cyan-600 dark:text-cyan-400",
					progressColor: "bg-cyan-500",
					Icon: Sparkles
				};
			default:
				return {
					bgColor: "bg-gray-500/10",
					textColor: "text-gray-600 dark:text-gray-400",
					progressColor: "bg-gray-500",
					Icon: FolderOpen
				};
		}
	};

	const getProjectTypeLabel = (type: string) => {
		switch (type) {
			case "script_generation":
				return (t("packages.scriptGeneration.subtitle") as string) || "Script Generation";
			case "script_voice":
				return (t("packages.scriptVoice.subtitle") as string) || "Script + Voice";
			case "full_service":
				return (t("packages.fullService.subtitle") as string) || "Full Service";
			default:
				return type;
		}
	};

	const getProjectRoute = (project: ProjectStorage) => {
		switch (project.type) {
			case "script_generation":
				return `/script-generation/${project.id}`;
			case "script_voice":
				return `/script-voice/${project.id}`;
			case "full_service":
				return `/full-service/${project.id}`;
			default:
				return `/`;
		}
	};

	const handleUpgrade = async () => {
		if (!selectedPackage || !storageInfo) return;

		const packageInfo = UPGRADE_PACKAGES.find(
			(pkg) => pkg.amountGB === selectedPackage
		);
		if (!packageInfo) return;

		if (credit < selectedPackage) {
			setUpgradeError(
				`Không đủ credit. Cần: ${selectedPackage}, Hiện tại: ${credit}`
			);
			return;
		}

		try {
			setUpgrading(true);
			setUpgradeError(null);
			await StorageService.upgradeStorage(selectedPackage);
			await fetchStorageInfo();
			await fetchCredit();
			setSelectedPackage(null);
			setUpgradeOverlayOpen(false);
		} catch (err) {
			const errorMessage =
				err instanceof Error
					? err.message
					: "Nâng cấp dung lượng thất bại";
			setUpgradeError(errorMessage);
		} finally {
			setUpgrading(false);
		}
	};

	return (
		<>
			<div className='min-h-full p-6 md:p-8'>
				<div className='max-w-6xl mx-auto'>
					<div className='flex items-center justify-between mb-8'>
						<div className='flex items-center gap-3'>
							<div>
								<h1 className='text-2xl font-bold text-foreground'>
									{storage?.title || "Lưu trữ"}
								</h1>
								<p className='text-sm text-muted-foreground'>
									{storage?.description || "Quản lý dung lượng lưu trữ của bạn"}
								</p>
							</div>
						</div>
						<button
							onClick={() => setUpgradeOverlayOpen(true)}
							className={cn(
								"flex items-center gap-2 px-4 py-2 rounded-lg",
								"bg-primary text-primary-foreground",
								"hover:bg-primary/90 transition-colors duration-200"
							)}
						>
							<Plus className='w-4 h-4' />
							<span className='text-sm font-medium'>
								{storage?.upgradeStorage || "Nạp dung lượng"}
							</span>
						</button>
					</div>

					<div className='rounded-2xl mb-6'>
						<div className='flex items-center justify-between mb-4'>
							<h2 className='text-lg font-semibold text-card-foreground'>
								{storage?.totalSpace || "Tổng dung lượng"}
							</h2>
							{storageInfo && (
								<span className='text-sm text-muted-foreground'>
									{storageInfo.usedFormatted} / {storageInfo.limitFormatted}
								</span>
							)}
						</div>

						<div className='h-4 rounded-full mb-4 flex gap-0.5'>
							{storageInfo && storageInfo.limit > 0 && projects.length > 0 ? (
								<>
									{projects.map((project) => {
										const percentage = (project.storageUsed / storageInfo.limit) * 100;
										const style = getProjectTypeStyle(project.type);

										if (percentage <= 0) return null;

										return (
											<Tooltip
												key={project.id}
												content={
													<div className="flex items-center gap-2 text-sm whitespace-nowrap">
														<span className="font-semibold">{project.title}</span>
														<div className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
														<span className="font-mono">{project.storageUsedFormatted}</span>
														<div className="w-1 h-1 rounded-full bg-muted-foreground/50 shrink-0" />
														<span className="font-mono text-muted-foreground">{percentage.toFixed(1)}%</span>
													</div>
												}
											>
												<div
													className={cn("h-full transition-all duration-500 hover:opacity-80 cursor-pointer rounded-full", style.progressColor)}
													style={{width: `${percentage}%`}}
												/>
											</Tooltip>
										);
									})}
									{(() => {
										const totalUsedPercent = projects.reduce((acc, p) => acc + (p.storageUsed / storageInfo.limit) * 100, 0);
										const remainingPercent = Math.max(0, 100 - totalUsedPercent);
										
										if (remainingPercent <= 0) return null;

										return (
											<Tooltip content={storage?.freeSpace || "Còn trống"}>
												<div 
													className="h-full bg-secondary rounded-full transition-all duration-500" 
													style={{width: `${remainingPercent}%`}} 
												/>
											</Tooltip>
										);
									})()}
								</>
							) : (
								<div className="w-full h-full bg-secondary rounded-full overflow-hidden">
									<div
										className={cn(
											"h-full rounded-full transition-all duration-500",
											getProgressColor(getUsagePercentage())
										)}
										style={{width: `${Math.min(getUsagePercentage(), 100)}%`}}
									/>
								</div>
							)}
						</div>

						<div className='grid grid-cols-2 gap-4'>
							<div className='flex items-center gap-3 p-4 bg-secondary/50 rounded-xl'>
								<div className='p-2 rounded-lg bg-primary/10'>
									<FolderOpen className='w-5 h-5 text-primary' />
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										{storage?.usedSpace || "Đã sử dụng"}
									</p>
									<p className='text-lg font-semibold text-card-foreground'>
										{storageInfo?.usedFormatted || "0 B"}
									</p>
								</div>
							</div>
							<div className='flex items-center gap-3 p-4 bg-secondary/50 rounded-xl'>
								<div className='p-2 rounded-lg bg-green-500/10'>
									<HardDrive className='w-5 h-5 text-green-500' />
								</div>
								<div>
									<p className='text-sm text-muted-foreground'>
										{storage?.freeSpace || "Còn trống"}
									</p>
									<p className='text-lg font-semibold text-card-foreground'>
										{storageInfo?.availableFormatted || "0 B"}
									</p>
								</div>
							</div>
						</div>
					</div>

					{/* Project Storage List */}
					<div className='mt-8'>
						<h2 className='text-lg font-semibold text-foreground mb-4'>
							{storage?.projectList || "Dung lượng theo dự án"}
						</h2>

						{projectsLoading ? (
							<div className='flex items-center justify-center py-12'>
								<Loading size='lg' />
							</div>
						) : projects.length === 0 ? (
							<div className='text-center py-12 bg-secondary/30 rounded-xl'>
								<FolderOpen className='w-12 h-12 mx-auto text-muted-foreground/50 mb-4' />
								<p className='text-muted-foreground'>
									{storage?.noProjects || "Chưa có dự án nào"}
								</p>
							</div>
						) : (
							<div className='space-y-2'>
								{projects.map((project) => {
									const style = getProjectTypeStyle(project.type);
									const Icon = style.Icon;
									
									return (
										<div
											key={project.id}
											onClick={() => navigate(getProjectRoute(project))}
											className='flex items-center justify-between p-4 bg-secondary/30 hover:bg-secondary/50 rounded-xl cursor-pointer transition-colors duration-200'
										>
											<div className='flex items-center gap-3'>
												<div className={cn("p-2 rounded-lg", style.bgColor, style.textColor)}>
													<Icon className='w-4 h-4' />
												</div>
												<div>
													<p className='font-medium text-foreground'>
														{project.title}
													</p>
													<p className='text-xs text-muted-foreground'>
														{getProjectTypeLabel(project.type)}
													</p>
												</div>
											</div>
											<div className='text-right'>
												<p className='font-semibold text-foreground'>
													{project.storageUsedFormatted}
												</p>
												{storageInfo && storageInfo.used > 0 && (
													<p className='text-xs text-muted-foreground'>
														{((project.storageUsed / storageInfo.used) * 100).toFixed(1)}%
													</p>
												)}
											</div>
										</div>
									);
								})}
							</div>
						)}
					</div>

					{!loading && !storageInfo && (
						<div className='mt-8 text-center'>
							<HardDrive className='w-12 h-12 mx-auto text-muted-foreground/50 mb-4' />
							<p className='text-muted-foreground'>
								{storage?.noData || "Không có dữ liệu lưu trữ"}
							</p>
						</div>
					)}
				</div>
			</div>

			<Overlay
				isOpen={upgradeOverlayOpen}
				onClose={() => setUpgradeOverlayOpen(false)}
				contentClassName='max-w-lg'
			>
				<div className='p-6'>
					<div className='flex items-center justify-between mb-6'>
						<div className='flex items-center gap-3'>
							<div className='w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center'>
								<Cloud className='w-5 h-5 text-primary' />
							</div>
							<div>
								<h2 className='text-xl font-semibold text-foreground'>
									Nâng cấp Cloud Storage
								</h2>
								<p className='text-sm text-muted-foreground'>
									Sử dụng credit để tăng dung lượng
								</p>
							</div>
						</div>
						<button
							onClick={() => setUpgradeOverlayOpen(false)}
							className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
							aria-label='Đóng'
						>
							<X className='w-5 h-5' />
						</button>
					</div>

					{storageInfo && (
						<div className='bg-muted/50 rounded-lg p-4 mb-6'>
							<div className='space-y-2'>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-muted-foreground'>
										Dung lượng đã dùng:
									</span>
									<span className='text-sm font-medium text-foreground'>
										{storageInfo.usedFormatted}
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-muted-foreground'>
										Tổng dung lượng:
									</span>
									<span className='text-sm font-medium text-foreground'>
										{storageInfo.limitFormatted}
									</span>
								</div>
								<div className='flex items-center justify-between'>
									<span className='text-sm text-muted-foreground'>
										Còn lại:
									</span>
									<span className='text-sm font-medium text-primary'>
										{storageInfo.availableFormatted}
									</span>
								</div>
								<div className='flex items-center justify-between pt-2 border-t border-border'>
									<span className='text-sm text-muted-foreground'>
										Credit hiện tại:
									</span>
									<span className='text-sm font-medium text-foreground'>
										{credit.toLocaleString()}
									</span>
								</div>
							</div>
						</div>
					)}

					<div className='mb-6'>
						<h3 className='text-sm font-medium text-foreground mb-3'>
							Chọn gói nâng cấp (1GB = 1 credit):
						</h3>
						<div className='grid grid-cols-2 gap-3'>
							{UPGRADE_PACKAGES.map((pkg) => (
								<button
									key={pkg.amountGB}
									onClick={() => setSelectedPackage(pkg.amountGB)}
									disabled={credit < pkg.amountGB || upgrading}
									className={`p-4 rounded-lg border-2 transition-all ${
										selectedPackage === pkg.amountGB
											? "border-primary bg-primary/10"
											: "border-border hover:border-primary/50"
									} ${
										credit < pkg.amountGB
											? "opacity-50 cursor-not-allowed"
											: "cursor-pointer"
									}`}
								>
									<div className='text-center'>
										<div className='text-lg font-semibold text-foreground mb-1'>
											{pkg.label}
										</div>
										<div className='text-xs text-muted-foreground'>
											{pkg.amountGB} credit
										</div>
									</div>
								</button>
							))}
						</div>
					</div>

					{upgradeError && (
						<div className='bg-destructive/10 border border-destructive/20 rounded-lg p-3 mb-4'>
							<div className='flex items-center gap-2 text-destructive'>
								<AlertCircle className='w-4 h-4' />
								<p className='text-sm'>{upgradeError}</p>
							</div>
						</div>
					)}

					<div className='flex items-center gap-3'>
						<Button
							variant='outline'
							onClick={() => setUpgradeOverlayOpen(false)}
							disabled={upgrading}
							className='flex-1'
						>
							Hủy
						</Button>
						<Button
							variant='primary-gradient'
							onClick={handleUpgrade}
							loading={upgrading}
							disabled={!selectedPackage || upgrading}
							className='flex-1'
						>
							Nâng cấp
						</Button>
					</div>
				</div>
			</Overlay>
		</>
	);
};

export default StoragePage;
