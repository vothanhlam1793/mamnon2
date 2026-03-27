const {
    Text,
  } = require('@keystonejs/fields');

module.exports = {
    fields: {
        hotline: {
            type: Text,
        },
        zaloId: {
            type: Text,
        },
        contactName: {
            type: Text,
        },
        workTime: {
            type: Text,
        },
        workDays: {
            type: Text,
        },
    },
    access: {
        read: true,
        update: true,
        create: true,
        delete: true,
    },
}