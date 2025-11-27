import {useNavigate} from "react-router-dom";
import {FaHome, FaArrowLeft} from "react-icons/fa";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const NotFoundPage = () => {
	const navigate = useNavigate();
	const {getNested} = useLanguage();

	const title = getNested?.("notFound.title") as string;
	const message = getNested?.("notFound.message") as string;
	const description = getNested?.("notFound.description") as string;
	const goHome = getNested?.("notFound.goHome") as string;
	const goBack = getNested?.("notFound.goBack") as string;

	const handleGoHome = () => {
		navigate("/");
	};

	const handleGoBack = () => {
		if (window.history.length > 1) {
			navigate(-1);
		} else {
			navigate("/");
		}
	};

	return (
		<div className='relative flex flex-col justify-center items-center min-h-screen bg-gray-50 px-4 py-8'>
			<div className='w-full max-w-2xl rounded-2xl p-8 md:p-12 text-center'>
				<div className='mb-6'>
					<h1 className='text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 leading-none'>
						404
					</h1>
				</div>

				<h2 className='text-3xl md:text-4xl font-bold text-gray-900 mb-4'>
					{title}
				</h2>

				<p className='text-xl md:text-2xl text-gray-600 mb-3'>
					{message}
				</p>

				<p className='text-base md:text-lg text-gray-500 mb-8 max-w-md mx-auto'>
					{description}
				</p>

				<div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
					<Button
						onClick={handleGoBack}
						variant='outline'
						className='w-full sm:w-auto border-gray-300 hover:bg-gray-50 px-8 py-3'
						size='lg'
					>
						<FaArrowLeft className='w-5 h-5' />
						{goBack}
					</Button>
					<Button
						onClick={handleGoHome}
						className='w-full sm:w-auto bg-black text-white hover:bg-gray-800 px-8 py-3'
						size='lg'
					>
						<FaHome className='w-5 h-5' />
						{goHome}
					</Button>
				</div>
			</div>
		</div>
	);
};

NotFoundPage.displayName = "NotFoundPage";
export default NotFoundPage;
