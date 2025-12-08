import {useNavigate} from "react-router-dom";
import {ArrowLeft, Code, Terminal, Key} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const ApiPage = () => {
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
						API Reference
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						Integrate Puzzle into your applications with our REST API.
					</p>
				</div>

				<div className="space-y-8">
					<div className="bg-card border border-border rounded-xl p-6">
						<div className="flex items-center gap-3 mb-4">
							<Key className="w-5 h-5 text-primary" />
							<h2 className="text-xl font-semibold text-foreground">
								Authentication
							</h2>
						</div>
						<p className="text-muted-foreground mb-4">
							All API requests require an API key. Include your key in the Authorization header:
						</p>
						<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
							<code className="text-foreground">
								Authorization: Bearer YOUR_API_KEY
							</code>
						</div>
					</div>

					<div className="bg-card border border-border rounded-xl p-6">
						<div className="flex items-center gap-3 mb-4">
							<Terminal className="w-5 h-5 text-primary" />
							<h2 className="text-xl font-semibold text-foreground">
								Base URL
							</h2>
						</div>
						<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
							<code className="text-foreground">
								https://api.puzzle.com/v1
							</code>
						</div>
					</div>

					<div className="bg-card border border-border rounded-xl p-6">
						<div className="flex items-center gap-3 mb-4">
							<Code className="w-5 h-5 text-primary" />
							<h2 className="text-xl font-semibold text-foreground">
								Example Request
							</h2>
						</div>
						<div className="bg-muted rounded-lg p-4 font-mono text-sm overflow-x-auto">
							<pre className="text-foreground whitespace-pre-wrap">{`curl -X POST https://api.puzzle.com/v1/scripts \\
  -H "Authorization: Bearer YOUR_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"prompt": "Create a video script..."}'`}</pre>
						</div>
					</div>
				</div>

				<div className="mt-12 text-center">
					<p className="text-muted-foreground mb-4">
						Get your API key from your account settings.
					</p>
					<Button
						variant="default"
						className="bg-foreground text-background hover:opacity-90"
						onClick={() => navigate("/settings")}
					>
						Get API Key
					</Button>
				</div>
			</div>
		</div>
	);
};

export default ApiPage;
