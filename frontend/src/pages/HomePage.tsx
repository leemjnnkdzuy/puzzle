import React, {useState, useEffect, useRef} from "react";
import {useNavigate} from "react-router-dom";
import {
	Plus,
	Bell,
	Grid3x3,
	List,
	CircleDollarSign,
	FileText,
	Mic,
	Sparkles,
	ChevronDown,
	Filter,
	Columns,
	LayoutGrid,
	Grid2x2,
	Square,
	X,
	Trash2,
} from "lucide-react";
import Button from "@/components/ui/Button";
import Loading from "@/components/ui/Loading";
import Assets from "@/configs/AssetsConfig";
import Overlay from "@/components/ui/Overlay";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
} from "@/components/ui/DropdownMenu";
import ProjectService from "@/services/ProjectService";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {useLanguage} from "@/hooks/useLanguage";
import {useNotifications} from "@/hooks/useNotifications";
import {useCreditStore} from "@/stores/creditStore";

interface Project {
	id: string;
	projectId: string;
	title: string;
	description: string;
	thumbnail?: string;
	type: "script_generation" | "script_voice" | "full_service";
	createdAt: string;
	updatedAt: string;
}

const getProjectTypeInfo = (
	type: Project["type"],
	getNested: (key: string) => unknown
) => {
	switch (type) {
		case "script_generation":
			return {
				label: getNested?.(
					"packages.scriptGeneration.subtitle"
				) as string,
				icon: FileText,
				bgColor: "bg-blue-500/10",
				textColor: "text-blue-600 dark:text-blue-400",
				borderColor: "border-blue-500/20",
			};
		case "script_voice":
			return {
				label: getNested?.("packages.scriptVoice.subtitle") as string,
				icon: Mic,
				bgColor: "bg-purple-500/10",
				textColor: "text-purple-600 dark:text-purple-400",
				borderColor: "border-purple-500/20",
			};
		case "full_service":
			return {
				label: getNested?.("packages.fullService.subtitle") as string,
				icon: Sparkles,
				bgColor: "bg-gradient-to-r from-cyan-500/10 to-blue-500/10",
				textColor: "text-cyan-600 dark:text-cyan-400",
				borderColor: "border-cyan-500/20",
			};
		default:
			return {
				label: "Unknown",
				icon: FileText,
				bgColor: "bg-gray-500/10",
				textColor: "text-gray-600 dark:text-gray-400",
				borderColor: "border-gray-500/20",
			};
	}
};

