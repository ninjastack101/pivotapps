import { FormGroup,  AbstractControl } from '@angular/forms';

export interface IFormValueChangesOpts {
    form: FormGroup;
    formErrors: Map<string, string>;
    validationMessages: Map<string, Map<string, string>>;
    data?: any;
}

export class ValidationMessageService {

    static _multipleFormHandling(options: IFormValueChangesOpts, field: string): void {
        const allFormGroups = options.form.get('messages');
        for (let i = 0; i < allFormGroups['controls'].length; i++) {
            const control = allFormGroups['controls'][i].get(field);
            ValidationMessageService._handleControl(options, field, control);
        }
    }

    static _handleControl(options: IFormValueChangesOpts, field: string, control:  AbstractControl): void {
        if (control && control.touched && !control.valid) {
            const messages = options.validationMessages.get(field);
            for (const [key, value] of Array.from(messages)) {
                if (control.getError(key)) {
                    options.formErrors.set(field, messages.get(key));
                }
            }
        }
    }

    static onValueChanged(options: IFormValueChangesOpts) {
        for (const [field, error] of Array.from(options.formErrors)) {
            options.formErrors.set(field, '');
            const control = options.form.get(field);
            if (control) {
                ValidationMessageService._handleControl(options, field, control);
            } else {
                ValidationMessageService._multipleFormHandling(options, field);
            }
        }
    }
}
