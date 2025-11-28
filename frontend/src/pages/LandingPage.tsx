import React, {useEffect, useRef, useState} from "react";
import {useNavigate} from "react-router-dom";
import {
	Clapperboard,
	FileText,
	Sparkles,
	Share2,
	Plus,
	Cpu,
	Bot,
	Languages,
	Mic,
	View,
	Layers,
	Volume2,
	VolumeX,
	RotateCcw,
} from "lucide-react";
import {FaTwitter, FaDiscord, FaGithub, FaEnvelope} from "react-icons/fa";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import VideoPlayer from "../components/ui/VideoPlayer";
import Tooltip from "../components/ui/Tooltip";
import Assets from "../configs/AssetsConfig";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import {useLanguage} from "../hooks/useLanguage";
import {Globe} from "lucide-react";

import {usePlaybackStore} from "../hooks/usePlaybackStore";
import {useAuth} from "../hooks/useAuth";

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
	const {language, setLanguage, t, getNested} = useLanguage();
	const {isAuthenticated} = useAuth({skipInitialCheck: true});
	const [showNav, setShowNav] = useState(false);
	const [demoOverlay, setDemoOverlay] = useState(false);
	const [demoShrink, setDemoShrink] = useState(false);
	const [audioOn, setAudioOn] = useState(false);
	const [showVolumeSlider, setShowVolumeSlider] = useState(false);
	const [ctaAnimationStep, setCtaAnimationStep] = useState(0);
	const [featuresAnimated, setFeaturesAnimated] = useState(false);
	const [packagesAnimated, setPackagesAnimated] = useState(false);
	const [packagesTitleAnimated, setPackagesTitleAnimated] = useState(false);
	const [packagesSubtitleAnimated, setPackagesSubtitleAnimated] =
		useState(false);
	const hasAnimatedRef = useRef(false);
	const demoRef = useRef<HTMLDivElement>(null);
	const demoVideoRef = useRef<HTMLVideoElement | null>(null);
	const ctaSectionRef = useRef<HTMLElement>(null);
	const featuresSectionRef = useRef<HTMLElement>(null);
	const packagesSectionRef = useRef<HTMLElement>(null);
	const prevDemoShrinkRef = useRef(false);
	const prevShowNavRef = useRef(false);
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

						const shrinkTrigger = rect.top < 150;
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

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setFeaturesAnimated(true);
				} else {
					setFeaturesAnimated(false);
				}
			},
			{threshold: 0.5, rootMargin: "0px"}
		);

		observer.observe(featuresSectionRef.current);
		return () => observer.disconnect();
	}, []);

	useEffect(() => {
		if (!packagesSectionRef.current) return;

		const observer = new IntersectionObserver(
			([entry]) => {
				if (entry.isIntersecting) {
					setTimeout(() => {
						setPackagesTitleAnimated(true);
					}, 0);
					setTimeout(() => {
						setPackagesSubtitleAnimated(true);
					}, 200);
					setTimeout(() => {
						setPackagesAnimated(true);
					}, 400);
				} else {
					setPackagesTitleAnimated(false);
					setPackagesSubtitleAnimated(false);
					setPackagesAnimated(false);
				}
			},
			{threshold: 0.2, rootMargin: "0px"}
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
		<div className='min-h-screen bg-white relative overflow-hidden'>
			<div className='parallax-bg absolute inset-0 pointer-events-none'>
				<div className='absolute top-20 left-10 w-32 h-32 bg-blue-100 opacity-50'></div>
				<div className='absolute left-4 bottom-14 w-48 h-48 border-2 border-purple-200 rounded-full spin-slower opacity-70'></div>
				<div
					className='absolute bottom-6 left-12 w-64 h-32 bg-gradient-to-r from-teal-100 via-blue-100 to-transparent rotate-6 rounded-3xl opacity-80'
					style={{boxShadow: "0 24px 70px rgba(59, 130, 246, 0.18)"}}
				></div>

				<div className='absolute top-32 right-20 grid grid-cols-3 gap-2'>
					{[...Array(9)].map((_, i) => (
						<div
							key={i}
							className='w-16 h-16 border border-gray-200 bg-white'
							style={{
								backgroundImage:
									i % 3 === 0
										? "repeating-linear-gradient(45deg, transparent, transparent 2px, #e5e7eb 2px, #e5e7eb 4px)"
										: "none",
							}}
						></div>
					))}
				</div>

				<div className='absolute bottom-24 right-14 w-56 h-56 bg-gradient-to-br from-indigo-100 via-blue-100 to-transparent blur-2xl opacity-70'></div>
				<div
					className='absolute right-10 bottom-8 w-32 h-32 opacity-60 float-slow'
					style={{
						backgroundImage:
							"radial-gradient(#e5e7eb 1px, transparent 1px)",
						backgroundSize: "10px 10px",
					}}
				></div>

				<span className='glow-dot absolute top-10 left-24 w-3 h-3 rounded-full bg-white/70 blur-sm'></span>
				<span
					className='glow-dot absolute top-28 right-32 w-3 h-3 rounded-full bg-amber-200/80 blur-sm'
					style={{animationDelay: "0.8s"}}
				></span>
				<span
					className='glow-dot absolute bottom-16 left-1/3 w-3 h-3 rounded-full bg-blue-200/80 blur-sm'
					style={{animationDelay: "1.4s"}}
				></span>
				<span
					className='glow-dot absolute bottom-10 right-1/4 w-3 h-3 rounded-full bg-pink-200/80 blur-sm'
					style={{animationDelay: "2s"}}
				></span>
			</div>

			<div
				className={`hidden z-50 lg:flex fixed left-6 top-1/2 -translate-y-1/2 flex-col gap-3 transition-opacity duration-300 ${
					showNav ? "opacity-100" : "opacity-0 pointer-events-none"
				}`}
			>
				{navSections.map(({label, id, Icon}) => (
					<button
						key={id}
						onClick={() => handleNavClick(id)}
						className='group flex items-center gap-3 rounded-full border border-gray-200 bg-white/90 px-3 py-2 shadow-sm hover:shadow-md hover:-translate-y-[2px] transition-all duration-200'
					>
						<span className='w-9 h-9 rounded-full bg-gray-900 text-white flex items-center justify-center shadow'>
							<Icon className='w-4 h-4' />
						</span>
						<span className='text-sm font-semibold text-gray-800 pr-2'>
							{label}
						</span>
					</button>
				))}
			</div>

			<header className='fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100'>
				<div className='container mx-auto px-6 py-6'>
					<div className='flex items-center justify-between'>
						<div className='flex items-center gap-2'>
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
							<a
								href='/customers'
								className='text-gray-700 hover:text-gray-900'
							>
								{t("nav.customers")}
							</a>
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
							<a
								href='/pricing'
								className='text-gray-700 hover:text-gray-900'
							>
								{t("nav.pricing")}
							</a>
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

			<main className='relative z-10 w-full min-h-screen flex items-center justify-center px-6 pt-24 pb-20'>
				<div className='max-w-4xl mx-auto text-center'>
					<h1 className='text-6xl md:text-7xl font-bold text-gray-900 mb-6 leading-tight animate-fade-in'>
						{t("hero.title")}
						{t("hero.titlePlatform") && (
							<>
								{" "}
								<span className='text-gray-500 text-5xl md:text-6xl'>
									{t("hero.titlePlatform")}
								</span>
							</>
						)}
					</h1>

					<div className='space-y-2 mb-10 text-lg text-gray-600 animate-fade-in-delay'>
						<p>{t("hero.subtitle")}</p>
						<p>{t("hero.subtitle2")}</p>
					</div>

					<div className='flex flex-col sm:flex-row gap-4 max-w-2xl w-full mx-auto justify-center'>
						<Input
							type='email'
							placeholder={t("hero.emailPlaceholder")}
							className='flex-1 h-12 px-5 py-3 text-lg border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black'
						/>
						<Button
							variant='default'
							size='lg'
							className='bg-black text-white hover:bg-gray-800 w-full sm:w-auto px-7 h-12 text-lg'
							onClick={() => navigate("/register")}
						>
							{t("hero.cta")}
						</Button>
					</div>
				</div>
			</main>

			<section className='relative z-10 w-full px-6 py-16 mb-32 border-t border-gray-200 overflow-hidden'>
				<div className='container mx-auto mb-8'>
					<h2 className='text-center text-2xl font-semibold text-gray-900 mb-2'>
						{t("platforms.trusted")}
					</h2>
					<p className='text-center text-gray-600'>
						{t("platforms.support")}
					</p>
				</div>

				<div className='relative'>
					<div className='marquee-track flex items-center gap-8 w-max'>
						{[...platforms, ...platforms].map((platform, index) => (
							<div
								key={`${platform.name}-${index}`}
								className='cursor-pointer group flex items-center gap-3 px-6 py-3 bg-white rounded-lg shadow-sm border border-gray-100 min-w-[200px] transition-transform duration-200 hover:-translate-y-1 hover:shadow-lg hover:border-gray-200'
							>
								<div
									className={`w-10 h-10 rounded-lg flex items-center justify-center`}
								>
									<img
										src={platform.icon}
										alt={platform.name}
										className='w-8 h-8 object-contain transition-transform duration-200 group-hover:scale-105'
									/>
								</div>
								<span className='text-lg font-semibold text-gray-900'>
									{platform.name}
								</span>
							</div>
						))}
					</div>
				</div>
			</section>

			<section
				id='features'
				ref={featuresSectionRef}
				className='relative z-11 w-full px-6 mb-24'
			>
				<div className='max-w-8xl mx-auto text-center mb-14'>
					<h2 className='text-4xl md:text-5xl font-bold text-gray-900'>
						{t("features.title")}
					</h2>
				</div>
				<div className='max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6'>
					{[
						{key: "movieRecap", Icon: Clapperboard},
						{key: "autoSubs", Icon: FileText},
						{key: "highlightScenes", Icon: Sparkles},
						{key: "multiPlatform", Icon: Share2},
					].map(({key, Icon}, index) => (
						<div
							key={key}
							className={`group cursor-pointer relative border border-gray-200 rounded-2xl p-8 flex flex-col gap-8 bg-white hover:shadow-lg hover:-translate-y-1 transition-all duration-200 ${
								featuresAnimated
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
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
								<div className='w-14 h-14 border border-gray-300 rounded-xl flex items-center justify-center'>
									<Icon
										className='w-7 h-7 text-gray-800'
										strokeWidth={2}
									/>
								</div>
								<Plus
									className='w-6 h-6 text-gray-800 transition-all duration-200 group-hover:rotate-90 group-hover:opacity-20'
									strokeWidth={2}
								/>
							</div>
							<div className='space-y-3'>
								<h3 className='text-xl font-semibold text-gray-900 text-left'>
									{t(`features.${key}.title`)}
								</h3>
								<p className='text-sm text-gray-600 text-left leading-relaxed'>
									{t(`features.${key}.description`)}
								</p>
							</div>
						</div>
					))}
				</div>
			</section>

			<div
				ref={demoRef}
				className='max-w-[1400px] mx-auto min-h-[400px] px-6 mt-[200px] mb-[250px]'
			>
				<div className='relative'>
					<div
						className='video-container-smooth'
						style={{
							width: demoShrink ? "75%" : "100%",
							maxWidth: demoShrink ? "none" : "1400px",
							marginLeft: demoShrink ? "0" : "auto",
							marginRight: demoShrink ? "0" : "auto",
							paddingRight: demoShrink ? "1.5rem" : "0",
							transition:
								"width 650ms cubic-bezier(0.4, 0, 0.2, 1), max-width 650ms cubic-bezier(0.4, 0, 0.2, 1), padding-right 650ms cubic-bezier(0.4, 0, 0.2, 1), margin-left 650ms cubic-bezier(0.4, 0, 0.2, 1), margin-right 650ms cubic-bezier(0.4, 0, 0.2, 1)",
							willChange: "width, max-width",
							contain: "layout style",
						}}
					>
						<div className='relative rounded-3xl overflow-hidden shadow-xl border border-gray-200 bg-black aspect-[16/9]'>
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
								className={`absolute inset-0 flex items-center justify-center bg-black text-white transition-opacity duration-500 ${
									demoOverlay
										? "opacity-80"
										: "opacity-0 pointer-events-none"
								}`}
							>
								<div className='text-center space-y-4'>
									<p className='text-lg font-semibold'>
										{t("demo.watchFull")}
									</p>
									<Button className='bg-white text-black hover:bg-gray-100 px-6'>
										{t("demo.goToFullVideo")}
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div
						className='video-panel-smooth absolute right-0 top-0'
						style={{
							width: demoShrink ? "25%" : "0%",
							paddingLeft: demoShrink ? "1.5rem" : "0",
							opacity: demoShrink ? 1 : 0,
							transform: demoShrink
								? "translateX(0)"
								: "translateX(24px)",
							pointerEvents: demoShrink ? "auto" : "none",
							overflow: demoShrink ? "visible" : "hidden",
							transition: demoShrink
								? "transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 400ms cubic-bezier(0.4, 0, 0.2, 1) 150ms, width 650ms cubic-bezier(0.4, 0, 0.2, 1), padding-left 650ms cubic-bezier(0.4, 0, 0.2, 1)"
								: "transform 650ms cubic-bezier(0.4, 0, 0.2, 1), opacity 300ms cubic-bezier(0.4, 0, 0.2, 1), width 650ms cubic-bezier(0.4, 0, 0.2, 1), padding-left 650ms cubic-bezier(0.4, 0, 0.2, 1)",
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
								<p className='text-xs uppercase tracking-wide text-gray-500'>
									{demoVideoDetail.platform}
								</p>
								<h3 className='text-2xl font-bold text-gray-900'>
									{demoVideoDetail.title}
								</h3>
								<p className='text-sm text-gray-600'>
									{t("demo.recapRuntime")} 03:45
								</p>
							</div>
						</div>
						<div className='grid grid-cols-1 gap-4 max-h-[520px] overflow-y-auto pr-1'>
							<div className='rounded-xl border border-gray-200 bg-white px-4 py-3'>
								<p className='text-xs uppercase text-gray-500'>
									{t("demo.cost")}
								</p>
								<p className='text-lg font-semibold text-gray-900'>
									{demoVideoDetail.cost}
								</p>
								<p className='text-xs text-gray-600'>
									{t("demo.roughTotal")}
								</p>
							</div>
							<div className='rounded-xl border border-gray-200 bg-white px-4 py-3'>
								<p className='text-xs uppercase text-gray-500'>
									{t("demo.context")}
								</p>
								<p className='text-lg font-semibold text-gray-900'>
									{demoVideoDetail.context}
								</p>
								<p className='text-xs text-gray-600'>
									{t("demo.scriptScene")}
								</p>
							</div>
							<div className='rounded-xl border border-gray-200 bg-white px-4 py-3'>
								<p className='text-xs uppercase text-gray-500'>
									{t("demo.captions")}
								</p>
								<p className='text-lg font-semibold text-gray-900'>
									{demoVideoDetail.captions}
								</p>
								<p className='text-xs text-gray-600'>
									{t("demo.autoAligned")}
								</p>
							</div>
							<div className='rounded-xl border border-gray-200 bg-white px-4 py-3'>
								<p className='text-xs uppercase text-gray-500'>
									{t("demo.exports")}
								</p>
								<p className='text-lg font-semibold text-gray-900'>
									{demoVideoDetail.exports}
								</p>
								<p className='text-xs text-gray-600'>
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
								<div className='flex items-center border border-gray-200 bg-white rounded-full transition-colors duration-200'>
									<Button
										variant='outline'
										size='icon'
										className='border-none bg-white text-gray-900 hover:bg-gray-100 rounded-full w-10 h-10 shrink-0 shadow-none'
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
											className='mx-[10px] w-full h-1 my-0 bg-gray-200 rounded-lg appearance-none cursor-pointer align-middle [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-black [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-3 [&::-moz-range-thumb]:h-3 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-black [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer'
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
									className='bg-black text-white hover:bg-gray-800 rounded-full w-10 h-10 shrink-0'
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
				className='relative z-10 w-full px-6 py-24 mb-20'
			>
				<div className='max-w-7xl mx-auto'>
					<div className='text-center mb-16'>
						<h2
							className={`text-4xl md:text-5xl font-bold text-gray-900 mb-4 transition-all duration-600 ${
								packagesTitleAnimated
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
							}`}
							style={{
								transitionTimingFunction:
									"cubic-bezier(0.4, 0, 0.2, 1)",
							}}
						>
							{t("packages.title")}
						</h2>
						<p
							className={`text-lg text-gray-600 max-w-2xl mx-auto transition-all duration-600 ${
								packagesSubtitleAnimated
									? "opacity-100 translate-y-0"
									: "opacity-0 translate-y-8"
							}`}
							style={{
								transitionTimingFunction:
									"cubic-bezier(0.4, 0, 0.2, 1)",
							}}
						>
							{t("packages.subtitle")}
						</p>
					</div>

					<div className='grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-4'>
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
									className={`group relative rounded-3xl p-8 flex flex-col transition-all duration-300 overflow-visible ${
										isPopular
											? "lg:-mt-4 lg:mb-4 border-2 border-gray-900 bg-white shadow-xl hover:shadow-2xl"
											: "border border-gray-200 bg-white hover:shadow-lg hover:-translate-y-1"
									} ${
										packagesAnimated
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
									style={{
										transitionDelay: packagesAnimated
											? `${index * 100}ms`
											: "0ms",
										transitionProperty:
											"opacity, transform, box-shadow",
										transitionDuration: "600ms",
										transitionTimingFunction:
											"cubic-bezier(0.4, 0, 0.2, 1)",
										boxShadow: isPopular
											? "0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 40px -10px rgba(0, 0, 0, 0.15)"
											: "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
									}}
									onMouseEnter={(e) => {
										if (isPopular) {
											e.currentTarget.style.boxShadow =
												"0 25px 50px -12px rgba(0, 0, 0, 0.25), 0 0 0 1px rgba(0, 0, 0, 0.05), 0 0 60px -15px rgba(0, 0, 0, 0.2)";
										} else {
											e.currentTarget.style.boxShadow =
												"0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05), 0 0 30px -10px rgba(0, 0, 0, 0.1)";
										}
									}}
									onMouseLeave={(e) => {
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
										<div className='absolute -top-4 left-1/2 -translate-x-1/2'>
											<span className='inline-flex items-center gap-1 text-xs font-semibold text-white bg-gray-900 px-4 py-1.5 rounded-full shadow-lg'>
												<Sparkles className='w-3 h-3' />
												{t("packages.popular")}
											</span>
										</div>
									)}

									<div className='mb-6'>
										<div
											className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-4 transition-all duration-200 ${
												isPopular
													? "bg-gradient-to-br from-gray-900 to-gray-700 text-white shadow-lg"
													: "border border-gray-300 bg-gray-50 group-hover:bg-gray-100"
											}`}
										>
											<Icon
												className={`w-8 h-8 ${
													isPopular
														? "text-white"
														: "text-gray-800"
												}`}
												strokeWidth={2}
											/>
										</div>
										<h3
											className={`text-2xl font-bold mb-3 flex items-center gap-2 ${
												isPopular
													? "text-gray-900"
													: "text-gray-900"
											}`}
										>
											<span>
												{t(`packages.${pkg.key}.title`)}
											</span>
											<span className='text-sm font-normal text-gray-500'>
												{t(
													`packages.${pkg.key}.subtitle`
												)}
											</span>
										</h3>
										<p className='text-gray-600 leading-relaxed text-sm'>
											{t(
												`packages.${pkg.key}.description`
											)}
										</p>
									</div>

									<div className='flex-grow mb-6'>
										<ul className='space-y-3'>
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
														className='flex items-start gap-3 text-sm text-gray-700'
													>
														<div
															className={`w-2 h-2 mt-2 rounded-full shrink-0 ${
																isPopular
																	? "bg-gray-900"
																	: "bg-gray-400"
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
												? "bg-gray-900 text-white hover:bg-gray-800 h-12 text-base font-semibold shadow-md hover:shadow-lg"
												: "bg-black text-white hover:bg-gray-800 h-11"
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
					className='text-4xl md:text-5xl font-bold text-gray-900 text-center'
				>
					{t("engine.title")}
				</h2>
				<section
					id='workflow'
					className='relative z-10 w-full px-6 py-20 scroll-mt-32'
				>
					<div className='max-w-6xl mx-auto'>
						<div className='grid md:grid-cols-2 gap-10 items-center'>
							<div className='relative flex justify-center'>
								<div className='absolute inset-0 bg-gray-100 rounded-3xl blur-2xl scale-105'></div>
								<div className='relative w-full max-w-xl bg-white border border-gray-200 rounded-3xl shadow-xl overflow-hidden'>
									<div className='flex items-center justify-between px-5 py-4 border-b border-gray-100 bg-gray-50'>
										<div>
											<p className='text-xs uppercase tracking-wide text-gray-500'>
												{t("workflow.workspace")}
											</p>
											<p className='text-sm font-semibold text-gray-900'>
												{t("workflow.cinemaAnime")}
											</p>
										</div>
										<span className='text-xs text-gray-500'>
											{t("workflow.autoSaved")}
										</span>
									</div>

									<div className='grid grid-cols-2 text-sm font-medium text-gray-600 border-b border-gray-100'>
										<div className='px-5 py-3 bg-white'>
											{t("workflow.clips")} 8
										</div>
										<div className='px-5 py-3 bg-gray-50 text-right text-gray-400'>
											{t("workflow.drafts")} 1
										</div>
									</div>

									<div className='p-5 space-y-4 bg-gradient-to-b from-white via-gray-50 to-white'>
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
												className='flex items-start gap-3 rounded-2xl border border-gray-200 bg-white px-4 py-3 shadow-sm'
											>
												<div className='w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white font-semibold text-xs'>
													{idx + 1}
												</div>
												<div className='flex-1'>
													<p className='text-sm font-semibold text-gray-900'>
														{item.title}
													</p>
													<p className='text-xs text-gray-500'>
														{item.meta}
													</p>
												</div>
												<div className='text-xs text-gray-400 border border-gray-200 px-2 py-1 rounded-lg'>
													{t("workflow.export")}
												</div>
											</div>
										))}
									</div>
								</div>
							</div>

							<div className='space-y-6 h-full flex flex-col justify-center md:justify-start'>
								<div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
									<Sparkles className='w-4 h-4' />
									<span>{t("workflow.label")}</span>
								</div>
								<h3 className='text-4xl font-bold text-gray-900 leading-tight'>
									{t("workflow.title")}
								</h3>
								<p className='text-base text-gray-600 leading-relaxed'>
									{t("workflow.description")}
								</p>
								<Button
									variant='default'
									className='bg-black text-white hover:bg-gray-800 w-full sm:w-auto px-7 h-12 text-lg'
									onClick={() => navigate("/register")}
								>
									{t("workflow.cta")}
								</Button>
								<ul className='space-y-3 text-gray-700'>
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
											<div className='w-2.5 h-2.5 mt-2 bg-black rounded-full'></div>
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
					<div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-center'>
						<div className='space-y-5'>
							<div className='flex items-center gap-2 text-sm font-semibold text-gray-700'>
								<Layers className='w-4 h-4' />
								<span>{t("models.label")}</span>
							</div>
							<h3 className='text-4xl font-bold text-gray-900 leading-tight'>
								{t("models.title")}
							</h3>
							<p className='text-base text-gray-600 leading-relaxed'>
								{t("models.description")}
							</p>
							<Button
								variant='default'
								className='bg-black text-white hover:bg-gray-800 w-full sm:w-auto px-7 h-12 text-lg'
								onClick={() => navigate("/register")}
							>
								{t("models.cta")}
							</Button>
							<ul className='space-y-3 text-gray-700'>
								{(Array.isArray(getNested?.("models.features"))
									? (getNested("models.features") as string[])
									: []
								).map((feature: string, idx: number) => (
									<li
										key={idx}
										className='flex items-start gap-3'
									>
										<div className='w-2.5 h-2.5 mt-2 bg-black rounded-full'></div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>
						<div className='relative'>
							<div className='absolute inset-0 bg-gradient-to-br from-indigo-100 via-purple-100 to-blue-50 rounded-[32px]'></div>
							<div className='relative rounded-[32px] p-8 space-y-4'>
								<div className='inline-flex items-center gap-2 text-xs font-semibold text-purple-700 bg-white/60 px-3 py-1 rounded-full shadow-sm'>
									<Cpu className='w-4 h-4' />
									<span>{t("models.stack")}</span>
								</div>

								<div className='space-y-4 bg-white rounded-2xl p-4 shadow'>
									<p className='text-xs font-semibold text-purple-800'>
										{t("models.editTimeline")}
									</p>
									<div className='flex h-3 w-full overflow-hidden rounded-full bg-gray-100'>
										<div className='bg-purple-500 w-2/5'></div>
										<div className='bg-blue-400 w-1/5'></div>
										<div className='bg-amber-400 w-1/6'></div>
										<div className='bg-gray-300 flex-1'></div>
									</div>
									<div className='space-y-2 text-sm text-gray-800'>
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
										<p className='text-xs text-gray-600 mt-2'>
											{t("models.appliedDirectly")}
										</p>
									</div>
								</div>

								<div className='bg-white rounded-2xl p-4 shadow flex items-center justify-between'>
									<div>
										<p className='text-xs uppercase text-gray-500'>
											{t("models.llm")}
										</p>
										<p className='text-sm font-semibold text-gray-900'>
											{t("models.plotAware")}
										</p>
									</div>
									<Bot className='w-5 h-5 text-gray-700' />
								</div>

								<div className='bg-white rounded-2xl p-4 shadow flex items-center justify-between'>
									<div>
										<p className='text-xs uppercase text-gray-500'>
											{t("models.asr")}
										</p>
										<p className='text-sm font-semibold text-gray-900'>
											{t("models.dualSubs")}
										</p>
									</div>
									<Cpu className='w-5 h-5 text-gray-700' />
								</div>
							</div>
						</div>
					</div>
				</section>

				<section
					id='voice'
					className='relative z-10 w-full px-6 py-20 scroll-mt-32'
				>
					<div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start md:items-stretch'>
						<div className='relative h-full'>
							<div className='absolute inset-0 bg-gradient-to-br from-purple-100 via-blue-50 to-indigo-100 rounded-[32px] blur-2xl'></div>
							<div className='relative bg-white rounded-[28px] border border-gray-200 shadow-xl p-7 space-y-5 h-full flex flex-col'>
								<div className='flex items-center justify-between'>
									<div className='flex items-center gap-2 text-sm font-semibold text-gray-800'>
										<Languages className='w-4 h-4' />
										<span>{t("voice.voiceTrack")}</span>
									</div>
									<span className='text-xs text-gray-500'>
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
											className='flex items-center justify-between rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3'
										>
											<div>
												<p className='text-sm font-semibold text-gray-900'>
													{v.lang} . {v.voice}
												</p>
												<p className='text-xs text-gray-600'>
													{v.note}
												</p>
											</div>
											<div className='flex items-center gap-2 text-xs text-gray-700'>
												<span className='px-2 py-1 rounded-lg border border-gray-200 bg-white'>
													{t("voice.play")}
												</span>
												<span className='px-2 py-1 rounded-lg border border-gray-200 bg-white'>
													{t("voice.swap")}
												</span>
											</div>
										</div>
									))}
								</div>
								<div className='rounded-2xl bg-black text-white px-4 py-3 flex items-center justify-between'>
									<div>
										<p className='text-sm font-semibold'>
											{t("voice.naturalPacing")}
										</p>
										<p className='text-xs text-gray-200'>
											{t("voice.breathPauses")}
										</p>
									</div>
									<span className='text-xs border border-white/30 px-2 py-1 rounded-lg'>
										ON
									</span>
								</div>

								<div className='grid sm:grid-cols-2 gap-3'>
									<div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
										<p className='text-xs font-semibold text-gray-700 mb-1'>
											{t("voice.tonePreset")}
										</p>
										<div className='flex items-center gap-2 text-xs text-gray-600 flex-wrap'>
											<span className='px-2 py-1 rounded-lg bg-white border border-gray-200'>
												{t("voice.cinematic")}
											</span>
											<span className='px-2 py-1 rounded-lg bg-white border border-gray-200'>
												{t("voice.narration")}
											</span>
											<span className='px-2 py-1 rounded-lg bg-white border border-gray-200'>
												{t("voice.drama")}
											</span>
										</div>
									</div>
									<div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
										<p className='text-xs font-semibold text-gray-700 mb-1'>
											{t("voice.speedPitch")}
										</p>
										<div className='flex items-center justify-between text-xs text-gray-600'>
											<span>
												{t("voice.speed")} 0.95x
											</span>
											<span>{t("voice.pitch")} +1</span>
										</div>
										<div className='mt-2 h-2 bg-white rounded-full overflow-hidden border border-gray-200'>
											<div className='h-full bg-gradient-to-r from-purple-400 via-blue-400 to-amber-300 w-2/3'></div>
										</div>
									</div>
								</div>
							</div>
						</div>
						<div className='space-y-6 h-full flex flex-col justify-center md:justify-start'>
							<div className='inline-flex items-center gap-2 text-sm font-semibold text-gray-700'>
								<Mic className='w-4 h-4' />
								<span>{t("voice.label")}</span>
							</div>
							<h3 className='text-4xl font-bold text-gray-900 leading-tight'>
								{t("voice.title")}
							</h3>
							<p className='text-base text-gray-600 leading-relaxed'>
								{t("voice.description")}
							</p>
							<Button
								variant='default'
								className='bg-black text-white hover:bg-gray-800 w-full sm:w-auto px-7 h-12 text-lg'
								onClick={() => navigate("/register")}
							>
								{t("voice.cta")}
							</Button>
							<ul className='space-y-3 text-gray-700'>
								{(Array.isArray(getNested?.("voice.features"))
									? (getNested("voice.features") as string[])
									: []
								).map((feature: string, idx: number) => (
									<li
										key={idx}
										className='flex items-start gap-3'
									>
										<div className='w-2.5 h-2.5 mt-2 bg-black rounded-full'></div>
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
					<div className='max-w-6xl mx-auto grid md:grid-cols-2 gap-10 items-start md:items-center'>
						<div className='space-y-6'>
							<div className='inline-flex items-center gap-2 text-sm font-semibold text-gray-700'>
								<View className='w-4 h-4' />
								<span>{t("quality.label")}</span>
							</div>
							<h3 className='text-4xl font-bold text-gray-900 leading-tight'>
								{t("quality.title")}
							</h3>
							<p className='text-base text-gray-600 leading-relaxed'>
								{t("quality.description")}
							</p>
							<ul className='space-y-3 text-gray-700'>
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
										<div className='w-2.5 h-2.5 mt-2 bg-black rounded-full'></div>
										<span>{feature}</span>
									</li>
								))}
							</ul>
						</div>

						<div className='relative'>
							<div className='absolute inset-0 bg-gradient-to-br from-gray-100 via-white to-gray-200 rounded-[32px] blur-2xl'></div>
							<div className='relative bg-white rounded-[28px] border border-gray-200 shadow-xl p-6 space-y-4'>
								<div className='flex items-center justify-between'>
									<p className='text-sm font-semibold text-gray-800'>
										{t("quality.exportSettings")}
									</p>
									<span className='text-xs text-gray-500'>
										{t("quality.preset")}{" "}
										{t("quality.trailer")}
									</span>
								</div>

								<div className='grid sm:grid-cols-2 gap-3'>
									<div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
										<p className='text-xs uppercase text-gray-500'>
											{t("quality.resolution")}
										</p>
										<p className='text-lg font-semibold text-gray-900'>
											4K UHD
										</p>
										<p className='text-xs text-gray-600'>
											3840 x 2160
										</p>
									</div>
									<div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
										<p className='text-xs uppercase text-gray-500'>
											{t("quality.aspect")}
										</p>
										<p className='text-lg font-semibold text-gray-900'>
											16:9
										</p>
										<p className='text-xs text-gray-600'>
											{t("quality.cinematicSafe")}
										</p>
									</div>
								</div>

								<div className='grid sm:grid-cols-2 gap-3'>
									<div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
										<p className='text-xs uppercase text-gray-500'>
											{t("quality.bitrate")}
										</p>
										<p className='text-lg font-semibold text-gray-900'>
											{t("quality.auto")}
										</p>
										<p className='text-xs text-gray-600'>
											{t("quality.keepsSource")}
										</p>
									</div>
									<div className='rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
										<p className='text-xs uppercase text-gray-500'>
											{t("quality.captions")}
										</p>
										<p className='text-lg font-semibold text-gray-900'>
											{t("quality.cleanMaster")}
										</p>
										<p className='text-xs text-gray-600'>
											{t("quality.burnInOff")}
										</p>
									</div>
								</div>

								<div className='flex items-center justify-between rounded-xl border border-gray-200 bg-gray-50 px-4 py-3'>
									<div>
										<p className='text-sm font-semibold text-gray-900'>
											{t("quality.altAspect")}
										</p>
										<p className='text-xs text-gray-600'>
											{t("quality.alsoRender")}
										</p>
									</div>
									<span className='text-xs px-2 py-1 rounded-lg border border-gray-200 bg-white'>
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
				<div className='max-w-7xl mx-auto px-6 py-16 md:py-48 mb-36'>
					<div className='max-w-4xl mx-auto text-center'>
						{isAuthenticated ? (
							<>
								<h3
									className={`text-5xl md:text-5xl font-bold text-gray-900 mb-3 transition-all duration-700 ease-out ${
										ctaAnimationStep >= 1
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									{t("footer.cta.authenticatedTitle")}
								</h3>
								<p
									className={`text-gray-600 mb-8 text-lg transition-all duration-700 ease-out ${
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
										className='bg-black text-white hover:bg-gray-800 px-8'
										onClick={() => navigate("/home")}
									>
										{t("footer.cta.authenticatedButton")}
									</Button>
								</div>
							</>
						) : (
							<>
								<h3
									className={`text-5xl md:text-5xl font-bold text-gray-900 mb-3 transition-all duration-700 ease-out ${
										ctaAnimationStep >= 1
											? "opacity-100 translate-y-0"
											: "opacity-0 translate-y-8"
									}`}
								>
									{t("footer.cta.title")}
								</h3>
								<p
									className={`text-gray-600 mb-8 text-lg transition-all duration-700 ease-out ${
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
										className='bg-black text-white hover:bg-gray-800 px-8'
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

			<footer className='relative z-10 w-full border-t border-gray-200 bg-white'>
				<div className='max-w-7xl mx-auto px-6 py-12 md:py-16'>
					<div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 md:gap-12 mb-8'>
						<div className='lg:col-span-2'>
							<div className='flex items-center gap-2 mb-4'>
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
								<a
									href='#'
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
									aria-label='Twitter'
								>
									<FaTwitter className='w-5 h-5' />
								</a>
								<a
									href='#'
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
									aria-label='Discord'
								>
									<FaDiscord className='w-5 h-5' />
								</a>
								<a
									href='#'
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
									aria-label='GitHub'
								>
									<FaGithub className='w-5 h-5' />
								</a>
								<a
									href='#'
									className='w-10 h-10 rounded-lg border border-gray-200 flex items-center justify-center text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
									aria-label='Email'
								>
									<FaEnvelope className='w-5 h-5' />
								</a>
							</div>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-gray-900 mb-4'>
								{t("footer.product")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.productFeatures")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.productPricing")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.productDocumentation")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.productApi")}
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-gray-900 mb-4'>
								{t("footer.company")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.companyAbout")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.companyBlog")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.companyCareers")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.companyContact")}
									</a>
								</li>
							</ul>
						</div>

						<div>
							<h3 className='text-sm font-semibold text-gray-900 mb-4'>
								{t("footer.resources")}
							</h3>
							<ul className='space-y-3'>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.resourcesHelp")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.resourcesCommunity")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.resourcesPrivacy")}
									</a>
								</li>
								<li>
									<a
										href='#'
										className='text-sm text-gray-600 hover:text-gray-900 transition-colors'
									>
										{t("footer.resourcesTerms")}
									</a>
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
								<a
									href='#'
									className='hover:text-gray-900 transition-colors'
								>
									{t("footer.privacy")}
								</a>
								<a
									href='#'
									className='hover:text-gray-900 transition-colors'
								>
									{t("footer.terms")}
								</a>
								<a
									href='#'
									className='hover:text-gray-900 transition-colors'
								>
									{t("footer.cookies")}
								</a>
							</div>
						</div>
					</div>
				</div>
			</footer>
		</div>
	);
};

LandingPage.displayName = "LandingPage";
export default LandingPage;
