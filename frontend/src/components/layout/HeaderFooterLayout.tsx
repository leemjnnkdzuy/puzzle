import React, {useState} from "react";
import {useNavigate} from "react-router-dom";
import {FaTwitter, FaDiscord, FaGithub, FaEnvelope} from "react-icons/fa";
import {FileText, Mic, Sparkles, User, Settings, Palette, LogOut, Sun, Moon, Wallet, CircleDollarSign} from "lucide-react";
import Button from "@/components/ui/Button";
import AppIcon from "@/components/common/AppIcon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
	DropdownMenuSeparator,
	DropdownMenuSub,
	DropdownMenuSubContent,
	DropdownMenuSubTrigger,
} from "@/components/ui/DropdownMenu";
import {useLanguage} from "@/hooks/useLanguage";
import {Globe} from "lucide-react";
import {useAuth} from "@/hooks/useAuth";
import {useTheme} from "@/hooks/useTheme";
import {useLogoutListener} from "@/hooks/useLogoutListener";
import {useCreditStore} from "@/stores/creditStore";
import {formatCurrency} from "@/utils";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import {cn} from "@/utils";

interface HeaderFooterLayoutProps {
	children: React.ReactNode;
}

const servicePackages = [
	{key: "scriptGeneration", Icon: FileText},
	{key: "scriptVoice", Icon: Mic},
	{key: "fullService", Icon: Sparkles},
];

interface UserData {
	username?: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
}

