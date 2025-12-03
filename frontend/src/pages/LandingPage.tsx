import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
	Clapperboard,
	FileText,
	Sparkles,
	Share2,
	Plus,
	Play,
	Cpu,
	Bot,
	Languages,
	Mic,
	View,
	Layers,
	Volume2,
	VolumeX,
	RotateCcw,
	ChevronDown,
} from "lucide-react";
import Button from "@/components/ui/Button";
import VideoPlayer from "@/components/ui/VideoPlayer";
import Tooltip from "@/components/ui/Tooltip";
import Assets from "@/configs/AssetsConfig";
import {useLanguage} from "@/hooks/useLanguage";
import {usePlaybackStore} from "@/hooks/usePlaybackStore";
import {useAuth} from "@/hooks/useAuth";
import CrescentBackground from "@/components/common/CrescentBackground";

const platforms = [
	{
		name: "YouTube",
		icon: Assets.YoutubeIcon,
	},
	{
		name: "Vimeo",
		icon: Assets.VimeoIcon,
	},
	{
		name: "Instagram",
		icon: Assets.InstagramIcon,
	},
	{
		name: "TikTok",
		icon: Assets.TiktokIcon,
	},
	{
		name: "Youku",
		icon: Assets.YoukuIcon,
	},
	{
		name: "Douyin",
		icon: Assets.DouyinIcon,
	},
	{
		name: "Facebook",
		icon: Assets.FacebookIcon,
	},
	{
		name: "X",
		icon: Assets.XIcon,
	},
	{
		name: "Bilibili",
		icon: Assets.BilibiliIcon,
	},
];

const categories = [
	{
		key: "animeMovie",
		poster: Assets.AnimeMoviePoster,
		titleKey: "platforms.animeMovieTitle",
		descriptionKey: "platforms.animeMovieDescription",
	},
	{
		key: "animeSeries",
		poster: Assets.AnimeSeriesPoster,
		titleKey: "platforms.animeSeriesTitle",
		descriptionKey: "platforms.animeSeriesDescription",
	},
	{
		key: "movie",
		poster: Assets.MoviePoster,
		titleKey: "platforms.movieTitle",
		descriptionKey: "platforms.movieDescription",
	},
];

const demoVideoDetail = {
	title: "Ratatouille",
	platform: "Pixar • Feature film",
	cost: "$1.28",
	context: "34k tokens",
	captions: "VI / EN",
	exports: "16:9 + 9:16",
	thumbnail: Assets.LandingPagePoster,
	videoSrc: Assets.DemoVideo,
};

const navSections = [
	{label: "Workflow", id: "workflow", Icon: Sparkles},
	{label: "Models", id: "models", Icon: Layers},
	{label: "Voice", id: "voice", Icon: Mic},
	{label: "Quality", id: "quality", Icon: View},
];

const servicePackages = [
	{key: "scriptGeneration", Icon: FileText, Peak: false},
	{key: "scriptVoice", Icon: Mic, Peak: false},
	{key: "fullService", Icon: Sparkles, Peak: true},
];

