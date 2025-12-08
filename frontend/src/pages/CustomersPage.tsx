import {useNavigate} from "react-router-dom";
import {ArrowLeft, Star, Quote} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const testimonials = [
	{
		name: "Alex Johnson",
		company: "TechStart Inc.",
		role: "Content Lead",
		quote: "Puzzle has transformed our content workflow. We're producing 10x more videos in half the time.",
		avatar: null,
	},
	{
		name: "Maria Garcia",
		company: "Digital Creators",
		role: "Founder",
		quote: "The AI quality is incredible. Our audience can't tell the difference from professional voiceovers.",
		avatar: null,
	},
	{
		name: "James Chen",
		company: "MediaFlow",
		role: "Video Producer",
		quote: "Best investment we've made. The ROI was visible within the first week.",
		avatar: null,
	},
];

const stats = [
	{value: "10K+", label: "Active Users"},
	{value: "1M+", label: "Scripts Generated"},
	{value: "99.9%", label: "Uptime"},
	{value: "4.9", label: "Rating", icon: Star},
];

const CustomersPage = () => {
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
						Trusted by Creators Worldwide
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						See how our customers are using Puzzle to transform their content creation.
					</p>
				</div>

				<div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
					{stats.map((stat, index) => (
						<div
							key={index}
							className="bg-card border border-border rounded-xl p-6 text-center"
						>
							<div className="flex items-center justify-center gap-1 mb-2">
								<span className="text-3xl font-bold text-foreground">
									{stat.value}
								</span>
								{stat.icon && <stat.icon className="w-5 h-5 text-yellow-500 fill-yellow-500" />}
							</div>
							<span className="text-sm text-muted-foreground">{stat.label}</span>
						</div>
					))}
				</div>

				<div className="mb-16">
					<h2 className="text-2xl font-bold text-foreground mb-8 text-center">
						What Our Customers Say
					</h2>
					<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
						{testimonials.map((testimonial, index) => (
							<div
								key={index}
								className="bg-card border border-border rounded-xl p-6"
							>
								<Quote className="w-8 h-8 text-primary/30 mb-4" />
								<p className="text-muted-foreground mb-6 italic">
									"{testimonial.quote}"
								</p>
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-semibold">
										{testimonial.name.charAt(0)}
									</div>
									<div>
										<div className="font-medium text-foreground">
											{testimonial.name}
										</div>
										<div className="text-sm text-muted-foreground">
											{testimonial.role}, {testimonial.company}
										</div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-card border border-border rounded-xl p-8 text-center">
					<h2 className="text-2xl font-bold text-foreground mb-2">
						Ready to Get Started?
					</h2>
					<p className="text-muted-foreground mb-6">
						Join thousands of creators who trust Puzzle for their content.
					</p>
					<Button
						variant="default"
						size="lg"
						className="bg-foreground text-background hover:opacity-90"
						onClick={() => navigate("/register")}
					>
						Start Free Trial
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CustomersPage;
