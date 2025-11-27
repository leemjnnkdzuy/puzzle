import Loading from "@/components/ui/Loading";

const AppLoader = () => {
	return (
		<div className='flex justify-center items-center h-screen text-lg text-gray-600'>
			<Loading size='50px' />
		</div>
	);
};

AppLoader.displayName = "AppLoader";
export default AppLoader;