const LandingPage = () => {
	const navigate = useNavigate();
	const {t, getNested} = useLanguage();
	const {isAuthenticated} = useAuth();
	const [showNav, setShowNav] = useState(false);
	const [demoOverlay, setDemoOverlay] = useState(false);
	const [demoShrink, setDemoShrink] = useState(false);
	const [audioOn, setAudioOn] = useState(false);
	const [showVolumeSlider, setShowVolumeSlider] = useState(false);
	const [ctaAnimationStep, setCtaAnimationStep] = useState(0);
	const [featuresAnimated, setFeaturesAnimated] = useState(false);
	const [packagesAnimated, setPackagesAnimated] = useState(false);
	const [expandedPackages, setExpandedPackages] = useState<{
		[key: number]: boolean;
	}>({});
	const [hoveredCategory, setHoveredCategory] = useState<number | null>(null);
	const [buttonHovered, setButtonHovered] = useState(false);
	const hasAnimatedRef = useRef(false);
	const demoRef = useRef<HTMLDivElement>(null);
	const demoVideoRef = useRef<HTMLVideoElement | null>(null);
	const ctaSectionRef = useRef<HTMLElement>(null);
	const featuresSectionRef = useRef<HTMLElement>(null);
	const packagesSectionRef = useRef<HTMLElement>(null);
	const prevDemoShrinkRef = useRef(false);
	const prevShowNavRef = useRef(false);
	const featuresAnimatingRef = useRef(false);
	const packagesAnimatingRef = useRef(false);
	const {
		play,
		pause,
		setDuration,
		setCurrentTime,
		seek,
		unmute,
		mute,
		volume,
		setVolume,
	} = usePlaybackStore();

	useEffect(() => {
		let rafId: number | null = null;
		let ticking = false;

		const handleScroll = () => {
			if (!ticking) {
				rafId = requestAnimationFrame(() => {
					const scrolled = window.pageYOffset;

					const background = document.querySelector(
						".parallax-bg"
					) as HTMLElement;
					if (background) {
						background.style.transform = `translateY(${
							scrolled * 0.8
						}px)`;
					}

					if (demoRef.current) {
						const rect = demoRef.current.getBoundingClientRect();
						const inView =
							rect.top < window.innerHeight && rect.bottom > 0;

						if (inView) {
							play();
						} else {
							pause();
						}

						const shrinkTrigger = rect.top < 300;
						const shouldShrink = shrinkTrigger;

						if (shouldShrink !== prevDemoShrinkRef.current) {
							prevDemoShrinkRef.current = shouldShrink;
							setDemoShrink(shouldShrink);
						}
					}

					const target = document.getElementById("engine-anchor");
					const threshold = target
						? target.offsetTop - window.innerHeight * 0.2
						: 300;

					let shouldShowNav = window.scrollY >= threshold;

					if (ctaSectionRef.current) {
						const ctaTop = ctaSectionRef.current.offsetTop;
						if (
							window.scrollY + window.innerHeight * 0.5 >=
							ctaTop
						) {
							shouldShowNav = false;
						}
					}

					if (shouldShowNav !== prevShowNavRef.current) {
						prevShowNavRef.current = shouldShowNav;
						setShowNav(shouldShowNav);
					}

					ticking = false;
				});
				ticking = true;
			}
		};

		handleScroll();

		window.addEventListener("scroll", handleScroll, {passive: true});
		return () => {
			window.removeEventListener("scroll", handleScroll);
			if (rafId !== null) {
				cancelAnimationFrame(rafId);
			}
		};
	}, [play, pause]);

	const handleTimeUpdate = (
		e: React.SyntheticEvent<HTMLVideoElement, Event>
	) => {
		const target = e.target as HTMLVideoElement;
		const {currentTime, duration} = target;
		setCurrentTime(currentTime);
		if (duration) {
			setDuration(duration);
			setDemoOverlay(duration - currentTime <= 5);
		}
	};

	useEffect(() => {
		if (!ctaSectionRef.current) return;

		if (showNav) {
			hasAnimatedRef.current = false;
			setTimeout(() => {
				setCtaAnimationStep(0);
			}, 0);
			return;
		}

		const observer = new IntersectionObserver(
			([entry]) => {
				if (
					entry.isIntersecting &&
					!hasAnimatedRef.current &&
					!showNav
				) {
					hasAnimatedRef.current = true;
					setCtaAnimationStep(0);

					setTimeout(() => {
						if (!showNav) setCtaAnimationStep(1);
					}, 0);
					setTimeout(() => {
						if (!showNav) setCtaAnimationStep(2);
					}, 250);
					setTimeout(() => {
						if (!showNav) setCtaAnimationStep(3);
					}, 500);
					observer.disconnect();
				}
			},
			{threshold: 0.5, rootMargin: "0px"}
		);

		observer.observe(ctaSectionRef.current);
		return () => observer.disconnect();
	}, [showNav]);

	useEffect(() => {
		if (!featuresSectionRef.current) return;

		const isMobile = window.innerWidth < 768;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					if (!featuresAnimatingRef.current) {
						featuresAnimatingRef.current = true;
						setFeaturesAnimated(true);
						setTimeout(() => {
							featuresAnimatingRef.current = false;
						}, 900);
					}
				} else {
					if (!featuresAnimatingRef.current && !isMobile) {
						setFeaturesAnimated(false);
					}
				}
			},
			{
				threshold: isMobile ? 0.1 : 0.5,
				rootMargin: isMobile ? "0px" : "-100px",
			}
		);

		observer.observe(featuresSectionRef.current);
		return () => observer.disconnect();
	}, []);

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
			{threshold: 0.3, rootMargin: "-100px"}
		);

		observer.observe(packagesSectionRef.current);
		return () => observer.disconnect();
	}, []);

	const handleNavClick = (id: string) => {
		const el = document.getElementById(id);
		if (el) {
			const y = el.getBoundingClientRect().top + window.scrollY - 120;
			window.scrollTo({top: y, behavior: "smooth"});
		}
	};

	return (
		<div className='min-h-screen bg-background relative overflow-hidden'>
			<div className='parallax-bg absolute inset-0 pointer-events-none z-0'></div>

			<div
				className={`z-50 fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 nav-menu-1400-only ${
					showNav ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				{navSections.map(({label, id, Icon}) => (
					<button
						key={id}
						onClick={() => handleNavClick(id)}
						className='group flex items-center gap-3 rounded-full border border-border bg-card/90 px-3 py-2 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200'
					>
						<span className='w-9 h-9 rounded-full bg-foreground text-background flex items-center justify-center shadow'>
							<Icon className='w-4 h-4' />
						</span>
						<span className='text-sm font-semibold text-foreground pr-2'>
							{label}
						</span>
					</button>
				))}
			</div>

			<section className='relative z-100 w-full min-h-[85vh] flex items-center justify-center px-4 sm:px-6 pt-12 sm:pt-16 pb-8 sm:pb-12 overflow-visible'>
				<div
					className='absolute bottom-0 left-0 right-0 w-full pointer-events-none'
					style={{zIndex: 5, height: "400px"}}
				>
					<CrescentBackground intenseShadow={buttonHovered} />
				</div>

				<div className='relative max-w-7xl mx-auto w-full z-10'>
					<div className='flex flex-col items-center'>
						<div className='space-y-4 sm:space-y-5 text-center'>
							<h1 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl font-bold text-foreground leading-tight animate-fade-in'>
								{t("hero.title")}
								{t("hero.titlePlatform") && (
									<>
										{" "}
										<span className='text-muted-foreground text-2xl sm:text-3xl md:text-4xl lg:text-5xl xl:text-6xl'>
											{t("hero.titlePlatform")}
										</span>
									</>
								)}
							</h1>

							<div className='space-y-2 sm:space-y-2 mb-6 sm:mb-8 text-sm sm:text-base md:text-lg text-muted-foreground animate-fade-in-delay'>
								<p>{t("hero.subtitle")}</p>
								<p>{t("hero.subtitle2")}</p>
							</div>

							<div className='flex justify-center animate-fade-in-delay'>
								<Button
									variant='default'
									size='lg'
									className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background w-full sm:w-auto px-6 sm:px-8 h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-lg hover:shadow-xl transition-all duration-200'
									onMouseEnter={() => setButtonHovered(true)}
									onMouseLeave={() => setButtonHovered(false)}
									onClick={() =>
										navigate(
											isAuthenticated ? "/home" : "/login"
										)
									}
								>
									{isAuthenticated
										? t("nav.goHome")
										: "Bắt đầu miễn phí"}
								</Button>
							</div>
						</div>
					</div>
				</div>
			</section>

			<div
				className='relative w-full'
				style={{
					zIndex: 50,
					marginTop: "-80px",
					marginBottom: "2rem",
				}}
			>
				<div className='max-w-[1400px] mx-auto px-6'>
					<p
						className='text-center text-muted-foreground relative'
						style={{zIndex: 50}}
					>
						{t("platforms.trusted")}
					</p>
				</div>
			</div>

			<section className='relative z-0 w-full py-10 overflow-hidden'>
				<div className='relative max-w-[1400px] mx-auto px-6 bg-transparent'>
					<div
						className='absolute inset-0 pointer-events-none z-10 bg-transparent'
						style={{
							background: `linear-gradient(to right, 
								rgb(var(--background)) 0%, 
								rgb(var(--background)) 5%,
								transparent 10%,
								transparent 90%,
								rgb(var(--background)) 95%,
								rgb(var(--background)) 100%)`,
						}}
					/>

					<div className='relative overflow-hidden'>
						<div className='marquee-track flex items-center gap-8 w-max'>
							{[...platforms, ...platforms].map(
								(platform, index) => (
									<div
										key={`${platform.name}-${index}`}
										className='flex items-center gap-3 px-6 min-w-[200px]'
									>
										<div
											className={`w-10 h-10 rounded-lg flex items-center justify-center`}
										>
											<img
												src={platform.icon}
												alt={platform.name}
												className='w-8 h-8 object-contain'
											/>
										</div>
										<span className='text-lg font-semibold text-foreground'>
											{platform.name}
										</span>
									</div>
								)
							)}
						</div>
					</div>
				</div>
			</section>

			<section className='relative z-10 w-full px-6 py-16 mb-32'>
				<div className='max-w-[1200px] mx-auto mb-8'>
					<h2 className='text-center text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4'>
						{t("platforms.categories")}
					</h2>
					<p className='text-center text-muted-foreground max-w-3xl mx-auto leading-relaxed mt-2'>
						{t("platforms.categoriesDescription")}
					</p>
				</div>

				<div className='max-w-[1200px] mx-auto'>
					<div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
						{categories.map((category, index) => {
							const isMiddleCard = index === 1;
							const isLeftHovered = hoveredCategory === 0;
							const isRightHovered = hoveredCategory === 2;

							return (
								<div
									key={category.key}
									onMouseEnter={() =>
										setHoveredCategory(index)
									}
									onMouseLeave={() =>
										setHoveredCategory(null)
									}
									className={`relative overflow-hidden rounded-xl border border-border bg-card shadow-lg transition-transform duration-300 ease-in-out ${
										hoveredCategory === index
											? "scale-110 z-20"
											: hoveredCategory !== null
											? "scale-90"
											: "scale-100"
									} ${
										isMiddleCard && isLeftHovered
											? "translate-x-8"
											: isMiddleCard && isRightHovered
											? "-translate-x-8"
											: ""
									}`}
								>
									<div className='aspect-[2/3] w-full overflow-hidden'>
										<img
											src={category.poster}
											alt={t(category.titleKey)}
											className='w-full h-full object-cover'
										/>
									</div>
									<div
										className={`absolute inset-0 bg-black/60 flex items-center justify-center transition-opacity duration-300 ${
											hoveredCategory === index
												? "opacity-100"
												: "opacity-0"
										}`}
									>
										<Button
											onClick={() => navigate("/home")}
											variant='default'
											className={`bg-muted text-muted-foreground dark:bg-[rgb(249,250,251)] dark:text-[rgb(107,114,128)] hover:bg-white hover:text-black dark:hover:text-black transition-all duration-300 ${
												hoveredCategory === index
													? "opacity-100 translate-y-0"
													: "opacity-0 translate-y-4"
											}`}
										>
											<Play className='w-4 h-4 mr-2' />
											{t("home.createProject")}
										</Button>
									</div>
									<div className='absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/80 to-transparent p-4'>
										<h3 className='text-lg font-semibold text-white mb-2'>
											{t(category.titleKey)}
										</h3>
										<div
											className={`overflow-hidden transition-[max-height] duration-500 ease-in-out ${
												hoveredCategory === index
													? "max-h-[500px]"
													: "max-h-[3rem]"
											}`}
										>
											<p
												className={`text-sm text-white/90 leading-relaxed ${
													hoveredCategory === index
														? "line-clamp-none"
														: "line-clamp-2"
												}`}
											>
												{t(category.descriptionKey)}
											</p>
										</div>
									</div>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<section
				id='features'
				ref={featuresSectionRef}
				className='relative z-11 w-full px-4 sm:px-6 mb-12 sm:mb-16 md:mb-24'
			>
				<div className='max-w-[1200px] mx-auto text-center mb-8 sm:mb-10 md:mb-14'>
					<h2 className='text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground px-2'>
						{t("features.title")}
					</h2>
				</div>
				<div className='max-w-[1200px] mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 md:gap-6'>
					{[
						{key: "movieRecap", Icon: Clapperboard},
						{key: "autoSubs", Icon: FileText},
						{key: "highlightScenes", Icon: Sparkles},
						{key: "multiPlatform", Icon: Share2},
					].map(({key, Icon}, index) => (
						<div
							key={key}
							className={`group cursor-pointer relative border border-border rounded-xl sm:rounded-2xl p-5 sm:p-6 md:p-8 flex flex-col gap-5 sm:gap-6 md:gap-8 bg-card hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${
								featuresAnimated
									? "opacity-100 translate-y-0"
									: "opacity-100 translate-y-0 sm:opacity-0 sm:translate-y-8"
							}`}
							style={{
								transitionDelay: featuresAnimated
									? `${index * 100}ms`
									: "0ms",
								transitionDuration: "600ms",
								transitionTimingFunction:
									"cubic-bezier(0.4, 0, 0.2, 1)",
							}}
						>
							<div className='flex items-start justify-between'>
								<div className='w-12 h-12 md:w-14 md:h-14 border border-border rounded-lg sm:rounded-xl flex items-center justify-center shrink-0'>
									<Icon
										className='w-6 h-6 sm:w-6 md:w-7 md:h-7 text-foreground'
										strokeWidth={2}
									/>
								</div>
								<Plus
									className='w-5 h-5 sm:w-5 md:w-6 md:h-6 text-foreground transition-all duration-200 group-hover:rotate-90 group-hover:opacity-20 shrink-0'
									strokeWidth={2}
								/>
							</div>
							<div className='space-y-2 sm:space-y-3 md:space-y-3 min-w-0'>
								<h3 className='text-lg sm:text-xl font-semibold text-foreground text-left leading-tight break-words'>
									{t(`features.${key}.title`)}
								</h3>
								<p className='text-xs sm:text-sm text-muted-foreground text-left leading-relaxed break-words overflow-wrap-anywhere'>
									{t(`features.${key}.description`)}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<div
				ref={demoRef}
				className='max-w-[1200px] mx-auto min-h-[400px] px-4 sm:px-6 mt-16 sm:mt-24 md:mt-[200px] mb-16 sm:mb-24 md:mb-[250px]'
			>
				<div className='relative flex flex-col lg:block'>
					<div
						className='video-container-smooth w-full lg:w-auto'
						style={{
							width: demoShrink
								? window.innerWidth >= 1024
									? "75%"
									: "100%"
								: "100%",
							maxWidth: demoShrink ? "none" : "1400px",
							marginLeft: demoShrink
								? window.innerWidth >= 1024
									? "0"
									: "auto"
								: "auto",
							marginRight: demoShrink
								? window.innerWidth >= 1024
									? "0"
									: "auto"
								: "auto",
							paddingRight: demoShrink
								? window.innerWidth >= 1024
									? "1.5rem"
									: "0"
								: "0",
							transition:
								"width 650ms cubic-bezier(0.4, 0, 0.2, 1), max-width 650ms cubic-bezier(0.4, 0, 0.2, 1), padding-right 650ms cubic-bezier(0.4, 0, 0.2, 1), margin-left 650ms cubic-bezier(0.4, 0, 0.2, 1), margin-right 650ms cubic-bezier(0.4, 0, 0.2, 1)",
							willChange: "width, max-width",
							contain: "layout style",
						}}
					>
						<div className='relative rounded-xl sm:rounded-2xl lg:rounded-3xl overflow-hidden shadow-xl border border-border bg-foreground aspect-[16/9]'>
							<VideoPlayer
								src={demoVideoDetail.videoSrc}
								poster={demoVideoDetail.thumbnail}
								className='w-full h-full object-cover'
								autoPlay={true}
								trackMuted={!audioOn}
								videoRef={demoVideoRef}
								onTimeUpdate={handleTimeUpdate}
							/>
							<div
								className={`absolute inset-0 flex items-center justify-center bg-black/80 dark:bg-black/90 text-white transition-opacity duration-500 ${
									demoOverlay
										? "opacity-100"
										: "opacity-0 pointer-events-none"
								}`}
							>
								<div className='text-center space-y-3 sm:space-y-4 px-4'>
									<p className='text-base sm:text-lg font-semibold text-white'>
										{t("demo.watchFull")}
									</p>
									<Button className='bg-white text-black hover:bg-gray-100 dark:bg-white dark:text-black dark:hover:bg-gray-200 px-4 sm:px-6 text-sm sm:text-base'>
										{t("demo.goToFullVideo")}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div
						className='video-panel-smooth relative lg:absolute lg:right-0 lg:top-0 mt-6 lg:mt-0 w-full lg:w-auto'
						style={{
							width: demoShrink
								? window.innerWidth >= 1024
									? "25%"
									: "100%"
								: window.innerWidth >= 1024
								? "0%"
								: "100%",
							paddingLeft: demoShrink
								? window.innerWidth >= 1024
									? "1.5rem"
									: "0"
								: "0",
							opacity: demoShrink
								? 1
								: window.innerWidth >= 1024
								? 0
								: 1,
							transform: demoShrink
								? "translateX(0)"
								: window.innerWidth >= 1024
								? "translateX(24px)"
								: "translateX(0)",
							pointerEvents: demoShrink
								? "auto"
								: window.innerWidth >= 1024
								? "none"
								: "auto",
							overflow: demoShrink
								? "visible"
								: window.innerWidth >= 1024
								? "hidden"
								: "visible",
							transition:
								window.innerWidth >= 1024
									? demoShrink
										? "transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 150ms, width 650ms cubic-bezier(0.4, 0, 0.2, 1), padding-left 650ms cubic-bezier(0.4, 0, 0.2, 1)"
										: "transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), width 650ms cubic-bezier(0.4, 0, 0.2, 1), padding-left 650ms cubic-bezier(0.4, 0, 0.2, 1)"
									: "none",
							willChange: "transform, opacity, width",
							contain: "layout style",
						}}
					>
						<div className='flex items-center gap-4 mb-4'>
							<img
								src={demoVideoDetail.thumbnail}
								alt={demoVideoDetail.title}
								className='w-20 h-28 rounded-xl object-cover shadow'
							/>
							<div>
								<p className='text-xs uppercase tracking-wide text-muted-foreground'>
									{demoVideoDetail.platform}
								</p>
								<h3 className='text-2xl font-bold text-foreground'>
									{demoVideoDetail.title}
								</h3>
								<p className='text-sm text-muted-foreground'>
									{t("demo.recapRuntime")} 03:45
								</p>
							</div>
						</div>
						<div className='grid grid-cols-2 gap-4 max-h-[520px] overflow-y-auto pr-1'>
							<div className='rounded-xl border border-border bg-card px-4 py-3'>
								<p className='text-xs uppercase text-muted-foreground'>
									{t("demo.cost")}
								</p>
								<p className='text-lg font-semibold text-foreground'>
									{demoVideoDetail.cost}
								</p>
								<p className='text-xs text-muted-foreground'>
									{t("demo.roughTotal")}
								</p>
							</div>
							<div className='rounded-xl border border-border bg-card px-4 py-3'>
								<p className='text-xs uppercase text-muted-foreground'>
									{t("demo.context")}
								</p>
								<p className='text-lg font-semibold text-foreground'>
									{demoVideoDetail.context}
								</p>
								<p className='text-xs text-muted-foreground'>
									{t("demo.scriptScene")}
								</p>
							</div>
							<div className='rounded-xl border border-border bg-card px-4 py-3'>
								<p className='text-xs uppercase text-muted-foreground'>
									{t("demo.captions")}
								</p>
								<p className='text-lg font-semibold text-foreground'>
									{demoVideoDetail.captions}
								</p>
								<p className='text-xs text-muted-foreground'>
									{t("demo.autoAligned")}
								</p>
							</div>
							<div className='rounded-xl border border-border bg-card px-4 py-3'>
								<p className='text-xs uppercase text-muted-foreground'>
									{t("demo.exports")}
								</p>
								<p className='text-lg font-semibold text-foreground'>
									{demoVideoDetail.exports}
								</p>
								<p className='text-xs text-muted-foreground'>
									{t("demo.masterReels")}
								</p>
							</div>
						</div>

						<div className='mt-6 flex flex-wrap gap-3'>
							<div
								className='relative'
								onMouseEnter={() => setShowVolumeSlider(true)}
								onMouseLeave={() => setShowVolumeSlider(false)}
							>
								<div className='flex items-center border border-border bg-card rounded-full transition-colors duration-200'>
									<Button
										variant='outline'
										size='icon'
										className='border-none bg-card text-foreground hover:bg-muted rounded-full w-10 h-10 shrink-0 shadow-none'
										onClick={() => {
											const next = !audioOn;
											setAudioOn(next);
											if (next) {
												unmute?.();
											} else {
												mute?.();
											}
										}}
									>
										{audioOn ? (
											<Volume2 className='w-4 h-4' />
										) : (
											<VolumeX className='w-4 h-4' />
										)}
									</Button>

									<div
										className={`flex items-center h-10 overflow-hidden transition-[width,opacity] duration-250 ease-out ${
											showVolumeSlider
												? "w-24 opacity-100"
												: "w-0 opacity-0"
										}`}
									>
										<input
											type='range'
											min='0'
											max='100'
											value={volume * 100}
											onChange={(e) => {
												const val =
													parseInt(e.target.value) /
													100;
												setVolume(val);
												if (val > 0 && !audioOn) {
													setAudioOn(true);
													unmute?.();
												} else if (
													val === 0 &&
													audioOn
												) {
													setAudioOn(false);
													mute?.();
												}
											}}
											className='mx-[10px] w-full h-1 my-0 bg-secondary rounded-lg appearance-none cursor-pointer align-middle [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-primary [&::-webkit-slider-thumb]:cursor-pointer [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-background [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-primary [&::-moz-range-thumb]:border-2 [&::-moz-range-thumb]:border-background [&::-moz-range-thumb]:cursor-pointer'
											onMouseEnter={() =>
												setShowVolumeSlider(true)
											}
											onMouseLeave={() =>
												setShowVolumeSlider(false)
											}
										/>
									</div>
								</div>
							</div>

							<Tooltip
								content={t("demo.replay")}
								placement='right'
								delay={[100, 0]}
								offset={[8, 0]}
								plain
							>
								<Button
									variant='default'
									size='icon'
									className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background rounded-full w-10 h-10 shrink-0'
									onClick={() => {
										setCurrentTime(0);
										seek?.(0);
										play();
										if (demoVideoRef.current) {
											demoVideoRef.current.currentTime = 0;
											demoVideoRef.current
												.play()
												.catch(() => {});
										}
									}}
								>
									<RotateCcw className='w-4 h-4' />
								</Button>
							</Tooltip>
						</div>
					</div>
				</div>
			</div>

			<section
				ref={packagesSectionRef}
				className='relative z-10 w-full px-4 sm:px-6 py-12 sm:py-16 md:py-24 mb-12 sm:mb-16 md:mb-20'
			>
				<div className='max-w-[1200px] mx-auto'>
					<div className='text-center mb-8 sm:mb-12 md:mb-16 px-2'>
						<h2
							className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-foreground mb-3 sm:mb-4 ${
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

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 lg:gap-4'>
						{servicePackages.map((pkg, index) => {
							const Icon = pkg.Icon;
							const isPopular = pkg.Peak;
							const featuresRaw = getNested?.(
								`packages.${pkg.key}.features`
							);
							const features = Array.isArray(featuresRaw)
								? (featuresRaw as string[])
								: [];
							return (
								<div
									key={index}
									className={`group relative rounded-xl sm:rounded-2xl lg:rounded-3xl p-5 sm:p-6 md:p-8 flex flex-col overflow-visible ${
										isPopular
											? "lg:-mt-4 border-2 border-foreground bg-card shadow-xl hover:shadow-2xl"
											: "border border-border bg-card hover:shadow-lg"
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
										boxShadow: isPopular
											? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 40px -10px rgba(0, 0, 0, 0.15)"
											: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
									}}
									onMouseEnter={(e) => {
										e.currentTarget.style.transition =
											"box-shadow 100ms ease-out";
										if (isPopular) {
											e.currentTarget.style.boxShadow =
												"0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 60px -15px rgba(0, 0, 0, 0.2)";
										} else {
											e.currentTarget.style.boxShadow =
												"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 30px -10px rgba(0, 0, 0, 0.1)";
										}
									}}
									onMouseLeave={(e) => {
										e.currentTarget.style.transition =
											"box-shadow 100ms ease-out";
										if (isPopular) {
											e.currentTarget.style.boxShadow =
												"0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 40px -10px rgba(0, 0, 0, 0.15)";
										} else {
											e.currentTarget.style.boxShadow =
												"0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)";
										}
									}}
								>
									{isPopular && (
										<div className='absolute -top-3 sm:-top-4 left-1/2 -translate-x-1/2'>
											<span className='inline-flex items-center gap-1 text-[10px] sm:text-xs font-semibold text-background bg-foreground px-3 sm:px-4 py-1 sm:py-1.5 rounded-full shadow-lg'>
												<Sparkles className='w-2.5 h-2.5 sm:w-3 sm:h-3' />
												{t("packages.popular")}
											</span>
										</div>
									)}

									<div className='mb-4 sm:mb-5 md:mb-6'>
										<div className='flex items-center gap-3 sm:gap-4 mb-2 sm:mb-3'>
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
												<span className='text-xs sm:text-sm font-normal text-muted-foreground'>
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
																!prev[index],
														})
													);
												}}
												className='sm:hidden flex items-center justify-center w-8 h-8 rounded-lg hover:bg-muted transition-colors duration-200 shrink-0'
												aria-label={
													expandedPackages[index]
														? "Thu gọn"
														: "Mở rộng"
												}
											>
												<ChevronDown
													className={`w-5 h-5 text-muted-foreground transition-transform duration-200 ${
														expandedPackages[index]
															? "rotate-180"
															: ""
													}`}
													strokeWidth={2}
												/>
											</button>
										</div>
										<p className='text-muted-foreground leading-relaxed text-xs sm:text-sm'>
											{t(
												`packages.${pkg.key}.description`
											)}
										</p>
									</div>

									<div
										className={`flex-grow mb-4 sm:mb-5 md:mb-6 overflow-hidden transition-all duration-300 ${
											expandedPackages[index]
												? "max-h-[1000px] opacity-100"
												: "max-h-0 opacity-0 sm:max-h-[1000px] sm:opacity-100"
										}`}
									>
										<ul className='space-y-2 sm:space-y-2.5 md:space-y-3'>
											{(Array.isArray(features)
												? features
												: []
											).map(
												(
													feature: string,
													idx: number
												) => (
													<li
														key={idx}
														className='flex items-start gap-2 sm:gap-3 text-xs sm:text-sm text-foreground'
													>
														<div
															className={`w-1.5 h-1.5 sm:w-2 sm:h-2 mt-1.5 sm:mt-2 rounded-full shrink-0 ${
																isPopular
																	? "bg-foreground"
																	: "bg-muted-foreground"
															}`}
														></div>
														<span className='leading-relaxed'>
															{feature}
														</span>
													</li>
												)
											)}
										</ul>
									</div>

									<Button
										variant='default'
										className={`w-full mt-auto transition-all duration-200 ${
											isPopular
												? "bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background h-11 sm:h-12 text-sm sm:text-base font-semibold shadow-md hover:shadow-lg"
												: "bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background h-10 sm:h-11 text-sm sm:text-base"
										}`}
										onClick={() => navigate("/register")}
									>
										{t("packages.choose")}
									</Button>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			<div className='space-y-20 mb-32'>
				<h2
					id='engine-anchor'
					className='text-4xl md:text-5xl font-bold text-foreground text-center'
				>
					{t("engine.title")}
				</h2>
				<section
					id='workflow'
					className='relative z-10 w-full px-6 py-20 scroll-mt-32'
				>
					<div className='max-w-[1200px] mx-auto'>
						<div className='grid md:grid-cols-2 gap-10 items-center'>
							<div className='relative flex justify-center'>
								<div className='absolute inset-0 bg-muted rounded-3xl blur-2xl scale-105'></div>
								<div className='relative w-full max-w-xl bg-card border border-border rounded-3xl shadow-xl overflow-hidden'>
									<div className='flex items-center justify-between px-5 py-4 border-b border-border bg-muted'>
										<div>
											<p className='text-xs uppercase tracking-wide text-muted-foreground'>
												{t("workflow.workspace")}
											</p>
											<p className='text-sm font-semibold text-foreground'>
												{t("workflow.cinemaAnime")}
											</p>
										</div>
										<span className='text-xs text-muted-foreground'>
											{t("workflow.autoSaved")}
										</span>
									</div>

									<div className='grid grid-cols-2 text-sm font-medium text-muted-foreground border-b border-border'>
										<div className='px-5 py-3 bg-card'>
											{t("workflow.clips")} 8
										</div>
										<div className='px-5 py-3 bg-muted text-right text-muted-foreground'>
											{t("workflow.drafts")} 1
										</div>
									</div>

									<div className='p-5 space-y-4 bg-gradient-to-b from-card via-muted to-card'>
										{[
											{
												title: "Episode 5: Final battle reveal",
												meta: "12:08 - kept automatically",
											},
											{
												title: "Season arc recap: Romance subplot",
												meta: "04:31 - captioned for TikTok",
											},
											{
												title: "Movie trailer beats: Opening hook",
												meta: "00:42 - auto-trimmed",
											},
											{
												title: "Anime OP highlight: S2 remix",
												meta: "02:10 - captioned for reels",
											},
											{
												title: "Behind the scenes: Director notes",
												meta: "15:04 - translated EN/KR",
											},
										].map((item, idx) => (
											<div
												key={idx}
												className='flex items-start gap-3 rounded-2xl border border-border bg-card px-4 py-3 shadow-sm'
											>
												<div className='w-10 h-10 rounded-xl bg-foreground flex items-center justify-center text-background font-semibold text-xs'>
													{idx + 1}
												</div>
												<div className='flex-1'>
													<p className='text-sm font-semibold text-foreground'>
														{item.title}
													</p>
													<p className='text-xs text-muted-foreground'>
														{item.meta}
													</p>
												</div>
												<div className='text-xs text-muted-foreground border border-border px-2 py-1 rounded-lg'>
													{t("workflow.export")}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className='space-y-6 h-full flex flex-col justify-center md:justify-start'>
								<div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
									<Sparkles className='w-4 h-4' />
									<span>{t("workflow.label")}</span>
								</div>
								<h3 className='text-4xl font-bold text-foreground leading-tight'>
									{t("workflow.title")}
								</h3>
								<p className='text-base text-muted-foreground leading-relaxed'>
									{t("workflow.description")}
								</p>
								<Button
									variant='default'
									className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background w-full sm:w-auto px-7 h-12 text-lg'
									onClick={() => navigate("/register")}
								>
									{t("workflow.cta")}
								</Button>
								<ul className='space-y-3 text-foreground'>
									{(Array.isArray(
										getNested?.("workflow.features")
									)
										? (getNested(
												"workflow.features"
										  ) as string[])
										: []
									).map((feature: string, idx: number) => (
										<li
											key={idx}
											className='flex items-start gap-3'
										>
											<div className='w-2.5 h-2.5 mt-2 bg-foreground rounded-full'></div>
											<span>{feature}</span>
										</li>
									))}
								</ul>
							</div>
						</div>
					</div>
				</section>

				<section
					id='models'
					className='relative z-10 w-full px-6 py-20 scroll-mt-32'
				>
					<div className='max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10 items-center'>
						<div className='space-y-5'>
							<div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
								<Layers className='w-4 h-4' />
								<span>{t("models.label")}</span>
							</div>
							<h3 className='text-4xl font-bold text-foreground leading-tight'>
								{t("models.title")}
							</h3>
							<p className='text-base text-muted-foreground leading-relaxed'>
								{t("models.description")}
							</p>
							<Button
								variant='default'
								className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background w-full sm:w-auto px-7 h-12 text-lg'
								onClick={() => navigate("/register")}
							>
								{t("models.cta")}
							</Button>
							<ul className='space-y-3 text-foreground'>
								{(Array.isArray(getNested?.("models.features"))
									? (getNested("models.features") as string[])
									: []
								).map((feature: string, idx: number) => (
									<li
										key={idx}
										className='flex items-start gap-3'
									>
										<div className='w-2.5 h-2.5 mt-2 bg-foreground rounded-full'></div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
						<div className='relative'>
							<div className='absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-50 rounded-[32px]'></div>
							<div className='relative rounded-[32px] p-8 space-y-4'>
								<div className='inline-flex items-center gap-2 text-xs font-semibold text-purple-700 dark:text-purple-400 bg-card/60 px-3 py-1 rounded-full shadow-sm'>
									<Cpu className='w-4 h-4' />
									<span>{t("models.stack")}</span>
								</div>

								<div className='space-y-4 bg-card rounded-2xl p-4 shadow'>
									<p className='text-xs font-semibold text-purple-800 dark:text-purple-300'>
										{t("models.editTimeline")}
									</p>
									<div className='flex h-3 w-full overflow-hidden rounded-full bg-muted'>
										<div className='bg-purple-500 dark:bg-purple-400 w-2/5'></div>
										<div className='bg-blue-400 dark:bg-blue-300 w-1/5'></div>
										<div className='bg-amber-400 dark:bg-amber-300 w-1/6'></div>
										<div className='bg-muted-foreground/30 flex-1'></div>
									</div>
									<div className='space-y-2 text-sm text-foreground'>
										<div className='flex items-center gap-3'>
											<span className='text-xs px-2 py-1 rounded-lg bg-purple-50 text-purple-800 border border-purple-100'>
												00:00
											</span>
											<span className='font-semibold'>
												Intro trimmed to 12s
											</span>
										</div>
										<div className='flex items-center gap-3'>
											<span className='text-xs px-2 py-1 rounded-lg bg-blue-50 text-blue-800 border border-blue-100'>
												02:10
											</span>
											<span className='font-semibold'>
												OP highlight locked in
											</span>
										</div>
										<div className='flex items-center gap-3'>
											<span className='text-xs px-2 py-1 rounded-lg bg-amber-50 text-amber-800 border border-amber-100'>
												15:04
											</span>
											<span className='font-semibold'>
												Director notes clipped
											</span>
										</div>
										<p className='text-xs text-muted-foreground mt-2'>
											{t("models.appliedDirectly")}
										</p>
									</div>
								</div>

								<div className='bg-card rounded-2xl p-4 shadow flex items-center justify-between'>
									<div>
										<p className='text-xs uppercase text-muted-foreground'>
											{t("models.llm")}
										</p>
										<p className='text-sm font-semibold text-foreground'>
											{t("models.plotAware")}
										</p>
									</div>
									<Bot className='w-5 h-5 text-foreground' />
								</div>

								<div className='bg-card rounded-2xl p-4 shadow flex items-center justify-between'>
									<div>
										<p className='text-xs uppercase text-muted-foreground'>
											{t("models.asr")}
										</p>
										<p className='text-sm font-semibold text-foreground'>
											{t("models.dualSubs")}
										</p>
									</div>
									<Cpu className='w-5 h-5 text-foreground' />
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					id='voice'
					className='relative z-10 w-full px-6 py-20 scroll-mt-32'
				>
					<div className='max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10 items-start md:items-stretch'>
						<div className='relative h-full'>
							<div className='absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 dark:from-purple-900/20 dark:via-blue-900/20 dark:to-indigo-900/20 rounded-[32px] blur-2xl'></div>
							<div className='relative bg-card rounded-[28px] border border-border shadow-xl p-7 space-y-5 h-full flex flex-col'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 text-sm font-semibold text-foreground'>
										<Languages className='w-4 h-4' />
										<span>{t("voice.voiceTrack")}</span>
									</div>
									<span className='text-xs text-muted-foreground'>
										{t("voice.autoSynced")}
									</span>
								</div>
								<div className='space-y-3'>
									{[
										{
											lang: "JP",
											voice: "Tokyo Calm",
											note: "Soft narration for recap",
										},
										{
											lang: "EN",
											voice: "Studio Warm",
											note: "Trailer-ready, deep tone",
										},
										{
											lang: "VI",
											voice: "Saigon Bright",
											note: "Conversational, upbeat",
										},
									].map((v, idx) => (
										<div
											key={idx}
											className='flex items-center justify-between rounded-2xl border border-border bg-muted px-4 py-3'
										>
											<div>
												<p className='text-sm font-semibold text-foreground'>
													{v.lang} . {v.voice}
												</p>
												<p className='text-xs text-muted-foreground'>
													{v.note}
												</p>
											</div>
											<div className='flex items-center gap-2 text-xs text-foreground'>
												<span className='px-2 py-1 rounded-lg border border-border bg-card'>
													{t("voice.play")}
												</span>
												<span className='px-2 py-1 rounded-lg border border-border bg-card'>
													{t("voice.swap")}
												</span>
											</div>
										</div>
									))}
								</div>
								<div className='rounded-2xl bg-foreground text-background px-4 py-3 flex items-center justify-between'>
									<div>
										<p className='text-sm font-semibold'>
											{t("voice.naturalPacing")}
										</p>
										<p className='text-xs text-background/80'>
											{t("voice.breathPauses")}
										</p>
									</div>
									<span className='text-xs border border-background/30 px-2 py-1 rounded-lg'>
										ON
									</span>
								</div>

								<div className='grid sm:grid-cols-2 gap-3'>
									<div className='rounded-xl border border-border bg-muted px-4 py-3'>
										<p className='text-xs font-semibold text-foreground mb-1'>
											{t("voice.tonePreset")}
										</p>
										<div className='flex items-center gap-2 text-xs text-muted-foreground flex-wrap'>
											<span className='px-2 py-1 rounded-lg bg-card border border-border'>
												{t("voice.cinematic")}
											</span>
											<span className='px-2 py-1 rounded-lg bg-card border border-border'>
												{t("voice.narration")}
											</span>
											<span className='px-2 py-1 rounded-lg bg-card border border-border'>
												{t("voice.drama")}
											</span>
										</div>
									</div>
									<div className='rounded-xl border border-border bg-muted px-4 py-3'>
										<p className='text-xs font-semibold text-foreground mb-1'>
											{t("voice.speedPitch")}
										</p>
										<div className='flex items-center justify-between text-xs text-muted-foreground'>
											<span>
												{t("voice.speed")} 0.95x
											</span>
											<span>{t("voice.pitch")} +1</span>
										</div>
										<div className='mt-2 h-2 bg-card rounded-full overflow-hidden border border-border'>
											<div className='h-full bg-gradient-to-r from-purple-400 via-blue-400 to-amber-300 dark:from-purple-500 dark:via-blue-500 dark:to-amber-400 w-2/3'></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='space-y-6 h-full flex flex-col justify-center md:justify-start'>
							<div className='inline-flex items-center gap-2 text-sm font-semibold text-foreground'>
								<Mic className='w-4 h-4' />
								<span>{t("voice.label")}</span>
							</div>
							<h3 className='text-4xl font-bold text-foreground leading-tight'>
								{t("voice.title")}
							</h3>
							<p className='text-base text-muted-foreground leading-relaxed'>
								{t("voice.description")}
							</p>
							<Button
								variant='default'
								className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background w-full sm:w-auto px-7 h-12 text-lg'
								onClick={() => navigate("/register")}
							>
								{t("voice.cta")}
							</Button>
							<ul className='space-y-3 text-foreground'>
								{(Array.isArray(getNested?.("voice.features"))
									? (getNested("voice.features") as string[])
									: []
								).map((feature: string, idx: number) => (
									<li
										key={idx}
										className='flex items-start gap-3'
									>
										<div className='w-2.5 h-2.5 mt-2 bg-foreground rounded-full'></div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
					</div>
				</section>

				<section
					id='quality'
					className='relative z-10 w-full px-6 py-20 scroll-mt-32'
				>
					<div className='max-w-[1200px] mx-auto grid md:grid-cols-2 gap-10 items-start md:items-center'>
						<div className='space-y-6'>
							<div className='inline-flex items-center gap-2 text-sm font-semibold text-foreground'>
								<View className='w-4 h-4' />
								<span>{t("quality.label")}</span>
							</div>
							<h3 className='text-4xl font-bold text-foreground leading-tight'>
								{t("quality.title")}
							</h3>
							<p className='text-base text-muted-foreground leading-relaxed'>
								{t("quality.description")}
							</p>
							<ul className='space-y-3 text-foreground'>
								{(Array.isArray(getNested?.("quality.features"))
									? (getNested(
											"quality.features"
									  ) as string[])
									: []
								).map((feature: string, idx: number) => (
									<li
										key={idx}
										className='flex items-start gap-3'
									>
										<div className='w-2.5 h-2.5 mt-2 bg-foreground rounded-full'></div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						<div className='relative'>
							<div className='absolute inset-0 bg-gradient-to-br from-muted via-background to-muted rounded-[32px] blur-2xl'></div>
							<div className='relative bg-card rounded-[28px] border border-border shadow-xl p-6 space-y-4'>
								<div className='flex items-center justify-between'>
									<p className='text-sm font-semibold text-foreground'>
										{t("quality.exportSettings")}
									</p>
									<span className='text-xs text-muted-foreground'>
										{t("quality.preset")}{" "}
										{t("quality.trailer")}
									</span>
								</div>

								<div className='grid sm:grid-cols-2 gap-3'>
									<div className='rounded-xl border border-border bg-muted px-4 py-3'>
										<p className='text-xs uppercase text-muted-foreground'>
											{t("quality.resolution")}
										</p>
										<p className='text-lg font-semibold text-foreground'>
											4K UHD
										</p>
										<p className='text-xs text-muted-foreground'>
											3840 x 2160
										</p>
									</div>
									<div className='rounded-xl border border-border bg-muted px-4 py-3'>
										<p className='text-xs uppercase text-muted-foreground'>
											{t("quality.aspect")}
										</p>
										<p className='text-lg font-semibold text-foreground'>
											16:9
										</p>
										<p className='text-xs text-muted-foreground'>
											{t("quality.cinematicSafe")}
										</p>
									</div>
								</div>

								<div className='grid sm:grid-cols-2 gap-3'>
									<div className='rounded-xl border border-border bg-muted px-4 py-3'>
										<p className='text-xs uppercase text-muted-foreground'>
											{t("quality.bitrate")}
										</p>
										<p className='text-lg font-semibold text-foreground'>
											{t("quality.auto")}
										</p>
										<p className='text-xs text-muted-foreground'>
											{t("quality.keepsSource")}
										</p>
									</div>
									<div className='rounded-xl border border-border bg-muted px-4 py-3'>
										<p className='text-xs uppercase text-muted-foreground'>
											{t("quality.captions")}
										</p>
										<p className='text-lg font-semibold text-foreground'>
											{t("quality.cleanMaster")}
										</p>
										<p className='text-xs text-muted-foreground'>
											{t("quality.burnInOff")}
										</p>
									</div>
								</div>

								<div className='flex items-center justify-between rounded-xl border border-border bg-muted px-4 py-3'>
									<div>
										<p className='text-sm font-semibold text-foreground'>
											{t("quality.altAspect")}
										</p>
										<p className='text-xs text-muted-foreground'>
											{t("quality.alsoRender")}
										</p>
									</div>
									<span className='text-xs px-2 py-1 rounded-lg border border-border bg-card'>
										{t("quality.enabled")}
									</span>
								</div>
							</div>
						</div>
					</div>
				</section>
			</div>

			<section
				ref={ctaSectionRef}
				className={`relative z-10 w-full transition-opacity duration-500 ease-in-out ${
					!showNav ? "opacity-100" : "opacity-0"
				}`}
			>
				<div className='max-w-[1200px] mx-auto px-6 py-16 md:py-48 mb-36'>
					<div className='max-w-4xl mx-auto text-center'>
						{isAuthenticated ? (
							<>
								<h3
									className={`text-5xl md:text-5xl font-bold text-foreground mb-3 transition-all duration-700 ease-out ${
										ctaAnimationStep >= 1
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									{t("footer.cta.authenticatedTitle")}
								</h3>
								<p
									className={`text-muted-foreground mb-8 text-lg transition-all duration-700 ease-out ${
										ctaAnimationStep >= 2
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									{t("footer.cta.authenticatedDescription")}
								</p>
								<div
									className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ease-out ${
										ctaAnimationStep >= 3
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									<Button
										variant='default'
										size='lg'
										className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background px-8'
										onClick={() => navigate("/home")}
									>
										{t("footer.cta.authenticatedButton")}
									</Button>
								</div>
							</>
						) : (
							<>
								<h3
									className={`text-5xl md:text-5xl font-bold text-foreground mb-3 transition-all duration-700 ease-out ${
										ctaAnimationStep >= 1
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									{t("footer.cta.title")}
								</h3>
								<p
									className={`text-muted-foreground mb-8 text-lg transition-all duration-700 ease-out ${
										ctaAnimationStep >= 2
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									{t("footer.cta.description")}
								</p>
								<div
									className={`flex flex-col sm:flex-row gap-4 justify-center transition-all duration-700 ease-out ${
										ctaAnimationStep >= 3
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									<Button
										variant='outline'
										size='lg'
										className='px-8'
										onClick={() => navigate("/login")}
									>
										{t("footer.cta.signIn")}
									</Button>
									<Button
										variant='default'
										size='lg'
										className='bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background px-8'
										onClick={() => navigate("/register")}
									>
										{t("footer.cta.signUp")}
									</Button>
								</div>
							</>
						)}
					</div>
				</div>
			</section>
		</div>
	);
};

LandingPage.displayName = "LandingPage";
export default LandingPage;
