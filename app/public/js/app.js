console.log("HOME PAGE");
var app = new Vue({
    el: "#app_home",
    data: {
        school: {},
        cameras: [],
        lydo: "thu nghiem",
        device: (navigator.userAgent.match(/iPhone/i)) || (navigator.userAgent.match(/iPod/i))
    },
    methods: {
        getHourFromISOWithOffset(isoDate) {
            // Chuyển đổi chuỗi ISO 8601 thành đối tượng Date
            var date = new Date(isoDate);
            
            // Lấy giờ và phút từ đối tượng Date
            var hours = date.getHours();
            var minutes = date.getMinutes();
            
            // Bổ sung giờ +7
            hours += 7;
            
            // Đảm bảo giờ không vượt quá 24 và không nhỏ hơn 0
            hours = (hours + 24) % 24;
            
            // Tạo chuỗi giờ
            var formattedHour = `${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}`;
            
            return formattedHour;
        },
        convertISOToNormalDate(isoDate) {
            var date = new Date(isoDate);
            var day = date.getDate();
            var month = date.getMonth() + 1; // Tháng bắt đầu từ 0
            var year = date.getFullYear();
            return day + '/' + month + '/' + year;
        },
        getListCameras: function(){
            var that = this;
            fetch("/cameras").then(res=>res.json()).then(data=>{
                var cms = [];
                // console.log(data);
                data.data.User.lophoc.forEach(function(e){
                    that.school = e.school;
                    console.log(e);
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
                // console.log("CAMERAS: ", that);
                that.checkRedirect();
                that.$forceUpdate();
            })
        },
        checkRedirect(){
            console.log(this.school);
        }
    },
    created: function(){
        this.getListCameras();
    }
})