import { FormControl } from '@angular/forms';

export function validateJson(input: FormControl): object | null {
    try {
        if (input.value) {
            JSON.parse(input.value);
        }

        return null;
    } catch (error) {
        return { invalidFormat: true };
    }
}
