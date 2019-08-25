module.exports = {
    environment: process.env.NODE_ENV || 'development',
    signaling: {
        url: process.env.SIGNALING_URL || "ws://localhost:3000"
    },
    webrtc: {
        video_type: process.env.VIDEO_TYPE || "file",
        file_path: process.env.FILE_PATH || "../media/",
        file_name: process.env.FILE_NAME || "BigBuckBunny.mp4"
    }
}