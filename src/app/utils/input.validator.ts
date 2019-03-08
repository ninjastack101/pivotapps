import { AbstractControl } from '@angular/forms';

/**
 *
 * @param control AbstractControl
 *
 * Error field to be used with validation message: **invalidUrl**
 */
export function validateUrl(control: AbstractControl) {
    if (control.value) {
        const URL_REGEXP = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/;
        return URL_REGEXP.test(control.value) ? null : {
            invalidUrl: true
        };
    }
}

export function validatePattern(control: AbstractControl, pattern: RegExp, errorKey: string) {
    if (control.value && !pattern.test(control.value)) {
        return {
            [errorKey]: true
        };
    }
}

export function ValidateEitherFields(field1: object, field2: object): string|null {
    if (!field1['value'] && !field2['value']) {
        return `Fields ${field1['name']} and ${field2['name']} cannot both be empty.`;
    }

    if (field1['value'] && field2['value']) {
        return `Fields ${field1['name']} and ${field2['name']} cannot both have values.`;
    }

    return null;
}
