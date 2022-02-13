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
        school: {
            type: Relationship,
            ref: 'School',
        },
        cameras: {
            type: Relationship,
            ref: 'Camera',
            many: true
        }
    },
    access: {
        
    },
}