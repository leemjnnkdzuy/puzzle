import {useMemo} from "react";
import {useLanguage} from "@/hooks/useLanguage";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {Globe} from "lucide-react";
import enDocument from "@/lang/TermsOfService/en.json";
import viDocument from "@/lang/TermsOfService/vi.json";

const TermsOfServicePage = () => {
	const {language, setLanguage} = useLanguage();

	const document = useMemo(() => {
		return language === "en" ? enDocument : viDocument;
	}, [language]);

	const formatDate = (date: Date) => {
		if (language === "vi") {
			return date.toLocaleDateString("vi-VN", {
				year: "numeric",
				month: "long",
				day: "numeric",
			});
		}
		return date.toLocaleDateString("en-US", {
			year: "numeric",
			month: "long",
			day: "numeric",
		});
	};

	const renderContent = (content: string | string[]) => {
		if (Array.isArray(content)) {
			return content.map((para, idx) => (
				<p
					key={idx}
					className='mb-4'
					dangerouslySetInnerHTML={{__html: para}}
				/>
			));
		}
		return (
			<p className='mb-4' dangerouslySetInnerHTML={{__html: content}} />
		);
	};

	return (
		<div className='min-h-screen bg-background pt-24 pb-16 transition-colors duration-300'>
			<div className='max-w-4xl mx-auto px-6 py-8'>
				<div className='mb-8 flex items-start justify-between'>
					<div>
						<h1 className='text-4xl md:text-5xl font-bold text-foreground mb-4'>
							{document.title}
						</h1>
						<p className='text-muted-foreground text-sm'>
							{document.lastUpdated}{" "}
							{formatDate(new Date("2025-11-28"))}
						</p>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className='flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors bg-transparent border border-border rounded-lg px-3 py-2 hover:bg-accent'>
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
							align='end'
							className='bg-card border border-border min-w-[120px]'
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

				<div className='prose prose-lg max-w-none'>
					<div className='mb-8 text-foreground leading-relaxed'>
						<p
							className='mb-4'
							dangerouslySetInnerHTML={{
								__html: document.intro.p1,
							}}
						/>
						<p
							className='mb-4'
							dangerouslySetInnerHTML={{
								__html: document.intro.p2,
							}}
						/>
						<p
							className='mb-4'
							dangerouslySetInnerHTML={{
								__html: document.intro.p3,
							}}
						/>
					</div>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["1"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["1"]["1.1"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["1"]["1.1"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["1"]["1.2"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["1"]["1.2"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["1"]["1.3"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["1"]["1.3"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["1"]["1.4"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["1"]["1.4"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["1"]["1.5"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["1"]["1.5"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["1"]["1.6"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["1"]["1.6"]
											.content,
									}}
								/>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["2"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["2"]["2.1"].title}
								</h3>
								<p className='mb-2'>
									{document.sections["2"]["2.1"].intro}
								</p>
								<ul className='list-disc list-inside space-y-2 ml-4'>
									{document.sections["2"]["2.1"].items.map(
										(item: string, idx: number) => (
											<li
												key={idx}
												dangerouslySetInnerHTML={{
													__html: item,
												}}
											/>
										)
									)}
								</ul>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["2"]["2.2"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["2"]["2.2"]
											.content,
									}}
								/>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["3"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["3"]["3.1"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["3"]["3.1"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["3"]["3.2"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["3"]["3.2"]
											.content,
									}}
								/>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["4"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							{renderContent(document.sections["4"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["5"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							{renderContent(document.sections["5"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["6"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							{renderContent(document.sections["6"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["7"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<p
								dangerouslySetInnerHTML={{
									__html: document.sections["7"].content,
								}}
							/>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["8"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<p
								dangerouslySetInnerHTML={{
									__html: document.sections["8"].content,
								}}
							/>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["9"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["9"]["9.1"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["9"]["9.1"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["9"]["9.2"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["9"]["9.2"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["9"]["9.3"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["9"]["9.3"]
											.content,
									}}
								/>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections["10"].title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["10"]["10.1"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["10"]["10.1"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["10"]["10.2"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["10"]["10.2"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["10"]["10.3"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["10"]["10.3"]
											.content,
									}}
								/>
							</div>
							<div>
								<h3 className='text-lg font-semibold text-foreground mb-2'>
									{document.sections["10"]["10.4"].title}
								</h3>
								<p
									dangerouslySetInnerHTML={{
										__html: document.sections["10"]["10.4"]
											.content,
									}}
								/>
							</div>
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections.exhibitA.title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							{renderContent(document.sections.exhibitA.content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-foreground mb-4'>
							{document.sections.exhibitB.title}
						</h2>
						<div className='space-y-4 text-foreground leading-relaxed'>
							{renderContent(document.sections.exhibitB.content)}
						</div>
					</section>

					<div className='mt-12 pt-8 border-t border-border'>
						<p className='text-muted-foreground text-sm'>
							{document.contact.text}{" "}
							<a
								href={`mailto:${document.contact.email}`}
								className='text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 underline'
							>
								{document.contact.email}
							</a>
							.
						</p>
					</div>
				</div>
			</div>
		</div>
	);
};

export default TermsOfServicePage;
