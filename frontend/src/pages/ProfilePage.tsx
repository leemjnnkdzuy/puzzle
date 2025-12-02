import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {useAuth} from "@/hooks/useAuth";
import {
	Edit2,
	Copy,
	Check,
	Plus,
	Trash2,
	Globe,
	ChevronDown,
} from "lucide-react";
import {
	FaFacebook,
	FaGithub,
	FaInstagram,
	FaLinkedin,
	FaYoutube,
	FaTiktok,
} from "react-icons/fa";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Loading from "@/components/ui/Loading";
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuTrigger,
} from "@/components/ui/DropdownMenu";
import {useGlobalNotificationPopup} from "@/hooks/useGlobalNotificationPopup";
import authService from "@/services/AuthService";
import {useAuthStore} from "@/stores/authStore";
import {useLanguage} from "@/hooks/useLanguage";

interface UserData {
	_id?: string;
	username?: string;
	email?: string;
	first_name?: string;
	last_name?: string;
	avatar?: string;
	bio?: string;
	credit?: number;
	createdAt?: string;
	updatedAt?: string;
	isEmailVerified?: boolean;
	theme?: "light" | "dark";
	language?: "en" | "vi";
	socialLinks?: Array<{
		platform:
			| "website"
			| "facebook"
			| "tiktok"
			| "github"
			| "instagram"
			| "linkedin"
			| "youtube";
		url: string;
	}>;
}

type SocialPlatform =
	| "website"
	| "facebook"
	| "tiktok"
	| "github"
	| "instagram"
	| "linkedin"
	| "youtube";

