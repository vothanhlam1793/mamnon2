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
        rtsp: {
            type: Text,
        },
        name: {
            type: Text,
        },
        topic: {
            type: Text,
        },
        state: {
            type: Text
        }
    },
    access: {
        
    },
}