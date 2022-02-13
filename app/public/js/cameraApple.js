Vue.component('video-hls-apple', {
    props: ['id', 'stream_url', 'poster'],
    data: function(){
        return {

        }
    },
    created: function(){
        this.newplayer({"stream_url": this.$props.stream_url, "poster": this.$props.poster});
    },
    methods: {
        newplayer(data){
            var poster = data.poster
            var posterimg = "<div id=\"" + this.$props.id + "\"><img id=\"mo" + this.$props.id + "\" src=\"" +poster+ "\"></div>";
            $("#" + this.$props.id ).replaceWith(posterimg);
            this.hlsplayer(data)
        },
        hlsplayer(data){
            this.checkm3u8available(data);
        },
        checkm3u8available(data){
            var is_available = this.checkm3u8available_helper(data,0);
        },
        runplayer(data) {
            var autoplay = "autoplay",
                loop = "",
                cast = "",
                controls = "controls";
            var hlsurl = data.stream_url;
            var poster = data.poster;
            var urlvars=this.getUrlVars();
            if(urlvars['autoplay'] != null){ 
            if(urlvars['autoplay'] == "false"){
            autoplay = ""
            }
            }
            if(urlvars['loop']){ 
            if(urlvars['loop'] == "true" ){
            loop = "loop"
            }
            }

            if(urlvars['cast']){ 
            if(urlvars['cast'] == "true" ){
            cast = "cast"
            }
            }	
            
            if( autoplay == "autoplay" ){
            if(urlvars['controls']){ 
                if(urlvars['controls'] == "false" ){
                controls = "";
                }
            }
            }
            var vidplayer = "<video "+controls + "  "+cast + "id=\"mo" + this.$props.id + "\" class=\"video-js vjs-default-skin\" preload=\"none\" "+autoplay + " playsinline " + loop + " poster=\""+ poster + "\"    data-setup=\'{ }'\>  <source src=\""+hlsurl+"\" type=\'video/mp4\' /></video>"
            $("#" + this.$props.id).replaceWith(vidplayer);
            vjs.autoSetup();
            this.resizeVideo();
            setInterval(this.resizeVideo, 1500);
        },
        checkm3u8available_helper(hlsdata,depth){
            var that = this;
            if(depth > 20){
                alert("Could not open stream");
                return
            }
            var is_msie = navigator.userAgent.toLowerCase().indexOf('msie') > -1;
            if(is_msie){
            this.runplayer(hlsdata);
            } else {
            var hlsurl = hlsdata.stream_url
            $.get(hlsurl, function(data,status) {
                if(data.indexOf(".ts") != -1 || data.indexOf("STREAM-INF") != -1){
                    that.runplayer(hlsdata);
                } else {
                    depth=depth+1;
                    setTimeout(function(){checkm3u8available_helper(hlsdata,depth)},350);
                }
            });
            }
        },
        getUrlVars(){
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for(var i = 0; i < hashes.length; i++)
            {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }
            return vars;
        },
        resizeVideo(){
            if( $('#mo' + this.$props.id).length ) { 
                $("#mo" + this.$props.id).width($( "#border" + this.$props.id ).width());
                $("#mo"+ this.$props.id).height($(  "#border" + this.$props.id  ).height());
            }
        }

    },
    template: `
        <div class="" :id="'border' + id">
            <div :id="id"></div>
        </div>
    `
})