import ffmpeg from "fluent-ffmpeg";
import ffmpegInstaller from "@ffmpeg-installer/ffmpeg";

ffmpeg.setFfmpegPath(ffmpegInstaller.path);

export interface VideoMetadata {
	width?: number;
	height?: number;
	duration?: number;
	fps?: number;
	bitrate?: number;
	codec?: string;
	format?: string;
}

export const getVideoMetadata = (filePath: string): Promise<VideoMetadata> => {
	return new Promise((resolve, reject) => {
		ffmpeg.ffprobe(filePath, (err, metadata) => {
			if (err) {
				return reject(err);
			}

			const videoStream = metadata.streams.find(
				(s) => s.codec_type === "video"
			);

			if (!videoStream) {
				return reject(new Error("No video stream found"));
			}

			const format = metadata.format;

			const result: VideoMetadata = {
				width: videoStream.width,
				height: videoStream.height,
				duration: format.duration,
				fps: videoStream.r_frame_rate
					? eval(videoStream.r_frame_rate)
					: undefined,
				bitrate: format.bit_rate ? Math.round(format.bit_rate / 1000) : undefined, // kbps
				codec: videoStream.codec_name,
				format: format.format_long_name || format.format_name,
			};

			resolve(result);
		});
	});
};
