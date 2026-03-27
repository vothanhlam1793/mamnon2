const crypto = require('crypto');
const randomString = () => crypto.randomBytes(6).hexSlice();

module.exports = async keystone => {
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
    const password = randomString();
    const email = 'admin@example.com';

    const { errors } = await keystone.executeGraphQL({
      context: keystone.createContext().sudo(),
      query: `mutation initialUser($password: String, $email: String) {
            createUser(data: {name: "Admin", email: $email, isAdmin: true, password: $password}) {
              id
            }
          }`,
      variables: { password, email },
    });

    if (errors) {
      console.log('failed to create initial user:');
      console.log(errors);
    } else {
      console.log(`

      User created:
        email: ${email}
        password: ${password}
      Please change these details after initial login.
      `);
    }
  }

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
              hotline: "0862270717"
              zaloId: "0862270717"
              contactName: "Huyền"
              workTime: "8g - 11g30 / 13g30 - 17g30"
              workDays: "T2 - T6"
            }) {
              id
            }
          }`,
    });

    if (settingErrors) {
      console.log('failed to create initial setting:');
      console.log(settingErrors);
    } else {
      console.log('Default setting created');
    }
  }
};