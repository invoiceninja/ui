import { User } from '$app/common/interfaces/user';
import { Task } from '../../../../src/common/interfaces/task';
import { isOverlapping } from '../../../../src/pages/tasks/common/helpers/is-overlapping';

describe('Test Valid Task TimeLog', () => {
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

        const assigned_user: User = {
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


        const task :Task = {
            id: "x",
            user_id: "x",
            assigned_user_id: "x",
            client_id: "x",
            invoice_id: "x",
            project_id: "x",
            status_id: "x",
            status_sort_order: 1,
            custom_value1: "x",
            custom_value2: "x",
            custom_value3: "x",
            custom_value4: "x",
            duration: 10,
            description: "x",
            is_running: false,
            time_log: "",
            number: "x",
            rate: 10,
            documents: [],
            is_date_based: true,
            status_order: 1,
            is_deleted: false,
            archived_at: 1,
            created_at: 2,
            updated_at: 3,
            date: "2020-01-01",
            calculated_start_date: "2020-01-01",
            user: user,
            assigned_user: user,
        }  

        task.time_log = "[[0,1]]";

        expect(isOverlapping(task)).toEqual(false);

        task.time_log = "[[0,1],[0,19]]";

        expect(isOverlapping(task)).toEqual(true);

        task.time_log = "[[0,1],[19,0]]";

        expect(isOverlapping(task)).toEqual(false);

        task.time_log = "[[0,1],[19,0],[20,50]]";

        expect(isOverlapping(task)).toEqual(true);


    });
});
