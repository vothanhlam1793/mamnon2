function video_hls(id_video, url_video) {
    var video = document.getElementById(id_video);
    if (Hls.isSupported()) {
        app.lydo = "HLS SUPORT";
        var hls = new Hls();
        hls.loadSource(url_video);
        hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
            video.play();
        });
    } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        app.lydo = (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i));
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
  
Vue.component("view-camera", {
    props: ['id_video', 'title_video', 'alias_camera'],
    data: function () {
        return {
  
        }
    },
    methods:{
        start_camera: function(){
            console.log("ALIAS:")
        }
    },
    created: function(){
        console.log("VIDEO.JS FILE")
    },
    template: `
        <div class="text-center">
            <video :id="id_video" width="100%" controls style="{height: auto}"></video>
             <label style='padding-top: 10px'>{{title_video}}</label>
        </div>            
    `
});