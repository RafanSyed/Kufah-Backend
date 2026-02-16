import { TeacherPushToken } from "./models";

export function toPopulateTeacherPushToken(data: any): TeacherPushToken {
    return new TeacherPushToken(
        data.id,
        data.teacher_id,
        data.push_token,
        data.platform,
        data.is_active,
        data.created_at,
        data.updated_at
    );
}