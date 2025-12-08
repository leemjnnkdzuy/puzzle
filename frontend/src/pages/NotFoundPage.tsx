import {useNavigate} from "react-router-dom";
import {FaHome, FaArrowLeft} from "react-icons/fa";
import Button from "@/components/ui/Button";
import {useLanguage} from "@/hooks/useLanguage";

const NotFoundPage = () => {
	const navigate = useNavigate();
	const {t} = useLanguage();

	const title = t("notFound.title") as string;
	const message = t("notFound.message") as string;
	const description = t("notFound.description") as string;
	const goHome = t("notFound.goHome") as string;
	const goBack = t("notFound.goBack") as string;

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
		<div className='relative flex flex-col justify-center items-center min-h-screen bg-background px-4 py-8 transition-colors duration-300'>
			<div className='w-full max-w-2xl rounded-2xl p-8 md:p-12 text-center'>
				<div className='mb-6'>
					<h1 className='text-9xl md:text-[12rem] font-bold text-transparent bg-clip-text bg-gradient-to-r from-gray-400 via-gray-600 to-gray-800 dark:from-gray-500 dark:via-gray-400 dark:to-gray-300 leading-none'>
						404
					</h1>
				</div>

				<h2 className='text-3xl md:text-4xl font-bold text-foreground mb-4 transition-colors duration-300'>
					{title}
				</h2>

				<p className='text-xl md:text-2xl text-muted-foreground mb-3 transition-colors duration-300'>
					{message}
				</p>

				<p className='text-base md:text-lg text-muted-foreground/80 mb-8 max-w-md mx-auto transition-colors duration-300'>
					{description}
				</p>

				<div className='flex flex-col sm:flex-row gap-4 justify-center items-center'>
					<Button
						onClick={handleGoBack}
						variant='outline'
						className='w-full sm:w-auto border-border hover:bg-accent px-8 py-3 transition-colors duration-300'
						size='lg'
					>
						<FaArrowLeft className='w-5 h-5' />
						{goBack}
					</Button>
					<Button
						onClick={handleGoHome}
						className='w-full sm:w-auto bg-foreground text-background hover:opacity-90 dark:bg-foreground dark:text-background px-8 py-3 transition-colors duration-300'
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


export default NotFoundPage;
