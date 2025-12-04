import React, {useState, useEffect} from "react";
import {ChevronLeft, ChevronRight} from "lucide-react";
import {useLanguage} from "@/hooks/useLanguage";
import {cn} from "@/utils";
import GlobalSidebar from "@/components/common/GlobalSidebar";

interface DoubleSidebarLayoutProps {
	children: React.ReactNode;
	rightSidebar?: React.ReactNode;
}

const DoubleSidebarLayout: React.FC<DoubleSidebarLayoutProps> = ({
	children,
	rightSidebar,
}) => {
	const [isLeftCollapsed, setIsLeftCollapsed] = useState(false);
	const [isRightCollapsed, setIsRightCollapsed] = useState(false);
	const {getNested} = useLanguage();

	const sidebar = getNested?.("sidebar") as
		| {
				collapse: string;
				expand: string;
		  }
		| undefined;

	useEffect(() => {
		const handleResize = () => {
			const shouldCollapse = window.innerWidth < 1200;
			setIsLeftCollapsed(shouldCollapse);
			setIsRightCollapsed(shouldCollapse);
		};

		handleResize();

		window.addEventListener("resize", handleResize);

		return () => {
			window.removeEventListener("resize", handleResize);
		};
	}, []);

	return (
		<div className='flex flex-col lg:flex-row h-screen overflow-hidden bg-background transition-colors duration-300'>
			<div className='hidden lg:flex'>
				<GlobalSidebar
					isCollapsed={isLeftCollapsed}
					onToggleCollapse={() =>
						setIsLeftCollapsed(!isLeftCollapsed)
					}
					className={isLeftCollapsed ? "w-16" : "w-64"}
				/>
			</div>

			<main className='flex-1 overflow-hidden bg-background transition-colors duration-300 order-2 lg:order-2'>
				<div className='h-full overflow-y-auto'>{children}</div>
			</main>

			{rightSidebar && (
				<aside
					className={cn(
						"h-full flex flex-col overflow-hidden transition-all duration-300 background flex-shrink-0",
						isRightCollapsed ? "w-16" : "w-64",
						"hidden lg:flex order-3"
					)}
				>
					<div className='flex-1 overflow-hidden no-scrollbar'>
						<div
							className={cn(
								"p-4 overflow-y-auto",
								isRightCollapsed && "px-2"
							)}
						>
							{!isRightCollapsed ? (
								rightSidebar
							) : (
								<div className='flex flex-col items-center space-y-4'>
									{/* Collapsed view - can show icons or minimal content */}
								</div>
							)}
						</div>
					</div>

					<div
						className={cn(
							"px-2 pt-1 pb-2 flex-shrink-0",
							isRightCollapsed &&
								"px-1 border-t border-sidebar-border"
						)}
					>
						<button
							onClick={() =>
								setIsRightCollapsed(!isRightCollapsed)
							}
							className={cn(
								"w-full flex items-center justify-center p-2 rounded-lg hover:bg-sidebar-accent transition-colors duration-300",
								isRightCollapsed ? "px-0" : "gap-2"
							)}
							title={
								isRightCollapsed
									? (sidebar?.expand as string) || "Expand"
									: (sidebar?.collapse as string) ||
									  "Collapse"
							}
						>
							{isRightCollapsed ? (
								<ChevronLeft className='w-5 h-5 text-sidebar-foreground/80' />
							) : (
								<>
									<ChevronRight className='w-5 h-5 text-sidebar-foreground/80' />
									{!isRightCollapsed && (
										<span className='text-sm text-sidebar-foreground/80'>
											{(sidebar?.collapse as string) ||
												"Collapse"}
										</span>
									)}
								</>
							)}
						</button>
					</div>
				</aside>
			)}

			<div className='lg:hidden flex flex-col w-full order-1'>
				<div className='w-full border-b border-sidebar-border'>
					<GlobalSidebar
						isCollapsed={false}
						onToggleCollapse={() => {}}
						className='w-full'
					/>
				</div>
			</div>

			{rightSidebar && (
				<div className='lg:hidden w-full border-t border-sidebar-border order-3'>
					<div className='p-4'>{rightSidebar}</div>
				</div>
			)}
		</div>
	);
};

DoubleSidebarLayout.displayName = "DoubleSidebarLayout";
export default DoubleSidebarLayout;
