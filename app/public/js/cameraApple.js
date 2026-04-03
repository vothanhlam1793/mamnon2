Vue.component('video-hls-apple', {
  props: ['id', 'stream_url', 'poster'],
  data: function () {
    return {
      zoomLevel: 1,
      maxZoom: 3,
      minZoom: 1
    }
  },
  created: function () {
    this.newplayer({
      stream_url: this.$props.stream_url,
      poster: this.$props.poster
    })
  },
  methods: {
    zoomIn: function () {
      if (this.zoomLevel < this.maxZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel + 0.5).toFixed(1))
        this.applyZoom()
      }
    },
    zoomOut: function () {
      if (this.zoomLevel > this.minZoom) {
        this.zoomLevel = parseFloat((this.zoomLevel - 0.5).toFixed(1))
        this.applyZoom()
      }
    },
    resetZoom: function () {
      this.zoomLevel = 1
      this.applyZoom()
    },
    applyZoom: function () {
      var video = document.getElementById('mo' + this.$props.id)
      if (video) {
        video.style.transform = 'scale(' + this.zoomLevel + ')'
        video.style.transition = 'transform 0.3s ease'
      }
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
      this.applyZoom() // Apply zoom after player is created
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
        <div class="video-container-wrapper" style="position: relative;">
            <div :id="'border' + id" style="overflow: hidden; border-radius: 12px; background: #000;">
                <div :id="id"></div>
            </div>
            
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
    `
})
