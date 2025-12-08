import {useNavigate} from "react-router-dom";
import {ArrowLeft, Book, Code, FileText, Zap} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const docSections = [
	{
		icon: Zap,
		title: "Getting Started",
		description: "Learn the basics and get up and running quickly.",
		link: "#",
	},
	{
		icon: Book,
		title: "Guides",
		description: "Step-by-step tutorials for common use cases.",
		link: "#",
	},
	{
		icon: Code,
		title: "API Reference",
		description: "Complete API documentation for developers.",
		link: "/api",
	},
	{
		icon: FileText,
		title: "Examples",
		description: "Sample projects and code snippets.",
		link: "#",
	},
];

const DocsPage = () => {
	const navigate = useNavigate();
	const {t} = useLanguage();

	return (
		<div className="min-h-screen bg-background pt-24 pb-16">
			<div className="max-w-4xl mx-auto px-6">
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
						Documentation
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Everything you need to know about using Puzzle.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
					{docSections.map((section, index) => {
						const Icon = section.icon;
						return (
							<button
								key={index}
								onClick={() => section.link.startsWith("/") && navigate(section.link)}
								className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:border-primary/50 transition-all duration-200 cursor-pointer"
							>
								<div className="flex items-start gap-4">
									<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
										<Icon className="w-5 h-5 text-primary" />
									</div>
									<div>
										<h3 className="text-lg font-semibold text-foreground mb-1">
											{section.title}
										</h3>
										<p className="text-sm text-muted-foreground">
											{section.description}
										</p>
									</div>
								</div>
							</button>
						);
					})}
				</div>

				<div className="mt-16 bg-card border border-border rounded-xl p-8 text-center">
					<h2 className="text-2xl font-bold text-foreground mb-2">
						Need Help?
					</h2>
					<p className="text-muted-foreground mb-6">
						Can't find what you're looking for? Contact our support team.
					</p>
					<Button
						variant="outline"
						onClick={() => navigate("/help")}
					>
						Visit Help Center
					</Button>
				</div>
			</div>
		</div>
	);
};

export default DocsPage;
