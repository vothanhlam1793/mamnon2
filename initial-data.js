/**
 * ============================================
 * INITIAL DATA - Tạo dữ liệu ban đầu
 * ============================================
 * Chạy tự động khi server khởi động lần đầu
 * (khi chưa có user nào trong DB)
 */

const crypto = require('crypto');

// =============================================
// CẤU HÌNH MẶC ĐỊNH CHO TRƯỜNG MỚI
// =============================================
const DEFAULT_ADMIN = {
  phone: 'admin',             // Username đăng nhập
  password: 'admin',           // ⚠️ ĐỔI SAU KHI deploy
  name: 'Quản trị viên',
};

const DEFAULT_SCHOOL = {
  name: 'Trường Mầm Non',
  description: 'Hệ thống Camera Trường Mầm Non',
  tagline: 'Nơi gửi gắm yêu thương',
  color: '#ff6b6b',
  logo: '/branding/default-logo.png',
  hotline: '0862270717',
  zaloId: '0862270717',
  address: '',
  email: '',
  website: '',
  workTime: '7g - 17g',
  workDays: 'T2 - T6',
};

// =============================================
// HELPERS
// =============================================
const randomString = () => crypto.randomBytes(6).hexSlice();

// =============================================
// MAIN
// =============================================
module.exports = async keystone => {
  // =============================================
  // 1. TẠO ADMIN MẶC ĐỊNH
  // =============================================
  const {
    data: {
      _allUsersMeta: { count = 0 },
    },
  } = await keystone.executeGraphQL({
    context: keystone.createContext().sudo(),
    query: `query {
      _allUsersMeta {
        count
      }
    }`,
  });

  if (count === 0) {
    const { errors } = await keystone.executeGraphQL({
      context: keystone.createContext().sudo(),
      query: `mutation initialUser($password: String, $name: String, $phone: String) {
            createUser(data: {
              name: $name
              password: $password
              username: $phone
              isAdmin: true
              role: ADMIN
              state: NORMAL
            }) {
              id
            }
          }`,
      variables: {
        password: DEFAULT_ADMIN.password,
        name: DEFAULT_ADMIN.name,
        phone: DEFAULT_ADMIN.phone,
      },
    });

    if (errors) {
      console.log('❌ failed to create initial user:');
      console.log(errors);
    } else {
      console.log(`
      ╔═══════════════════════════════════════════╗
      ║       ✅ ADMIN ACCOUNT CREATED            ║
      ╠═══════════════════════════════════════════╣
      ║  Username: ${DEFAULT_ADMIN.phone.padEnd(20)}║
      ║  Password: ${DEFAULT_ADMIN.password.padEnd(20)}║
      ║                                           ║
      ║  ⚠️  ĐỔI MẬT KHẨU SAU KHI ĐĂNG NHẬP!     ║
      ╚═══════════════════════════════════════════╝
      `);
    }
  }

  // =============================================
  // 2. TẠO SETTING MẶC ĐỊNH
  // =============================================
  const {
    data: {
      _allSettingsMeta: { count: settingCount = 0 },
    },
  } = await keystone.executeGraphQL({
    context: keystone.createContext().sudo(),
    query: `query {
      _allSettingsMeta {
        count
      }
    }`,
  });

  if (settingCount === 0) {
    const { errors: settingErrors } = await keystone.executeGraphQL({
      context: keystone.createContext().sudo(),
      query: `mutation initialSetting {
            createSetting(data: {
              hotline: "${DEFAULT_SCHOOL.hotline}"
              zaloId: "${DEFAULT_SCHOOL.zaloId}"
              contactName: "${DEFAULT_SCHOOL.name}"
              workTime: "${DEFAULT_SCHOOL.workTime}"
              workDays: "${DEFAULT_SCHOOL.workDays}"
            }) {
              id
            }
          }`,
    });

    if (settingErrors) {
      console.log('❌ failed to create initial setting:');
      console.log(settingErrors);
    } else {
      console.log('✅ Default setting created');
    }
  }

  // =============================================
  // 3. TẠO SCHOOL MẶC ĐỊNH
  // =============================================
  const {
    data: {
      _allSchoolsMeta: { count: schoolCount = 0 },
    },
  } = await keystone.executeGraphQL({
    context: keystone.createContext().sudo(),
    query: `query {
      _allSchoolsMeta {
        count
      }
    }`,
  });

  if (schoolCount === 0) {
    const { errors: schoolErrors } = await keystone.executeGraphQL({
      context: keystone.createContext().sudo(),
      query: `mutation initialSchool {
            createSchool(data: {
              name: "${DEFAULT_SCHOOL.name}"
              description: "${DEFAULT_SCHOOL.description}"
              tagline: "${DEFAULT_SCHOOL.tagline}"
              color: "${DEFAULT_SCHOOL.color}"
              logo: "${DEFAULT_SCHOOL.logo}"
              hotline: "${DEFAULT_SCHOOL.hotline}"
              zaloId: "${DEFAULT_SCHOOL.zaloId}"
              address: "${DEFAULT_SCHOOL.address}"
              email: "${DEFAULT_SCHOOL.email}"
              website: "${DEFAULT_SCHOOL.website}"
              workTime: "${DEFAULT_SCHOOL.workTime}"
              workDays: "${DEFAULT_SCHOOL.workDays}"
            }) {
              id
            }
          }`,
    });

    if (schoolErrors) {
      console.log('❌ failed to create initial school:');
      console.log(schoolErrors);
    } else {
      console.log('✅ Default school created');
      console.log(`   → Vào Admin > Schools để chỉnh sửa tên, logo, màu sắc`);
    }
  }
};
