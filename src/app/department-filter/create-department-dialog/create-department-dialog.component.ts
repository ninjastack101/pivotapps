import { Component, OnInit } from '@angular/core';
import { DepartmentService } from '../../services/departments.service';
import { FormGroup } from '@angular/forms';
import { MatDialogRef } from '@angular/material';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';

@Component({
    selector: 'app-create-department-dialog',
    templateUrl: 'create-department-dialog.component.html',
    styleUrls: ['./create-department-dialog.component.scss']
})

export class CreateDepartmentDialogComponent implements OnInit {
    inputForm: FormGroup;
    showLoadingSpinner = {};

    constructor(
        private departmentService: DepartmentService,
        private dialogRef: MatDialogRef<CreateDepartmentDialogComponent>,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() {}

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveDepartments'] = true;
        try {
            const department = await this.departmentService.createDepartment(event.value);
            this.dialogRef.close(department);
            this.showLoadingSpinner['saveDepartments'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveDepartments'] = false;
        }
    }
}
