import {useNavigate} from "react-router-dom";
import {ArrowLeft, HelpCircle, MessageCircle, Book, Mail} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const faqs = [
	{
		question: "help.faq.items.started.question",
		answer: "help.faq.items.started.answer",
	},
	{
		question: "help.faq.items.payment.question",
		answer: "help.faq.items.payment.answer",
	},
	{
		question: "help.faq.items.cancel.question",
		answer: "help.faq.items.cancel.answer",
	},
	{
		question: "help.faq.items.refunds.question",
		answer: "help.faq.items.refunds.answer",
	},
];

const HelpPage = () => {
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
						{t("help.title")}
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t("help.subtitle")}
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-12">
					<button
						onClick={() => navigate("/docs")}
						className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:border-primary/50 transition-all duration-200"
					>
						<Book className="w-8 h-8 text-primary mb-3" />
						<h3 className="font-semibold text-foreground mb-1">
							{t("help.cards.documentation.title")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("help.cards.documentation.description")}
						</p>
					</button>
					<button
						onClick={() => navigate("/community")}
						className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:border-primary/50 transition-all duration-200"
					>
						<MessageCircle className="w-8 h-8 text-primary mb-3" />
						<h3 className="font-semibold text-foreground mb-1">
							{t("help.cards.community.title")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("help.cards.community.description")}
						</p>
					</button>
					<button
						onClick={() => navigate("/contact")}
						className="bg-card border border-border rounded-xl p-6 text-left hover:shadow-lg hover:border-primary/50 transition-all duration-200"
					>
						<Mail className="w-8 h-8 text-primary mb-3" />
						<h3 className="font-semibold text-foreground mb-1">
							{t("help.cards.contact.title")}
						</h3>
						<p className="text-sm text-muted-foreground">
							{t("help.cards.contact.description")}
						</p>
					</button>
				</div>

				<div className="mb-12">
					<h2 className="text-2xl font-bold text-foreground mb-6 flex items-center gap-2">
						<HelpCircle className="w-6 h-6" />
						{t("help.faq.title")}
					</h2>
					<div className="space-y-4">
						{faqs.map((faq, index) => (
							<div
								key={index}
								className="bg-card border border-border rounded-xl p-6"
							>
								<h3 className="font-semibold text-foreground mb-2">
									{t(faq.question)}
								</h3>
								<p className="text-muted-foreground text-sm">{t(faq.answer)}</p>
							</div>
						))}
					</div>
				</div>
			</div>
		</div>
	);
};

export default HelpPage;
