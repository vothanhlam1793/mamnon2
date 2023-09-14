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
        topic: {
            type: Text,
        },
        rtsp: {
            type: Text,
        },
        hls: {
            type: Text,
        },
        state: {
            type: Text,
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