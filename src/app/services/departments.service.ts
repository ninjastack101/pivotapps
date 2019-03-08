import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../utils/utils.service';
import { IDropdown } from '../agent-procedures/agent-procedures.interface';
import { ICompanyDepartment } from './companies.interface';
import { Subject } from 'rxjs';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { IBotPersona } from './botpersona.interface';
import { ICompanyDepartmentUser } from '../departments/department/users/department-users.interface';
import { CompanyFilterService } from './company-filter.service';

@Injectable()
export class DepartmentService {
    private departments: Array<IDropdown> = [];

    departmentsSubject = new Subject<Array<IDropdown>>();

    constructor(
        private http: HttpClient,
        private orderByPipe: OrderByPipe,
        private companyFilterService: CompanyFilterService
    ) { }

    getDepartments(): Promise<Array<IDropdown>> {
        if (this.departments.length) {
            if (this.companyFilterService.companyId) {
                const departments = this.departments.filter(department => {
                    const index = department.companies.findIndex(
                        company => company.id === this.companyFilterService.companyId
                    );

                    if (index !== -1) {
                        return department;
                    }
                });

                if (departments.length) {
                    return Promise.resolve(departments);
                } else {
                    return this._getDepartments();
                }

            } else if (this.companyFilterService.companyId === null) {
                return this._getDepartments();
            } else {
                return Promise.resolve(this.departments);
            }
        } else {
            return this._getDepartments();
        }
    }

    private _getDepartments() {
        return this.http
            .get<Array<IDropdown>>(`${API_URL}/api/departments`)
            .toPromise()
            .then(departments => this.departments = departments);
    }

    createDepartment(data: object): Promise<IDropdown> {
        return this.http
            .post<IDropdown>(`${API_URL}/api/departments`, data)
            .toPromise()
            .then(department => {
                this.departments.push(department);
                this.departments = this.orderByPipe.transform(this.departments, ['name', 'asc']);
                this.departmentsSubject.next(this.departments);
                return department;
            });
    }

    updateDepartment(id: number, data: IDropdown): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/departments/${id}`, data)
            .toPromise()
            .then(() => {
                // Update cached departments
                const department = this.departments.find(dept => dept.id === data.id);
                if (department) {
                    department.name = data.name;
                }

                this.departmentsSubject.next(this.departments);
            });
    }

    deleteDepartment(id: number): Promise<void> {
        return this.http
            .delete<void>(`${API_URL}/api/departments/${id}`)
            .toPromise()
            .then(() => {
                const index = this.departments.findIndex(dept => dept.id === id);
                this.departments.splice(index, 1);
                this.departmentsSubject.next(this.departments);
            });
    }

    getCompanyBotPersonasByDepartment(departmentId: number): Promise<Array<IBotPersona>> {
        return this.http
            .get<Array<IBotPersona>>(`${API_URL}/api/departments/${departmentId}/company-botpersonas`)
            .toPromise();
    }

    getDepartmentCompanyUsers(id: number): Promise<Array<ICompanyDepartmentUser>> {
        return this.http
            .get<Array<ICompanyDepartmentUser>>(`${API_URL}/api/departments/${id}/company-users`)
            .toPromise();
    }
}
