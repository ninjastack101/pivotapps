import { Component, OnInit, OnDestroy } from '@angular/core';
import { DepartmentService } from '../services/departments.service';
import { IDropdown } from '../agent-procedures/agent-procedures.interface';
import { MatDialog } from '@angular/material';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { CreateDepartmentDialogComponent } from '../department-filter/create-department-dialog/create-department-dialog.component';
import { CompanyFilterService } from '../services/company-filter.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-departments',
    templateUrl: './departments.component.html',
    styleUrls: [
        './departments.component.scss'
    ]
})

export class DepartmentsComponent implements OnInit, OnDestroy {
    departments: Array<IDropdown>;
    showLoadingSpinner = {};
    companyChangeSubscription: Subscription;

    constructor(
        private departmentService: DepartmentService,
        private dialog: MatDialog,
        private orderByPipe: OrderByPipe,
        private companyFilterService: CompanyFilterService
    ) { }

    ngOnInit() {
        this.companyChangeSubscription = this.companyFilterService
                .companyChangeSubject
                .subscribe(async () => await this.init());

        this.init();
    }

    public openCreateDepartmentModal() {
        this.dialog.open(CreateDepartmentDialogComponent);
    }

    private async init() {
        this.departments = await this.departmentService.getDepartments();
        this.departments = this.orderByPipe.transform(this.departments, ['name', 'asc']);
    }

    ngOnDestroy() {
        this.companyChangeSubscription.unsubscribe();
    }
}
