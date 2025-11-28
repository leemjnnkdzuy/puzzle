import React from "react";
import {useNavigate} from "react-router-dom";
import {FaTwitter, FaDiscord, FaGithub, FaEnvelope} from "react-icons/fa";
import Button from "../ui/Button";
import Assets from "../../configs/AssetsConfig";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../ui/DropdownMenu";
import {useLanguage} from "../../hooks/useLanguage";
import {Globe} from "lucide-react";
import {useAuth} from "../../hooks/useAuth";

interface HeaderFooterLayoutProps {
	children: React.ReactNode;
}

const HeaderFooterLayout: React.FC<HeaderFooterLayoutProps> = ({children}) => {
	const navigate = useNavigate();
	const {language, setLanguage, t} = useLanguage();
	const {isAuthenticated} = useAuth({skipInitialCheck: true});

	return (
		<div className='min-h-screen bg-white relative overflow-hidden'>
			<header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100'>
				<div className='container mx-auto px-6 py-6'>
					<div className='flex items-center justify-between'>
						<div
							className='flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity'
							onClick={() => navigate("/")}
						>
							<img
								src={Assets.AppIcon}
								alt='Puzzle'
								className='w-8 h-8 object-contain'
							/>
							<span className='text-xl font-semibold text-gray-900'>
								Puzzle
							</span>
						</div>

						<nav className='hidden md:flex items-center gap-8'>
							<div className='flex items-center gap-1 cursor-pointer'>
								<span className='text-gray-700 hover:text-gray-900'>
									{t("nav.product")}
								</span>
								<svg
									className='w-4 h-4 text-gray-500'
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
								onClick={() => navigate("/customers")}
								className='text-gray-700 hover:text-gray-900 cursor-pointer bg-transparent border-none p-0'
							>
								{t("nav.customers")}
							</button>
							<div className='flex items-center gap-1 cursor-pointer'>
								<span className='text-gray-700 hover:text-gray-900'>
									{t("nav.resources")}
								</span>
								<svg
									className='w-4 h-4 text-gray-500'
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
								className='text-gray-700 hover:text-gray-900 cursor-pointer bg-transparent border-none p-0'
							>
								{t("nav.pricing")}
							</button>
							<div className='flex items-center gap-1 cursor-pointer'>
								<span className='text-gray-700 hover:text-gray-900'>
									{t("nav.company")}
								</span>
								<svg
									className='w-4 h-4 text-gray-500'
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
							{isAuthenticated ? (
								<Button
									variant='default'
									className='bg-black text-white hover:bg-gray-800'
									onClick={() => navigate("/home")}
								>
									{t("nav.goHome")}
								</Button>
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
										className='bg-black text-white hover:bg-gray-800'
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

			<footer className='relative z-10 w-full border-t border-gray-200 bg-white'>
				<div className='max-w-7xl mx-auto px-6 py-12 md:py-16'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8'>
						<div className='lg:col-span-2'>
							<div
								className='flex items-center gap-2 mb-4 cursor-pointer hover:opacity-80 transition-opacity'
								onClick={() => navigate("/")}
							>
								<img
									src={Assets.AppIcon}
									alt='Puzzle'
									className='w-8 h-8 object-contain'
								/>
								<span className='text-xl font-semibold text-gray-900'>
									Puzzle
								</span>
							</div>
							<p className='text-gray-600 text-sm leading-relaxed max-w-md'>
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
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors cursor-pointer'
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
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors cursor-pointer'
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
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors cursor-pointer'
									aria-label='GitHub'
								>
									<FaGithub className='w-5 h-5' />
								</button>
								<button
									onClick={() =>
										window.open("mailto:", "_blank")
									}
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors cursor-pointer'
									aria-label='Email'
								>
									<FaEnvelope className='w-5 h-5' />
								</button>
							</div>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-gray-900 mb-4'>
								{t("footer.product")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<button
										onClick={() => navigate("/features")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productFeatures")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/pricing")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productPricing")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/docs")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productDocumentation")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/api")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.productApi")}
									</button>
								</li>
							</ul>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-gray-900 mb-4'>
								{t("footer.company")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<button
										onClick={() => navigate("/about")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyAbout")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/blog")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyBlog")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/careers")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyCareers")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/contact")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.companyContact")}
									</button>
								</li>
							</ul>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-gray-900 mb-4'>
								{t("footer.resources")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<button
										onClick={() => navigate("/help")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesHelp")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/community")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesCommunity")}
									</button>
								</li>
								<li>
									<button
										onClick={() => navigate("/privacy")}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesPrivacy")}
									</button>
								</li>
								<li>
									<button
										onClick={() =>
											navigate("/terms-of-service")
										}
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0 text-left'
									>
										{t("footer.resourcesTerms")}
									</button>
								</li>
							</ul>
						</div>
					</div>

					<div className='pt-8 border-t border-gray-200'>
						<div className='flex flex-col md:flex-row items-center justify-between gap-4'>
							<div className='flex items-center gap-4'>
								<DropdownMenu>
									<DropdownMenuTrigger asChild>
										<button className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors'>
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
										className='bg-white border border-gray-200 min-w-[120px]'
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
							<p className='text-sm text-gray-600'>
								© {new Date().getFullYear()} Puzzle.{" "}
								{t("footer.copyright")}
							</p>
							<div className='flex items-center gap-6 text-sm text-gray-600'>
								<button
									onClick={() => navigate("/privacy")}
									className='hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0'
								>
									{t("footer.privacy")}
								</button>
								<button
									onClick={() =>
										navigate("/terms-of-service")
									}
									className='hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0'
								>
									{t("footer.terms")}
								</button>
								<button
									onClick={() => navigate("/cookies")}
									className='hover:text-gray-900 transition-colors cursor-pointer bg-transparent border-none p-0'
								>
									{t("footer.cookies")}
								</button>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

HeaderFooterLayout.displayName = "HeaderFooterLayout";
export default HeaderFooterLayout;
