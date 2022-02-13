console.log("HOME PAGE");
var app = new Vue({
    el: "#app_home",
    data: {
        cameras: [],
        lydo: "thu nghiem",
        device: (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))
    },
    methods: {
        getListCameras: function(){
            var that = this;
            fetch("/cameras").then(res=>res.json()).then(data=>{
                var cms = [];
                data.data.User.lophoc.forEach(function(e){
                    e.cameras.forEach(function(_e){
                        _e.lophoc = e;
                        var t = cms.filter(function(__e){
                            return __e.id == _e.id;
                        })
                        if(t.length > 0){
                            return;
                        } else {
                            cms.push(_e);
                        }
                    });
                })
                that.cameras = cms;
                that.$forceUpdate();
            })
        }
    },
    created: function(){
        this.getListCameras();
    }
})