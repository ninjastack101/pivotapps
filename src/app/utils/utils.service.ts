import { FormGroup } from '@angular/forms';

export const API_URL = '';


export function diffObjects(sourceObject: object, newObject: object): object {
    const changes = {};

    for (const key in newObject) {
        if (newObject[key] !== sourceObject[key]) {
            changes[key] = newObject[key];
        }
    }

    return changes;
}

export function setEmptyStringsToNull(entity: object): object {
    const changes = {};

    for (const key in entity) {
        if (entity.hasOwnProperty(key) && entity[key] !== '') {
            changes[key] = entity[key];
        }
    }

    return changes;
}

export function diffSets<T>(set1: Set<T>, set2: Set<T>): Set<T> {
    const difference = new Set(set1);
    set2.forEach(element => difference.delete(element));
    return difference;
}

export function max(data: Array<number>, initialValue: number|null) {
    return data.reduce((a, b) => Math.max(a, b), initialValue);
}

export function replaceKnownVariable(variable: string): string {
    return variable.replace(/^<% | %>$/g, '');
}

export function trimStringPropertiesFromObject(data) {
    for (const key in data) {
        if (data.hasOwnProperty(key) && typeof data[key] === 'string') {
            data[key] = data[key].trim();
        } else if (data[key] !== null && typeof data[key] === 'object') {
            data[key] = this.trimStringPropertiesFromObject(data[key]);
        }
    }
    return data;
}

export function hasFormChanged(formData: FormGroup, form: object): boolean {
    let formDataChangeDetected = false;
    for (const formControl of Object.keys(formData)) {
        if (formData[formControl] !== form[formControl]) {
            formDataChangeDetected = true;
            break;
        }
    }

    return formDataChangeDetected;
}

export function parseAndStringify(data: string, space?: number): string {
    return JSON.stringify(JSON.parse(data), null, space);
}
