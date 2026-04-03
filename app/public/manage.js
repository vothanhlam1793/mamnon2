Vue.component("create-user", {
    template: `
        <div>   
            <div class="form-group">
                <label for="pwd">Tên học sinh:</label>
                <input type="text" class="form-control" id="pwd" v-model="user.name">
            </div>
            <div class="form-group">
                <label for="pwd">Số điện thoại:</label>
                <input type="text" class="form-control" id="pwd" v-model="user.phone">
            </div>
            <div class="row">
                <div class="col">
                    <div class="form-group">
                        <label for="pwd">Chọn lớp:</label>
                        <select class="form-control" @change="addLophoc()" v-model="lophoc">
                            <option v-for="lophoc in lophocs" :value="lophoc">{{lophoc.name}}</option>
                        </select>
                    </div>
                </div>
                <div class="col">
                    <div v-if="user.lophoc">
                        <span class="mn-chip" v-for="lophoc in user.lophoc" @click="removeLophoc(lophoc)">{{lophoc.name}}</span>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col text-center">
                    <button class="btn btn-primary" style="border-radius: 14px; font-weight: 800;" @click="addUser()">Thêm tài khoản</button>
                </div>
            </div>
        </div>
    `,
    props: [],
    data(){
        return {
            user: {},
            lophoc: {}
        }
    },
    methods: {
        addLophoc(){
            if(!this.user.lophoc){
                this.user.lophoc = [];
            }
            this.user.lophoc.push(this.lophoc);
        },
        removeLophoc(lophoc){
            var that = this;
            this.user.lophoc.forEach(function(item, index){
                if(item.id == lophoc.id){
                    that.user.lophoc.splice(index, 1);
                    that.$forceUpdate();                    
                }
            })
        },
        addUser(){
            var that = this;
            if (!this.user.name || !this.user.phone) {
                alert("Vui lòng nhập tên và số điện thoại");
                return;
            }
            if (!this.user.lophoc || this.user.lophoc.length === 0) {
                alert("Vui lòng chọn ít nhất 1 lớp");
                return;
            }
            var ql = [];
            this.user.lophoc.forEach(function(item){
                ql.push(`{id:"${item.id}"}`);
            })
            var qllh = `[` + ql.join(",") + "]";
            var QL_CREATE_USER = `
            mutation {  
                createUser (data: {
                    name: "${this.user.name}",
                    phone: "${this.user.phone}",
                    username: "${this.user.phone}",
                    password: "${this.user.phone}",
                    state: "NORMAL",
                    lophoc: {
                        connect: ${qllh}
                    }
                }) {
                  id
                  name
                  phone
                }
            }
            `
            graphql(QL_CREATE_USER).then(function(data){
                if (data && data.data && data.data.createUser && data.data.createUser.id) {
                    alert("Tạo tài khoản thành công");
                    that.user = {};
                    that.lophoc = {};
                    that.$store.dispatch('fetchUsers');
                } else {
                    alert("Không tạo được tài khoản, vui lòng kiểm tra lại")
                }
            }).catch(function(err){
                console.log(err);
                alert("Có lỗi khi tạo tài khoản")
            })
        }
    },
    computed: {
        lophocs(){
            return this.$store.state.lophocs;
        }
    }
});

const store = new Vuex.Store({
    state: {
        count: 0,
        users: [],
        lophocs: [],
        usersFilter: [],
        searchTerm: "",
        searchField: "phone",
        selectedLophocId: ""
    },
    mutations: {
        increase(state){
            state.count += 1;
        },
        fetchUsers(state, payload){
            state.users = payload;
            state.usersFilter = payload;
        },
        fetchLophocs(state, payload){
            state.lophocs = payload;
        },
        setSearchTerm(state, payload){
            state.searchTerm = payload;
        },
        setSearchField(state, payload){
            state.searchField = payload;
        },
        setSelectedLophocId(state, payload){
            state.selectedLophocId = payload;
        }
    },
    actions: {
        increase(context){
            context.commit('increase');
        },
        fetchUsers(context){
            graphql(`
                query {
                allUsers {
                    id
                    name
                    username
                    phone
                    lophoc {
                    id
                    name
                    school {
                        name
                    }
                    }
                    state
                }
                }
            `).then(function(data){
                context.commit('fetchUsers', data.data.allUsers);
            }).catch(function(err){
                console.log(err);
            })
        },
        fetchLophocs(context){
            graphql(`
                query {
                    allLopHocs {
                        id
                        name
                    }
                    }
            `).then(function(data){
                context.commit('fetchLophocs', data.data.allLopHocs);
            }).catch(function(err){
                console.log(err);
            })
        }
    }
});