const HeaderFooterLayout: React.FC<HeaderFooterLayoutProps> = ({children}) => {
	const navigate = useNavigate();
	const {language, setLanguage, t, getNested} = useLanguage();
	const {isAuthenticated, user, logout} = useAuth();
	const {theme, setTheme} = useTheme();
	const credit = useCreditStore((state) => state.credit);
	const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

	useLogoutListener();

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
				recharge: string;
				settings: string;
				theme: string;
				language: string;
				logout: string;
				light: string;
				dark: string;
				collapse: string;
				expand: string;
		  }
		| undefined;

	const handleLogoutClick = () => {
		setShowLogoutConfirm(true);
	};

	const handleLogout = async () => {
		await logout();
		navigate("/");
	};

	return (
		<div className='min-h-screen bg-background relative overflow-hidden'>
			<header className='fixed top-0 left-0 right-0 z-50 bg-background/95 backdrop-blur-sm border-b border-border'>
				<div className='container mx-auto px-6 py-6'>
					<div className='flex items-center justify-between'>
						<div
							className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'
							onClick={() => navigate("/")}
						>
							<AppIcon className='w-8 h-8 object-contain' />
							<span className='text-xl font-semibold text-foreground'>
								Puzzle
							</span>
						</div>

						<nav className='hidden md:flex items-center gap-8'>
							<DropdownMenu>
								<DropdownMenuTrigger asChild>
									<div className='flex items-center gap-1 cursor-pointer'>
										<span className='text-foreground hover:text-foreground/80'>
											{t("nav.product")}
										</span>
										<svg
											className='w-4 h-4 text-muted-foreground'
											fill='none'
											stroke='currentColor'
											viewBox='0 0 24 24'
										>
											<path
												strokeLinecap='round'
												strokeLinejoin='round'
												strokeWidth={2}
												d='M19 9l-7 7-7-7'
											/>
										</svg>
									</div>
								</DropdownMenuTrigger>
								<DropdownMenuContent
									align='start'
									className='w-[400px] p-4 bg-card border border-border shadow-lg'
								>
									<div className='space-y-3'>
										{servicePackages.map((pkg) => {
											const Icon = pkg.Icon;
											return (
												<DropdownMenuItem
													key={pkg.key}
													className='flex items-start gap-4 p-4 rounded-lg hover:bg-muted cursor-pointer focus:bg-muted'
													onClick={() =>
														navigate("/register")
													}
												>
													<div className='flex-shrink-0 w-12 h-12 rounded-lg border border-border bg-muted flex items-center justify-center'>
														<Icon
															className='w-6 h-6 text-foreground'
															strokeWidth={2}
														/>
													</div>
													<div className='flex-1 min-w-0'>
														<div className='flex items-center gap-2 mb-1'>
															<h3 className='text-base font-semibold text-foreground'>
																{t(
																	`packages.${pkg.key}.title`
																)}
															</h3>
															<span className='text-sm text-muted-foreground'>
																{t(
																	`packages.${pkg.key}.subtitle`
																)}
															</span>
														</div>
														<p className='text-sm text-muted-foreground leading-relaxed'>
															{t(
																`packages.${pkg.key}.description`
															)}
														</p>
													</div>
												</DropdownMenuItem>
											);
										})}
									</div>
								</DropdownMenuContent>
							</DropdownMenu>
							<button
								onClick={() => navigate("/customers")}
								className='text-foreground hover:text-foreground/80 cursor-pointer bg-transparent border-none p-0'
							>
								{t("nav.customers")}
							</button>
							<div className='flex items-center gap-1 cursor-pointer'>
								<span className='text-foreground hover:text-foreground/80'>
									{t("nav.resources")}
								</span>
								<svg
									className='w-4 h-4 text-muted-foreground'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</div>
							<button
								onClick={() => navigate("/pricing")}
								className='text-foreground hover:text-foreground/80 cursor-pointer bg-transparent border-none p-0'
							>
								{t("nav.pricing")}
							</button>
							<div className='flex items-center gap-1 cursor-pointer'>
								<span className='text-foreground hover:text-foreground/80'>
									{t("nav.company")}
								</span>
								<svg
									className='w-4 h-4 text-muted-foreground'
									fill='none'
									stroke='currentColor'
									viewBox='0 0 24 24'
								>
									<path
										strokeLinecap='round'
										strokeLinejoin='round'
										strokeWidth={2}
										d='M19 9l-7 7-7-7'
									/>
								</svg>
							</div>
						</nav>

						<div className='flex items-center gap-4'>
							{isAuthenticated && userData ? (
								<>
									<div className='flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-card/50'>
										<CircleDollarSign className='w-4 h-4 text-green-500 dark:text-green-400' />
										<span className='text-sm font-medium text-foreground'>
											{formatCurrency(credit)}
										</span>
									</div>
									<DropdownMenu>
										<DropdownMenuTrigger asChild>
											<button
												className='flex items-center gap-2 rounded-full hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-foreground focus:ring-offset-2'
												type='button'
											>
												<div className='flex-shrink-0 w-10 h-10 rounded-full overflow-hidden border-2 border-border transition-colors duration-300'>
													{userAvatar ? (
														<img
															src={userAvatar}
															alt={userName}
															className='w-full h-full object-cover'
														/>
													) : (
														<div className='w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold'>
															{userName.charAt(0).toUpperCase()}
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
															src={userAvatar}
															alt={userName}
															className='w-full h-full object-cover'
														/>
													) : (
														<div className='w-full h-full bg-primary flex items-center justify-center text-primary-foreground font-semibold'>
															{userName.charAt(0).toUpperCase()}
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
											onClick={() => navigate("/recharge")}
											className='cursor-pointer'
										>
											<Wallet className='w-4 h-4 mr-2' />
											{sidebar?.recharge || "Nạp tiền"}
										</DropdownMenuItem>

										<DropdownMenuItem
											onClick={() => navigate("/settings")}
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
													onSelect={() => setTheme("light")}
													className={cn(
														"cursor-pointer",
														theme === "light" && "bg-accent"
													)}
												>
													<Sun className='w-4 h-4 mr-2' />
													{sidebar?.light}
												</DropdownMenuItem>
												<DropdownMenuItem
													onSelect={() => setTheme("dark")}
													className={cn(
														"cursor-pointer",
														theme === "dark" && "bg-accent"
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
								</>
							) : (
								<>
									<Button
										variant='outline'
										onClick={() => navigate("/login")}
									>
										{t("nav.signIn")}
									</Button>
									<Button
										variant='default'
										className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background'
										onClick={() => navigate("/register")}
									>
										{t("nav.signUp")}
									</Button>
								</>
							)}
						</div>
					</div>
				</div>
			</header>

			{children}

			<footer className='relative z-10 w-full border-t border-border bg-background'>
				<div className='max-w-7xl mx-auto px-6 py-12 md:py-16'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8'>
						<div className='lg:col-span-2'>
							<div
								className='flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity'
								onClick={() => navigate("/")}
							>
								<AppIcon className='w-8 h-8 object-contain' />
								<span className='text-xl font-semibold text-foreground'>
									Puzzle
								</span>
							</div>
							<p className='text-muted-foreground text-sm leading-relaxed max-w-md'>
								{t("footer.description")}
							</p>
							<div className='flex items-center gap-4 mt-6'>
								<button
									onClick={() =>
										window.open(
											"https://twitter.com",
											"_blank"
										)
									}
									className='w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer'
									aria-label='Twitter'
								>
									<FaTwitter className='w-5 h-5' />
								</button>
								<button
									onClick={() =>
										window.open(
											"https://discord.com",
											"_blank"
										)
									}
									className='w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer'
									aria-label='Discord'
								>
									<FaDiscord className='w-5 h-5' />
								</button>
								<button
									onClick={() =>
										window.open(
											"https://github.com",
											"_blank"
										)
									}
									className='w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer'
									aria-label='GitHub'
								>
									<FaGithub className='w-5 h-5' />
								</button>
								<button
									onClick={() =>
										window.open("mailto:", "_blank")
									}
									className='w-10 h-10 rounded-lg border border-border flex items-center justify-center text-muted-foreground hover:text-foreground hover:border-border transition-colors cursor-pointer'
									aria-label='Email'
								>
									<FaEnvelope className='w-5 h-5' />
								</button>
							</div>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-foreground mb-4'>
								{t("footer.product")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<button
										onClick={() => navigate("/features")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productFeatures")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/pricing")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productPricing")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/docs")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productDocumentation")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/api")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productApi")}
									</button>
								</li>
							</ul>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-foreground mb-4'>
								{t("footer.company")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<button
										onClick={() => navigate("/about")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyAbout")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/blog")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyBlog")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/careers")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyCareers")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/contact")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyContact")}
									</button>
								</li>
							</ul>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-foreground mb-4'>
								{t("footer.resources")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<button
										onClick={() => navigate("/help")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesHelp")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/community")}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesCommunity")}
									</button>
								</li>
								<li>
									<button
										onClick={() =>
											navigate("/privacy-policy")
										}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesPrivacy")}
									</button>
								</li>
								<li>
									<button
										onClick={() =>
											navigate("/terms-of-service")
										}
										className='text-sm text-muted-foreground hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesTerms")}
									</button>
								</li>
							</ul>
						</div>
					</div>

					<div className='pt-8 border-t border-border'>
						<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
							<div className='flex items-center gap-4'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors'>
											<Globe className='w-4 h-4' />
											<span>
												{language === "en"
													? "English"
													: "Tiếng Việt"}
											</span>
											<svg
												className='w-4 h-4'
												fill='none'
												stroke='currentColor'
												viewBox='0 0 24 24'
											>
												<path
													strokeLinecap='round'
													strokeLinejoin='round'
													strokeWidth={2}
													d='M19 9l-7 7-7-7'
												/>
											</svg>
										</button>
									</DropdownMenuTrigger>
									<DropdownMenuContent
										align='start'
										className='bg-card border border-border min-w-[120px]'
									>
										<DropdownMenuItem
											onSelect={() => setLanguage("en")}
										>
											English
										</DropdownMenuItem>
										<DropdownMenuItem
											onSelect={() => setLanguage("vi")}
										>
											Tiếng Việt
										</DropdownMenuItem>
									</DropdownMenuContent>
								</DropdownMenu>
							</div>
							<p className='text-sm text-muted-foreground'>
								© {new Date().getFullYear()} Puzzle.{" "}
								{t("footer.copyright")}
							</p>
							<div className='flex items-center gap-6 text-sm text-muted-foreground'>
								<button
									onClick={() => navigate("/privacy-policy")}
									className='hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0'
								>
									{t("footer.privacy")}
								</button>
								<button
									onClick={() =>
										navigate("/terms-of-service")
									}
									className='hover:text-foreground transition-colors cursor-pointer bg-transparent border-none p-0'
								>
									{t("footer.terms")}
								</button>
							</div>
						</div>
					</div>
				</div>
			</footer>

			<ConfirmDialog
				isOpen={showLogoutConfirm}
				onClose={() => setShowLogoutConfirm(false)}
				onConfirm={async () => {
					await handleLogout();
					setShowLogoutConfirm(false);
				}}
				title={
					(getNested?.("logout.confirmTitle") as string) ||
					"Confirm Logout"
				}
				message={
					(getNested?.("logout.confirmMessage") as string) ||
					"Are you sure you want to logout?"
				}
				confirmText={
					(getNested?.("logout.confirm") as string) || "Logout"
				}
				cancelText={
					(getNested?.("logout.cancel") as string) || "Cancel"
				}
				confirmVariant='destructive'
				icon={
					<div className='w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center'>
						<LogOut className='w-6 h-6 text-destructive' />
					</div>
				}
			/>
		</div>
	);
};

HeaderFooterLayout.displayName = "HeaderFooterLayout";
export default HeaderFooterLayout;
