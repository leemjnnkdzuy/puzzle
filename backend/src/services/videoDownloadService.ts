import {spawn, ChildProcess} from "child_process";
import path from "path";
import fs from "fs";
import crypto from "crypto";

function generateId(): string {
	return crypto.randomBytes(16).toString("hex");
}

interface DownloadTask {
	id: string;
	url: string;
	status: "pending" | "downloading" | "completed" | "error";
	progress: number;
	speed: string;
	eta: string;
	filename: string;
	filepath: string;
	error?: string;
	createdAt: Date;
	process?: ChildProcess;
}

const downloadTasks = new Map<string, DownloadTask>();

const REFERER_MAP: Record<string, string> = {
	quetinuk: "https://goatembed.com/",
	mistcloud: "https://goatembed.com/",
	finallygotthexds: "https://goatembed.com/",
	owakshina: "https://goatembed.com/",
	hydrax: "https://goatembed.com/",
};

function getRefererForUrl(url: string): string | null {
	try {
		const hostname = new URL(url).hostname.toLowerCase();
		for (const [domain, referer] of Object.entries(REFERER_MAP)) {
			if (hostname.includes(domain)) {
				return referer;
			}
		}
	} catch {}
	return null;
}

// Get downloads directory
function getDownloadsDir(): string {
	const downloadsDir = path.join(process.cwd(), "downloads");
	if (!fs.existsSync(downloadsDir)) {
		fs.mkdirSync(downloadsDir, {recursive: true});
	}
	return downloadsDir;
}

// Start a new download
export async function startDownload(
	url: string,
	customReferer?: string,
	customFilename?: string
): Promise<DownloadTask> {
	const taskId = generateId();
	const downloadsDir = getDownloadsDir();
	const outputTemplate = path.join(
		downloadsDir,
		`${taskId}_%(title)s.%(ext)s`
	);

	const referer = customReferer || getRefererForUrl(url);

	const task: DownloadTask = {
		id: taskId,
		url,
		status: "pending",
		progress: 0,
		speed: "",
		eta: "",
		filename: "",
		filepath: "",
		createdAt: new Date(),
	};

	downloadTasks.set(taskId, task);

	// Build yt-dlp arguments
	const args: string[] = [
		url,
		"-o",
		outputTemplate,
		"--newline",
		"--no-colors",
	];

	if (referer) {
		args.push("--referer", referer);
	}

	// Add progress output
	args.push(
		"--progress-template",
		"%(progress._percent_str)s %(progress._speed_str)s %(progress._eta_str)s"
	);

	try {
		const ytdlp = spawn("yt-dlp", args);
		task.process = ytdlp;
		task.status = "downloading";

		ytdlp.stdout.on("data", (data: Buffer) => {
			const output = data.toString();
			console.log("[yt-dlp]", output);

			// Parse progress
			const progressMatch = output.match(/(\d+\.?\d*)%/);
			if (progressMatch) {
				task.progress = parseFloat(progressMatch[1]);
			}

			// Parse speed
			const speedMatch = output.match(/(\d+\.?\d*\s*[KMG]?i?B\/s)/i);
			if (speedMatch) {
				task.speed = speedMatch[1];
			}

			// Parse ETA
			const etaMatch = output.match(/(\d+:\d+(?::\d+)?)/);
			if (etaMatch) {
				task.eta = etaMatch[1];
			}

			// Parse destination filename
			const destMatch = output.match(/Destination:\s*(.+)/);
			if (destMatch) {
				task.filepath = destMatch[1].trim();
				task.filename = path.basename(task.filepath);
			}

			// Check for merger
			const mergerMatch = output.match(/Merging formats into "(.+)"/);
			if (mergerMatch) {
				task.filepath = mergerMatch[1].trim();
				task.filename = path.basename(task.filepath);
			}
		});

		ytdlp.stderr.on("data", (data: Buffer) => {
			const error = data.toString();
			console.error("[yt-dlp error]", error);

			if (error.includes("ERROR")) {
				task.error = error;
			}
		});

		ytdlp.on("close", (code) => {
			if (code === 0) {
				task.status = "completed";
				task.progress = 100;

				// Find actual output file
				if (!task.filepath) {
					const files = fs.readdirSync(downloadsDir);
					const taskFile = files.find((f) => f.startsWith(taskId));
					if (taskFile) {
						task.filepath = path.join(downloadsDir, taskFile);
						task.filename = taskFile;
					}
				}
			} else {
				task.status = "error";
				task.error = task.error || `yt-dlp exited with code ${code}`;
			}
		});

		ytdlp.on("error", (err) => {
			task.status = "error";
			task.error = err.message;
		});
	} catch (error: any) {
		task.status = "error";
		task.error = error.message;
	}

	return task;
}

