export type userReturn = {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    isActive: boolean | null;
    createdAt: string | null;
    updatedAt: string | null;
}

export type loginReturn = {
    id: string;
    email: string;
    role: string;
    token: string;
}

type codes = 200 | 201 | 204 | 400 | 404 | 403 | 401 | 500;

export type userApiResponse = {
    statusCode: codes,
    message: string;
}