Vue.component('video-hls-android', {
  props: ['id', 'stream_url', 'poster'],
  data: function () {
    return {
      zoomLevel: 1,
      maxZoom: 3,
      minZoom: 1
    }
  },
  mounted: function () {
    this.video_hls(this.$props.id, this.$props.stream_url)
  },
  methods: {
    zoomIn: function () {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel + 0.5).toFixed(1))
      }
    },
    zoomOut: function () {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel - 0.5).toFixed(1))
      }
    },
    resetZoom: function () {
      this.zoomLevel = 1
    },
    video_hls(id_video, url_video) {
      console.log('Video hls running', id_video, url_video)
      var video = document.getElementById(id_video)
      if (Hls.isSupported()) {
        var hls = new Hls({
          maxBufferLength: 30,
          maxBufferSize: 60 * 1000 * 1000,
          maxBufferHole: 0.5
        })
        hls.loadSource(url_video)
        hls.attachMedia(video)
        hls.on(Hls.Events.MANIFEST_PARSED, function () {
          video.play()
        })
      } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url_video
        video.addEventListener('canplay', function () {
          video.play()
        })
      } else {
        alert('Trình duyệt không hỗ trợ - Bạn nên sử dụng Chrome để hệ thống hoạt động tốt hơn')
      }
    }
  },
  template: `
        <div class="video-container-wrapper">
            <div class="video-overflow-hidden" style="overflow: hidden; border-radius: 12px; position: relative; background: #000;">
                <video :id='id'
                    controls
                    loop
                    autoplay
                    playsinline
                    :style="{ 
                        transform: 'scale(' + zoomLevel + ')', 
                        transition: 'transform 0.3s ease',
                        width: '100%',
                        height: 'auto',
                        display: 'block'
                    }"
                ></video>
                
                <!-- Zoom Controls Overlay -->
                <div class="zoom-controls" style="position: absolute; bottom: 50px; right: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 10;">
                    <button @click="zoomIn" class="btn btn-sm btn-light" style="border-radius: 50%; width: 32px; height: 32px; padding: 0; opacity: 0.8; font-weight: bold;">+</button>
                    <button @click="zoomOut" class="btn btn-sm btn-light" style="border-radius: 50%; width: 32px; height: 32px; padding: 0; opacity: 0.8; font-weight: bold;">-</button>
                    <button @click="resetZoom" class="btn btn-sm btn-light" style="border-radius: 10px; height: 32px; padding: 0 8px; opacity: 0.8; font-size: 10px; font-weight: bold;">1:1</button>
                </div>
                
                <!-- Zoom Indicator -->
                <div v-if="zoomLevel > 1" style="position: absolute; top: 10px; left: 10px; background: rgba(0,0,0,0.5); color: white; padding: 2px 8px; border-radius: 10px; font-size: 11px; pointer-events: none;">
                    Zoom: {{ zoomLevel }}x
                </div>
            </div>
        </div>
    `
})
