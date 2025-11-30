import React from "react";
import {FaGithub, FaFacebook, FaInstagram} from "react-icons/fa";
import Assets from "@/configs/AssetsConfig";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const AboutPage: React.FC = () => {
	const {getNested} = useLanguage();

	const about = getNested?.("about") as
		| {
				title: string;
				subtitle: string;
				duy: {name: string; quote1: string; quote2: string};
				truong: {name: string; quote1: string; quote2: string};
				social: {facebook: string; github: string; instagram: string};
		  }
		| undefined;

	return (
		<div className='min-h-screen bg-white pt-32 pb-20'>
			<div className='max-w-7xl mx-auto px-6'>
				<div className='text-center mb-16'>
					<h1 className='text-4xl md:text-5xl font-bold text-gray-900 mb-4'>
						{about?.title || "Về Chúng Tôi"}
					</h1>
					<p className='text-lg text-gray-600 max-w-2xl mx-auto'>
						{about?.subtitle ||
							"Hai developer trẻ đầy nhiệt huyết, quyết tâm tạo ra những sản phẩm chất lượng với một chút... sex quá ông ơi!"}
					</p>
				</div>

				<div className='flex flex-col gap-12 max-w-5xl mx-auto'>
					<div className='bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
						<div className='flex flex-col md:flex-row items-center md:items-start gap-6 p-8'>
							<div className='flex-shrink-0'>
								<div className='relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg'>
									<img
										src={Assets.Leemjnnkdzuy}
										alt='Duy Lê'
										className='w-full h-full object-cover'
									/>
								</div>
							</div>
							<div className='flex-1 text-center md:text-left'>
								<h2 className='text-2xl font-bold text-gray-900 mb-2'>
									{about?.duy?.name ||
										"Duy Lê (leemjnnkdzuy)"}
								</h2>
								<p className='text-gray-600 leading-relaxed'>
									{about?.duy?.quote1 ||
										'"Thí dụ giờ có 10 tỷ mày sẽ làm gì ?"'}
								</p>
								<p className='text-gray-600 mb-6 leading-relaxed'>
									{about?.duy?.quote2 ||
										'"Thí dụ giờ Nghĩa Trần bị bắt cóc, mà tụi nó bắt mày ăn cứt cứu Nghĩa Trần mày có cứu không ?"'}
								</p>

								<div className='flex items-center justify-center md:justify-start gap-4'>
									<Button
										variant='outline'
										size='icon'
										onClick={() =>
											window.open(
												"https://www.facebook.com/leemjnnkdzuy",
												"_blank",
												"noopener,noreferrer"
											)
										}
										className='w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors'
										aria-label={
											about?.social?.facebook ||
											"Facebook"
										}
									>
										<FaFacebook className='w-5 h-5' />
									</Button>
									<Button
										variant='outline'
										size='icon'
										onClick={() =>
											window.open(
												"https://github.com/leemjnnkdzuy",
												"_blank",
												"noopener,noreferrer"
											)
										}
										className='w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
										aria-label={
											about?.social?.github || "GitHub"
										}
									>
										<FaGithub className='w-5 h-5' />
									</Button>
									<Button
										variant='outline'
										size='icon'
										onClick={() =>
											window.open(
												"https://www.instagram.com/leemjnnkdzuy/",
												"_blank",
												"noopener,noreferrer"
											)
										}
										className='w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-pink-600 hover:border-pink-300 transition-colors'
										aria-label={
											about?.social?.instagram ||
											"Instagram"
										}
									>
										<FaInstagram className='w-5 h-5' />
									</Button>
								</div>
							</div>
						</div>
					</div>

					<div className='bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden hover:shadow-xl transition-shadow duration-300'>
						<div className='flex flex-col md:flex-row-reverse items-center md:items-start gap-6 p-8'>
							<div className='flex-shrink-0'>
								<div className='relative w-32 h-32 md:w-40 md:h-40 rounded-full overflow-hidden border-4 border-gray-200 shadow-lg'>
									<img
										src={Assets.TruongSoCute}
										alt='Trường'
										className='w-full h-full object-cover'
									/>
								</div>
							</div>
							<div className='flex-1 text-center md:text-right'>
								<h2 className='text-2xl font-bold text-gray-900 mb-2'>
									{about?.truong?.name ||
										"Ngô Trường (TruongSoCute)"}
								</h2>
								<p className='text-gray-600 leading-relaxed'>
									{about?.truong?.quote1 ||
										'"Giờ mà tao giàu thì đcm tao bao nuôi chục con."'}
								</p>
								<p className='text-gray-600 mb-6 leading-relaxed'>
									{about?.truong?.quote2 ||
										'"Xàm lồn quá ông ơi."'}
								</p>
								<div className='flex items-center justify-center md:justify-end gap-4'>
									<Button
										variant='outline'
										size='icon'
										onClick={() =>
											window.open(
												"https://www.facebook.com/ngo.truong.803211",
												"_blank",
												"noopener,noreferrer"
											)
										}
										className='w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-blue-600 hover:border-blue-300 transition-colors'
										aria-label={
											about?.social?.facebook ||
											"Facebook"
										}
									>
										<FaFacebook className='w-5 h-5' />
									</Button>
									<Button
										variant='outline'
										size='icon'
										onClick={() =>
											window.open(
												"https://github.com/truongsocute",
												"_blank",
												"noopener,noreferrer"
											)
										}
										className='w-10 h-10 rounded-lg border border-gray-200 text-gray-600 hover:text-gray-900 hover:border-gray-300 transition-colors'
										aria-label={
											about?.social?.github || "GitHub"
										}
									>
										<FaGithub className='w-5 h-5' />
									</Button>
								</div>
							</div>
						</div>
					</div>
				</div>
			</div>
		</div>
	);
};

AboutPage.displayName = "AboutPage";
export default AboutPage;
