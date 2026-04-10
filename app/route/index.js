/**
 * ============================================
 * ROUTES - Express Router
 * ============================================
 * Tất cả routes của ứng dụng
 * School config được lấy từ DB và pass vào mọi view
 */

var express = require('express');

// Lấy config mặc định từ config.js
const appConfig = require('../../config').app;

// =============================================
// HELPERS
// =============================================

/** Lấy thông tin School từ DB */
async function getSchoolInfo(keystone) {
  try {
    const result = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `query {
        allSchools(first: 1) {
          id
          name
          description
          logo
          color
          tagline
          hotline
          zaloId
          address
          email
          website
          workTime
          workDays
          stateMode {
            id name description estimate note
          }
        }
      }`,
    });
    return result.data?.allSchools?.[0] || null;
  } catch (e) {
    console.error('Error fetching school info:', e);
    return null;
  }
}

/** Merge School config với defaults */
function mergeSchoolConfig(schoolFromDb) {
  const defaults = {
    name: appConfig.title,
    description: 'Hệ thống Camera Trường Mầm Non',
    logo: appConfig.logo,
    color: appConfig.color,
    tagline: 'Nơi gửi gắm yêu thương',
    hotline: '',
    zaloId: '',
    address: '',
    email: '',
    website: '',
    workTime: '7g - 17g',
    workDays: 'T2 - T6',
    stateMode: null,
  };

  if (!schoolFromDb) return defaults;

  // Merge: db values override defaults
  return {
    ...defaults,
    ...schoolFromDb,
    // Ensure color always has a value
    color: schoolFromDb.color || defaults.color,
  };
}

// =============================================
// MIDDLEWARE
// =============================================

function redirectLogin(req, res, next) {
  if (req.session.keystoneItemId) {
    next();
  } else {
    res.redirect('/login');
  }
}

async function requireStaffOrAdmin(req, res, next) {
  if (!req.session.keystoneItemId) {
    return res.redirect('/login');
  }
  try {
    const user = await getCurrentUser(req, keystone);
    if (user && (user.isAdmin === true || user.role === 'ADMIN' || user.role === 'STAFF')) {
      return next();
    }
    return res.redirect('/');
  } catch (e) {
    return res.status(500).send('Server error');
  }
}

async function requireAdmin(req, res, next) {
  if (!req.session.keystoneItemId) {
    return res.redirect('/login');
  }
  try {
    const user = await getCurrentUser(req, keystone);
    if (user && (user.isAdmin === true || user.role === 'ADMIN')) {
      return next();
    }
    if (user && user.role === 'STAFF') {
      return res.redirect('/staff');
    }
    return res.redirect('/');
  } catch (e) {
    return res.status(500).send('Server error');
  }
}

async function getCurrentUser(req, keystone) {
  if (!req.session.keystoneItemId) return null;
  const result = await keystone.executeGraphQL({
    context: keystone.createContext({ skipAccessControl: true }),
    query: `query ($id: ID!) { User(where: { id: $id }) { id isAdmin role } }`,
    variables: { id: req.session.keystoneItemId },
  });
  return result?.data?.User;
}

// =============================================
// ROUTES
// =============================================

module.exports = keystone => {
  var router = express.Router();

  // =============================================
  // PUBLIC ROUTES
  // =============================================

  /** Trang đăng nhập */
  router.get('/login', async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('login', { schoolConfig: config });
  });

  /** Trang thông tin / hỗ trợ */
  router.get('/info', async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('info.ejs', {
      setting: {
        hotline: config.hotline,
        zaloId: config.zaloId,
        contactName: config.name,
        workTime: config.workTime,
        workDays: config.workDays,
        address: config.address,
        email: config.email,
      },
      schoolConfig: config,
    });
  });

  /** Trang logout */
  router.get('/logout', (req, res) => {
    res.render('logout.ejs');
  });

  // =============================================
  // AUTHENTICATED ROUTES
  // =============================================

  /** Trang chủ - Danh sách camera */
  router.get('/', redirectLogin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('homepage', { schoolConfig: config });
  });

  /** Kiểm tra đổi mật khẩu */
  router.get('/checkChangePassWord', redirectLogin, async (req, res) => {
    const c = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `query ($id: ID!) {
        User(where: { id: $id }) {
          name
          state
        }
      }`,
      variables: { id: req.session.keystoneItemId },
    });
    res.send(c);
  });

  /** Đổi mật khẩu */
  router.post('/changePassword', redirectLogin, async (req, res) => {
    const c = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `mutation changePassword($id: ID!, $password: String!, $state: String!) {
        updateUser(id: $id, data: { password: $password, state: $state }) {
          id
        }
      }`,
      variables: {
        id: req.session.keystoneItemId,
        password: req.body.pwd,
        state: 'NORMAL',
      },
    });
    res.send(c);
  });

  /** API: Kiểm tra auth */
  router.get('/checkAuth', (req, res) => {
    res.send({ auth: !!req.session.keystoneItemId });
  });

  /** API: Lấy cameras của user đang login */
  router.get('/cameras', redirectLogin, async (req, res) => {
    const c = await keystone.executeGraphQL({
      context: keystone.createContext({ skipAccessControl: true }),
      query: `query getLopHocByUser($id: ID!) {
        User(where: {id: $id}) {
          name
          lophoc {
            id
            name
            school {
              id
              name
              stateMode {
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
      }`,
      variables: { id: req.session.keystoneItemId },
    });
    res.send(c);
  });

  // =============================================
  // STAFF ROUTES
  // =============================================

  router.get('/staff', requireStaffOrAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/index', { schoolConfig: config });
  });

  router.get('/staff/notify', requireStaffOrAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/notify', { schoolConfig: config });
  });

  // =============================================
  // ADMIN ROUTES
  // =============================================

  router.get('/manage', requireAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/admin', { tab: 'school', schoolConfig: config });
  });

  router.get('/manage/school', requireAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/admin', { tab: 'school', schoolConfig: config });
  });

  router.get('/manage/classes', requireAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/admin', { tab: 'classes', schoolConfig: config });
  });

  router.get('/manage/cameras', requireAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/admin', { tab: 'cameras', schoolConfig: config });
  });

  router.get('/mNotify', requireStaffOrAdmin, async (req, res) => {
    const school = await getSchoolInfo(keystone);
    const config = mergeSchoolConfig(school);
    res.render('manage/notify', { schoolConfig: config });
  });

  return router;
};
