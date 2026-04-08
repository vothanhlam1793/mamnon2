var express = require('express')
function redirectLogin(req, res, next) {
  if (req.session.keystoneItemId) {
    next()
  } else {
    res.redirect('/login')
  }
}

module.exports = keystone => {
  var router = express.Router()
  async function getCurrentUser(req) {
    if (!req.session.keystoneItemId) return null
    const result = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `query ($id: ID!) { User(where: { id: $id }) { id isAdmin role } }`,
      variables: { id: req.session.keystoneItemId }
    })
    return result && result.data && result.data.User
  }
  async function requireStaffOrAdmin(req, res, next) {
    if (!req.session.keystoneItemId) {
      return res.redirect('/login')
    }
    try {
      const user = await getCurrentUser(req)
      if (user && (user.isAdmin === true || user.role === 'ADMIN' || user.role === 'STAFF')) {
        return next()
      }
      return res.redirect('/')
    } catch (e) {
      return res.status(500).send('Server error')
    }
  }
  async function requireAdmin(req, res, next) {
    if (!req.session.keystoneItemId) {
      return res.redirect('/login')
    }
    try {
      const user = await getCurrentUser(req)
      if (user && (user.isAdmin === true || user.role === 'ADMIN')) {
        return next()
      }
      if (user && user.role === 'STAFF') {
        return res.redirect('/staff')
      }
      return res.redirect('/')
    } catch (e) {
      return res.status(500).send('Server error')
    }
  }
  router.get('/', redirectLogin, (req, res) => {
    // console.log(keystone);
    res.render('homepage')
  })

  router.get('/test', (req, res) => {
    res.render('test')
  })
  router.get('/login', (req, res) => {
    res.render('login')
  })

  router.get('/error', (req, res) => {
    res.render('error')
  })

  router.get('/checkChangePassWord', redirectLogin, async (req, res) => {
    QUERY_USER = `
            query getUser($id: ID!){
                User(where: { id: $id }) {
                    name
                    state
                }
            }
        `
    var c = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: QUERY_USER,
      variables: {
        id: req.session.keystoneItemId
      }
    })
    res.send(c)
  })

  router.post('/changePassword', redirectLogin, async (req, res) => {
    var CHANGE_PASSWORD = `        
        mutation changePassword($id: ID!, $password: String!, $state: String!){
            updateUser(id: $id, data: { password: $password, state: $state }) {
                id
            }
        }
        `
    var c = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: CHANGE_PASSWORD,
      variables: {
        id: req.session.keystoneItemId,
        password: req.body.pwd,
        state: 'NORMAL'
      }
    })
    res.send(c)
  })

  router.get('/checkAuth', (req, res) => {
    if (req.session.keystoneItemId) {
      res.send({
        auth: true
      })
    } else {
      res.send({
        auth: false
      })
    }
  })

  router.get('/info', async (req, res) => {
    const { data } = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `query { allSettings { id hotline zaloId contactName workTime workDays } }`
    });
    const setting = data.allSettings[0] || {};
    res.render('info.ejs', { setting });
  })

  router.get('/logout', (req, res) => {
    res.render('logout.ejs')
  })

  router.get('/cameras', redirectLogin, async (req, res) => {
    var QUERY_CAMERAS = `
        query getLopHocByUser($id: ID!){
            User(where: {id: $id}){
              name
              lophoc {
                id
                name
                school {
                    id name stateMode {
                        id name description estimate note
                    }
                }
                cameras {
                  id
                  hls
                  rtsp
                  name
                  state
                  stateMode {
                    id name description estimate note
                  }
                }
                stateMode {
                    id name description estimate note
                }
              }
            }
        }
        `
    var c = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: QUERY_CAMERAS,
      variables: {
        id: req.session.keystoneItemId
      }
    })
    res.send(c)
  })
  router.get('/staff', requireStaffOrAdmin, function (req, res) {
    res.render('manage/index')
  })
  router.get('/staff/notify', requireStaffOrAdmin, function (req, res) {
    res.render('manage/notify')
  })

  router.get('/manage', requireAdmin, function (req, res) {
    res.render('manage/admin', { tab: 'school' })
  })
  router.get('/manage/school', requireAdmin, function (req, res) {
    res.render('manage/admin', { tab: 'school' })
  })
  router.get('/manage/classes', requireAdmin, function (req, res) {
    res.render('manage/admin', { tab: 'classes' })
  })
  router.get('/manage/cameras', requireAdmin, function (req, res) {
    res.render('manage/admin', { tab: 'cameras' })
  })

  router.get('/mNotify', requireStaffOrAdmin, function (req, res) {
    res.render('manage/notify')
  })
  return router
}
