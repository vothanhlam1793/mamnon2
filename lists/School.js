/**
 * ============================================
 * SCHOOL Schema - Thông tin trường
 * ============================================
 * Mỗi trường có 1 School record để customize:
 * - Tên hiển thị
 * - Logo
 * - Màu chủ đạo
 * - Hotline, địa chỉ
 * - Trạng thái bảo trì
 */

const { Text, Relationship } = require('@keystonejs/fields');
const access = require("../setting/access").access;

module.exports = {
    fields: {
        // === THÔNG TIN CƠ BẢN ===
        name: {
            type: Text,
            label: 'Tên trường',
            description: 'VD: Trường Mầm Non Ngọc Hoàng',
        },
        description: {
            type: Text,
            label: 'Mô tả ngắn',
            description: 'VD: Trường Mầm Non Chất Lượng Cao',
        },

        // === GIAO DIỆN & THƯƠNG HIỆU ===
        logo: {
            type: Text,
            label: 'Logo URL',
            description: 'VD: /images/ngoc-hoang-logo.png hoặc https://...',
        },
        color: {
            type: Text,
            label: 'Màu chủ đạo',
            description: 'Mã hex. VD: #ff6b6b (màu hồng mặc định)',
        },
        tagline: {
            type: Text,
            label: 'Slogan',
            description: 'VD: "Nơi gửi gắm yêu thương"',
        },

        // === LIÊN HỆ ===
        hotline: {
            type: Text,
            label: 'Hotline',
            description: 'VD: 0862270717',
        },
        zaloId: {
            type: Text,
            label: 'ID Zalo',
            description: 'VD: 0862270717 (số điện thoại Zalo)',
        },
        address: {
            type: Text,
            label: 'Địa chỉ',
            description: 'VD: 123 Nguyễn Trãi, Quận 1, TP.HCM',
        },
        email: {
            type: Text,
            label: 'Email liên hệ',
            description: 'VD: contact@ngchoang.edu.vn',
        },
        website: {
            type: Text,
            label: 'Website',
            description: 'VD: https://ngchoang.edu.vn',
        },

        // === GIỜ LÀM VIỆC ===
        workTime: {
            type: Text,
            label: 'Giờ làm việc',
            description: 'VD: 7g - 17g',
        },
        workDays: {
            type: Text,
            label: 'Ngày làm việc',
            description: 'VD: T2 - T6',
        },

        // === TRẠNG THÁI HỆ THỐNG ===
        stateMode: {
            type: Relationship,
            ref: 'Notify',
            label: 'Trạng thái hệ thống',
            description: 'Thông báo bảo trì / sự cố',
            many: false,
        },
    },

    // === ACCESS CONTROL ===
    access: {
        read: access.userIsAdmin,
        update: access.userIsAdmin,
        create: access.userIsAdmin,
        delete: access.userIsAdmin,
    },

    labelField: 'name',
    plural: 'Schools',
};
