import React from "react";

interface NotThingLayoutProps {
	children: React.ReactNode;
}

const NotThingLayout = ({children}: NotThingLayoutProps) => {
	return (
		<div className='w-full min-h-screen bg-background'>
			<div className='w-full'>{children}</div>
		</div>
	);
};

NotThingLayout.displayName = "NotThingLayout";
export default NotThingLayout;