const HomePage: React.FC = () => {
	const navigate = useNavigate();
	const {showError, showWarning, showSuccess} = useGlobalNotificationPopup();
	const showErrorRef = useRef(showError);
	const {t, getNested} = useLanguage();
	const {
		notifications,
		unreadCount,
		markAsRead,
		markAllAsRead,
		deleteNotification,
	} = useNotifications();

	useEffect(() => {
		showErrorRef.current = showError;
	}, [showError]);

	const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
	const [gridColumns, setGridColumns] = useState<3 | 4 | 5 | 6>(4);
	const [filterType, setFilterType] = useState<
		"all" | "script_generation" | "script_voice" | "full_service"
	>("all");
	const [isCreateProjectOpen, setIsCreateProjectOpen] = useState(false);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);
	const [projectPhase, setProjectPhase] = useState<1 | 2>(1);
	const [isTransitioning, setIsTransitioning] = useState(false);
	const [selectedServiceType, setSelectedServiceType] = useState<
		"script_generation" | "script_voice" | "full_service" | null
	>(null);
	const [projectTitle, setProjectTitle] = useState("");
	const [projectDescription, setProjectDescription] = useState("");
	const [isCreating, setIsCreating] = useState(false);
	const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
	const [projectToDelete, setProjectToDelete] = useState<Project | null>(
		null
	);

	const userCredit = useCreditStore((state) => state.credit);

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				setLoading(true);
				setError(null);

				const allProjects = await ProjectService.getProjects();

				setProjects(allProjects);
			} catch (err: unknown) {
				const errorMessage =
					err instanceof Error
						? err.message
						: "Failed to load projects";
				setError(errorMessage);
				showErrorRef.current(errorMessage);
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	const filteredProjects =
		filterType === "all"
			? projects
			: projects.filter((project) => project.type === filterType);

	const handleCreateProject = () => {
		setProjectPhase(1);
		setSelectedServiceType(null);
		setIsTransitioning(false);
		setProjectTitle("");
		setProjectDescription("");
		setIsCreating(false);
		setIsCreateProjectOpen(true);
	};

	const handleSelectService = (
		type: "script_generation" | "script_voice" | "full_service"
	) => {
		setIsTransitioning(true);
		setSelectedServiceType(type);

		setTimeout(() => {
			setProjectPhase(2);
			setIsTransitioning(false);
		}, 300);
	};

	const handleChangeServiceType = (
		type: "script_generation" | "script_voice" | "full_service"
	) => {
		if (projectPhase === 2) {
			setSelectedServiceType(type);
		} else {
			handleSelectService(type);
		}
	};

	const handleBackToServiceSelection = () => {
		setIsTransitioning(true);
		setTimeout(() => {
			setProjectPhase(1);
			setSelectedServiceType(null);
			setIsTransitioning(false);
		}, 300);
	};

	const handleSubmitProject = async () => {
		if (!selectedServiceType || !projectTitle.trim()) {
			showWarning(t("home.errors.projectNameRequired"));
			return;
		}

		try {
			setIsCreating(true);
			const projectData = {
				title: projectTitle.trim(),
				description: projectDescription.trim() || "",
				type: selectedServiceType,
			};

			const newProject = await ProjectService.createProject(projectData);

			const allProjects = await ProjectService.getProjects();
			setProjects(allProjects);

			setIsCreateProjectOpen(false);
			setProjectPhase(1);
			setSelectedServiceType(null);
			setProjectTitle("");
			setProjectDescription("");

			showSuccess(t("home.errors.createSuccess"));

			if (newProject?.projectId) {
				const routeMap = {
					script_generation: "script-generation",
					script_voice: "script-voice",
					full_service: "full-service",
				};
				const routePrefix = routeMap[newProject.type];
				if (routePrefix) {
					navigate(`/${routePrefix}/${newProject.projectId}`);
				}
			}
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: t("home.errors.createFailed");
			showError(errorMessage);
		} finally {
			setIsCreating(false);
		}
	};

	const handleNotificationClick = async (
		notificationId: string,
		link?: string
	) => {
		try {
			await markAsRead(notificationId);
			if (link) {
				navigate(link);
			}
		} catch {
			void 0;
		}
	};

	const handleProjectClick = (project: Project) => {
		const routeMap = {
			script_generation: "script-generation",
			script_voice: "script-voice",
			full_service: "full-service",
		};
		const routePrefix = routeMap[project.type];
		if (routePrefix) {
			navigate(`/${routePrefix}/${project.projectId}`);
		}
	};

	const handleDeleteClick = (e: React.MouseEvent, project: Project) => {
		e.stopPropagation();
		setProjectToDelete(project);
		setIsDeleteDialogOpen(true);
	};

	const handleDeleteConfirm = async () => {
		if (!projectToDelete) return;

		try {
			await ProjectService.deleteProject(
				projectToDelete.projectId,
				projectToDelete.type
			);

			const allProjects = await ProjectService.getProjects();
			setProjects(allProjects);

			showSuccess(t("home.errors.deleteSuccess"));
			setProjectToDelete(null);
		} catch (err: unknown) {
			const errorMessage =
				err instanceof Error
					? err.message
					: t("home.errors.deleteFailed");
			showError(errorMessage);
		}
	};

	const shouldHideCreateButton =
		!loading &&
		!error &&
		filteredProjects.length === 0 &&
		filterType === "all";

	return (
		<div className='min-h-screen bg-background'>
			<header className='sticky top-0 z-50 bg-background/95 backdrop-blur-sm'>
				<div className='container mx-auto px-4 sm:px-6 lg:px-8'>
					<div className='flex items-center justify-between h-16'>
						{!shouldHideCreateButton && (
							<>
								<button
									onClick={handleCreateProject}
									className='hidden sm:flex inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-9 px-4 py-2 bg-gradient-to-r from-cyan-400 to-blue-500 text-white hover:opacity-85 transition-opacity'
								>
									<Plus className='w-4 h-4' />
									<span>{t("home.createProject")}</span>
								</button>
								<Button
									onClick={handleCreateProject}
									variant='primary-gradient'
									size='icon'
									className='sm:hidden'
								>
									<Plus className='w-4 h-4' />
								</Button>
							</>
						)}

						<div className='flex items-center gap-3 sm:gap-4 ml-auto'>
							<div
								className='flex items-center gap-2 px-3 h-7 rounded-md bg-card border border-green-500 dark:border-green-400 group-hover:border-cyan-500 dark:group-hover:border-cyan-400 transition-all duration-200 cursor-pointer group'
								onClick={() => navigate("/recharge")}
							>
								<div className='relative w-4 h-4'>
									<CircleDollarSign className='w-4 h-4 text-green-500 dark:text-green-400 absolute inset-0 transition-opacity duration-200 group-hover:opacity-0 group-hover:scale-90' />
									<Plus className='w-4 h-4 text-cyan-500 dark:text-cyan-400 absolute inset-0 transition-opacity duration-200 opacity-0 scale-90 group-hover:opacity-100 group-hover:scale-100' />
								</div>
								<span className='text-sm font-medium text-foreground'>
									{userCredit.toLocaleString()}
								</span>
							</div>

							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<button className='inline-flex items-center cursor-pointer justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 h-7 w-7 border border-input bg-transparent text-foreground shadow-xs hover:opacity-75 transition-opacity hover:text-accent-foreground relative'>
										<Bell className='w-4 h-4' />
										{unreadCount > 0 && (
											<span className='absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-medium text-white'>
												{unreadCount > 9
													? "9+"
													: unreadCount}
											</span>
										)}
									</button>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align='end'
									className='w-80 h-96 p-0 overflow-hidden flex flex-col'
								>
									<div className='px-4 py-3 border-b border-border flex items-center justify-between'>
										<h3 className='text-sm font-semibold text-foreground'>
											{t("home.notifications")}
										</h3>
										{unreadCount > 0 && (
											<button
												onClick={async (e) => {
													e.stopPropagation();
													try {
														await markAllAsRead();
													} catch {
														void 0;
													}
												}}
												className='text-xs text-blue-600 dark:text-blue-400 hover:underline'
											>
												{t("home.markAllAsRead") ||
													"Mark all as read"}
											</button>
										)}
									</div>
									<div className='flex-1 overflow-y-auto overflow-x-hidden'>
										{notifications.length === 0 ? (
											<div className='flex items-center justify-center h-full text-sm text-muted-foreground'>
												{t("home.noNotifications")}
											</div>
										) : (
											notifications.map(
												(notification, index) => (
													<React.Fragment
														key={notification.id}
													>
														<DropdownMenuItem
															onClick={() =>
																handleNotificationClick(
																	notification.id,
																	notification.link
																)
															}
															className='flex flex-col items-start gap-1 px-4 py-3 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 relative group'
														>
															<button
																onClick={async (
																	e
																) => {
																	e.stopPropagation();
																	try {
																		await deleteNotification(
																			notification.id
																		);
																	} catch {
																		void 0;
																	}
																}}
																className='absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity text-muted-foreground hover:text-destructive'
																aria-label='Delete notification'
															>
																<X className='w-3 h-3' />
															</button>
															<div className='flex items-start justify-between w-full gap-2 pr-6'>
																<div className='flex-1 min-w-0'>
																	<div className='flex items-center gap-2 mb-1'>
																		<span
																			className={`text-xs font-medium ${
																				notification.type ===
																				"success"
																					? "text-green-600 dark:text-green-400"
																					: notification.type ===
																					  "warning"
																					? "text-yellow-600 dark:text-yellow-400"
																					: notification.type ===
																					  "error"
																					? "text-red-600 dark:text-red-400"
																					: "text-blue-600 dark:text-blue-400"
																			}`}
																		>
																			{
																				notification.title
																			}
																		</span>
																		{!notification.read && (
																			<span className='h-2 w-2 rounded-full bg-blue-500 flex-shrink-0' />
																		)}
																	</div>
																	<p className='text-xs text-muted-foreground line-clamp-2'>
																		{
																			notification.message
																		}
																	</p>
																	<span className='text-[10px] text-muted-foreground mt-1 block text-right'>
																		{new Date(
																			notification.createdAt
																		).toLocaleString(
																			"vi-VN",
																			{
																				day: "2-digit",
																				month: "2-digit",
																				year: "numeric",
																				hour: "2-digit",
																				minute: "2-digit",
																			}
																		)}
																	</span>
																</div>
															</div>
														</DropdownMenuItem>
														{index <
															notifications.length -
																1 && (
															<DropdownMenuSeparator />
														)}
													</React.Fragment>
												)
											)
										)}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
						</div>
					</div>
				</div>
			</header>

			<main className='container mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8'>
				<div className='flex items-center justify-between mb-6'>
					<h1 className='text-2xl sm:text-3xl font-bold text-foreground'>
						{t("home.myProjects")}
					</h1>
					<div className='flex items-center gap-2 transition-all duration-300 ease-in-out'>
						<div className='flex items-center gap-2'>
							{viewMode === "grid" && (
								<div className='flex items-center gap-2 p-1 rounded-lg bg-card border border-border animate-slideInRightSubtle'>
									<Button
										onClick={() => setGridColumns(6)}
										variant={
											gridColumns === 6
												? "default"
												: "text"
										}
										size='icon'
										className={`transition-all duration-200 ${
											gridColumns === 6
												? ""
												: "opacity-50"
										}`}
										title={t("home.gridColumns.6")}
									>
										<Columns className='w-4 h-4' />
									</Button>
									<Button
										onClick={() => setGridColumns(5)}
										variant={
											gridColumns === 5
												? "default"
												: "text"
										}
										size='icon'
										className={`transition-all duration-200 ${
											gridColumns === 5
												? ""
												: "opacity-50"
										}`}
										title={t("home.gridColumns.5")}
									>
										<LayoutGrid className='w-4 h-4' />
									</Button>
									<Button
										onClick={() => setGridColumns(4)}
										variant={
											gridColumns === 4
												? "default"
												: "text"
										}
										size='icon'
										className={`transition-all duration-200 ${
											gridColumns === 4
												? ""
												: "opacity-50"
										}`}
										title={t("home.gridColumns.4")}
									>
										<Grid2x2 className='w-4 h-4' />
									</Button>
									<Button
										onClick={() => setGridColumns(3)}
										variant={
											gridColumns === 3
												? "default"
												: "text"
										}
										size='icon'
										className={`transition-all duration-200 ${
											gridColumns === 3
												? ""
												: "opacity-50"
										}`}
										title={t("home.gridColumns.3")}
									>
										<Square className='w-4 h-4' />
									</Button>
								</div>
							)}
							<div className='flex items-center gap-2 p-1 rounded-lg bg-card border border-border'>
								<Button
									onClick={() => setViewMode("grid")}
									variant={
										viewMode === "grid" ? "default" : "text"
									}
									size='icon'
									className={
										viewMode === "grid" ? "" : "opacity-50"
									}
								>
									<Grid3x3 className='w-4 h-4' />
								</Button>
								<Button
									onClick={() => setViewMode("list")}
									variant={
										viewMode === "list" ? "default" : "text"
									}
									size='icon'
									className={
										viewMode === "list" ? "" : "opacity-50"
									}
								>
									<List className='w-4 h-4' />
								</Button>
							</div>
						</div>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button className='flex items-center gap-2 px-3 h-9 rounded-lg bg-card border border-border text-sm font-medium text-foreground hover:bg-gray-100 dark:hover:bg-gray-800 transition-all duration-300 ease-in-out w-48 justify-between'>
									<div className='flex items-center gap-2'>
										<Filter className='w-4 h-4' />
										<span>
											{filterType === "all"
												? t("home.all")
												: filterType ===
												  "script_generation"
												? (getNested?.(
														"packages.scriptGeneration.subtitle"
												  ) as string)
												: filterType === "script_voice"
												? (getNested?.(
														"packages.scriptVoice.subtitle"
												  ) as string)
												: (getNested?.(
														"packages.fullService.subtitle"
												  ) as string)}
										</span>
									</div>
									<ChevronDown className='w-4 h-4 transition-transform duration-300 group-data-[state=open]:rotate-180' />
								</button>
							</DropdownMenuTrigger>
							<DropdownMenuContent align='end' className='w-48'>
								<DropdownMenuItem
									onClick={() => setFilterType("all")}
									className={
										filterType === "all"
											? "bg-gray-100 dark:bg-gray-800"
											: ""
									}
								>
									{t("home.all")}
								</DropdownMenuItem>
								<DropdownMenuSeparator />
								<DropdownMenuItem
									onClick={() =>
										setFilterType("script_generation")
									}
									className={
										filterType === "script_generation"
											? "bg-gray-100 dark:bg-gray-800"
											: ""
									}
								>
									<div className='flex items-center gap-2'>
										<FileText className='w-4 h-4 text-blue-600 dark:text-blue-400' />
										<span>
											{
												getNested?.(
													"packages.scriptGeneration.subtitle"
												) as string
											}
										</span>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setFilterType("script_voice")
									}
									className={
										filterType === "script_voice"
											? "bg-gray-100 dark:bg-gray-800"
											: ""
									}
								>
									<div className='flex items-center gap-2'>
										<Mic className='w-4 h-4 text-purple-600 dark:text-purple-400' />
										<span>
											{
												getNested?.(
													"packages.scriptVoice.subtitle"
												) as string
											}
										</span>
									</div>
								</DropdownMenuItem>
								<DropdownMenuItem
									onClick={() =>
										setFilterType("full_service")
									}
									className={
										filterType === "full_service"
											? "bg-gray-100 dark:bg-gray-800"
											: ""
									}
								>
									<div className='flex items-center gap-2'>
										<Sparkles className='w-4 h-4 text-cyan-600 dark:text-cyan-400' />
										<span>
											{
												getNested?.(
													"packages.fullService.subtitle"
												) as string
											}
										</span>
									</div>
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				</div>

				{loading ? (
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<Loading size={40} />
					</div>
				) : error ? (
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<p className='text-red-500 mb-4'>{error}</p>
						<Button
							onClick={() => window.location.reload()}
							variant='default'
						>
							{t("home.tryAgain")}
						</Button>
					</div>
				) : filteredProjects.length === 0 ? (
					<div className='flex flex-col items-center justify-center py-16 text-center'>
						<p className='text-muted-foreground mb-4'>
							{filterType === "all"
								? t("home.noProjects")
								: t("home.noProjectsOfType")}
						</p>
						<Button
							onClick={handleCreateProject}
							variant='primary-gradient'
						>
							<Plus className='w-4 h-4 mr-2' />
							{t("home.createFirstProject")}
						</Button>
					</div>
				) : viewMode === "grid" ? (
					<div className='overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]'>
						<div
							className={`grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 ${
								gridColumns === 3
									? "lg:grid-cols-3"
									: gridColumns === 4
									? "lg:grid-cols-4"
									: gridColumns === 5
									? "lg:grid-cols-5"
									: "lg:grid-cols-6"
							}`}
						>
							{filteredProjects.map((project) => {
								const typeInfo = getProjectTypeInfo(
									project.type,
									getNested!
								);
								const TypeIcon = typeInfo.icon;
								return (
									<div
										key={project.projectId}
										onClick={() =>
											handleProjectClick(project)
										}
										className='group cursor-pointer rounded-lg border border-border bg-card overflow-hidden relative hover:shadow-lg transition-shadow duration-200'
									>
										<div className='w-full h-36 bg-muted flex items-center justify-center relative overflow-hidden group-hover:scale-[1.1] transition-transform duration-200 origin-center'>
											{project.thumbnail ? (
												<img
													src={project.thumbnail}
													alt={project.title}
													className='w-full h-full object-cover'
												/>
											) : (
												<img
													src={Assets.AppIconGradient}
													alt={project.title}
													className='w-24 h-24 object-contain opacity-50'
												/>
											)}
										</div>
										<div
											className={`absolute top-3.5 right-3.5 ${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-md px-1.5 py-0.5 flex items-center gap-1 z-10`}
										>
											<TypeIcon
												className={`w-2.5 h-2.5 ${typeInfo.textColor}`}
											/>
											<span
												className={`text-[9px] font-medium ${typeInfo.textColor}`}
											>
												{typeInfo.label}
											</span>
										</div>
										<div className='p-3'>
											<h3 className='font-semibold text-sm text-foreground mb-1.5 line-clamp-1'>
												{project.title}
											</h3>
											<p className='text-xs text-muted-foreground mb-2 line-clamp-2'>
												{project.description}
											</p>
											<div className='flex items-center justify-between text-[10px] text-muted-foreground'>
												<span>
													{t("home.updated")}{" "}
													{new Date(
														project.updatedAt
													).toLocaleDateString(
														"vi-VN"
													)}
												</span>
											</div>
										</div>
										<button
											onClick={(e) =>
												handleDeleteClick(e, project)
											}
											className='absolute bottom-3 right-3 w-8 h-8 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 shadow-lg'
											aria-label={t("home.deleteProject")}
											title={t("home.deleteProject")}
										>
											<Trash2 className='w-4 h-4' />
										</button>
									</div>
								);
							})}
						</div>
					</div>
				) : (
					<div className='overflow-y-auto overflow-x-hidden max-h-[calc(100vh-200px)]'>
						<div className='space-y-4'>
							{filteredProjects.map((project) => {
								const typeInfo = getProjectTypeInfo(
									project.type,
									getNested!
								);
								const TypeIcon = typeInfo.icon;
								return (
									<div
										key={project.projectId}
										onClick={() =>
											handleProjectClick(project)
										}
										className='group cursor-pointer flex gap-4 rounded-lg border border-border bg-card transition-all duration-200 p-4 min-h-[100px] hover:shadow-lg'
									>
										<div className='w-32 h-24 sm:w-40 sm:h-28 flex-shrink-0 rounded-md bg-muted flex items-center justify-center overflow-hidden group-hover:scale-[1.1] transition-transform duration-200 origin-center'>
											{project.thumbnail ? (
												<img
													src={project.thumbnail}
													alt={project.title}
													className='w-full h-full object-cover'
												/>
											) : (
												<img
													src={Assets.AppIconGradient}
													alt={project.title}
													className='w-20 h-20 object-contain opacity-50'
												/>
											)}
										</div>
										<div className='flex-1 min-w-0 flex flex-col justify-between'>
											<div>
												<div className='flex items-start justify-between gap-2 mb-2'>
													<h3 className='font-semibold text-foreground'>
														{project.title}
													</h3>
													<div
														className={`${typeInfo.bgColor} ${typeInfo.borderColor} border rounded-md px-2 py-1 flex items-center gap-1.5 flex-shrink-0`}
													>
														<TypeIcon
															className={`w-3 h-3 ${typeInfo.textColor}`}
														/>
														<span
															className={`text-[10px] font-medium ${typeInfo.textColor}`}
														>
															{typeInfo.label}
														</span>
													</div>
												</div>
												<p className='text-sm text-muted-foreground line-clamp-2'>
													{project.description}
												</p>
											</div>
											<div className='flex items-center gap-4 text-xs text-muted-foreground mt-auto'>
												<span>
													{t("home.created")}{" "}
													{new Date(
														project.createdAt
													).toLocaleDateString(
														"vi-VN"
													)}
												</span>
												<span>
													{t("home.updated")}{" "}
													{new Date(
														project.updatedAt
													).toLocaleDateString(
														"vi-VN"
													)}
												</span>
											</div>
										</div>
										<button
											onClick={(e) =>
												handleDeleteClick(e, project)
											}
											className='absolute bottom-4 right-4 w-8 h-8 rounded-full bg-destructive/90 hover:bg-destructive text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-20 shadow-lg'
											aria-label={t("home.deleteProject")}
											title={t("home.deleteProject")}
										>
											<Trash2 className='w-4 h-4' />
										</button>
									</div>
								);
							})}
						</div>
					</div>
				)}
			</main>

			<Overlay
				isOpen={isCreateProjectOpen}
				onClose={() => setIsCreateProjectOpen(false)}
				contentClassName='max-w-lg'
			>
				<div className='p-6 relative overflow-hidden min-h-[500px]'>
					<div className='flex items-center justify-between mb-6'>
						<h2 className='text-2xl font-bold text-foreground'>
							{projectPhase === 1
								? t("home.selectServiceType")
								: t("home.createNewProject")}
						</h2>
						<button
							onClick={() => setIsCreateProjectOpen(false)}
							className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
							aria-label={t("home.close")}
						>
							<X className='w-5 h-5' />
						</button>
					</div>

					<div
						className={`transition-all duration-300 ${
							projectPhase === 1 && !isTransitioning
								? "opacity-100 translate-y-0"
								: projectPhase === 1 && isTransitioning
								? "opacity-0 -translate-y-4"
								: "opacity-0 translate-y-4 pointer-events-none absolute inset-x-0"
						}`}
						style={projectPhase !== 1 ? {top: "64px"} : undefined}
					>
						<div className='space-y-3'>
							<button
								onClick={() =>
									handleSelectService("script_generation")
								}
								className='w-full flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group'
							>
								<div className='w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform'>
									<FileText className='w-6 h-6 text-foreground' />
								</div>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-1'>
										<h3 className='font-semibold text-foreground'>
											{
												getNested?.(
													"packages.scriptGeneration.title"
												) as string
											}
										</h3>
										<span className='text-sm text-muted-foreground'>
											{
												getNested?.(
													"packages.scriptGeneration.subtitle"
												) as string
											}
										</span>
									</div>
									<p className='text-sm text-muted-foreground leading-relaxed'>
										{
											getNested?.(
												"packages.scriptGeneration.description"
											) as string
										}
									</p>
								</div>
							</button>

							<button
								onClick={() =>
									handleSelectService("script_voice")
								}
								className='w-full flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group'
							>
								<div className='w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform'>
									<Mic className='w-6 h-6 text-foreground' />
								</div>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-1'>
										<h3 className='font-semibold text-foreground'>
											{
												getNested?.(
													"packages.scriptVoice.title"
												) as string
											}
										</h3>
										<span className='text-sm text-muted-foreground'>
											{
												getNested?.(
													"packages.scriptVoice.subtitle"
												) as string
											}
										</span>
									</div>
									<p className='text-sm text-muted-foreground leading-relaxed'>
										{
											getNested?.(
												"packages.scriptVoice.description"
											) as string
										}
									</p>
								</div>
							</button>

							<button
								onClick={() =>
									handleSelectService("full_service")
								}
								className='w-full flex items-start gap-4 p-4 rounded-lg border border-border bg-card hover:bg-muted/50 transition-colors text-left group'
							>
								<div className='w-12 h-12 rounded-lg bg-gray-100 dark:bg-gray-800 border border-border flex items-center justify-center flex-shrink-0 group-hover:scale-105 transition-transform'>
									<Sparkles className='w-6 h-6 text-foreground' />
								</div>
								<div className='flex-1 min-w-0'>
									<div className='flex items-center gap-2 mb-1'>
										<h3 className='font-semibold text-foreground'>
											{
												getNested?.(
													"packages.fullService.title"
												) as string
											}
										</h3>
										<span className='text-sm text-muted-foreground'>
											{
												getNested?.(
													"packages.fullService.subtitle"
												) as string
											}
										</span>
									</div>
									<p className='text-sm text-muted-foreground leading-relaxed'>
										{
											getNested?.(
												"packages.fullService.description"
											) as string
										}
									</p>
								</div>
							</button>
						</div>
					</div>

					<div
						className={`transition-all duration-300 ${
							projectPhase === 2 && !isTransitioning
								? "opacity-100 translate-y-0"
								: projectPhase === 2 && isTransitioning
								? "opacity-0 translate-y-4"
								: "opacity-0 translate-y-4 pointer-events-none absolute inset-x-0"
						}`}
						style={projectPhase !== 2 ? {top: "64px"} : undefined}
					>
						<div className='space-y-4'>
							<div className='mb-4'>
								<label className='block text-sm font-medium text-foreground mb-2'>
									{t("home.serviceType")}
								</label>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className='w-full flex items-center justify-between gap-2 p-3 rounded-lg bg-muted/50 border border-border hover:bg-muted transition-colors text-left'>
											<div className='flex items-center gap-2'>
												{selectedServiceType ===
													"script_generation" && (
													<>
														<FileText className='w-5 h-5 text-blue-600 dark:text-blue-400' />
														<span className='text-sm font-medium text-foreground'>
															{
																getNested?.(
																	"packages.scriptGeneration.title"
																) as string
															}{" "}
															-{" "}
															{
																getNested?.(
																	"packages.scriptGeneration.subtitle"
																) as string
															}
														</span>
													</>
												)}
												{selectedServiceType ===
													"script_voice" && (
													<>
														<Mic className='w-5 h-5 text-purple-600 dark:text-purple-400' />
														<span className='text-sm font-medium text-foreground'>
															{
																getNested?.(
																	"packages.scriptVoice.title"
																) as string
															}{" "}
															-{" "}
															{
																getNested?.(
																	"packages.scriptVoice.subtitle"
																) as string
															}
														</span>
													</>
												)}
												{selectedServiceType ===
													"full_service" && (
													<>
														<Sparkles className='w-5 h-5 text-cyan-600 dark:text-cyan-400' />
														<span className='text-sm font-medium text-foreground'>
															{
																getNested?.(
																	"packages.fullService.title"
																) as string
															}{" "}
															-{" "}
															{
																getNested?.(
																	"packages.fullService.subtitle"
																) as string
															}
														</span>
													</>
												)}
											</div>
											<ChevronDown className='w-4 h-4 text-muted-foreground' />
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align='start'
										className='min-w-[var(--radix-dropdown-menu-trigger-width)]'
									>
										<DropdownMenuItem
											onClick={() =>
												handleChangeServiceType(
													"script_generation"
												)
											}
											className='flex items-center gap-2'
										>
											<FileText className='w-4 h-4 text-blue-600 dark:text-blue-400' />
											<span>
												{
													getNested?.(
														"packages.scriptGeneration.title"
													) as string
												}{" "}
												-{" "}
												{
													getNested?.(
														"packages.scriptGeneration.subtitle"
													) as string
												}
											</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												handleChangeServiceType(
													"script_voice"
												)
											}
											className='flex items-center gap-2'
										>
											<Mic className='w-4 h-4 text-purple-600 dark:text-purple-400' />
											<span>
												{
													getNested?.(
														"packages.scriptVoice.title"
													) as string
												}{" "}
												-{" "}
												{
													getNested?.(
														"packages.scriptVoice.subtitle"
													) as string
												}
											</span>
										</DropdownMenuItem>
										<DropdownMenuSeparator />
										<DropdownMenuItem
											onClick={() =>
												handleChangeServiceType(
													"full_service"
												)
											}
											className='flex items-center gap-2'
										>
											<Sparkles className='w-4 h-4 text-cyan-600 dark:text-cyan-400' />
											<span>
												{
													getNested?.(
														"packages.fullService.title"
													) as string
												}{" "}
												-{" "}
												{
													getNested?.(
														"packages.fullService.subtitle"
													) as string
												}
											</span>
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>

							<div className='space-y-4'>
								<div>
									<label
										htmlFor='project-title'
										className='block text-sm font-medium text-foreground mb-2'
									>
										{t("home.projectName")}
									</label>
									<input
										id='project-title'
										type='text'
										value={projectTitle}
										onChange={(e) =>
											setProjectTitle(e.target.value)
										}
										placeholder={t(
											"home.projectNamePlaceholder"
										)}
										className='w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2'
									/>
								</div>

								<div>
									<label
										htmlFor='project-description'
										className='block text-sm font-medium text-foreground mb-2'
									>
										{t("home.description")}
									</label>
									<textarea
										id='project-description'
										value={projectDescription}
										onChange={(e) =>
											setProjectDescription(
												e.target.value
											)
										}
										placeholder={t(
											"home.descriptionPlaceholder"
										)}
										rows={4}
										className='w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none'
									/>
								</div>
							</div>

							<div className='flex items-center gap-3 pt-4'>
								<Button
									onClick={handleBackToServiceSelection}
									variant='text'
									className='flex-1'
								>
									{t("home.back")}
								</Button>
								<Button
									onClick={handleSubmitProject}
									variant='primary-gradient'
									className='flex-1'
									disabled={isCreating}
								>
									{isCreating
										? t("home.creating")
										: t("home.createProjectButton")}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</Overlay>

			<ConfirmDialog
				isOpen={isDeleteDialogOpen}
				onClose={() => {
					setIsDeleteDialogOpen(false);
					setProjectToDelete(null);
				}}
				onConfirm={async () => {
					await handleDeleteConfirm();
					setIsDeleteDialogOpen(false);
					setProjectToDelete(null);
				}}
				title={
					(getNested?.("home.deleteConfirmTitle") as string) ||
					"Delete Project"
				}
				message={(
					(getNested?.("home.deleteConfirmMessage") as string) ||
					'Are you sure you want to delete the project "{projectTitle}"? This action cannot be undone.'
				).replace("{projectTitle}", projectToDelete?.title || "này")}
				confirmText={
					(getNested?.("home.deleteConfirm") as string) || "Delete"
				}
				cancelText={(getNested?.("home.cancel") as string) || "Cancel"}
				confirmVariant='destructive'
				icon={
					<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
						<Trash2 className='w-6 h-6 text-destructive' />
					</div>
				}
			/>
		</div>
	);
};

HomePage.displayName = "HomePage";
export default HomePage;
