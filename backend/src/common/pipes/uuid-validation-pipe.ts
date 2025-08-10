import { ArgumentMetadata, BadRequestException, Injectable, PipeTransform } from "@nestjs/common";
import { validate } from "uuid";

// Pipe is a class which implements the said interface.
// 1. It transforms the input, here from string -> string
// 2. Validates input data and throws exception on invalid format

@Injectable()
export class UuidValidationPipe implements PipeTransform<string, string> {
    transform(value: string, metadata: ArgumentMetadata): string {
        if(!value) {
            throw new BadRequestException("ID parameter is required");
        }

        if(!validate(value)) {
            throw new BadRequestException("Invalid UUID format");
        }
        return value;
    }
}