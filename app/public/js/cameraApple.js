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
        '"><img id="mo' +
        this.$props.id +
        '" src="' +
        poster +
        '" style="width:100%; height:auto; border-radius:12px;"></div>'
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
        controls = 'controls'
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

      if (autoplay == 'autoplay') {
        if (urlvars['controls']) {
          if (urlvars['controls'] == 'false') {
            controls = ''
          }
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
        ' playsinline ' +
        loop +
        ' poster="' +
        poster +
        '" style="width:100%; height:auto; display:block; border-radius:12px;" data-setup=\'{ }\'>  <source src="' +
        hlsurl +
        "\" type='video/mp4' /></video>"
      $('#' + this.$props.id).replaceWith(vidplayer)
      vjs.autoSetup()
      this.resizeVideo()
      this.applyTransform()
      setInterval(this.resizeVideo, 1500)
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
      if ($('#mo' + this.$props.id).length) {
        // Only resize if not zoomed to avoid breaking CSS transform scale
        if (this.zoomLevel === 1) {
          $('#mo' + this.$props.id).width($('#border' + this.$props.id).width())
          $('#mo' + this.$props.id).height($('#border' + this.$props.id).height())
        }
      }
    }
  },
  template: `
        <div class="video-container-wrapper" style="position: relative; touch-action: none;">
            <div :id="'border' + id" 
                 style="overflow: hidden; border-radius: 12px; background: #000;"
                 @touchstart="handleTouchStart"
                 @touchmove="handleTouchMove"
                 @touchend="handleTouchEnd">
                <div :id="id"></div>
            </div>
            
            <!-- Zoom Controls Overlay -->
            <div class="zoom-controls" style="position: absolute; bottom: 50px; right: 10px; display: flex; flex-direction: column; gap: 5px; z-index: 10;">
                <button @click="zoomIn" class="btn btn-sm btn-light shadow-sm" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; opacity: 0.9; font-weight: bold; border: 1px solid #eee;">+</button>
                <button @click="zoomOut" class="btn btn-sm btn-light shadow-sm" style="border-radius: 50%; width: 36px; height: 36px; padding: 0; opacity: 0.9; font-weight: bold; border: 1px solid #eee;">-</button>
                <button @click="resetZoom" class="btn btn-sm btn-light shadow-sm" style="border-radius: 12px; height: 32px; padding: 0 10px; opacity: 0.9; font-size: 11px; font-weight: 800; border: 1px solid #eee; color: #ff6b6b;">1:1</button>
            </div>
            
            <!-- Zoom Indicator -->
            <div v-if="zoomLevel > 1" style="position: absolute; top: 12px; left: 12px; background: rgba(255,107,107,0.85); color: white; padding: 4px 12px; border-radius: 20px; font-size: 12px; font-weight: 700; pointer-events: none; box-shadow: 0 2px 10px rgba(0,0,0,0.2);">
                Zoom: {{ zoomLevel.toFixed(1) }}x
            </div>
        </div>
    `
})
