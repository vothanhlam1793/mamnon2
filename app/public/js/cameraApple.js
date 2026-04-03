Vue.component('video-hls-apple', {
  props: ['id', 'stream_url', 'poster'],
  data: function () {
    return {
      zoomLevel: 1,
      maxZoom: 4,
      minZoom: 1,
      translateX: 0,
      translateY: 0,
      touchStartX: 0,
      touchStartY: 0,
      initialPinchDistance: 0,
      isDragging: false
    }
  },
  created: function () {
    this.newplayer({
      stream_url: this.$props.stream_url,
      poster: this.$props.poster
    })
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
        this.applyTransform()
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
          this.applyTransform()
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
      
      const video = document.getElementById('mo' + this.$props.id)
      if (!video) return

      const overflowX = (video.clientWidth * this.zoomLevel - video.clientWidth) / 2
      const overflowY = (video.clientHeight * this.zoomLevel - video.clientHeight) / 2

      this.translateX = Math.min(Math.max(this.translateX, -overflowX), overflowX)
      this.translateY = Math.min(Math.max(this.translateY, -overflowY), overflowY)
    },
    applyTransform: function () {
      var video = document.getElementById('mo' + this.$props.id)
      if (video) {
        video.style.transform = 'translate(' + this.translateX + 'px, ' + this.translateY + 'px) scale(' + this.zoomLevel + ')'
        video.style.transition = this.isDragging ? 'none' : 'transform 0.1s ease'
      }
    },
    zoomIn: function () {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel + 0.5).toFixed(1))
        this.constrainTranslation()
        this.applyTransform()
      }
    },
    zoomOut: function () {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel - 0.5).toFixed(1))
        this.constrainTranslation()
        this.applyTransform()
      }
    },
    resetZoom: function () {
      this.zoomLevel = 1
      this.translateX = 0
      this.translateY = 0
      this.applyTransform()
    },
    applyZoom: function () {
      this.applyTransform()
    },
    newplayer(data) {
      var poster = data.poster
      var posterimg =
        '<div id="' +
        this.$props.id +
        '" style="width:100%; height:100%; position:relative;"><img id="mo' +
        this.$props.id +
        '" src="' +
        poster +
        '" style="width:100%; height:100%; object-fit:contain; border-radius:8px;"></div>'
      $('#' + this.$props.id).replaceWith(posterimg)
      this.hlsplayer(data)
    },
    hlsplayer(data) {
      this.checkm3u8available(data)
    },
    checkm3u8available(data) {
      var is_available = this.checkm3u8available_helper(data, 0)
    },
    runplayer(data) {
      var autoplay = 'autoplay',
        loop = '',
        cast = '',
        controls = '' // Disable native controls
      var hlsurl = data.stream_url
      var poster = data.poster
      var urlvars = this.getUrlVars()
      if (urlvars['autoplay'] != null) {
        if (urlvars['autoplay'] == 'false') {
          autoplay = ''
        }
      }
      if (urlvars['loop']) {
        if (urlvars['loop'] == 'true') {
          loop = 'loop'
        }
      }

      if (urlvars['cast']) {
        if (urlvars['cast'] == 'true') {
          cast = 'cast'
        }
      }

      var vidplayer =
        '<video ' +
        controls +
        '  ' +
        cast +
        ' id="mo' +
        this.$props.id +
        '" class="video-js vjs-default-skin" preload="none" ' +
        autoplay +
        ' playsinline muted ' +
        loop +
        ' poster="' +
        poster +
        '" style="width:100%; height:100%; object-fit:contain; border-radius:8px; pointer-events:none; display:block;" data-setup=\'{ }\'>  <source src="' +
        hlsurl +
        "\" type='video/mp4' /></video>"
      $('#' + this.$props.id).replaceWith(vidplayer)
      vjs.autoSetup()
      this.applyTransform()
    },
    checkm3u8available_helper(hlsdata, depth) {
      if (depth > 20) {
        alert('Could not open stream')
        return
      }

      const is_msie = navigator.userAgent.toLowerCase().indexOf('msie') > -1

      if (is_msie) {
        this.runplayer(hlsdata)
      } else {
        const hlsurl = hlsdata.stream_url

        // Sử dụng fetch để kiểm tra luồng HLS
        fetch(hlsurl)
          .then(response => response.text()) // Chuyển đổi phản hồi thành text
          .then(data => {
            if (data.includes('.ts') || data.includes('STREAM-INF')) {
              this.runplayer(hlsdata) // Nếu tìm thấy đoạn video, phát luồng
            } else {
              depth += 1
              setTimeout(
                () => this.checkm3u8available_helper(hlsdata, depth),
                350
              ) // Thử lại sau 350ms
            }
          })
          .catch(error => {
            console.error('Error fetching HLS stream:', error)
          })
      }
    },
    getUrlVars() {
      var vars = [],
        hash
      var hashes = window.location.href
        .slice(window.location.href.indexOf('?') + 1)
        .split('&')
      for (var i = 0; i < hashes.length; i++) {
        hash = hashes[i].split('=')
        vars.push(hash[0])
        vars[hash[0]] = hash[1]
      }
      return vars
    },
    resizeVideo() {
      // No manual resize needed
    }
  },
  template: `
        <div class="video-container-wrapper" style="position: relative; touch-action: none; width: 100%; aspect-ratio: 16/9;">
            <div :id="'border' + id" 
                 style="overflow: hidden; border-radius: 8px; background: #000; position: absolute; top: 0; left: 0; width: 100%; height: 100%;">
                <div :id="id" style="width: 100%; height: 100%;"></div>
                
                <!-- Touch Overlay: Captures all gestures to prevent video pausing/native player -->
                <div class="touch-overlay" 
                     style="position: absolute; top: 0; left: 0; right: 0; bottom: 0; z-index: 5;"
                     @touchstart.stop.prevent="handleTouchStart"
                     @touchmove.stop.prevent="handleTouchMove"
                     @touchend.stop.prevent="handleTouchEnd">
                </div>
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
    `
})
