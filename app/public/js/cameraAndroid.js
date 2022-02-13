Vue.component('video-hls-android',{
    props: ['id', 'stream_url', 'poster'],
    data: function(){
        return {

        }
    },
    mounted: function(){
        this.video_hls(this.$props.id, this.$props.stream_url);
    },
    methods: {
        video_hls(id_video, url_video) {
            console.log("Video hls running", id_video, url_video);
            var video = document.getElementById(id_video);
            if (Hls.isSupported()) {
                var hls = new Hls();
                hls.loadSource(url_video);
                hls.attachMedia(video);
                hls.on(Hls.Events.MANIFEST_PARSED, function () {
                    video.play();
                });
            } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = url_video;
                video.addEventListener('canplay', function () {
                    video.play();
                });
            } else {
                app.lydo = "KHONG HO TRO"
                alert("Trình duyệt không hỗ trợ - Bạn nên sử dụng Chrome để hệ thống hoạt động tốt hơn")
                console.log("Notthing");
            }
        }
    },
    template: `
        <div>
            <video :id='id'
            controls
            loop
            autoplay
            ></video>
        </div>
    `
})