import { Injectable, PipeTransform } from "@nestjs/common";
import { Schema } from "zod";

@Injectable()
export class ZodValidationPipe implements PipeTransform {
    constructor(private schema: Schema) {}

    transform(value: any) {
        try {
            return (this.schema.parse(value));
        } catch (error) {
            return false;
        }
    }
}