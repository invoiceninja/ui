import { Task } from '../../../../src/common/interfaces/task';
import { isOverlapping } from '../../../../src/pages/tasks/common/helpers/is-overlapping';

describe('Test Valid Task TimeLog', () => {
    test('access', () => {
        
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
            invoice_documents: false,
            is_date_based: true,
            status_order: 1,
            is_deleted: false,
            archived_at: 1,
            created_at: 2,
            updated_at: 3,
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