// Get download status
export function getDownloadStatus(taskId: string): DownloadTask | null {
	return downloadTasks.get(taskId) || null;
}

// Get all downloads
export function getAllDownloads(): DownloadTask[] {
	return Array.from(downloadTasks.values()).map((task) => ({
		...task,
		process: undefined, // Don't expose process object
	}));
}

// Cancel download
export function cancelDownload(taskId: string): boolean {
	const task = downloadTasks.get(taskId);
	if (task && task.process) {
		task.process.kill("SIGTERM");
		task.status = "error";
		task.error = "Cancelled by user";
		return true;
	}
	return false;
}

// Delete download file
export function deleteDownload(taskId: string): boolean {
	const task = downloadTasks.get(taskId);
	if (task) {
		if (task.filepath && fs.existsSync(task.filepath)) {
			fs.unlinkSync(task.filepath);
		}
		downloadTasks.delete(taskId);
		return true;
	}
	return false;
}

// Get file stream for download
export function getDownloadFile(
	taskId: string
): {stream: fs.ReadStream; filename: string} | null {
	const task = downloadTasks.get(taskId);
	if (
		task &&
		task.status === "completed" &&
		task.filepath &&
		fs.existsSync(task.filepath)
	) {
		return {
			stream: fs.createReadStream(task.filepath),
			filename: task.filename,
		};
	}
	return null;
}

export function cleanupOldDownloads(): void {
	const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000);

	for (const [taskId, task] of downloadTasks) {
		if (task.createdAt < oneHourAgo) {
			deleteDownload(taskId);
		}
	}
}

setInterval(cleanupOldDownloads, 30 * 60 * 1000);

// Video format info interface
export interface VideoFormat {
	formatId: string;
	ext: string;
	resolution: string;
	width: number;
	height: number;
	fps: number;
	vcodec: string;
	acodec: string;
	filesize: number;
	tbr: number; // Total bitrate
	quality: string;
}

export interface VideoInfo {
	title: string;
	duration: number;
	thumbnail: string;
	formats: VideoFormat[];
	bestFormat: VideoFormat | null;
}

// Get video info (formats, resolution, etc.)
export async function getVideoInfo(
	url: string,
	customReferer?: string
): Promise<VideoInfo> {
	return new Promise((resolve, reject) => {
		const referer = customReferer || getRefererForUrl(url);

		const args: string[] = [url, "-J", "--no-warnings"];

		if (referer) {
			args.push("--referer", referer);
		}

		const ytdlp = spawn("yt-dlp", args);
		let output = "";
		let errorOutput = "";

		ytdlp.stdout.on("data", (data: Buffer) => {
			output += data.toString();
		});

		ytdlp.stderr.on("data", (data: Buffer) => {
			errorOutput += data.toString();
		});

		ytdlp.on("close", (code) => {
			if (code !== 0) {
				reject(
					new Error(errorOutput || `yt-dlp exited with code ${code}`)
				);
				return;
			}

			try {
				const info = JSON.parse(output);
				const formats: VideoFormat[] = [];

				// Parse formats
				if (info.formats && Array.isArray(info.formats)) {
					for (const f of info.formats) {
						// Only include formats with video
						if (f.vcodec && f.vcodec !== "none") {
							const width = f.width || 0;
							const height = f.height || 0;
							let resolution = "Unknown";

							if (height >= 2160) resolution = "4K";
							else if (height >= 1440) resolution = "1440p";
							else if (height >= 1080) resolution = "1080p";
							else if (height >= 720) resolution = "720p";
							else if (height >= 480) resolution = "480p";
							else if (height >= 360) resolution = "360p";
							else if (height > 0) resolution = `${height}p`;

							formats.push({
								formatId: f.format_id || "",
								ext: f.ext || "mp4",
								resolution,
								width,
								height,
								fps: f.fps || 0,
								vcodec: f.vcodec || "",
								acodec: f.acodec || "none",
								filesize: f.filesize || f.filesize_approx || 0,
								tbr: f.tbr || 0,
								quality: `${resolution} ${
									f.ext?.toUpperCase() || ""
								}`.trim(),
							});
						}
					}
				}

				// Sort by height (best first)
				formats.sort((a, b) => b.height - a.height);

				// Find best format
				const bestFormat = formats.length > 0 ? formats[0] : null;

				resolve({
					title: info.title || "Unknown",
					duration: info.duration || 0,
					thumbnail: info.thumbnail || "",
					formats,
					bestFormat,
				});
			} catch (e: any) {
				reject(new Error("Failed to parse video info: " + e.message));
			}
		});

		ytdlp.on("error", (err) => {
			reject(err);
		});
	});
}
