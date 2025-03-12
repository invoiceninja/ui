import { User } from '$app/common/interfaces/user';

describe('Test User Logic Bools', () => {
    test('access', () => {

        const user: User = {
            id: "x",
            first_name: "Jim",
            last_name: "Bob",
            email: "g@gmail.com",
            phone: "1234567890",
            has_password: true,
            oauth_provider_id: "google",
            custom_value1: "x",
            custom_value2: "x",
            custom_value3: "x",
            custom_value4: "x",
            email_verified_at: 0,
            google_2fa_secret: false,
            is_deleted: false,
            last_confirmed_email_address: "",
            last_login: 0,
            oauth_user_token: "",
            signature: "",
            verified_phone_number: false,
            created_at: 0,
            updated_at: 0,
            archived_at: 0,
            language_id: "1",
            user_logged_in_notification: true,
        }

        expect(user?.has_password && user.oauth_provider_id.length >=1).toEqual(true);

        user.has_password = false;
        user.oauth_provider_id = "google";

        expect(!user?.has_password && user?.oauth_provider_id && user.oauth_provider_id.length > 1).toEqual(true);

        user.has_password = true;
        user.oauth_provider_id = "google";

        expect(!user?.has_password && user?.oauth_provider_id && user.oauth_provider_id.length > 1).toEqual(false);


    });
});
