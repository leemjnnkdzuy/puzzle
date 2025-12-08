
import crypto from 'crypto';
import AppError from './errors';

const TOKEN_EXPIRY_MS = 60 * 60 * 1000;

export interface DRMTokenPayload {
    videoId: string;
    userId: string;
    expiresAt: number;
    nonce: string;
}

const getSecretKey = (): string => {
    return process.env.DRM_SECRET_KEY || 'default-secret-key-change-in-production';
};

export class DRMHelper {
    static generateToken(videoId: string, userId: string): string {
        const payload: DRMTokenPayload = {
            videoId,
            userId,
            expiresAt: Date.now() + TOKEN_EXPIRY_MS,
            nonce: crypto.randomBytes(16).toString('hex')
        };

        const payloadStr = JSON.stringify(payload);
        const signature = this.createSignature(payloadStr);
        
        return Buffer.from(`${payloadStr}.${signature}`).toString('base64');
    }

    static verifyToken(token: string, videoId: string, userId: string): DRMTokenPayload {
        try {
            const decoded = Buffer.from(token, 'base64').toString('utf8');
            const lastDotIndex = decoded.lastIndexOf('.');
            
            if (lastDotIndex === -1) {
                throw new Error('Invalid token format');
            }
            
            const payloadStr = decoded.substring(0, lastDotIndex);
            const signature = decoded.substring(lastDotIndex + 1);

            if (!payloadStr || !signature) {
                throw new Error('Invalid token format');
            }

            const expectedSignature = this.createSignature(payloadStr);
            if (signature !== expectedSignature) {
                throw new Error('Invalid signature');
            }

            const payload: DRMTokenPayload = JSON.parse(payloadStr);

            if (payload.videoId !== videoId) {
                throw new Error('Token not for this video');
            }
            if (payload.userId !== userId) {
                throw new Error('Token not for this user');
            }
            if (Date.now() > payload.expiresAt) {
                throw new Error('Token expired');
            }

            return payload;
        } catch (error) {
            throw new AppError('DRM verification failed', 403);
        }
    }

    private static createSignature(data: string): string {
        const secretKey = getSecretKey();
        return crypto
            .createHmac('sha256', secretKey)
            .update(data)
            .digest('hex');
    }
}
