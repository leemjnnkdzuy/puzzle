import {useNavigate} from "react-router-dom";
import {ArrowLeft, Mail, MapPin, Phone} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const ContactPage = () => {
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
						Contact Us
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Have questions? We'd love to hear from you.
					</p>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-2 gap-8">
					<div className="space-y-6">
						<div className="bg-card border border-border rounded-xl p-6">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<Mail className="w-5 h-5 text-primary" />
								</div>
								<h3 className="text-lg font-semibold text-foreground">Email</h3>
							</div>
							<p className="text-muted-foreground">support@puzzle.com</p>
						</div>

						<div className="bg-card border border-border rounded-xl p-6">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<Phone className="w-5 h-5 text-primary" />
								</div>
								<h3 className="text-lg font-semibold text-foreground">Phone</h3>
							</div>
							<p className="text-muted-foreground">+1 (555) 123-4567</p>
						</div>

						<div className="bg-card border border-border rounded-xl p-6">
							<div className="flex items-center gap-3 mb-3">
								<div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
									<MapPin className="w-5 h-5 text-primary" />
								</div>
								<h3 className="text-lg font-semibold text-foreground">Office</h3>
							</div>
							<p className="text-muted-foreground">
								123 Innovation Street<br />
								San Francisco, CA 94102
							</p>
						</div>
					</div>

					<div className="bg-card border border-border rounded-xl p-6">
						<h2 className="text-xl font-semibold text-foreground mb-6">
							Send us a message
						</h2>
						<form className="space-y-4">
							<div>
								<label className="block text-sm font-medium text-foreground mb-2">
									Name
								</label>
								<input
									type="text"
									className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="Your name"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-2">
									Email
								</label>
								<input
									type="email"
									className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary"
									placeholder="you@example.com"
								/>
							</div>
							<div>
								<label className="block text-sm font-medium text-foreground mb-2">
									Message
								</label>
								<textarea
									rows={4}
									className="w-full px-4 py-2 rounded-lg border border-border bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary resize-none"
									placeholder="How can we help?"
								/>
							</div>
							<Button
								type="submit"
								variant="default"
								className="w-full bg-foreground text-background hover:opacity-90"
							>
								Send Message
							</Button>
						</form>
					</div>
				</div>
			</div>
		</div>
	);
};

export default ContactPage;
