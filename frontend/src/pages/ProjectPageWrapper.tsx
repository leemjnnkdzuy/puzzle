import React, {useState, useEffect} from "react";
import {useParams, useLocation} from "react-router-dom";
import ProjectService from "@/services/ProjectService";
import Loading from "@/components/ui/Loading";
import ScriptGenerationServiceProjectPage from "./ScriptGenerationServiceProjectPage";
import ScriptVoiceServiceProjectPage from "./ScriptVoiceServiceProjectPage";
import FullServiceProjectPage from "./FullServiceProjectPage";

const ProjectPageWrapper: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const location = useLocation();
	const [projectType, setProjectType] = useState<
		"script_generation" | "script_voice" | "full_service" | null
	>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProject = async () => {
			if (!id) {
				setError("Không tìm thấy ID dự án");
				setLoading(false);
				return;
			}

			const pathname = location.pathname;
			let type:
				| "script_generation"
				| "script_voice"
				| "full_service"
				| null = null;

			if (pathname.includes("/script-generation/")) {
				type = "script_generation";
			} else if (pathname.includes("/script-voice/")) {
				type = "script_voice";
			} else if (pathname.includes("/full-service/")) {
				type = "full_service";
			}

			if (!type) {
				setError("Không tìm thấy loại dự án");
				setLoading(false);
				return;
			}

			const reservedPaths = [
				"home",
				"login",
				"register",
				"forgot-password",
				"terms-of-service",
				"privacy-policy",
				"about",
			];

			if (reservedPaths.includes(id)) {
				setError("Không tìm thấy dự án");
				setLoading(false);
				return;
			}

			try {
				setLoading(true);
				setError(null);
				setProjectType(type);
				await ProjectService.getProjectById(id, type);
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Không thể tải dự án"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProject();
	}, [id, location.pathname]);

	if (loading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Loading size='lg' />
			</div>
		);
	}

	if (error || !projectType) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<div className='text-center'>
					<p className='text-red-500 mb-4'>
						{error || "Không tìm thấy dự án"}
					</p>
				</div>
			</div>
		);
	}

	switch (projectType) {
		case "script_generation":
			return <ScriptGenerationServiceProjectPage />;
		case "script_voice":
			return <ScriptVoiceServiceProjectPage />;
		case "full_service":
			return <FullServiceProjectPage />;
		default:
			return (
				<div className='min-h-screen bg-background flex items-center justify-center'>
					<div className='text-center'>
						<p className='text-red-500 mb-4'>
							Loại dự án không hợp lệ
						</p>
					</div>
				</div>
			);
	}
};


export default ProjectPageWrapper;
