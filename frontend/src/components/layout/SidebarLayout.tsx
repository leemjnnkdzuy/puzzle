import React, {useState, useEffect} from "react";
import GlobalSidebar from "@/components/common/GlobalSidebar";

interface SidebarLayoutProps {
	children: React.ReactNode;
}

const SidebarLayout: React.FC<SidebarLayoutProps> = ({children}) => {
	const [isCollapsed, setIsCollapsed] = useState(false);

	useEffect(() => {
		const handleResize = () => {
			const shouldCollapse = window.innerWidth < 1200;
			setIsCollapsed(shouldCollapse);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className='flex h-screen overflow-hidden bg-background transition-colors duration-300'>
			<GlobalSidebar
				isCollapsed={isCollapsed}
				onToggleCollapse={() => setIsCollapsed(!isCollapsed)}
			/>
			<main className='flex-1 overflow-y-auto bg-background transition-colors duration-300'>
				<div className='h-full'>{children}</div>
			</main>
		</div>
	);
};


export default SidebarLayout;
