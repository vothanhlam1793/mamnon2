Vue.component('video-hls-android', {
  props: ['id', 'stream_url', 'poster'],
  data: function () {
    return {
      zoomLevel: 1,
      maxZoom: 4,
      minZoom: 1,
      translateX: 0,
      translateY: 0,
      lastTranslateX: 0,
      lastTranslateY: 0,
      touchStartX: 0,
      touchStartY: 0,
      initialPinchDistance: 0,
      isDragging: false
    }
  },
  mounted: function () {
    this.video_hls(this.$props.id, this.$props.stream_url)
  },
  methods: {
    handleTouchStart: function (e) {
      if (e.touches.length === 1) {
        this.isDragging = true
        this.touchStartX = e.touches[0].clientX - this.translateX
        this.touchStartY = e.touches[0].clientY - this.translateY
      } else if (e.touches.length === 2) {
        this.isDragging = false
        this.initialPinchDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
      }
    },
    handleTouchMove: function (e) {
      if (this.zoomLevel <= 1 && e.touches.length === 1) return

      if (e.touches.length === 1 && this.isDragging) {
        e.preventDefault()
        this.translateX = e.touches[0].clientX - this.touchStartX
        this.translateY = e.touches[0].clientY - this.touchStartY
        this.constrainTranslation()
      } else if (e.touches.length === 2) {
        e.preventDefault()
        const currentDistance = Math.hypot(
          e.touches[0].clientX - e.touches[1].clientX,
          e.touches[0].clientY - e.touches[1].clientY
        )
        const zoomDelta = currentDistance / this.initialPinchDistance
        const newZoom = Math.min(Math.max(this.zoomLevel * zoomDelta, this.minZoom), this.maxZoom)
        
        if (newZoom !== this.zoomLevel) {
          this.zoomLevel = newZoom
          this.initialPinchDistance = currentDistance
          this.constrainTranslation()
        }
      }
    },
    handleTouchEnd: function () {
      this.isDragging = false
    },
    constrainTranslation: function () {
      if (this.zoomLevel <= 1) {
        this.translateX = 0
        this.translateY = 0
        return
      }
      
      const video = document.getElementById(this.$props.id)
      if (!video) return

      const overflowX = (video.clientWidth * this.zoomLevel - video.clientWidth) / 2
      const overflowY = (video.clientHeight * this.zoomLevel - video.clientHeight) / 2

      this.translateX = Math.min(Math.max(this.translateX, -overflowX), overflowX)
      this.translateY = Math.min(Math.max(this.translateY, -overflowY), overflowY)
    },
    zoomIn: function () {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel + 0.5).toFixed(1))
        this.constrainTranslation()
      }
    },
    zoomOut: function () {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel - 0.5).toFixed(1))
        this.constrainTranslation()
      }
    },
    resetZoom: function () {
      this.zoomLevel = 1
      this.translateX = 0
      this.translateY = 0
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
            <div class="video-overflow-hidden" 
                 style="overflow: hidden; border-radius: 12px; position: relative; background: #000; touch-action: none;">
                
                <video :id='id'
                    loop
                    autoplay
                    playsinline
                    muted
                    :style="{ 
                        transform: 'translate(' + translateX + 'px, ' + translateY + 'px) scale(' + zoomLevel + ')', 
                        transition: isDragging ? 'none' : 'transform 0.1s ease',
                        width: '100%',
                        height: 'auto',
                        display: 'block',
                        pointerEvents: 'none'
                    }"
                ></video>

                <!-- Touch Overlay: Captures all gestures to prevent video pausing/native player -->
                <div class="touch-overlay" 
                     style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5;"
                     @touchstart.stop.prevent="handleTouchStart"
                     @touchmove.stop.prevent="handleTouchMove"
                     @touchend.stop.prevent="handleTouchEnd">
                </div>
                
                <!-- Zoom Controls Overlay: Only Reset Button -->
                <div class="zoom-controls" style="position: absolute; bottom: 10px; right: 10px; z-index: 10;">
                    <button v-if="zoomLevel > 1" @click.stop="resetZoom" class="btn btn-sm btn-light shadow-sm" style="border-radius: 10px; height: 30px; padding: 0 10px; opacity: 0.9; font-size: 11px; font-weight: 800; border: 1px solid #eee; color: #ff6b6b; display: flex; align-items: center; justify-content: center;">
                        <span style="margin-right: 4px;">🔄</span> 1:1
                    </button>
                </div>
                
                <!-- Zoom Indicator -->
                <div v-if="zoomLevel > 1" style="position: absolute; top: 12px; left: 12px; background: rgba(255,107,107,0.85); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; pointer-events: none; box-shadow: 0 2px 10px rgba(0,0,0,0.2); z-index: 10;">
                    Zoom: {{ zoomLevel.toFixed(1) }}x
                </div>
            </div>
        </div>
    `
})
