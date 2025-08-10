import { HttpStatus } from "@nestjs/common";

export type categoryReturn = {
    id:string;
    name: string;
    description: string | null;
    createdAt: string | null;
}

export type categoryApiResponse = {
    statusCode: HttpStatus;
    message: string;
    data: categoryReturn;
}