const ProfilePage: React.FC = () => {
	const {identifier} = useParams<{identifier?: string}>();
	const {user: currentUser, loading: authLoading} = useAuth();
	const setUser = useAuthStore((state) => state.setUser);
	const {showSuccess, showError} = useGlobalNotificationPopup();
	const {getNested} = useLanguage();
	const profile = getNested?.("profile") as
		| {
				editInfo?: string;
				bio?: string;
				bioPlaceholder?: string;
				noBio?: string;
				bioCharCount?: string;
				socialLinks?: string;
				addLink?: string;
				noLinks?: string;
				noSocialLinks?: string;
				saveChanges?: string;
				cancel?: string;
				copyUserId?: string;
				copiedUserId?: string;
				copyUserIdFailed?: string;
				userNotFound?: string;
				updateSuccess?: string;
				updateFailed?: string;
				cannotEditOthers?: string;
				loadingUser?: string;
				platforms?: {
					website?: string;
					facebook?: string;
					github?: string;
					instagram?: string;
					linkedin?: string;
					youtube?: string;
					tiktok?: string;
				};
		  }
		| undefined;
	const [isEditing, setIsEditing] = useState(false);
	const [loading, setLoading] = useState(false);
	const [userData, setUserData] = useState<UserData | null>(null);
	const [copied, setCopied] = useState(false);
	const [isLoadingProfile, setIsLoadingProfile] = useState(false);

	const [formData, setFormData] = useState({
		bio: "",
		socialLinks: [] as Array<{platform: SocialPlatform; url: string}>,
	});

	// Check if viewing own profile
	const isOwnProfile = !identifier;

	useEffect(() => {
		const fetchUserProfile = async () => {
			if (isOwnProfile) {
				// Viewing own profile - use current user
				if (currentUser) {
					const data = currentUser as UserData;
					setUserData(data);
					setFormData({
						bio: data.bio || "",
						socialLinks: data.socialLinks || [],
					});
				}
			} else {
				// Viewing other user's profile
				try {
					setIsLoadingProfile(true);
					const result = await authService.getUserProfile(identifier);
					if (result.success && result.data?.user) {
						const profileUser = result.data.user as UserData;
						setUserData(profileUser);
						setFormData({
							bio: profileUser.bio || "",
							socialLinks: profileUser.socialLinks || [],
						});
					} else {
						showError(
							result.message ||
								profile?.userNotFound ||
								"User not found"
						);
					}
				} catch (error) {
					const errorMessage =
						error instanceof Error
							? error.message
							: profile?.loadingUser ||
							  "Failed to load user information";
					showError(errorMessage);
				} finally {
					setIsLoadingProfile(false);
				}
			}
		};

		fetchUserProfile();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [identifier, currentUser, isOwnProfile]);

	const handleInputChange = (field: keyof typeof formData, value: string) => {
		setFormData((prev) => ({...prev, [field]: value}));
	};

	const handleSocialLinkChange = (
		index: number,
		field: "platform" | "url",
		value: string
	) => {
		setFormData((prev) => {
			const newLinks = [...prev.socialLinks];
			newLinks[index] = {
				...newLinks[index],
				[field]: value,
			};
			return {...prev, socialLinks: newLinks};
		});
	};

	const handleAddSocialLink = () => {
		setFormData((prev) => ({
			...prev,
			socialLinks: [...prev.socialLinks, {platform: "website", url: ""}],
		}));
	};

	const handleRemoveSocialLink = (index: number) => {
		setFormData((prev) => ({
			...prev,
			socialLinks: prev.socialLinks.filter((_, i) => i !== index),
		}));
	};

	const getSocialIcon = (platform: SocialPlatform) => {
		switch (platform) {
			case "website":
				return <Globe className='w-5 h-5' />;
			case "facebook":
				return <FaFacebook className='w-5 h-5' />;
			case "github":
				return <FaGithub className='w-5 h-5' />;
			case "instagram":
				return <FaInstagram className='w-5 h-5' />;
			case "linkedin":
				return <FaLinkedin className='w-5 h-5' />;
			case "youtube":
				return <FaYoutube className='w-5 h-5' />;
			case "tiktok":
				return <FaTiktok className='w-5 h-5' />;
			default:
				return <Globe className='w-5 h-5' />;
		}
	};

	const getSocialPlatformName = (platform: SocialPlatform) => {
		const names: Record<SocialPlatform, string> = {
			website: "Website",
			facebook: "Facebook",
			github: "GitHub",
			instagram: "Instagram",
			linkedin: "LinkedIn",
			youtube: "YouTube",
			tiktok: "TikTok",
		};
		return names[platform];
	};

	const getSocialLinkHoverClasses = (platform: SocialPlatform) => {
		const hoverClasses: Record<SocialPlatform, string> = {
			website:
				"hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-300 dark:hover:border-emerald-700",
			facebook:
				"hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700",
			github: "hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700",
			instagram:
				"hover:bg-pink-50 dark:hover:bg-pink-950/20 hover:border-pink-300 dark:hover:border-pink-700",
			linkedin:
				"hover:bg-blue-50 dark:hover:bg-blue-950/20 hover:border-blue-300 dark:hover:border-blue-700",
			youtube:
				"hover:bg-red-50 dark:hover:bg-red-950/20 hover:border-red-300 dark:hover:border-red-700",
			tiktok: "hover:bg-gray-50 dark:hover:bg-gray-900/50 hover:border-gray-300 dark:hover:border-gray-700",
		};
		return hoverClasses[platform];
	};

	const getSocialIconHoverClasses = (platform: SocialPlatform) => {
		const hoverClasses: Record<SocialPlatform, string> = {
			website:
				"group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
			facebook:
				"group-hover:text-blue-600 dark:group-hover:text-blue-400",
			github: "group-hover:text-gray-900 dark:group-hover:text-gray-100",
			instagram:
				"group-hover:text-pink-600 dark:group-hover:text-pink-400",
			linkedin:
				"group-hover:text-blue-600 dark:group-hover:text-blue-400",
			youtube: "group-hover:text-red-600 dark:group-hover:text-red-400",
			tiktok: "group-hover:text-gray-900 dark:group-hover:text-gray-100",
		};
		return hoverClasses[platform];
	};

	const getSocialTextHoverClasses = (platform: SocialPlatform) => {
		const hoverClasses: Record<SocialPlatform, string> = {
			website:
				"group-hover:text-emerald-600 dark:group-hover:text-emerald-400",
			facebook:
				"group-hover:text-blue-600 dark:group-hover:text-blue-400",
			github: "group-hover:text-gray-900 dark:group-hover:text-gray-100",
			instagram:
				"group-hover:text-pink-600 dark:group-hover:text-pink-400",
			linkedin:
				"group-hover:text-blue-600 dark:group-hover:text-blue-400",
			youtube: "group-hover:text-red-600 dark:group-hover:text-red-400",
			tiktok: "group-hover:text-gray-900 dark:group-hover:text-gray-100",
		};
		return hoverClasses[platform];
	};

	const handleSave = async () => {
		if (!isOwnProfile) {
			showError("Bạn chỉ có thể chỉnh sửa profile của chính mình");
			return;
		}

		try {
			setLoading(true);

			const validSocialLinks = formData.socialLinks.filter(
				(link) => link.url.trim() !== ""
			);

			const response = await authService.updateProfile({
				bio: formData.bio,
				socialLinks: validSocialLinks,
			});

			if (response.success) {
				showSuccess(
					profile?.updateSuccess || "Profile updated successfully!"
				);
				setIsEditing(false);

				const result = await authService.getCurrentUser();
				if (result.success && result.data?.user) {
					const updatedUser = result.data.user as UserData;
					setUser(updatedUser);
					setUserData(updatedUser);
					setFormData({
						bio: updatedUser.bio || "",
						socialLinks: updatedUser.socialLinks || [],
					});
				}
			} else {
				showError(
					response.message ||
						profile?.updateFailed ||
						"Failed to update profile!"
				);
			}
		} catch (error) {
			const errorMessage =
				error instanceof Error
					? error.message
					: "Cập nhật thông tin thất bại!";
			showError(errorMessage);
		} finally {
			setLoading(false);
		}
	};

	const handleCancel = () => {
		if (userData) {
			setFormData({
				bio: userData.bio || "",
				socialLinks: userData.socialLinks || [],
			});
		}
		setIsEditing(false);
	};

	const handleCopyUserId = async () => {
		if (!userData?._id) return;

		try {
			await navigator.clipboard.writeText(userData._id);
			setCopied(true);
			showSuccess(profile?.copiedUserId || "User ID copied!");
			setTimeout(() => {
				setCopied(false);
			}, 2000);
		} catch {
			showError(profile?.copyUserIdFailed || "Failed to copy User ID!");
		}
	};

	if (authLoading || isLoadingProfile) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<Loading size='lg' />
			</div>
		);
	}

	if (!userData) {
		return (
			<div className='flex items-center justify-center min-h-screen'>
				<div className='text-center'>
					<p className='text-muted-foreground'>
						{profile?.userNotFound || "User not found"}
					</p>
				</div>
			</div>
		);
	}

	const fullName =
		userData.first_name && userData.last_name
			? `${userData.first_name} ${userData.last_name}`.trim()
			: userData.username || "User";

	const getInitials = () => {
		if (userData.first_name && userData.last_name) {
			return `${userData.first_name[0]}${userData.last_name[0]}`.toUpperCase();
		}
		if (userData.username) {
			return userData.username.substring(0, 2).toUpperCase();
		}
		return "U";
	};

	return (
		<div className='min-h-screen bg-background p-4 md:p-8'>
			<div className='max-w-6xl mx-auto'>
				<div className='rounded-lg shadow-sm'>
					<div className='sticky top-0 z-10 flex flex-col md:flex-row items-center gap-6 mb-8 pb-8 border-b border-input pt-4'>
						<div className='relative'>
							{userData.avatar ? (
								<img
									src={userData.avatar}
									alt={fullName}
									className='w-24 h-24 rounded-full object-cover border-2 border-primary'
								/>
							) : (
								<div className='w-24 h-24 rounded-full bg-primary/20 flex items-center justify-center border-2 border-primary'>
									<span className='text-3xl font-semibold text-primary'>
										{getInitials()}
									</span>
								</div>
							)}
						</div>
						<div className='flex-1 flex flex-col md:flex-row items-center md:items-center justify-between gap-4 w-full'>
							<div className='text-center md:text-left'>
								<div className='flex items-center gap-2 justify-center md:justify-start mb-2'>
									<h2 className='text-2xl font-semibold text-foreground'>
										{fullName}
									</h2>
									{userData._id && (
										<div className='flex items-center gap-1 px-2 py-1 bg-accent/50 rounded-md border border-input'>
											<span className='text-xs text-muted-foreground font-mono'>
												{userData._id.substring(0, 8)}
												...
											</span>
											<button
												onClick={handleCopyUserId}
												className='p-0.5 hover:bg-accent rounded transition-colors'
												title={
													profile?.copyUserId ||
													"Copy User ID"
												}
											>
												{copied ? (
													<Check className='w-3 h-3 text-green-600 dark:text-green-400' />
												) : (
													<Copy className='w-3 h-3 text-muted-foreground hover:text-foreground' />
												)}
											</button>
										</div>
									)}
								</div>
								<p className='text-muted-foreground'>
									@{userData.username}
								</p>
							</div>
							{isOwnProfile && !isEditing && (
								<Button
									variant='outline'
									size='sm'
									onClick={() => setIsEditing(true)}
									className='gap-2'
								>
									<Edit2 className='w-4 h-4' />
									{profile?.editInfo || "Edit information"}
								</Button>
							)}
						</div>
					</div>

					<div className='space-y-6 p-6'>
						<div>
							<label className='block text-sm font-medium text-foreground mb-2'>
								{profile?.bio || "Bio"}
							</label>
							{isEditing && isOwnProfile ? (
								<textarea
									value={formData.bio}
									onChange={(e) =>
										handleInputChange("bio", e.target.value)
									}
									placeholder={
										profile?.bioPlaceholder ||
										"Tell us about yourself..."
									}
									className='w-full min-h-[120px] p-3 bg-background border border-input rounded-md resize-none focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent'
									maxLength={500}
								/>
							) : (
								<div className='p-4 min-h-[120px]'>
									{userData.bio ? (
										<p className='text-foreground whitespace-pre-wrap'>
											{userData.bio}
										</p>
									) : (
										<p className='text-muted-foreground italic'>
											{profile?.noBio || "No bio yet"}
										</p>
									)}
								</div>
							)}
							{isEditing && isOwnProfile && (
								<p className='text-xs text-muted-foreground mt-1'>
									{formData.bio.length}/500{" "}
									{profile?.bioCharCount || "characters"}
								</p>
							)}
						</div>

						<div>
							<div className='flex items-center justify-between mb-2'>
								<label className='block text-sm font-medium text-foreground'>
									{profile?.socialLinks || "Social Links"}
								</label>
								{isEditing && isOwnProfile && (
									<Button
										variant='outline'
										size='sm'
										onClick={handleAddSocialLink}
										className='gap-2'
									>
										<Plus className='w-4 h-4' />
										{profile?.addLink || "Add link"}
									</Button>
								)}
							</div>

							{isEditing && isOwnProfile ? (
								<div className='space-y-3'>
									{formData.socialLinks.map((link, index) => (
										<div
											key={index}
											className='flex gap-2 items-start sidebar-muted rounded-md'
										>
											<div className='flex-1 grid grid-cols-[3fr_1fr] gap-2'>
												<Input
													value={link.url}
													onChange={(e) =>
														handleSocialLinkChange(
															index,
															"url",
															e.target.value
														)
													}
													placeholder='https://...'
													className='w-full'
												/>
												<DropdownMenu>
													<DropdownMenuTrigger
														asChild
													>
														<button
															type='button'
															className='file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-accent/50 px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[2px] flex items-center justify-between text-left'
														>
															<span>
																{getSocialPlatformName(
																	link.platform
																)}
															</span>
															<ChevronDown className='h-4 w-4 opacity-50' />
														</button>
													</DropdownMenuTrigger>
													<DropdownMenuContent
														align='start'
														className='min-w-[var(--radix-dropdown-menu-trigger-width)]'
													>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"website"
																)
															}
															className='flex items-center gap-2'
														>
															<Globe className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"website"
																)}
															</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"facebook"
																)
															}
															className='flex items-center gap-2'
														>
															<FaFacebook className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"facebook"
																)}
															</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"github"
																)
															}
															className='flex items-center gap-2'
														>
															<FaGithub className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"github"
																)}
															</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"instagram"
																)
															}
															className='flex items-center gap-2'
														>
															<FaInstagram className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"instagram"
																)}
															</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"linkedin"
																)
															}
															className='flex items-center gap-2'
														>
															<FaLinkedin className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"linkedin"
																)}
															</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"youtube"
																)
															}
															className='flex items-center gap-2'
														>
															<FaYoutube className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"youtube"
																)}
															</span>
														</DropdownMenuItem>
														<DropdownMenuItem
															onClick={() =>
																handleSocialLinkChange(
																	index,
																	"platform",
																	"tiktok"
																)
															}
															className='flex items-center gap-2'
														>
															<FaTiktok className='w-4 h-4' />
															<span>
																{getSocialPlatformName(
																	"tiktok"
																)}
															</span>
														</DropdownMenuItem>
													</DropdownMenuContent>
												</DropdownMenu>
											</div>
											<Button
												variant='outline'
												onClick={() =>
													handleRemoveSocialLink(
														index
													)
												}
												className='h-9 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950'
											>
												<Trash2 className='w-4 h-4' />
											</Button>
										</div>
									))}
									{formData.socialLinks.length === 0 && (
										<p className='text-sm text-muted-foreground text-center py-4'>
											Chưa có liên kết nào. Nhấn "Thêm
											liên kết" để thêm.
										</p>
									)}
								</div>
							) : (
								<div className='space-y-2'>
									{userData.socialLinks &&
									userData.socialLinks.length > 0 ? (
										userData.socialLinks.map(
											(link, index) => (
												<a
													key={index}
													href={link.url}
													target='_blank'
													rel='noopener noreferrer'
													className={`flex items-center gap-3 p-3 sidebar-muted rounded-md border border-input dark:border-input/70 transition-colors group ${getSocialLinkHoverClasses(
														link.platform
													)}`}
												>
													<div
														className={`text-foreground transition-colors ${getSocialIconHoverClasses(
															link.platform
														)}`}
													>
														{getSocialIcon(
															link.platform
														)}
													</div>
													<div className='flex-1'>
														<p
															className={`text-sm font-medium text-foreground transition-colors ${getSocialTextHoverClasses(
																link.platform
															)}`}
														>
															{getSocialPlatformName(
																link.platform
															)}
														</p>
														<p className='text-xs text-muted-foreground truncate'>
															{link.url}
														</p>
													</div>
												</a>
											)
										)
									) : (
										<p className='text-sm text-muted-foreground text-center py-4'>
											{profile?.noSocialLinks ||
												"No social links"}
										</p>
									)}
								</div>
							)}
						</div>
					</div>

					{isEditing && isOwnProfile && (
						<div className='flex gap-3 mt-8 pt-6 border-t border-input'>
							<Button
								variant='primary'
								onClick={handleSave}
								loading={loading}
								disabled={loading}
								className='flex-1'
							>
								{profile?.saveChanges || "Save changes"}
							</Button>
							<Button
								variant='outline'
								onClick={handleCancel}
								disabled={loading}
								className='flex-1'
							>
								{profile?.cancel || "Cancel"}
							</Button>
						</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default ProfilePage;
