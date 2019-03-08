import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../utils/utils.service';
import { IDepartmentSubCategory } from '../agent-procedures/agent-procedures.interface';
import { IDepartmentSubCategoryUpdate } from '../sub-categories/sub-categories.interface';
import { Subject } from 'rxjs';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { CompanyFilterService } from './company-filter.service';

@Injectable()
export class SubCategoryService {
    private subCategories: Array<IDepartmentSubCategory> = [];
    subCategoriesSubject = new Subject<Array<IDepartmentSubCategory>>();

    constructor(
        private http: HttpClient,
        private orderByPipe: OrderByPipe,
        private companyFilterService: CompanyFilterService
    ) { }

    getDepartmentSubCategories(fromCache = true): Promise<Array<IDepartmentSubCategory>> {
        if (this.subCategories.length && fromCache) {
            if (this.companyFilterService.companyId) {
                const subCategories = this.subCategories.filter(subCategory => {
                    const index = subCategory.companies.findIndex(
                        company => company.id === this.companyFilterService.companyId
                    );

                    if (index !== -1) {
                        return subCategory;
                    }
                });

                if (subCategories.length) {
                    return Promise.resolve(subCategories);
                } else {
                    return this._getDepartmentSubCategories();
                }

            } else if (this.companyFilterService.companyId === null) {
                return this._getDepartmentSubCategories();
            } else {
                return Promise.resolve(this.subCategories);
            }
        } else {
            return this._getDepartmentSubCategories();
        }
    }

    private _getDepartmentSubCategories() {
        return this.http
            .get<Array<IDepartmentSubCategory>>(`${API_URL}/api/sub-categories`)
            .toPromise()
            .then(subCategories => this.subCategories = subCategories);
    }

    createSubCategory(data: object): Promise<IDepartmentSubCategory> {
        return this.http
            .post<IDepartmentSubCategory>(`${API_URL}/api/sub-categories`, data)
            .toPromise()
            .then(subCategory => {
                this.subCategories.push(subCategory);
                this.subCategories = this.orderByPipe.transform(this.subCategories, ['name', 'asc']);
                this.subCategoriesSubject.next(this.subCategories);
                return subCategory;
            });
    }

    updateSubCategories(updatedEntities: Array<IDepartmentSubCategoryUpdate>): Promise<void> {
        return this.http
            .put<void>(`${API_URL}/api/sub-categories`, updatedEntities)
            .toPromise()
            .then(() => {
                // Update cached categories
                for (const entity of updatedEntities) {
                    const deptSubCategory = this.subCategories.find(subCategory => subCategory.id === entity.id);
                    if (deptSubCategory) {
                        Object.assign(deptSubCategory, entity);
                    }
                }

                this.subCategoriesSubject.next(this.subCategories);
            });
    }

    deleteSubCategory(id: number): Promise<void> {
        return this.http
            .delete<void>(`${API_URL}/api/sub-categories/${id}`)
            .toPromise()
            .then(() => {
                const index = this.subCategories.findIndex(subCategory => subCategory.id === id);
                this.subCategories.splice(index, 1);
                this.subCategoriesSubject.next(this.subCategories);
            });
    }
}
