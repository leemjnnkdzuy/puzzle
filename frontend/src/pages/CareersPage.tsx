import {useNavigate} from "react-router-dom";
import {ArrowLeft, MapPin, Briefcase} from "lucide-react";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const jobs = [
	{
		title: "careers.jobs.frontend",
		department: "careers.jobs.engineering",
		location: "careers.jobs.remote",
		type: "careers.jobs.fullTime",
	},
	{
		title: "careers.jobs.backend",
		department: "careers.jobs.engineering",
		location: "careers.jobs.sf",
		type: "careers.jobs.fullTime",
	},
	{
		title: "careers.jobs.productDesigner",
		department: "careers.jobs.design",
		location: "careers.jobs.remote",
		type: "careers.jobs.fullTime",
	},
	{
		title: "careers.jobs.aiEngineer",
		department: "careers.jobs.aiResearch",
		location: "careers.jobs.remote",
		type: "careers.jobs.fullTime",
	},
];

const CareersPage = () => {
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
						{t("careers.title")}
					</h1>
					<p className="text-lg text-muted-foreground max-w-2xl mx-auto">
						{t("careers.subtitle")}
					</p>
				</div>

				<div className="mb-12">
					<h2 className="text-2xl font-bold text-foreground mb-6">
						{t("careers.openPositions")}
					</h2>
					<div className="space-y-4">
						{jobs.map((job, index) => (
							<div
								key={index}
								className="bg-card border border-border rounded-xl p-6 hover:shadow-lg transition-shadow duration-200 cursor-pointer"
							>
								<div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
									<div>
										<h3 className="text-lg font-semibold text-foreground mb-1">
											{t(job.title)}
										</h3>
										<div className="flex flex-wrap items-center gap-3 text-sm text-muted-foreground">
											<span className="flex items-center gap-1">
												<Briefcase className="w-4 h-4" />
												{t(job.department)}
											</span>
											<span className="flex items-center gap-1">
												<MapPin className="w-4 h-4" />
												{t(job.location)}
											</span>
											<span className="px-2 py-0.5 bg-primary/10 text-primary rounded-full text-xs">
												{t(job.type)}
											</span>
										</div>
									</div>
									<Button variant="outline" size="sm">
										{t("careers.applyNow")}
									</Button>
								</div>
							</div>
						))}
					</div>
				</div>

				<div className="bg-card border border-border rounded-xl p-8 text-center">
					<h2 className="text-2xl font-bold text-foreground mb-2">
						{t("careers.noFit.title")}
					</h2>
					<p className="text-muted-foreground mb-6">
						{t("careers.noFit.subtitle")}
					</p>
					<Button
						variant="default"
						className="bg-foreground text-background hover:opacity-90"
						onClick={() => navigate("/contact")}
					>
						{t("careers.noFit.contact")}
					</Button>
				</div>
			</div>
		</div>
	);
};

export default CareersPage;
