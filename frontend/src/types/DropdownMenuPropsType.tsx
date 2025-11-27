import type React from "react";
import type * as DropdownMenuPrimitive from "@radix-ui/react-dropdown-menu";

export type DropdownMenuItemVariant = "default" | "destructive";

export interface DropdownMenuSubTriggerProps
	extends React.ComponentPropsWithoutRef<
		typeof DropdownMenuPrimitive.SubTrigger
	> {
	variant?: DropdownMenuItemVariant;
	inset?: boolean;
}

export interface DropdownMenuItemProps
	extends React.ComponentPropsWithoutRef<typeof DropdownMenuPrimitive.Item> {
	variant?: DropdownMenuItemVariant;
	inset?: boolean;
}

export interface DropdownMenuCheckboxItemProps
	extends React.ComponentPropsWithoutRef<
		typeof DropdownMenuPrimitive.CheckboxItem
	> {
	variant?: DropdownMenuItemVariant;
}

export interface DropdownMenuRadioItemProps
	extends React.ComponentPropsWithoutRef<
		typeof DropdownMenuPrimitive.RadioItem
	> {
	variant?: DropdownMenuItemVariant;
}
