import {useNavigate} from "react-router-dom";
import {ArrowLeft} from "lucide-react";
import {FaDiscord, FaFacebook} from "react-icons/fa";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const communities = [
	{
		icon: FaDiscord,
		name: "community.discord.name",
		description: "community.discord.description",
		members: "community.discord.members",
		link: "https://discord.com",
		color: "text-[#5865F2]",
	},
	{
		icon: FaFacebook,
		name: "community.facebook.name",
		description: "community.facebook.description",
		members: "community.facebook.members",
		link: "https://facebook.com",
		color: "text-[#1877F2]",
	},
];

const CommunityPage = () => {
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
						{t("community.title")}
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t("community.subtitle")}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
					{communities.map((community, index) => {
						const Icon = community.icon;
						return (
							<button
								key={index}
								onClick={() => window.open(community.link, "_blank")}
								className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:border-primary/50 transition-all duration-200 flex flex-col h-full"
							>
								<Icon className={`w-10 h-10 ${community.color} mb-4`} />
								<h3 className="text-lg font-semibold text-foreground mb-2">
									{t(community.name)}
								</h3>
								<p className="text-sm text-muted-foreground mb-4 flex-1">
									{t(community.description)}
								</p>
								<span className="text-xs text-primary font-medium">
									{t(community.members)}
								</span>
							</button>
						);
					})}
				</div>

				<div className="bg-card border border-border rounded-xl p-8 text-center">
					<h2 className="text-2xl font-bold text-foreground mb-2">
						{t("community.share.title")}
					</h2>
					<p className="text-muted-foreground mb-6">
						{t("community.share.description")}
					</p>
					<Button
						variant="default"
						className="bg-foreground text-background hover:opacity-90"
						onClick={() => navigate("/contact")}
					>
						{t("community.share.cta")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CommunityPage;
