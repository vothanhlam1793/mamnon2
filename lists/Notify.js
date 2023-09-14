const {
    File,
    Text,
    Slug,
    Relationship,
    Select,
    Password,
    Checkbox,
    CalendarDay,
    DateTime,
  } = require('@keystonejs/fields');
const access = require("../setting/access").access;
module.exports = {
    fields: {
        name: {
            type: Text,
        },
        description: {
            type: Text,
        },
        estimate: {
            type: DateTime,
        },
        note: {
            type: Text
        }
    },
    access: {
        
    },
}