var SIGNIN = `
    mutation signin($identity: String, $secret: String) {
        authenticate: authenticateUserWithPassword(username: $identity, password: $secret) {
            item {
            id
            }
        }
    }
`
var SIGNOUT = `
        mutation {
            unauthenticate: unauthenticateUser {
                success
            }
        }

`
var appLogin = new Vue({
    el: "#app_login",
    data: {
        username: "",
        password: "",
        page: "login",
        pwdchange: "",
        status: "",
        c_status: "alert alert-danger"
    },
    methods: {
        login: function(){
            var that = this;
            console.log(this.username, this.password);
            graphql(SIGNIN, {
                identity: this.username,
                secret: this.password
            }).then(a => {
                console.log(a);
                if(!a.data.authenticate){
                    console.log("ERROR");
                    // Đăng nhập thất bại
                    that.status = "Tên đăng nhập hoặc mật khẩu bị sai";
                } else {
                    console.log("Đăng nhập thành công");
                    that.checkChangePassword();
                }
            });
        },
        logout: function(){
            var that = this;
            graphql(SIGNOUT).then(a=>{
                location.href="/";
            })
        },
        checkChangePassword: function(){
            var that = this;
            fetch("/checkChangePassWord").then(res => res.json()).then(data=>{
                if(data.data.User.state == "RESET"){
                    // Yeu cau doi mat khau
                    that.page = "change_password"
                } else {
                    // Hoat dong binh thuong
                    location.href="/";  // Chuyen doi vao trang chu
                }
            });
        },
        changePassword: function(){
            var that = this;
            fetch("/changePassword", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                    // 'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: JSON.stringify({
                    pwd: this.pwdchange
                })
            }).then(res=>res.json()).then(data=>{
                that.page = "success";
            })
        },
        checkAuth: function(cbSuccess, cbError){
            fetch("/checkAuth").then(res=>res.json()).then(data=>{
                if(data.auth){
                    if(cbSuccess){
                        cbSuccess();
                    }
                } else {
                    if(cbError){
                        cbError();

                    }                
                }
            })
        }
    },
    created: function(){
        var that = this;
        this.checkAuth(()=>{
            that.page = "success"
        }, ()=>{
            that.page = "login"
        });
    }
})