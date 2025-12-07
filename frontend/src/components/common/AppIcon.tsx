import React from "react";
import {useTheme} from "@/hooks/useTheme";
import appIconGray from "@/assets/app_icon_gray.svg";
import appIconWhite from "@/assets/app_icon_while.svg";

interface AppIconProps {
	className?: string;
	alt?: string;
}

const AppIcon: React.FC<AppIconProps> = ({
	className = "w-8 h-8 object-contain",
	alt = "Puzzle",
}) => {
	const {isDark} = useTheme();
	const iconSrc = isDark ? appIconWhite : appIconGray;

	return <img src={iconSrc} alt={alt} className={className} />;
};


export default AppIcon;
