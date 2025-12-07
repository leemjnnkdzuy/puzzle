import {Request, Response, NextFunction} from "express";
import busboy from "busboy";
import path from "path";
import fs from "fs";
import {getProjectFolderPath} from "@/utils/projectFileHelper";
import AppError from "@/utils/errors";

const ALLOWED_VIDEO_TYPES = [
	"video/mp4",
	"video/avi",
	"video/quicktime",
	"video/x-msvideo",
	"video/x-matroska",
	"video/webm",
	"video/x-ms-wmv",
	"video/mpeg",
	"video/3gpp",
];

/**
 * Interface tương thích với multer file format
 */
interface MulterCompatibleFile {
	filename: string;
	originalname: string;
	size: number;
	mimetype: string;
	path: string;
	fieldname: string;
	encoding: string;
	destination: string;
}

/**
 * Middleware để upload video với streaming cho file lớn
 * Sử dụng busboy để stream file trực tiếp vào disk, không load toàn bộ vào memory
 * Tương thích với format của multer để không cần thay đổi controller
 */
export const uploadVideoStream = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	const projectId = req.params.id;
	if (!projectId) {
		return next(new AppError("Project ID is required", 400));
	}

	const projectFolderPath = getProjectFolderPath(projectId);

	// Đảm bảo folder tồn tại
	if (!fs.existsSync(projectFolderPath)) {
		fs.mkdirSync(projectFolderPath, {recursive: true});
	}

	const bb = busboy({
		headers: req.headers,
		limits: {
			fileSize: 10 * 1024 * 1024 * 1024, // 10GB
		},
	});

	const files: MulterCompatibleFile[] = [];
	let pendingFiles = 0;
	let hasError = false;
	let errorMessage: string | null = null;
	let isFinished = false;

	bb.on("file", (fieldname, file, info) => {
		const {filename, encoding, mimeType} = info;
		pendingFiles++;

		// Kiểm tra file type
		if (!ALLOWED_VIDEO_TYPES.includes(mimeType)) {
			hasError = true;
			errorMessage = `Invalid file type. Only video files are allowed (mp4, avi, mov, mkv, webm, etc.)`;
			file.resume(); // Bỏ qua file này
			pendingFiles--;
			checkComplete();
			return;
		}

		// Sanitize filename
		const sanitizedOriginalName = filename
			.replace(/[^a-zA-Z0-9._-]/g, "_")
			.replace(/\.\./g, "_");

		// Tạo tên file unique với timestamp
		const timestamp = Date.now();
		const ext = path.extname(sanitizedOriginalName);
		const nameWithoutExt = path.basename(sanitizedOriginalName, ext);
		const savedFilename = `${nameWithoutExt}_${timestamp}${ext}`;
		const filePath = path.join(projectFolderPath, savedFilename);

		// Tạo write stream để lưu file với streaming
		const writeStream = fs.createWriteStream(filePath);
		let fileSize = 0;

		// Stream data trực tiếp vào file
		file.on("data", (data: Buffer) => {
			if (!hasError) {
				fileSize += data.length;
				writeStream.write(data);
			}
		});

		file.on("end", () => {
			writeStream.end();
			pendingFiles--;

			if (!hasError) {
				files.push({
					filename: savedFilename,
					originalname: filename,
					size: fileSize,
					mimetype: mimeType,
					path: filePath,
					fieldname: fieldname,
					encoding: encoding,
					destination: projectFolderPath,
				});
			} else {
				// Xóa file nếu có lỗi
				try {
					fs.unlinkSync(filePath);
				} catch {
					// Ignore
				}
			}

			checkComplete();
		});

		file.on("error", (err) => {
			hasError = true;
			errorMessage = err.message;
			writeStream.destroy();
			try {
				fs.unlinkSync(filePath);
			} catch (unlinkErr) {
				// Ignore
			}
			pendingFiles--;
			checkComplete();
		});

		writeStream.on("error", (err) => {
			hasError = true;
			errorMessage = err.message;
			file.resume(); // Bỏ qua phần còn lại của file
			try {
				fs.unlinkSync(filePath);
			} catch (unlinkErr) {
				// Ignore
			}
			pendingFiles--;
			checkComplete();
		});
	});

	bb.on("field", (name, value) => {
		// Lưu các field vào req.body
		if (!(req as any).body) {
			(req as any).body = {};
		}
		(req as any).body[name] = value;
	});

	bb.on("finish", () => {
		isFinished = true;
		checkComplete();
	});

	bb.on("error", (err: Error) => {
		hasError = true;
		errorMessage = err.message;
		// Xóa các file đã upload nếu có lỗi
		files.forEach((file) => {
			try {
				fs.unlinkSync(file.path);
			} catch (unlinkErr) {
				// Ignore
			}
		});
		next(new AppError(errorMessage || "Upload error", 400));
	});

	function checkComplete() {
		if (isFinished && pendingFiles === 0) {
			if (hasError && errorMessage) {
				// Xóa các file đã upload nếu có lỗi
				files.forEach((file) => {
					try {
						fs.unlinkSync(file.path);
					} catch (err) {
						// Ignore
					}
				});
				return next(new AppError(errorMessage, 400));
			}

			// Nếu không có file nào được upload
			if (files.length === 0) {
				return next(new AppError("No video file uploaded", 400));
			}

			// Gán file vào req để controller sử dụng (tương thích với multer)
			(req as any).file = files[0] || null;
			(req as any).files = files;
			next();
		}
	}

	// Pipe request vào busboy để xử lý streaming
	req.pipe(bb);
};

/**
 * Wrapper để tương thích với multer.single()
 */
export const uploadVideoStreamSingle = (
	req: Request,
	res: Response,
	next: NextFunction
): void => {
	uploadVideoStream(req, res, next);
};

/**
 * Wrapper để tương thích với multer.array()
 */
export const uploadVideoStreamArray = (
	fieldName: string,
	maxCount?: number
) => {
	return (req: Request, res: Response, next: NextFunction): void => {
		uploadVideoStream(req, res, next);
	};
};

export default uploadVideoStream;
