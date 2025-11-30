import React, {useState, useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {
	Home,
	Mic,
	Volume2,
	MessageSquare,
	FolderOpen,
	Share2,
	User,
	Settings,
	Palette,
	Globe,
	LogOut,
	Sun,
	Moon,
	ChevronLeft,
	ChevronRight,
} from "lucide-react";
import {useLanguage} from "@/hooks/useLanguage";
import {useAuth} from "@/hooks/useAuth";
import {useTheme} from "@/hooks/useTheme";
import {cn} from "@/utils";
import AppIcon from "@/components/common/AppIcon";
import LogoutConfirmDialog from "@/components/common/LogoutConfirmDialog";
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

interface SidebarLayoutProps {
	children: React.ReactNode;
}

interface MenuItem {
	key: string;
	label: string;
	icon: React.ComponentType<{className?: string}>;
	path?: string;
	children?: MenuItem[];
}

interface UserData {
	_id?: string;
	username?: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({children}) => {
	const [isCollapsed, setIsCollapsed] = useState(false);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
	const navigate = useNavigate();
	const location = useLocation();
	const {getNested, language, setLanguage} = useLanguage();
	const {user, logout} = useAuth();
	const {theme, setTheme} = useTheme();

	const userData = user as UserData | null;
	const userName =
		userData && userData.first_name && userData.last_name
			? `${userData.first_name} ${userData.last_name}`.trim()
			: userData?.username || "User";
	const userEmail = userData?.email || "";
	const userAvatar = userData?.avatar || "";

	const sidebar = getNested?.("sidebar") as
		| {
				home: string;
				api: string;
				voice: string;
				tts: string;
				stt: string;
				projects: string;
				templates: string;
				shared: string;
				about: string;
				viewProfile: string;
				settings: string;
				theme: string;
				language: string;
				logout: string;
				light: string;
				dark: string;
		  }
		| undefined;

	const menuItems: MenuItem[] = [
		{
			key: "home",
			label: sidebar?.home || "Trang chủ",
			icon: Home,
			path: "/home",
		},
		{
			key: "api",
			label: sidebar?.api || "API",
			icon: Mic,
			children: [
				{
					key: "voice",
					label: sidebar?.voice || "Voice",
					icon: Mic,
					path: "/api/voice",
				},
				{
					key: "tts",
					label: sidebar?.tts || "Text-to-Speech",
					icon: Volume2,
					path: "/api/tts",
				},
				{
					key: "stt",
					label: sidebar?.stt || "Speech-to-Text",
					icon: MessageSquare,
					path: "/api/stt",
				},
			],
		},
		{
			key: "projects",
			label: sidebar?.projects || "Dự án",
			icon: FolderOpen,
			children: [
				{
					key: "templates",
					label: sidebar?.templates || "Mẫu",
					icon: FolderOpen,
					path: "/projects/templates",
				},
				{
					key: "shared",
					label: sidebar?.shared || "Dự án được chia sẻ",
					icon: Share2,
					path: "/projects/shared",
				},
			],
		},
	];

	const isActive = (path?: string) => {
		if (!path) return false;
		return location.pathname === path;
	};

	useEffect(() => {
		const handleResize = () => {
			const shouldCollapse = window.innerWidth < 1200;
			setIsCollapsed(shouldCollapse);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	const renderMenuItem = (
		item: MenuItem,
		level = 0,
		isLastItemWithChildren = false,
		isFirstItemWithChildren = false
	) => {
		const hasChildren = item.children && item.children.length > 0;
		const active = isActive(item.path);
		const Icon = item.icon;

		if (isCollapsed && hasChildren) {
			return (
				<div key={item.key}>
					<div
						className={cn(
							"flex items-center justify-center py-2.5 transition-all duration-300",
							level === 0 &&
								isFirstItemWithChildren &&
								"border-t border-sidebar-border",
							level === 0 ? "mt-2 pt-2" : "mb-0.5"
						)}
					>
						<div className='w-8 h-px bg-sidebar-border' />
					</div>
					<div className='space-y-0.5'>
						{item.children?.map((child) =>
							renderMenuItem(child, level + 1)
						)}
					</div>
				</div>
			);
		}

		if (isCollapsed && !hasChildren) {
			return (
				<div key={item.key}>
					<div
						className={cn(
							"flex items-center justify-center py-2.5 rounded-lg cursor-pointer transition-all duration-300",
							level === 0 ? "mb-1" : "mb-0.5",
							active
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground"
						)}
						onClick={() => {
							if (item.path) {
								navigate(item.path);
							}
						}}
						title={item.label}
					>
						<Icon
							className={cn(
								"w-5 h-5 flex-shrink-0",
								active
									? "text-primary-foreground"
									: "text-sidebar-muted"
							)}
						/>
					</div>
				</div>
			);
		}

		return (
			<div key={item.key}>
				{!hasChildren && (
					<div
						className={cn(
							"flex items-center gap-3 px-4 py-2.5 rounded-lg cursor-pointer transition-all duration-300",
							level === 0 ? "mb-1" : "mb-0.5",
							active
								? "bg-primary text-primary-foreground shadow-sm"
								: "text-sidebar-foreground/80 hover:bg-sidebar-accent hover:text-sidebar-foreground",
							level > 0 && "ml-4"
						)}
						onClick={() => {
							if (item.path) {
								navigate(item.path);
							}
						}}
					>
						<Icon
							className={cn(
								"w-5 h-5 flex-shrink-0",
								active
									? "text-primary-foreground"
									: "text-sidebar-muted"
							)}
						/>
						<span className='flex-1 text-sm font-medium'>
							{item.label}
						</span>
					</div>
				)}
				{hasChildren && (
					<>
						<div
							className={cn(
								"flex items-center px-4 py-2.5 transition-all duration-300",
								level === 0 ? "mt-2 pt-2" : "mb-0.5",
								!isLastItemWithChildren &&
									"border-t border-sidebar-border",
								"text-sidebar-foreground/80 font-medium"
							)}
						>
							<span className='text-sm font-medium'>
								{item.label}
							</span>
						</div>
						<div className='space-y-0.5'>
							{item.children?.map((child) =>
								renderMenuItem(child, level + 1)
							)}
						</div>
					</>
				)}
			</div>
		);
	};

	const handleLogout = async () => {
		await logout();
	};

	const handleLogoutClick = () => {
		setShowLogoutConfirm(true);
	};

	return (
		<div className='flex h-screen overflow-hidden bg-background transition-colors duration-300'>
			<aside
				className={cn(
					"h-full flex flex-col overflow-hidden transition-all duration-300 background flex-shrink-0",
					isCollapsed ? "w-16" : "w-64"
				)}
			>
				<div className='flex-1 overflow-y-auto no-scrollbar'>
					<div className={cn("p-4", isCollapsed && "px-2")}>
						<div className={cn("mb-6", isCollapsed && "mb-4")}>
							<div
								className={cn(
									"flex items-center cursor-pointer hover:opacity-80 transition-opacity",
									isCollapsed ? "justify-center" : "gap-2"
								)}
								onClick={() => navigate("/")}
							>
								<AppIcon className='w-8 h-8 object-contain' />
								{!isCollapsed && (
									<span className='text-xl font-semibold text-sidebar-foreground transition-colors duration-300'>
										Puzzle
									</span>
								)}
							</div>
						</div>
						<nav className='space-y-1'>
							{menuItems.map((item, index) => {
								const isLastItemWithChildren =
									item.children &&
									index === menuItems.length - 1;
								const isFirstItemWithChildren =
									item.children &&
									index ===
										menuItems.findIndex(
											(i) => i.children
										) &&
									index > 0;
								return renderMenuItem(
									item,
									0,
									isLastItemWithChildren,
									isFirstItemWithChildren
								);
							})}
						</nav>
					</div>
				</div>

				{userData && (
					<div
						className={cn(
							"px-4 pt-4 pb-2",
							isCollapsed && "px-2",
							!isCollapsed && "border-t border-sidebar-border"
						)}
					>
						<DropdownMenu>
							<DropdownMenuTrigger asChild>
								<button
									className={cn(
										"w-full flex items-center rounded-lg hover:bg-sidebar-accent transition-colors duration-300 text-left",
										isCollapsed
											? "justify-center px-0 py-2"
											: "gap-3 px-3 py-2"
									)}
								>
									<div className='flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-sidebar-border transition-colors duration-300'>
										{userAvatar ? (
											<img
												src={userAvatar}
												alt={userName}
												className='w-full h-full object-cover'
											/>
										) : (
											<div className='w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold'>
												{userName
													.charAt(0)
													.toUpperCase()}
											</div>
										)}
									</div>
									{!isCollapsed && (
										<div className='flex-1 min-w-0'>
											<div className='text-sm font-medium text-sidebar-foreground truncate transition-colors duration-300'>
												{userName}
											</div>
											<div className='text-xs text-sidebar-muted truncate transition-colors duration-300'>
												{userEmail}
											</div>
										</div>
									)}
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
													src={userAvatar}
													alt={userName}
													className='w-full h-full object-cover'
												/>
											) : (
												<div className='w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold'>
													{userName
														.charAt(0)
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
									onClick={() => navigate("/profile")}
									className='cursor-pointer'
								>
									<User className='w-4 h-4 mr-2' />
									{sidebar?.viewProfile || "Xem hồ sơ"}
								</DropdownMenuItem>

								<DropdownMenuItem
									onClick={() => navigate("/settings")}
									className='cursor-pointer'
								>
									<Settings className='w-4 h-4 mr-2' />
									{sidebar?.settings || "Cài đặt"}
								</DropdownMenuItem>

								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<Palette className='w-4 h-4 mr-2' />
										{sidebar?.theme || "Chủ đề"}
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											onSelect={() => setTheme("light")}
											className={cn(
												"cursor-pointer",
												theme === "light" && "bg-accent"
											)}
										>
											<Sun className='w-4 h-4 mr-2' />
											{sidebar?.light || "Sáng"}
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setTheme("dark")}
											className={cn(
												"cursor-pointer",
												theme === "dark" && "bg-accent"
											)}
										>
											<Moon className='w-4 h-4 mr-2' />
											{sidebar?.dark || "Tối"}
										</DropdownMenuItem>
									</DropdownMenuSubContent>
								</DropdownMenuSub>

								<DropdownMenuSub>
									<DropdownMenuSubTrigger>
										<Globe className='w-4 h-4 mr-2' />
										{sidebar?.language || "Ngôn ngữ"}
									</DropdownMenuSubTrigger>
									<DropdownMenuSubContent>
										<DropdownMenuItem
											onSelect={() => setLanguage("vi")}
											className={cn(
												"cursor-pointer",
												language === "vi" && "bg-accent"
											)}
										>
											Tiếng Việt
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setLanguage("en")}
											className={cn(
												"cursor-pointer",
												language === "en" && "bg-accent"
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
									{sidebar?.logout || "Đăng xuất"}
								</DropdownMenuItem>
							</DropdownMenuContent>
						</DropdownMenu>
					</div>
				)}

				<div
					className={cn(
						"px-2 pt-1 pb-2 flex-shrink-0",
						isCollapsed && "px-1 border-t border-sidebar-border"
					)}
				>
					<button
						onClick={() => setIsCollapsed(!isCollapsed)}
						className={cn(
							"w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-300",
							isCollapsed ? "px-0" : "gap-2"
						)}
						title={isCollapsed ? "Mở rộng" : "Thu nhỏ"}
					>
						{isCollapsed ? (
							<ChevronRight className='w-5 h-5 text-sidebar-foreground/80' />
						) : (
							<>
								<ChevronLeft className='w-5 h-5 text-sidebar-foreground/80' />
								{!isCollapsed && (
									<span className='text-sm text-sidebar-foreground/80'>
										Thu nhỏ
									</span>
								)}
							</>
						)}
					</button>
				</div>
			</aside>
			<main className='flex-1 overflow-y-auto bg-background transition-colors duration-300'>
				<div className='h-full'>{children}</div>
			</main>

			<LogoutConfirmDialog
				isOpen={showLogoutConfirm}
				onClose={() => setShowLogoutConfirm(false)}
				onConfirm={handleLogout}
			/>
		</div>
	);
};

SidebarLayout.displayName = "SidebarLayout";
export default SidebarLayout;
