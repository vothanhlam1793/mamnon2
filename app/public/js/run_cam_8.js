var app_8 = new Vue({
    el: '#app_8',
    data: {
        message: 'Hello Vue!',
        uris: [],
        choice: "",
        urlss: window.location.origin + "/video?id=camera1",
        idVideos: [{
            id: "black",
            title: "Lá 1"
        }, {
            id: "blue",
            title: "Mầm 1"
        }, {
            id: "green",
            title: "Chồi 2"
        }],
        user: {},
        group: {},
        cameras :[
          {   
              _id: "san_3",
              title: "SAN 3", 
              alias:"san3"
          },
      ]
    },
    methods: {
        change: function () {
            var url = "http://localhost/stream/test/index.m3u8";
            this.idVideos.forEach(function (ivideo) {
                video_hls(ivideo.id, url)
            })
  
        },
        start: function(){
            app_8.cameras.forEach(function(camera){
                video_hls(camera._id, "http://localhost/stream/test/index.m3u8");
            });
        },
        start_element: function(camera){
            console.log(camera);
            video_hls(camera._id, "http://localhost/stream/test/index.m3u8");
        }
    },
    created: function(){
        
    }
  
  })