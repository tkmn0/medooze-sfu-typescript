interface Config {
    environment: string; // development or production
    signaling: {
        port: number
    }
    sfu: {
        video_codec: string,
        check_media_stream_alive: boolean,
        enable_log: boolean
    }
}

const config: Config = {
    environment: process.env.NODE_ENV || 'development',
    signaling: {
        port: parseInt(process.env.SIGNALING_SERVER_PORT) || 3000
    },
    sfu: {
        video_codec: process.env.VIDEO_CODEC || 'h264',
        check_media_stream_alive: true,
        enable_log: true
    }
}

export const CONFIG = config;