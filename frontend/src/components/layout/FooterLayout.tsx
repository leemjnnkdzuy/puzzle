import React, {useEffect} from "react";
import {useNavigate, useLocation} from "react-router-dom";
import {FaTwitter, FaDiscord, FaGithub, FaEnvelope} from "react-icons/fa";
import AppIcon from "@/components/common/AppIcon";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {useLanguage} from "@/hooks/useLanguage";
import {Globe} from "lucide-react";

interface FooterLayoutProps {
	children: React.ReactNode;
}

const FooterLayout: React.FC<FooterLayoutProps> = ({children}) => {
	const navigate = useNavigate();
	const location = useLocation();
	const {language, setLanguage, t} = useLanguage();

	useEffect(() => {
		window.scrollTo({top: 0, behavior: "smooth"});
	}, [location.pathname]);

	return (
		<div className='min-h-screen bg-background relative overflow-hidden flex flex-col'>
			<div className="flex-grow">
				{children}
			</div>

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
		</div>
	);
};


export default FooterLayout;
