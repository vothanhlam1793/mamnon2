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
                        <span v-for="lophoc in user.lophoc" @click="removeLophoc(lophoc)">{{lophoc.name}}</span>
                    </div>
                </div>
            </div>
            <div class="row">
                <div class="col text-center">
                    <button class="btn btn-primary" @click="addUser()">Thêm tài khoản</button>
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
                console.log(data);
            }).catch(function(err){
                console.log(err);
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
        usersFilter: []
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
    computed: {
        count(){
            return this.$store.state.count;
        },
        users(){
            return this.$store.state.users;
        },
        lophocs(){
            return this.$store.state.lophocs;
        }
    },
    mounted(){
        this.$store.dispatch('fetchUsers');
        this.$store.dispatch('fetchLophocs');
    }
})