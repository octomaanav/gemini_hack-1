
export interface User {
    user_id: string;
    email: string;
    name: string;
    disabilities?: string[] | null;
    grade?: string | null;
    curriculum?: string | null;
    subjects?: string[] | null;
    isProfileComplete: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
}
