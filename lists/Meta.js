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
        key: {
            type: Text
        },
        value: {
            type: Text
        }
    },
    access: {

    },
}