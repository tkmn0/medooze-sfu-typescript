interface Config {
    environment: string; // development or production
    signaling: {
        url: string
    },
    webrtc: {
        video_type: string,
        file_path: string,
        file_name: string
    }
}

const config: Config = {
    environment: process.env.NODE_ENV || "development",
    signaling: {
        url: process.env.SIGNALING_URL || "ws://localhost:3000"
    },
    webrtc: {
        video_type: process.env.VIDEO_TYPE || "file",
        file_path: process.env.FILE_PATH || "../media/",
        file_name: process.env.FILE_NAME || "BigBuckBunny.mp4"
    }
}

export const CONFIG = config;