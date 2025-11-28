import {useMemo} from "react";
import {useLanguage} from "../hooks/useLanguage";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "../components/ui/DropdownMenu";
import {Globe} from "lucide-react";
import enDocument from "../lang/PrivacyPolicy/en.json";
import viDocument from "../lang/PrivacyPolicy/vi.json";

const PrivacyPolicyPage = () => {
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

	const renderList = (items: string[]) => {
		return (
			<ul className='list-disc list-inside space-y-2 ml-4 mb-4'>
				{items.map((item, idx) => (
					<li key={idx} dangerouslySetInnerHTML={{__html: item}} />
				))}
			</ul>
		);
	};

	const renderTable = (table: {headers: string[]; rows: string[][]}) => {
		return (
			<div className='overflow-x-auto mb-6'>
				<table className='min-w-full border border-gray-300'>
					<thead>
						<tr className='bg-gray-50'>
							{table.headers.map((header, idx) => (
								<th
									key={idx}
									className='border border-gray-300 px-4 py-2 text-left text-sm font-semibold text-gray-900'
									dangerouslySetInnerHTML={{__html: header}}
								/>
							))}
						</tr>
					</thead>
					<tbody>
						{table.rows.map((row, rowIdx) => (
							<tr key={rowIdx} className='bg-white'>
								{row.map((cell, cellIdx) => (
									<td
										key={cellIdx}
										className='border border-gray-300 px-4 py-2 text-sm text-gray-700'
										dangerouslySetInnerHTML={{__html: cell}}
									/>
								))}
							</tr>
						))}
					</tbody>
				</table>
			</div>
		);
	};

	return (
		<div className='min-h-screen bg-white pt-24 pb-16'>
			<div className='max-w-4xl mx-auto px-6 py-8'>
				<div className='mb-8 flex items-start justify-between'>
					<div>
						<h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
							{document.title}
						</h1>
						<p className='text-gray-600 text-sm'>
							{document.lastUpdated}{" "}
							{formatDate(new Date("2024-03-04"))}
						</p>
					</div>
					<DropdownMenu>
						<DropdownMenuTrigger asChild>
							<button className='flex items-center gap-2 text-sm text-gray-600 hover:text-gray-900 transition-colors bg-transparent border border-gray-200 rounded-lg px-3 py-2 hover:bg-gray-50'>
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

				<div className='prose prose-lg max-w-none'>
					<div className='mb-8 text-gray-700 leading-relaxed'>
						{renderContent(document.intro)}
					</div>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["1"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["1"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["2"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{document.sections["2"].table &&
								renderTable(document.sections["2"].table)}
							{renderContent(document.sections["2"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["3"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["3"].content)}
							{document.sections["3"].subsections &&
								Object.keys(
									document.sections["3"].subsections
								).map((key) => {
									const subsection = (
										document.sections["3"]
											.subsections as Record<
											string,
											{
												title: string;
												content: string | string[];
											}
										>
									)[key];
									return (
										<div key={key} className='mt-4'>
											<h3 className='text-lg font-semibold text-gray-900 mb-2'>
												{subsection.title}
											</h3>
											{renderContent(subsection.content)}
										</div>
									);
								})}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["4"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["4"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["5"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{document.sections["5"].items &&
								renderList(document.sections["5"].items)}
							{renderContent(document.sections["5"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["6"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["6"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["7"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["7"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["8"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["8"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["9"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["9"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["10"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["10"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["11"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["11"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["12"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["12"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["13"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["13"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["14"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["14"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["15"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["15"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["16"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["16"].content)}
							{document.sections["16"].items &&
								renderList(document.sections["16"].items)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["17"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["17"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["18"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["18"].content)}
							{document.sections["18"].items && (
								<ul className='list-disc list-inside space-y-2 ml-4 mb-4'>
									{document.sections["18"].items.map(
										(item, idx) => (
											<li
												key={idx}
												className='text-gray-700'
											>
												{item.label && (
													<strong>
														{item.label}
													</strong>
												)}
												{item.content && (
													<span
														dangerouslySetInnerHTML={{
															__html: item.content,
														}}
													/>
												)}
											</li>
										)
									)}
								</ul>
							)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["19"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["19"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["20"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["20"].content)}
						</div>
					</section>

					<section className='mb-10'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.sections["21"].title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.sections["21"].content)}
							{document.sections["21"].subsections &&
								Object.keys(
									document.sections["21"].subsections
								).map((key) => {
									const subsection = (
										document.sections["21"]
											.subsections as Record<
											string,
											{title: string; content: string}
										>
									)[key];
									return (
										<div key={key} className='mt-4'>
											<h3 className='text-lg font-semibold text-gray-900 mb-2'>
												{subsection.title}
											</h3>
											<div className='text-gray-700 whitespace-pre-line'>
												{subsection.content}
											</div>
										</div>
									);
								})}
						</div>
					</section>

					<div className='mt-12 pt-8 border-t border-gray-200'>
						<h2 className='text-2xl font-bold text-gray-900 mb-4'>
							{document.contact.title}
						</h2>
						<div className='space-y-4 text-gray-700 leading-relaxed'>
							{renderContent(document.contact.content)}
							{document.contact.addresses &&
								Object.keys(document.contact.addresses).length >
									0 &&
								Object.keys(document.contact.addresses).map(
									(key) => {
										const address = (
											document.contact
												.addresses as Record<
												string,
												{title: string; content: string}
											>
										)[key];
										return (
											<div key={key} className='mt-4'>
												<h3 className='text-lg font-semibold text-gray-900 mb-2'>
													{address.title}
												</h3>
												<div className='text-gray-700 whitespace-pre-line'>
													{address.content}
												</div>
											</div>
										);
									}
								)}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

PrivacyPolicyPage.displayName = "PrivacyPolicyPage";
export default PrivacyPolicyPage;
