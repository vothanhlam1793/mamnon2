var express = require('express');
function redirectLogin(req, res, next){
    if(req.session.keystoneItemId){
        next();
    } else {
        res.redirect("/login");
    }
}

module.exports = (keystone) => {
    var router = express.Router();
    router.get("/", redirectLogin, (req, res)=>{
        res.render("homepage");
    })
    
    router.get("/login", (req, res)=>{
        res.render("login");
    })

    router.get("/error", (req, res)=>{
        res.render("error");
    })

    router.get("/checkChangePassWord", redirectLogin, async (req, res)=>{
        QUERY_USER = `
            query getUser($id: ID!){
                User(where: { id: $id }) {
                    name
                    state
                }
            }
        `;
        var c = await keystone.executeGraphQL({
            context: keystone.createContext({skipAccessControl: true}),
            query: QUERY_USER,
            variables: {
                id: req.session.keystoneItemId
            }
        });
        res.send(c);
    });

    router.post("/changePassword", redirectLogin, async(req, res)=>{
        var CHANGE_PASSWORD = `        
        mutation changePassword($id: ID!, $password: String!, $state: String!){
            updateUser(id: $id, data: { password: $password, state: $state }) {
                id
            }
        }
        `
        var c = await keystone.executeGraphQL({
            context: keystone.createContext({skipAccessControl: true}),
            query: CHANGE_PASSWORD,
            variables: {
                id: req.session.keystoneItemId,
                password: req.body.pwd,
                state: "NORMAL"
            }
        });
        res.send(c);
    });

    router.get("/checkAuth", (req, res)=>{
        if(req.session.keystoneItemId){
            res.send({
                auth: true
            })
        } else {
            res.send({
                auth: false
            })
        }
    })

    router.get("/info", (req, res)=> {
        res.render("info.ejs");
    });

    router.get("/logout", (req, res)=> {
        res.render("logout.ejs");
    });

    router.get("/cameras", redirectLogin, async (req, res)=>{
        var QUERY_CAMERAS = `
        query getLopHocByUser($id: ID!){
            User(where: {id: $id}){
              name
              lophoc {
                id
                name
                cameras {
                  id
                  hls
                  rtsp
                  name
                  state
                }
              }
            }
        }
        `
        var c = await keystone.executeGraphQL({
            context: keystone.createContext({skipAccessControl: true}),
            query: QUERY_CAMERAS,
            variables: {
                id: req.session.keystoneItemId,
            }
        });
        res.send(c);
    })
    router.get("/manage", function(req, res){
        res.render("manage/index");
    })
    router.get("/mNotify", function(req, res){
        res.render("manage/notify");
    })
    return router;
};
