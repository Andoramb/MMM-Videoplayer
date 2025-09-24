const NodeHelper = require("node_helper");
const fs = require("fs");
const path = require("path");

module.exports = NodeHelper.create({
    start: function () {
        console.log("MMM-Videoplayer helper started...");
    },

    socketNotificationReceived: function (notification, payload) {
        if (notification === "GET_VIDEO_FILES") {
            const videoFolder = payload;
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