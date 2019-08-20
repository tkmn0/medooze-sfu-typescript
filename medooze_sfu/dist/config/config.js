"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const config = {
    environment: process.env.NODE_ENV || 'development',
    signaling: {
        port: parseInt(process.env.SIGNALING_SERVER_PORT) || 3000
    },
    sfu: {
        video_codec: process.env.VIDEO_CODEC || 'h264',
        check_media_stream_alive: true,
        enable_log: true
    }
};
exports.CONFIG = config;
//# sourceMappingURL=config.js.map