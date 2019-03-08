import { Component, OnInit } from '@angular/core';
import { IDropdown } from '../../agent-procedures/agent-procedures.interface';
import { ActivatedRoute, Router } from '@angular/router';
import { DepartmentService } from '../../services/departments.service';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { Location } from '@angular/common';
import { FormGroup } from '@angular/forms';
import { diffObjects, API_URL } from '../../utils/utils.service';
import { IConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.interface';
import { TabChangeService } from '../../tab-change/tab-change.service';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-department',
    templateUrl: 'department.component.html',
    styleUrls: ['./department.component.scss']
})

export class DepartmentComponent implements OnInit {
    currentDepartment: IDropdown;

    showLoadingSpinner = {};
    departmentSettingsApiUrl: string;
    departmentSettingsConfirmationDialogData: IConfirmationDialogData = {
        title: 'Confirm update',
        content: `
            You've removed one or more companies from this department.
            URL Redirect permissions and users assigned to this department would also be removed.
            Are you sure you wish to persist the changes?
        `
    };

    departmentSettingsDisplayedColumns = ['select', 'name', 'emailAddress', 'luisEndpoint', 'skill', 'isDefault', 'hiddenFromMenu'];

    constructor(
        public location: Location,
        private route: ActivatedRoute,
        private departmentService: DepartmentService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private tabChangeService: TabChangeService,
        private dialog: MatDialog,
        private router: Router
    ) { }

    ngOnInit() {
        this.showLoadingSpinner['overlay'] = true;
        this.route.params
            .subscribe(async params => {
                try {
                    const departments = await this.departmentService.getDepartments();
                    this.currentDepartment = departments.find(department => department.id === +params['id']);
                    this.departmentSettingsApiUrl = `${API_URL}/api/departments/${this.currentDepartment.id}/companies`;
                    this.showLoadingSpinner['overlay'] = false;
                } catch (error) {
                    console.log(error);
                    this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                    this.showLoadingSpinner['overlay'] = false;
                }
            });
    }

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveCompanies'] = true;
        const data = <IDropdown>diffObjects(this.currentDepartment, event.value);
        if (Object.keys(data).length) {
            try {
                await this.departmentService.updateDepartment(this.currentDepartment.id, data);
                this.showLoadingSpinner['saveCompanies'] = false;
                Object.assign(this.currentDepartment, data);
            } catch (error) {
                console.error(error);
                this.showLoadingSpinner['saveCompanies'] = false;
            }
        } else {
            this.showLoadingSpinner['saveCompanies'] = false;
        }
    }

    public async deleteDepartment(): Promise<void> {
        try {
            const data: IConfirmationDialogData = {
                title: 'You are about to delete a Department',
                content: `
                    Deleting a department would also delete all the entities connected to a department such as categories,
                    subcategories, company departments and much more.
                    Are you absolutely sure you wish to proceed?
                `
            };

            this.dialog
                .open(ConfirmationDialogComponent, {
                    data
                })
                .afterClosed()
                .subscribe(async result => {
                    if (result) {
                        try {
                            this.showLoadingSpinner['overlay'] = true;
                            await this.departmentService.deleteDepartment(this.currentDepartment.id);
                            this.showLoadingSpinner['overlay'] = false;
                            this.router.navigate(['/departments']);
                        } catch (error) {
                            console.error(error);
                            this.showLoadingSpinner['overlay'] = false;
                        }
                    }
                });
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }
}
