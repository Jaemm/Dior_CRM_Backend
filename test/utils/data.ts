export const localURL = process.env.LOCAL_TEST_API_URL ?? 'http://localhost:3100/v1/api';
export const rubyURL = process.env.REMOTE_TEST_API_URL ?? 'https://example.com/api';

export const consultantRegisterData = {
    email: 'test.user@example.com',
    password: 'example-password',
    app_id: 88,
};

export const consultantRubyRegisterData = {
    email: 'test.user2@example.com',
    app_id: 88,
    password: 'example-password',
};

export const consultantLoginData = {
    email: 'test.user@example.com',
    password: 'example-password',
    app_id: 88,
};

export const consultantUpdateData = {
    address: 'test',
    app_id: 88,
    age: '23',
    skin_color_group_id: '1',
    ethnicity_id: '1',
    city: 'testCity',
    state: 'testState',
    zip_code: 'testZipCode',
    phone_country_code: '93',
    country_code: 'AF',
    gender_id: 1,
    consultant_shop_id: '712',
};
