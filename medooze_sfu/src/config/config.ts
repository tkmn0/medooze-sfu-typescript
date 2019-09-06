interface Config {
    environment: string; // development or production
    signaling: {
        port: number
    }
    sfu: {
        video_codec: string,
        check_media_stream_alive: boolean,
        enable_log: boolean,
        enable_record: boolean
    }
}

const config: Config = {
    environment: process.env.NODE_ENV || 'development',
    signaling: {
        port: parseInt(process.env.SIGNALING_SERVER_PORT) || 3000
    },
    sfu: {
        video_codec: process.env.VIDEO_CODEC || 'h264',
        check_media_stream_alive: (process.env.CHECK_MEDIA_STREAM_ALIVE == 'on'),
        enable_log: (process.env.ENABLE_SFU_LOG == 'on'),
        enable_record: (process.env.ENABLE_RECORD == 'on')
    }
}

export const CONFIG = config;