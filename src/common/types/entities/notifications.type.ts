import { messageT } from './messages.type';

export type NotificationsT = {
    id: number | null;
    kind: string | null;
    title: string | null;
    content: string | null;
    ios_link: string | null;
    android_link: string | null;
    created_at: Date | null;
    message?: messageT | null;
};
