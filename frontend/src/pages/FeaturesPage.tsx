import {useNavigate} from "react-router-dom";
import {ArrowLeft, Zap, Shield, Globe, Clock, Sparkles, Layers} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const features = [
	{
		icon: Zap,
		titleKey: "features.speed.title",
		descKey: "features.speed.desc",
		fallbackTitle: "Lightning Fast",
		fallbackDesc: "Generate scripts in seconds with our optimized AI pipeline.",
	},
	{
		icon: Shield,
		titleKey: "features.security.title",
		descKey: "features.security.desc",
		fallbackTitle: "Enterprise Security",
		fallbackDesc: "Your data is encrypted and protected with industry standards.",
	},
	{
		icon: Globe,
		titleKey: "features.multilang.title",
		descKey: "features.multilang.desc",
		fallbackTitle: "Multi-Language",
		fallbackDesc: "Support for 50+ languages with natural voice synthesis.",
	},
	{
		icon: Clock,
		titleKey: "features.available.title",
		descKey: "features.available.desc",
		fallbackTitle: "24/7 Available",
		fallbackDesc: "Our service is always online and ready to assist you.",
	},
	{
		icon: Sparkles,
		titleKey: "features.ai.title",
		descKey: "features.ai.desc",
		fallbackTitle: "AI Powered",
		fallbackDesc: "Cutting-edge AI models for best quality results.",
	},
	{
		icon: Layers,
		titleKey: "features.integration.title",
		descKey: "features.integration.desc",
		fallbackTitle: "Easy Integration",
		fallbackDesc: "Simple API to integrate with your existing workflow.",
	},
];

const FeaturesPage = () => {
	const navigate = useNavigate();
	const {t} = useLanguage();

	return (
		<div className="min-h-screen bg-background pt-24 pb-16">
			<div className="max-w-6xl mx-auto px-6">
				<Button
					size="sm"
					className="mb-8 -ml-3 text-muted-foreground hover:text-foreground hover:opacity-100 bg-transparent border-none shadow-none transition-colors duration-200"
					onClick={() => navigate("/")}
					variant="text"
				>
					<ArrowLeft className="mr-2 h-4 w-4" />
					{t("signIn.backToHome")}
				</Button>

				<div className="text-center mb-16">
					<h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
						{t("features.title") || "Features"}
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t("features.subtitle") || "Discover what makes Puzzle the best choice for your content creation needs."}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
					{features.map((feature, index) => {
						const Icon = feature.icon;
						return (
							<div
								key={index}
								className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-200"
							>
								<div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center mb-4">
									<Icon className="w-6 h-6 text-primary" />
								</div>
								<h3 className="text-lg font-semibold text-foreground mb-2">
									{t(feature.titleKey) || feature.fallbackTitle}
								</h3>
								<p className="text-sm text-muted-foreground">
									{t(feature.descKey) || feature.fallbackDesc}
								</p>
							</div>
						);
					})}
				</div>

				<div className="text-center mt-16">
					<Button
						variant="default"
						size="lg"
						className="bg-foreground text-background hover:opacity-90"
						onClick={() => navigate("/register")}
					>
						{t("nav.signUp") || "Get Started"}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default FeaturesPage;