var app = new Vue({
    el: "#app",
    store,
    data: function () {
        return {
            editUser: null,
            editUserName: "",
            editLophocIds: []
        }
    },
    computed: {
        count(){
            return this.$store.state.count;
        },
        users(){
            return this.$store.state.users;
        },
        lophocs(){
            return this.$store.state.lophocs;
        },
        searchTerm: {
            get(){
                return this.$store.state.searchTerm;
            },
            set(v){
                this.$store.commit('setSearchTerm', v);
            }
        },
        searchField: {
            get(){
                return this.$store.state.searchField;
            },
            set(v){
                this.$store.commit('setSearchField', v);
            }
        },
        selectedLophocId: {
            get(){
                return this.$store.state.selectedLophocId;
            },
            set(v){
                this.$store.commit('setSelectedLophocId', v);
            }
        },
        filteredUsers(){
            var term = (this.searchTerm || "").toLowerCase().trim();
            var field = this.searchField;
            var classId = this.selectedLophocId;
            return (this.users || []).filter(function(u){
                if (classId) {
                    var okClass = (u.lophoc || []).some(function(lh){ return lh.id === classId; });
                    if (!okClass) return false;
                }
                if (!term) return true;
                var phone = (u.phone || "").toLowerCase();
                var name = (u.name || "").toLowerCase();
                var classNames = (u.lophoc || []).map(function(lh){ return (lh.name || "").toLowerCase(); }).join(" ");
                if (field === "phone") return phone.includes(term);
                if (field === "name") return name.includes(term);
                if (field === "class") return classNames.includes(term);
                return phone.includes(term) || name.includes(term) || classNames.includes(term);
            });
        }
    },
    methods: {
        refresh(){
            this.$store.dispatch('fetchUsers');
            this.$store.dispatch('fetchLophocs');
        },
        openEdit(user){
            if(!user || !user.id) return;
            this.editUser = user;
            this.editUserName = user.name || "";
            this.editLophocIds = (user.lophoc || []).map(function(lh){ return lh.id; });
            if (window.$ && $('#editUserModal').length) {
                $('#editUserModal').modal('show');
            }
        },
        isEditLophocSelected(lophocId){
            return this.editLophocIds.indexOf(lophocId) >= 0;
        },
        toggleEditLophoc(lh){
            if(!lh || !lh.id) return;
            var idx = this.editLophocIds.indexOf(lh.id);
            if (idx >= 0) {
                this.editLophocIds.splice(idx, 1);
            } else {
                this.editLophocIds.push(lh.id);
            }
        },
        saveEdit(){
            if(!this.editUser || !this.editUser.id) return;
            var name = (this.editUserName || "").trim();
            var currentIds = (this.editUser.lophoc || []).map(function(lh){ return lh.id; });
            var nextIds = (this.editLophocIds || []).slice();

            if (!name) {
                alert("Vui lòng nhập tên bé");
                return;
            }
            if (nextIds.length === 0) {
                alert("Vui lòng chọn ít nhất 1 lớp");
                return;
            }

            var connect = nextIds.filter(function(id){ return currentIds.indexOf(id) < 0; }).map(function(id){ return { id: id }; });
            var disconnect = currentIds.filter(function(id){ return nextIds.indexOf(id) < 0; }).map(function(id){ return { id: id }; });

            graphql(`
                mutation ($id: ID!, $name: String, $connect: [LopHocWhereUniqueInput!], $disconnect: [LopHocWhereUniqueInput!]) {
                    updateUser(id: $id, data: { name: $name, lophoc: { connect: $connect, disconnect: $disconnect } }) { id }
                }
            `, { id: this.editUser.id, name: name, connect: connect, disconnect: disconnect }).then(() => {
                if (window.$ && $('#editUserModal').length) {
                    $('#editUserModal').modal('hide');
                }
                this.editUser = null;
                this.editUserName = "";
                this.editLophocIds = [];
                this.$store.dispatch('fetchUsers');
                alert("Đã cập nhật");
            }).catch((e) => {
                console.log(e);
                alert("Không cập nhật được");
            });
        },
        resetPassword(user){
            if(!user || !user.id) return;
            if(!confirm("Reset mật khẩu về số điện thoại và yêu cầu đổi mật khẩu khi đăng nhập?")) return;
            graphql(`
                mutation ($id: ID!, $pwd: String!) {
                    updateUser(id: $id, data: { password: $pwd, state: "RESET" }) { id }
                }
            `, { id: user.id, pwd: user.phone }).then(() => {
                alert("Đã reset mật khẩu");
                this.$store.dispatch('fetchUsers');
            }).catch((e) => {
                console.log(e);
                alert("Không reset được");
            });
        },
        deleteUser(user){
            if(!user || !user.id) return;
            if(!confirm("Xoá tài khoản này?")) return;
            graphql(`
                mutation ($id: ID!) { deleteUser(id: $id) { id } }
            `, { id: user.id }).then(() => {
                alert("Đã xoá");
                this.$store.dispatch('fetchUsers');
            }).catch((e) => {
                console.log(e);
                alert("Không xoá được");
            });
        }
    },
    mounted(){
        this.$store.dispatch('fetchUsers');
        this.$store.dispatch('fetchLophocs');
    }
})
