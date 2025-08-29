/* global Module */

/* Magic Mirror 2
 * Module: MMM-Videoplayer
 *
 * Forked and modified for HTTP-served video folder
 * MIT Licensed.
 */
Module.register("MMM-Videoplayer", {
    defaults: {
        videoFolderHTTP: "http://localhost:8081",
        random: false,
        loop: true,
        hideonstart: false,
        fadeSpeed: 1000,
        showcontrols: false,
        preload: "auto",
        autoplay: true,
        muted: true,
        pauseonhide: true,
        resumeonshow: true,
        notification: "VIDEOPLAYER1"
    },

    start: function () {
        this.videoArray = [];
        this.playedVideoArray = [];
        this.currentVideoIndex = 0;
        this.video = null;
    },

    getStyles: function () {
        return ["MMM-Videoplayer.css"];
    },

    // Fetch videos from HTTP folder
    fetchVideoList: function () {
        fetch(this.config.videoFolderHTTP)
    		.then(res => res.json())
    		.then(list => {
    		    this.videoArray = list.videos.map(f => this.config.videoFolderHTTP + "/" + f);
    		    this.playedVideoArray = [];
    		    if (!this.video.src) this.nextVideo();
    		})
    		.catch(err => {
    		    console.error("MMM-Videoplayer: Could not load videos from HTTP folder", err);
    		});
    },

    replayVideo: function () {
        if (this.video && this.playedVideoArray.length > 0) {
            const lastVideo = this.playedVideoArray[this.playedVideoArray.length - 1];
            this.video.setAttribute("src", lastVideo);
            this.video.load();
            this.video.play();
        }
    },

    nextVideo: function () {
        if (this.videoArray.length === 0) {
            this.fetchVideoList();
            return;
        }

        if (this.config.hideonstart) this.hide(this.config.fadeSpeed);

        if (this.config.random) {
            this.currentVideoIndex = Math.floor(Math.random() * this.videoArray.length);
        } else {
            this.currentVideoIndex = 0;
        }

        const nextVid = this.videoArray.splice(this.currentVideoIndex, 1)[0];
        this.playedVideoArray.push(nextVid);

        if (this.video) {
            this.video.setAttribute("src", nextVid);
            this.video.load();
            this.video.play();
        }
    },

    suspend: function () {
        if (this.config.pauseonhide && this.video) {
            this.video.pause();
        }
    },

    resume: function () {
        if (this.config.resumeonshow && this.video) {
            this.video.play().catch(err => {
                console.warn("MMM-Videoplayer: resume play failed", err);
            });
        }
    },

    notificationReceived: function (notification, payload, sender) {
        if (notification === this.config.notification) {
            switch (payload) {
                case 'TOGGLE':
                    if (this.video.paused) this.video.play();
                    else this.video.pause();
                    break;
                case 'NEXT':
                    this.nextVideo();
                    break;
                case 'REPLAY':
                    this.replayVideo();
                    break;
                case 'REFRESH':
                    this.fetchVideoList();
                    break;
            }
        }
    },

    getDom: function () {
    	// Create wrapper div
    	var wrapper = document.createElement("div");
		
    	// Create video element
    	this.video = document.createElement("video");
    	this.video.id = this.identifier + "_video";
		
    	// Configure video attributes
    	this.video.muted = this.config.muted;
    	this.video.autoplay = this.config.autoplay;
    	this.video.loop = false; // Loop handled manually by module
    	this.video.controls = this.config.showcontrols;
    	this.video.preload = this.config.preload;
		
    	// Play next video when current ends
    	this.video.addEventListener('ended', () => {
    	    this.nextVideo();
    	}, false);
	
    	// Append video to wrapper
    	wrapper.appendChild(this.video);
	
    	// Fetch video list and start playback
    	this.fetchVideoList();
	
    	return wrapper;
	}

});
