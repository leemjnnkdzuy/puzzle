import React, {useState, useEffect} from "react";
import {
	Home,
	FileText,
	Mic,
	Sparkles,
	ChevronDown,
	User,
	Settings,
	Palette,
	LogOut,
	Sun,
	Moon,
	Wallet,
	CircleDollarSign,
	Globe,
	Layout,
	LayoutGrid,
	Columns,
	List,
	Copy,
	Check,
	Trash2,
	AlertTriangle,
	FolderOpen,
	X,
} from "lucide-react";
import {useNavigate, useLocation} from "react-router-dom";
import Button from "@/components/ui/Button";
import {cn, formatCurrency} from "@/utils";
import {
	DropdownMenu,
	DropdownMenuTrigger,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/DropdownMenu";
import ProjectService, {type Project} from "@/services/ProjectService";
import Loading from "@/components/ui/Loading";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {ProjectLayoutContext} from "@/hooks/useProjectLayoutContext";
import {useAuth} from "@/hooks/useAuth";
import {useTheme} from "@/hooks/useTheme";
import {useLanguage} from "@/hooks/useLanguage";
import {useCreditStore} from "@/stores/creditStore";
import {useLogoutListener} from "@/hooks/useLogoutListener";
import Overlay from "@/components/ui/Overlay";
import Input from "@/components/ui/Input";
import { type ScriptGenerationLayout, scriptGenerationLayouts } from "@/configs/ScriptGenerationLayouts";

type BodyLayout = "single" | "two-columns" | "grid" | "list";

interface ProjectLayoutProps {
	children: React.ReactNode;
	title?: string;
	subtitle?: string;
	showBackButton?: boolean;
	headerActions?: React.ReactNode;
	className?: string;
	bodyLayout?: BodyLayout;
	onBodyLayoutChange?: (layout: BodyLayout) => void;
	fullWidth?: boolean;
}

const getProjectTypeIcon = (
	type: Project["type"]
): React.ComponentType<{className?: string}> => {
	switch (type) {
		case "script_generation":
			return FileText;
		case "script_voice":
			return Mic;
		case "full_service":
			return Sparkles;
		default:
			return FileText;
	}
};

const getProjectRoute = (project: Project): string => {
	const routeMap = {
		script_generation: "script-generation",
		script_voice: "script-voice",
		full_service: "full-service",
	};
	return `/${routeMap[project.type]}/${project.projectId}`;
};

const ProjectLayout: React.FC<ProjectLayoutProps> = ({
	children,
	title,
	subtitle,
	showBackButton = true,
	headerActions,
	className,
	bodyLayout: initialBodyLayout,
	onBodyLayoutChange,
	fullWidth = false,
}) => {
	const [bodyLayout, setBodyLayout] = useState<BodyLayout>(
		initialBodyLayout || "single"
	);
	const navigate = useNavigate();
	const location = useLocation();

	// Auto-detect fullWidth for script-generation pages
	const isScriptGenerationPage = location.pathname.includes(
		"/script-generation/"
	);
	const shouldFullWidth = fullWidth || isScriptGenerationPage;
	const {isAuthenticated, user, logout} = useAuth();
	const {theme, setTheme} = useTheme();
	const {language, setLanguage, getNested} = useLanguage();
	const credit = useCreditStore((state) => state.credit);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const [projects, setProjects] = useState<Project[]>([]);
	const [loading, setLoading] = useState(true);
	const [showGoHomeDialog, setShowGoHomeDialog] = useState(false);
	const [showSwitchProjectDialog, setShowSwitchProjectDialog] =
		useState(false);
	const [pendingNavigation, setPendingNavigation] = useState<string | null>(
		null
	);
	const [isSaving, setIsSaving] = useState(false);
	const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
	const [onSave, setOnSave] = useState<
		(() => Promise<void> | void) | undefined
	>(undefined);
	const [copied, setCopied] = useState(false);
	const [showDeleteDialog, setShowDeleteDialog] = useState(false);
	const [isDeleting, setIsDeleting] = useState(false);
	const [showDeleteErrorDialog, setShowDeleteErrorDialog] = useState(false);
	const [deleteError, setDeleteError] = useState<string | null>(null);
	const [showEditProjectOverlay, setShowEditProjectOverlay] = useState(false);
	const [editProjectData, setEditProjectData] = useState<{
		title: string;
		description: string;
	}>({title: "", description: ""});
	const [isUpdatingProject, setIsUpdatingProject] = useState(false);
	const [editProjectError, setEditProjectError] = useState<string | null>(
		null
	);
	const [scriptGenerationLayout, setScriptGenerationLayout] = useState<ScriptGenerationLayout>("grid1");

	useLogoutListener();

	interface UserData {
		username?: string;
		email?: string;
		first_name?: string;
		last_name?: string;
		avatar?: string;
	}

	const userData = user as UserData | null;
	const userName =
		userData && userData.first_name && userData.last_name
			? `${userData.first_name} ${userData.last_name}`.trim()
			: userData?.username || "User";
	const userEmail = userData?.email || "";
	const userAvatar = userData?.avatar || "";

	const sidebar = getNested?.("sidebar") as
		| {
				viewProfile: string;
				recharge: string;
				settings: string;
				theme: string;
				language: string;
				logout: string;
				light: string;
				dark: string;
		  }
		| undefined;

	const handleLogoutClick = () => {
		setShowLogoutConfirm(true);
	};

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	const handleCopyProjectId = async () => {
		if (currentProject?.projectId) {
			try {
				await navigator.clipboard.writeText(currentProject.projectId);
				setCopied(true);
				setTimeout(() => {
					setCopied(false);
				}, 2000);
			} catch (error) {
				console.error("Failed to copy:", error);
			}
		}
	};

	const handleEditProjectClick = () => {
		if (currentProject) {
			setEditProjectData({
				title: currentProject.title,
				description: currentProject.description || "",
			});
			setEditProjectError(null);
			setShowEditProjectOverlay(true);
		}
	};

	const handleUpdateProject = async () => {
		if (!currentProject) return;

		if (!editProjectData.title.trim()) {
			setEditProjectError("Tiêu đề không được để trống");
			return;
		}

		try {
			setIsUpdatingProject(true);
			setEditProjectError(null);
			await ProjectService.updateProject(
				currentProject.projectId,
				currentProject.type,
				{
					title: editProjectData.title.trim(),
					description:
						editProjectData.description.trim() || undefined,
				}
			);
			const updatedProjects = await ProjectService.getProjects("all");
			setProjects(updatedProjects);
			setShowEditProjectOverlay(false);
		} catch (error) {
			console.error("Failed to update project:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Không thể cập nhật project. Vui lòng thử lại.";
			setEditProjectError(errorMessage);
		} finally {
			setIsUpdatingProject(false);
		}
	};

	const handleDeleteClick = () => {
		setShowDeleteDialog(true);
	};

	const handleDeleteConfirm = async () => {
		if (!currentProject) return;

		try {
			setIsDeleting(true);
			await ProjectService.deleteProject(
				currentProject.projectId,
				currentProject.type
			);
			setShowDeleteDialog(false);
			navigate("/home");
		} catch (error) {
			console.error("Failed to delete project:", error);
			const errorMessage =
				error instanceof Error
					? error.message
					: "Không thể xóa project. Vui lòng thử lại.";
			setDeleteError(errorMessage);
			setShowDeleteDialog(false);
			setShowDeleteErrorDialog(true);
		} finally {
			setIsDeleting(false);
		}
	};

	const handleBodyLayoutChange = (layout: BodyLayout) => {
		setBodyLayout(layout);
		if (onBodyLayoutChange) {
			onBodyLayoutChange(layout);
		}
	};

	const layoutOptions = [
		{
			value: "single" as BodyLayout,
			label: "Một cột",
			icon: Columns,
		},
		{
			value: "two-columns" as BodyLayout,
			label: "Hai cột",
			icon: Layout,
		},
		{
			value: "grid" as BodyLayout,
			label: "Lưới",
			icon: LayoutGrid,
		},
		{
			value: "list" as BodyLayout,
			label: "Danh sách",
			icon: List,
		},
	];

	useEffect(() => {
		const fetchProjects = async () => {
			try {
				setLoading(true);
				const data = await ProjectService.getProjects("all");
				setProjects(data);
			} catch (error) {
				console.error("Failed to fetch projects:", error);
			} finally {
				setLoading(false);
			}
		};

		fetchProjects();
	}, []);

	const currentProjectId = location.pathname.split("/").pop();
	const currentProject = projects.find(
		(p) => p.projectId === currentProjectId
	);
	const CurrentProjectIcon = currentProject
		? getProjectTypeIcon(currentProject.type)
		: null;

	const targetProjectId = pendingNavigation
		? pendingNavigation.split("/").pop()
		: null;
	const targetProject = targetProjectId
		? projects.find((p) => p.projectId === targetProjectId)
		: null;

	const handleGoHome = () => {
		setShowGoHomeDialog(true);
	};

	const handleSwitchProject = (path: string) => {
		setPendingNavigation(path);
		setShowSwitchProjectDialog(true);
	};

	const handleSaveAndGoHome = async () => {
		try {
			setIsSaving(true);
			if (onSave && typeof onSave === "function") {
				await onSave();
			}
			setShowGoHomeDialog(false);
			setTimeout(() => {
				navigate("/home");
			}, 100);
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleGoHomeConfirm = async () => {
		await handleSaveAndGoHome();
	};

	const handleSaveAndSwitchProject = async () => {
		if (!pendingNavigation) return;
		try {
			setIsSaving(true);
			if (onSave && typeof onSave === "function") {
				await onSave();
			}
			setShowSwitchProjectDialog(false);
			const targetPath = pendingNavigation;
			setPendingNavigation(null);
			setTimeout(() => {
				navigate(targetPath);
			}, 100);
		} catch (error) {
			console.error("Failed to save:", error);
		} finally {
			setIsSaving(false);
		}
	};

	const handleSwitchProjectConfirm = async () => {
		await handleSaveAndSwitchProject();
	};

	const handleSetOnSave = React.useCallback(
		(saveFn: (() => Promise<void> | void) | undefined) => {
			if (saveFn === undefined || typeof saveFn === "function") {
				setOnSave(saveFn);
			} else {
				console.warn(
					"setOnSave received a non-function value:",
					saveFn
				);
				setOnSave(undefined);
			}
		},
		[]
	);

	const handleSetHasUnsavedChanges = React.useCallback(
		(value: boolean) => {
			setHasUnsavedChanges(value);
		},
		[]
	);

	const contextValue = React.useMemo(
		() => ({
			setHasUnsavedChanges: handleSetHasUnsavedChanges,
			setOnSave: handleSetOnSave,
			scriptGenerationLayout,
			setScriptGenerationLayout,
		}),
		[handleSetHasUnsavedChanges, handleSetOnSave, scriptGenerationLayout]
	);

	return (
		<ProjectLayoutContext.Provider value={contextValue}>
			<div
				className={cn(
					"h-screen bg-background flex flex-col overflow-hidden",
					className
				)}
			>
				<header className='sticky top-0 z-40 w-full bg-background/95 backdrop-blur-sm border-b border-border'>
					<div className='w-full px-4 sm:px-6 lg:px-8'>
						<div className='flex items-center justify-between py-2 gap-4'>
							<div className='flex items-center gap-3 flex-1 min-w-0'>
								{showBackButton && (
									<>
										<Button
											onClick={handleGoHome}
											variant='outline'
											size='icon'
											className='flex items-center justify-center flex-shrink-0 border-border hover:border-foreground/50 transition-colors'
											title='Về trang chủ'
										>
											<Home className='w-4 h-4' />
										</Button>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='outline'
													className='flex items-center gap-2 flex-shrink-0 border-border hover:border-foreground/50 transition-colors min-w-[200px] max-w-[300px] h-7 px-2'
													title='Danh sách dự án'
												>
													{loading ? (
														<Loading size={16} />
													) : currentProject ? (
														<>
															{CurrentProjectIcon && (
																<CurrentProjectIcon className='w-4 h-4 flex-shrink-0' />
															)}
															<span className='flex-1 min-w-0 truncate text-left text-sm font-medium'>
																{
																	currentProject.title
																}
															</span>
															<ChevronDown className='w-4 h-4 flex-shrink-0' />
														</>
													) : (
														<>
															<span className='flex-1 min-w-0 truncate text-left text-sm text-muted-foreground'>
																Chọn dự án
															</span>
															<ChevronDown className='w-4 h-4 flex-shrink-0' />
														</>
													)}
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='start'
												className='w-80 max-h-[400px] overflow-y-auto'
											>
												{projects.length === 0 ? (
													<div className='px-2 py-4 text-sm text-muted-foreground text-center'>
														Không có dự án nào
													</div>
												) : (
													projects.map((project) => {
														const Icon =
															getProjectTypeIcon(
																project.type
															);
														const isActive =
															project.projectId ===
															currentProjectId;
														return (
															<DropdownMenuItem
																key={project.id}
																onClick={() => {
																	if (
																		!isActive
																	) {
																		handleSwitchProject(
																			getProjectRoute(
																				project
																			)
																		);
																	}
																}}
																className={cn(
																	"cursor-pointer flex items-center gap-3 px-3 py-2",
																	isActive &&
																		"bg-accent"
																)}
															>
																<Icon className='w-4 h-4 flex-shrink-0' />
																<div className='flex-1 min-w-0'>
																	<p
																		className={cn(
																			"text-sm font-medium truncate",
																			isActive
																				? "text-foreground"
																				: "text-foreground/80"
																		)}
																	>
																		{
																			project.title
																		}
																	</p>
																	{project.description && (
																		<p className='text-xs text-muted-foreground truncate'>
																			{
																				project.description
																			}
																		</p>
																	)}
																</div>
															</DropdownMenuItem>
														);
													})
												)}
											</DropdownMenuContent>
										</DropdownMenu>
									</>
								)}
								<div className='flex-1 min-w-0 flex items-center justify-center'>
									{currentProject ? (
										<div className='text-center'>
											<div className='flex items-center justify-center gap-2'>
												<h1 className='text-xs sm:text-sm font-light text-foreground/80'>
													{currentProject.title} •{" "}
													{currentProject.projectId}
												</h1>
												<button
													onClick={
														handleCopyProjectId
													}
													className='flex items-center justify-center w-5 h-5 rounded hover:bg-muted transition-colors text-muted-foreground hover:text-foreground'
													title='Copy project ID'
												>
													{copied ? (
														<Check className='w-3 h-3 text-green-500' />
													) : (
														<Copy className='w-3 h-3' />
													)}
												</button>
											</div>
											{subtitle && (
												<p className='text-xs text-muted-foreground mt-0.5'>
													{subtitle}
												</p>
											)}
										</div>
									) : (
										<div className='text-center'>
											{title && (
												<h1 className='text-xs sm:text-sm font-light text-foreground/80'>
													{title}
												</h1>
											)}
											{subtitle && (
												<p className='text-xs text-muted-foreground mt-0.5'>
													{subtitle}
												</p>
											)}
										</div>
									)}
								</div>
							</div>
							<div className='flex items-center gap-4 flex-shrink-0'>
								{headerActions && (
									<div className='flex items-center gap-2'>
										{headerActions}
									</div>
								)}
								{isAuthenticated && userData && (
									<>
										{currentProject && (
											<DropdownMenu>
												<DropdownMenuTrigger asChild>
													<Button
														variant='outline'
														size='icon'
														className='flex items-center justify-center flex-shrink-0 border-border hover:border-foreground/50 transition-colors h-7 w-7'
														title='Cài đặt project'
													>
														<Settings className='w-3.5 h-3.5' />
													</Button>
												</DropdownMenuTrigger>
												<DropdownMenuContent
													align='end'
													className='w-48'
												>
													<DropdownMenuItem
														onClick={
															handleEditProjectClick
														}
														className='cursor-pointer'
													>
														<FileText className='w-4 h-4 mr-2' />
														<span>
															Chỉnh sửa project
														</span>
													</DropdownMenuItem>
													<DropdownMenuItem
														onClick={() => {
															// TODO: Implement duplicate project
															console.log(
																"Duplicate project"
															);
														}}
														className='cursor-pointer'
													>
														<Copy className='w-4 h-4 mr-2' />
														<span>
															Nhân đôi project
														</span>
													</DropdownMenuItem>
													<DropdownMenuSeparator />
													<DropdownMenuItem
														onClick={
															handleDeleteClick
														}
														className='cursor-pointer text-destructive focus:text-destructive hover:text-destructive hover:bg-destructive/10'
													>
														<Trash2 className='w-4 h-4 mr-2 text-destructive' />
														<span>Xóa project</span>
													</DropdownMenuItem>
												</DropdownMenuContent>
											</DropdownMenu>
										)}
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<Button
													variant='outline'
													size='icon'
													className='flex items-center justify-center flex-shrink-0 border-border hover:border-foreground/50 transition-colors h-7 w-7'
													title='Chỉnh layout'
												>
													<Layout className='w-3.5 h-3.5' />
												</Button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='end'
												className='w-48'
											>
												{isScriptGenerationPage
													? scriptGenerationLayouts.map(
															(option) => {
																const Icon =
																	option.icon;
																return (
																	<DropdownMenuItem
																		key={
																			option.value
																		}
																		onClick={() => {
																			setScriptGenerationLayout(option.value);
																		}}
																		className='cursor-pointer flex items-center gap-2'
																	>
																		<Icon className='w-4 h-4' />
																		<div className='flex flex-col'>
																			<span className='text-sm font-medium'>
																				{
																					option.label
																				}
																			</span>

																		</div>
																	</DropdownMenuItem>
																);
															}
													  )
													: layoutOptions.map(
															(option) => {
																const Icon =
																	option.icon;
																const isActive =
																	bodyLayout ===
																	option.value;
																return (
																	<DropdownMenuItem
																		key={
																			option.value
																		}
																		onClick={() =>
																			handleBodyLayoutChange(
																				option.value
																			)
																		}
																		className={cn(
																			"cursor-pointer flex items-center gap-2",
																			isActive &&
																				"bg-accent"
																		)}
																	>
																		<Icon className='w-4 h-4' />
																		<span
																			className={cn(
																				"text-sm",
																				isActive
																					? "font-medium"
																					: ""
																			)}
																		>
																			{
																				option.label
																			}
																		</span>
																	</DropdownMenuItem>
																);
															}
													  )}
											</DropdownMenuContent>
										</DropdownMenu>
										<div className='flex items-center gap-1.5 px-2 py-0.5 h-7 rounded-lg bg-card/50'>
											<CircleDollarSign className='w-3.5 h-3.5 text-green-500 dark:text-green-400' />
											<span className='text-xs font-medium text-foreground'>
												{formatCurrency(credit)}
											</span>
										</div>
										<DropdownMenu>
											<DropdownMenuTrigger asChild>
												<button
													className='flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2'
													type='button'
												>
													<div className='flex-shrink-0 w-7 h-7 rounded-full overflow-hidden border-2 border-border transition-colors duration-300'>
														{userAvatar ? (
															<img
																src={userAvatar}
																alt={userName}
																className='w-full h-full object-cover'
															/>
														) : (
															<div className='w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold text-xs'>
																{userName
																	.charAt(0)
																	.toUpperCase()}
															</div>
														)}
													</div>
												</button>
											</DropdownMenuTrigger>
											<DropdownMenuContent
												align='end'
												className='w-56 shadow-lg border bg-card border-border'
											>
												<div className='px-3 py-2 border-b border-border'>
													<div className='flex items-center gap-3'>
														<div className='flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-border'>
															{userAvatar ? (
																<img
																	src={
																		userAvatar
																	}
																	alt={
																		userName
																	}
																	className='w-full h-full object-cover'
																/>
															) : (
																<div className='w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold'>
																	{userName
																		.charAt(
																			0
																		)
																		.toUpperCase()}
																</div>
															)}
														</div>
														<div className='flex-1 min-w-0'>
															<div className='text-sm font-medium text-card-foreground truncate'>
																{userName}
															</div>
															<div className='text-xs text-muted-foreground truncate'>
																{userEmail}
															</div>
														</div>
													</div>
												</div>

												<DropdownMenuItem
													onClick={() =>
														navigate("/profile")
													}
													className='cursor-pointer'
												>
													<User className='w-4 h-4 mr-2' />
													{sidebar?.viewProfile ||
														"Xem hồ sơ"}
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														navigate("/recharge")
													}
													className='cursor-pointer'
												>
													<Wallet className='w-4 h-4 mr-2' />
													{sidebar?.recharge ||
														"Nạp tiền"}
												</DropdownMenuItem>

												<DropdownMenuItem
													onClick={() =>
														navigate("/settings")
													}
													className='cursor-pointer'
												>
													<Settings className='w-4 h-4 mr-2' />
													{sidebar?.settings}
												</DropdownMenuItem>

												<DropdownMenuSub>
													<DropdownMenuSubTrigger>
														<Palette className='w-4 h-4 mr-2' />
														{sidebar?.theme}
													</DropdownMenuSubTrigger>
													<DropdownMenuSubContent>
														<DropdownMenuItem
															onSelect={() =>
																setTheme(
																	"light"
																)
															}
															className={cn(
																"cursor-pointer",
																theme ===
																	"light" &&
																	"bg-accent"
															)}
														>
															<Sun className='w-4 h-4 mr-2' />
															{sidebar?.light}
														</DropdownMenuItem>
														<DropdownMenuItem
															onSelect={() =>
																setTheme("dark")
															}
															className={cn(
																"cursor-pointer",
																theme ===
																	"dark" &&
																	"bg-accent"
															)}
														>
															<Moon className='w-4 h-4 mr-2' />
															{sidebar?.dark}
														</DropdownMenuItem>
													</DropdownMenuSubContent>
												</DropdownMenuSub>

												<DropdownMenuSub>
													<DropdownMenuSubTrigger>
														<Globe className='w-4 h-4 mr-2' />
														{sidebar?.language}
													</DropdownMenuSubTrigger>
													<DropdownMenuSubContent>
														<DropdownMenuItem
															onSelect={() =>
																setLanguage(
																	"vi"
																)
															}
															className={cn(
																"cursor-pointer",
																language ===
																	"vi" &&
																	"bg-accent"
															)}
														>
															Tiếng Việt
														</DropdownMenuItem>
														<DropdownMenuItem
															onSelect={() =>
																setLanguage(
																	"en"
																)
															}
															className={cn(
																"cursor-pointer",
																language ===
																	"en" &&
																	"bg-accent"
															)}
														>
															English
														</DropdownMenuItem>
													</DropdownMenuSubContent>
												</DropdownMenuSub>

												<DropdownMenuSeparator />

												<DropdownMenuItem
													onClick={handleLogoutClick}
													className='cursor-pointer text-muted-foreground hover:text-foreground'
												>
													<LogOut className='w-4 h-4 mr-2' />
													{sidebar?.logout ||
														"Đăng xuất"}
												</DropdownMenuItem>
											</DropdownMenuContent>
										</DropdownMenu>
									</>
								)}
							</div>
						</div>
					</div>
				</header>

				<main
					className={cn(
						"flex-1",
						shouldFullWidth ? "overflow-hidden" : "overflow-y-auto"
					)}
				>
					{shouldFullWidth ? (
						<div className='h-full w-full'>{children}</div>
					) : (
						<div
							className={cn(
								"container mx-auto px-4 sm:px-6 py-6 sm:py-8",
								bodyLayout === "two-columns" &&
									"grid grid-cols-1 lg:grid-cols-2 gap-6",
								bodyLayout === "grid" &&
									"grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6",
								bodyLayout === "list" && "space-y-4"
							)}
						>
							{children}
						</div>
					)}
				</main>

				<ConfirmDialog
					isOpen={showGoHomeDialog}
					onClose={() => {
						if (!isSaving) {
							setShowGoHomeDialog(false);
						}
					}}
					onConfirm={handleGoHomeConfirm}
					title={
						hasUnsavedChanges ? "Lưu thay đổi" : "Trở về trang chủ"
					}
					message={
						hasUnsavedChanges
							? "Bạn có thay đổi chưa được lưu. Bạn có muốn lưu và trở về trang chủ?"
							: "Bạn có muốn trở về trang chủ?"
					}
					confirmText={
						hasUnsavedChanges
							? "Lưu và trở về trang chủ"
							: "Trở về trang chủ"
					}
					cancelText='Hủy'
					confirmVariant='default'
					isLoading={isSaving}
					icon={
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<Home className='w-6 h-6 text-primary' />
						</div>
					}
				/>

				<ConfirmDialog
					isOpen={showSwitchProjectDialog}
					onClose={() => {
						if (!isSaving) {
							setShowSwitchProjectDialog(false);
							setPendingNavigation(null);
						}
					}}
					onConfirm={handleSwitchProjectConfirm}
					title={
						hasUnsavedChanges ? "Lưu thay đổi" : "Chuyển project"
					}
					message={
						targetProject
							? hasUnsavedChanges
								? `Bạn có thay đổi chưa được lưu. Bạn có muốn lưu và chuyển sang project "${targetProject.title}"?`
								: `Bạn có muốn chuyển sang project "${targetProject.title}"?`
							: hasUnsavedChanges
							? "Bạn có thay đổi chưa được lưu. Bạn có muốn lưu và chuyển sang project khác?"
							: "Bạn có muốn chuyển sang project khác?"
					}
					confirmText={
						hasUnsavedChanges
							? "Lưu và chuyển sang project"
							: "Chuyển sang project"
					}
					cancelText='Hủy'
					confirmVariant='default'
					isLoading={isSaving}
					icon={
						<div className='w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center'>
							<FolderOpen className='w-6 h-6 text-primary' />
						</div>
					}
				/>

				<ConfirmDialog
					isOpen={showDeleteDialog}
					onClose={() => {
						if (!isDeleting) {
							setShowDeleteDialog(false);
						}
					}}
					onConfirm={handleDeleteConfirm}
					title='Xóa project'
					message={
						currentProject
							? `Bạn có chắc chắn muốn xóa project "${currentProject.title}"? Hành động này không thể hoàn tác.`
							: "Bạn có chắc chắn muốn xóa project này? Hành động này không thể hoàn tác."
					}
					confirmText='Xóa'
					cancelText='Hủy'
					confirmVariant='destructive'
					isLoading={isDeleting}
					icon={
						<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
							<Trash2 className='w-6 h-6 text-destructive' />
						</div>
					}
				/>

				<ConfirmDialog
					isOpen={showDeleteErrorDialog}
					onClose={() => {
						setShowDeleteErrorDialog(false);
						setDeleteError(null);
					}}
					onConfirm={() => {
						setShowDeleteErrorDialog(false);
						setDeleteError(null);
					}}
					title='Lỗi xóa project'
					message={deleteError || "Đã xảy ra lỗi khi xóa project."}
					confirmText='Đóng'
					cancelText='Hủy'
					confirmVariant='default'
					icon={
						<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
							<AlertTriangle className='w-6 h-6 text-destructive' />
						</div>
					}
				/>

				<ConfirmDialog
					isOpen={showLogoutConfirm}
					onClose={() => setShowLogoutConfirm(false)}
					onConfirm={handleLogout}
					title='Xác nhận đăng xuất'
					message='Bạn có chắc chắn muốn đăng xuất?'
					confirmText='Đăng xuất'
					cancelText='Hủy'
					confirmVariant='destructive'
				/>

				<Overlay
					isOpen={showEditProjectOverlay}
					onClose={() => {
						if (!isUpdatingProject) {
							setShowEditProjectOverlay(false);
							setEditProjectError(null);
						}
					}}
					contentClassName='max-w-lg'
					closeOnBackdropClick={!isUpdatingProject}
				>
					<div className='p-6'>
						<div className='flex items-center justify-between mb-6'>
							<h2 className='text-xl font-semibold text-foreground'>
								Chỉnh sửa project
							</h2>
							{!isUpdatingProject && (
								<button
									onClick={() => {
										setShowEditProjectOverlay(false);
										setEditProjectError(null);
									}}
									className='w-8 h-8 rounded-lg flex items-center justify-center text-muted-foreground hover:text-foreground hover:bg-muted transition-colors'
									aria-label='Đóng'
								>
									<X className='w-5 h-5' />
								</button>
							)}
						</div>

						<div className='space-y-4'>
							<div>
								<label
									htmlFor='edit-project-title'
									className='block text-sm font-medium text-foreground mb-2'
								>
									Tiêu đề
								</label>
								<Input
									id='edit-project-title'
									type='text'
									value={editProjectData.title}
									onChange={(e) => {
										setEditProjectData((prev) => ({
											...prev,
											title: e.target.value,
										}));
										if (editProjectError) {
											setEditProjectError(null);
										}
									}}
									placeholder='Nhập tiêu đề project'
									disabled={isUpdatingProject}
									className='w-full'
								/>
							</div>

							<div>
								<label
									htmlFor='edit-project-description'
									className='block text-sm font-medium text-foreground mb-2'
								>
									Mô tả
								</label>
								<textarea
									id='edit-project-description'
									value={editProjectData.description}
									onChange={(e) => {
										setEditProjectData((prev) => ({
											...prev,
											description: e.target.value,
										}));
									}}
									placeholder='Nhập mô tả project'
									rows={4}
									disabled={isUpdatingProject}
									className='w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 resize-none disabled:opacity-50 disabled:cursor-not-allowed'
								/>
							</div>

							{editProjectError && (
								<div className='p-3 rounded-lg bg-destructive/10 border border-destructive/20'>
									<p className='text-sm text-destructive'>
										{editProjectError}
									</p>
								</div>
							)}

							<div className='flex items-center gap-3 pt-4'>
								<Button
									variant='outline'
									onClick={() => {
										setShowEditProjectOverlay(false);
										setEditProjectError(null);
									}}
									disabled={isUpdatingProject}
									className='flex-1'
								>
									Hủy
								</Button>
								<Button
									variant='default'
									onClick={handleUpdateProject}
									loading={isUpdatingProject}
									disabled={isUpdatingProject}
									className='flex-1'
								>
									Lưu
								</Button>
							</div>
						</div>
					</div>
				</Overlay>
			</div>
		</ProjectLayoutContext.Provider>
	);
};


export default ProjectLayout;
