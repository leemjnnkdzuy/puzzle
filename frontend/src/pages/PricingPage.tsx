import {useRef, useState, useEffect} from "react";
import {useNavigate} from "react-router-dom";
import {
	ArrowLeft,
	FileText,
	Mic,
	Sparkles,
	ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";
import {useAuth} from "@/hooks/useAuth";

const servicePackages = [
	{key: "scriptGeneration", Icon: FileText, Peak: false},
	{key: "scriptVoice", Icon: Mic, Peak: false},
	{key: "fullService", Icon: Sparkles, Peak: true},
];

const PricingPage = () => {
	const navigate = useNavigate();
	const {t} = useLanguage();
	const {isAuthenticated} = useAuth();
	const packagesSectionRef = useRef<HTMLDivElement>(null);
	const [packagesAnimated, setPackagesAnimated] = useState(false);
	const packagesAnimatingRef = useRef(false);
	const [expandedPackages, setExpandedPackages] = useState<{
		[key: number]: boolean;
	}>({});

	useEffect(() => {
		if (!packagesSectionRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!packagesAnimatingRef.current) {
						packagesAnimatingRef.current = true;
						setPackagesAnimated(true);

						setTimeout(() => {
							packagesAnimatingRef.current = false;
						}, 1000);
					}
				}
			},
			{threshold: 0.1}
		);

		observer.observe(packagesSectionRef.current);
		return () => observer.disconnect();
	}, []);

	return (
		<div className="min-h-screen bg-background pt-24 pb-16">
			<div className="max-w-[1400px] 2k:max-w-[1800px] mx-auto px-6">
				<Button
					size="sm"
					className="mb-8 -ml-3 text-muted-foreground hover:text-foreground hover:opacity-100 bg-transparent border-none shadow-none transition-colors duration-200"
					onClick={() => navigate("/")}
					variant="text"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("signIn.backToHome")}
				</Button>

				<div
					ref={packagesSectionRef}
					className="max-w-[1200px] 2k:max-w-[1600px] 4k:max-w-[2000px] mx-auto"
				>
					<div className="text-center mb-8 sm:mb-12 md:mb-16 px-2">
						<h2
							className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl 2k:text-6xl 4k:text-7xl font-bold text-foreground mb-3 sm:mb-4 2k:mb-6 4k:mb-8 ${
								packagesAnimated
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
							}`}
							style={{
								transitionDelay: packagesAnimated
									? "0ms"
									: "0ms",
								transitionDuration: "600ms",
								transitionTimingFunction:
									"cubic-bezier(0.4, 0, 0.2, 1)",
							}}
						>
							{t("packages.title")}
						</h2>
						<p
							className={`text-sm sm:text-base md:text-lg text-muted-foreground max-w-2xl mx-auto ${
								packagesAnimated
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
							}`}
							style={{
								transitionDelay: packagesAnimated
									? "100ms"
									: "0ms",
								transitionDuration: "600ms",
								transitionTimingFunction:
									"cubic-bezier(0.4, 0, 0.2, 1)",
							}}
						>
							{t("packages.subtitle")}
						</p>
					</div>

					<div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-4 2k:gap-8 4k:gap-10 items-stretch">
						{servicePackages.map((pkg, index) => {
							const Icon = pkg.Icon;
							const isPopular = pkg.Peak;
							const featuresRaw = t(
								`packages.${pkg.key}.features`
							);
							const features = Array.isArray(featuresRaw)
								? (featuresRaw as string[])
								: [];
							return (
								<div
									key={index}
									className={`group relative overflow-visible ${
										isPopular ? "lg:-mt-4" : ""
									} ${
										packagesAnimated
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
									style={{
										transitionDelay: packagesAnimated
											? `${(index + 2) * 100}ms`
											: "0ms",
										transitionDuration: "600ms",
										transitionTimingFunction:
											"cubic-bezier(0.4, 0, 0.2, 1)",
										willChange: packagesAnimated
											? "transform, opacity"
											: "auto",
									}}
								>
									{isPopular ? (
										<div className="bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] p-[2px] rounded-xl sm:rounded-2xl lg:rounded-3xl h-full">
											<div
												className="bg-card rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col h-full shadow-xl hover:shadow-2xl transition-shadow duration-200"
												style={{
													boxShadow:
														"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 40px -10px rgba(0, 0, 0, 0.15)",
												}}
												onMouseEnter={(e) => {
													e.currentTarget.style.transition =
														"box-shadow 100ms ease-out";
													e.currentTarget.style.boxShadow =
														"0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 60px -15px rgba(0, 0, 0, 0.2)";
												}}
												onMouseLeave={(e) => {
													e.currentTarget.style.transition =
														"box-shadow 100ms ease-out";
													e.currentTarget.style.boxShadow =
														"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 40px -10px rgba(0, 0, 0, 0.15)";
												}}
											>
												{isPopular && (
													<div className="absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2">
														<span className="inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] px-[2px] py-[2px] rounded-full shadow-lg">
															<span className="inline-flex items-center gap-1 bg-background/90 backdrop-blur-sm px-3 sm:px-4 py-1 sm:py-1.5 rounded-full">
																<Sparkles className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-cyan-500" />
																<span className="bg-gradient-to-r from-[#22d3ee] to-[#3b82f6] bg-clip-text text-transparent">
																	{t(
																		"packages.popular"
																	)}
																</span>
															</span>
														</span>
													</div>
												)}

												<div className="mb-4 sm:mb-5 md:mb-6">
													<div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
														<div
															className={`w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 transition-all duration-200 ${
																isPopular
																	? "bg-gradient-to-br from-foreground to-foreground/80 text-background shadow-lg"
																	: "border border-border bg-muted group-hover:bg-muted/80"
															}`}
														>
															<Icon
																className={`w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 ${
																	isPopular
																		? "text-background"
																		: "text-foreground"
																}`}
																strokeWidth={2}
															/>
														</div>
														<h3
															className={`text-lg sm:text-xl md:text-2xl font-bold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 ${
																isPopular
																	? "text-foreground"
																	: "text-foreground"
															}`}
														>
															<span>
																{t(
																	`packages.${pkg.key}.title`
																)}
															</span>
															<span className="text-xs sm:text-sm font-normal text-muted-foreground">
																{t(
																	`packages.${pkg.key}.subtitle`
																)}
															</span>
														</h3>
														<button
															onClick={() => {
																setExpandedPackages(
																	(prev) => ({
																		...prev,
																		[index]:
																			!prev[
																				index
																			],
																	})
																);
															}}
															className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-200 shrink-0"
															aria-label={
																expandedPackages[
																	index
																]
																	? "Thu gọn"
																	: "Mở rộng"
															}
														>
															<ChevronDown
																className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
																	expandedPackages[
																		index
																	]
																		? "rotate-180"
																		: ""
																}`}
																strokeWidth={2}
															/>
														</button>
													</div>
													<p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
														{t(
															`packages.${pkg.key}.description`
														)}
													</p>
												</div>

												<div
													className={`space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-10 ${
														expandedPackages[index]
															? "block"
															: "hidden sm:block"
													}`}
												>
													<div className="h-px w-full bg-border/50 mb-3 sm:mb-4"></div>
													<div className="space-y-2 sm:space-y-3">
														{features.map(
															(
																feature,
																fIndex
															) => (
																<div
																	key={fIndex}
																	className="flex items-start gap-2 sm:gap-3"
																>
																	<div className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-cyan-500/10 flex items-center justify-center shrink-0">
																		<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-cyan-500" />
																	</div>
																	<span className="text-xs sm:text-sm text-foreground/80 leading-relaxed">
																		{
																			feature
																		}
																	</span>
																</div>
															)
														)}
													</div>
												</div>

												<div className="mt-auto pt-2 sm:pt-4">
													<Button
														variant="default"
														className="w-full bg-foreground text-background hover:opacity-90 h-9 sm:h-10 md:h-11 shadow-lg group-hover:shadow-xl transition-all duration-200 text-xs sm:text-sm"
														onClick={() =>
															navigate(
																isAuthenticated
																	? "/home"
																	: "/login"
															)
														}
													>
														{t(
															`packages.${pkg.key}.cta`
														)}
													</Button>
												</div>
											</div>
										</div>
									) : (
										<div className="bg-card border border-border rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col h-full hover:shadow-lg transition-all duration-200">
											<div className="mb-4 sm:mb-5 md:mb-6">
												<div className="flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3">
													<div className="w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16 rounded-xl sm:rounded-2xl flex items-center justify-center shrink-0 border border-border bg-muted group-hover:bg-muted/80 transition-colors">
														<Icon
															className="w-6 h-6 sm:w-7 sm:h-7 md:w-8 md:h-8 text-foreground"
															strokeWidth={2}
														/>
													</div>
													<h3 className="text-lg sm:text-xl md:text-2xl font-bold flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-2 flex-1 text-foreground">
														<span>
															{t(
																`packages.${pkg.key}.title`
															)}
														</span>
														<span className="text-xs sm:text-sm font-normal text-muted-foreground">
															{t(
																`packages.${pkg.key}.subtitle`
															)}
														</span>
													</h3>
													<button
														onClick={() => {
															setExpandedPackages(
																(prev) => ({
																	...prev,
																	[index]:
																		!prev[
																			index
																		],
																})
															);
														}}
														className="sm:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-200 shrink-0"
														aria-label={
															expandedPackages[
																index
															]
																? "Thu gọn"
																: "Mở rộng"
														}
													>
														<ChevronDown
															className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
																expandedPackages[
																	index
																]
																	? "rotate-180"
																	: ""
															}`}
															strokeWidth={2}
														/>
													</button>
												</div>
												<p className="text-muted-foreground leading-relaxed text-xs sm:text-sm">
													{t(
														`packages.${pkg.key}.description`
													)}
												</p>
											</div>

											<div
												className={`space-y-3 sm:space-y-4 mb-6 sm:mb-8 md:mb-10 ${
													expandedPackages[index]
														? "block"
														: "hidden sm:block"
												}`}
											>
												<div className="h-px w-full bg-border/50 mb-3 sm:mb-4"></div>
												<div className="space-y-2 sm:space-y-3">
													{features.map(
														(feature, fIndex) => (
															<div
																key={fIndex}
																className="flex items-start gap-2 sm:gap-3"
															>
																<div className="mt-0.5 sm:mt-1 w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-muted flex items-center justify-center shrink-0">
																	<div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-muted-foreground" />
																</div>
																<span className="text-xs sm:text-sm text-muted-foreground leading-relaxed">
																	{feature}
																</span>
															</div>
														)
													)}
												</div>
											</div>

											<div className="mt-auto pt-2 sm:pt-4">
												<Button
													variant="outline"
													className="w-full h-9 sm:h-10 md:h-11 text-xs sm:text-sm hover:bg-muted transition-colors"
													onClick={() =>
														navigate(
															isAuthenticated
																? "/home"
																: "/login"
														)
													}
												>
													{t(
														`packages.${pkg.key}.cta`
													)}
												</Button>
											</div>
										</div>
									)}
								</div>
							);
						})}
					</div>
				</div>
			</div>
		</div>
	);
};

export default PricingPage;
