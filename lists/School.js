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
            type: Text
        },
        stateMode: {
            type: Relationship,
            ref: "Notify",
            many: false
        }
    },
    access: {
        
    },
}