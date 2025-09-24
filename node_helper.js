const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-Videoplayer helper started...");
        this.config = null; // Initialize config
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "CONFIG") {
            this.config = payload;
            // Set up static route for video folder
            // The videoFolder path needs to be absolute for express.static
            // MagicMirror's app.use expects a URL path and a directory path
            // We'll use the videoFolder from the config as both the URL path and the directory path
            // This assumes videoFolder is an absolute path like /downloads
            // Use a fixed URL path for serving videos, relative to the module name
            const videoUrlPath = `/${this.name}/videos`;
            this.expressApp.use(videoUrlPath, this.express.static(this.config.videoFolder));
            console.log(`MMM-Videoplayer: Serving videos from ${this.config.videoFolder} at URL ${videoUrlPath}`);
        } else if (notification === "GET_VIDEO_FILES") {
            const videoFolder = this.config.videoFolder; // Use stored config
            fs.readdir(videoFolder, (err, files) => {
                if (err) {
                    console.error("MMM-Videoplayer: Could not read video folder", err);
                    this.sendSocketNotification("VIDEO_FILES", []);
                    return;
                }

                const videoFiles = files.filter(file => {
                    const ext = path.extname(file).toLowerCase();
                    return [".mp4", ".webm", ".ogg", ".mov", ".avi", ".mkv"].includes(ext);
                });

                this.sendSocketNotification("VIDEO_FILES", videoFiles);
            });
        }
    },
});