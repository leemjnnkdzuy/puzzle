import React, {useState, useEffect} from "react";
import {useParams} from "react-router-dom";
import {Loader2} from "lucide-react";
import ProjectService from "@/services/ProjectService";
import ScriptGenerationServiceProjectPage from "./ScriptGenerationServiceProjectPage";
import ScriptVoiceServiceProjectPage from "./ScriptVoiceServiceProjectPage";
import FullServiceProjectPage from "./FullServiceProjectPage";

const ProjectPageWrapper: React.FC = () => {
	const {id} = useParams<{id: string}>();
	const [projectType, setProjectType] = useState<
		"script_generation" | "script_voice" | "full_service" | null
	>(null);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		const fetchProjectType = async () => {
			if (!id) {
				setError("Không tìm thấy ID dự án");
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
				const project = await ProjectService.getProjectById(id);
				setProjectType(project.type);
			} catch (err: unknown) {
				setError(
					err instanceof Error ? err.message : "Không thể tải dự án"
				);
			} finally {
				setLoading(false);
			}
		};

		fetchProjectType();
	}, [id]);

	if (loading) {
		return (
			<div className='min-h-screen bg-background flex items-center justify-center'>
				<Loader2 className='w-8 h-8 animate-spin text-primary' />
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

ProjectPageWrapper.displayName = "ProjectPageWrapper";
export default ProjectPageWrapper;
