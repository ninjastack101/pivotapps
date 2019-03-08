import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../utils/utils.service';
import { IDepartmentCategory } from '../agent-procedures/agent-procedures.interface';
import { IDepartmentCategoryUpdate } from '../categories/categories.interface';
import { Subject } from 'rxjs';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { CompanyFilterService } from './company-filter.service';

@Injectable()
export class CategoryService {
    private categories: Array<IDepartmentCategory> = [];
    categoriesSubject = new Subject<Array<IDepartmentCategory>>();

    constructor(
        private http: HttpClient,
        private orderByPipe: OrderByPipe,
        private companyFilterService: CompanyFilterService
    ) { }

    getCategories(fromCache = true): Promise<Array<IDepartmentCategory>> {
        if (this.categories.length && fromCache) {
            if (this.companyFilterService.companyId) {
                const categories = this.categories.filter(category => {
                    const index = category.companies.findIndex(
                        company => company.id === this.companyFilterService.companyId
                    );

                    if (index !== -1) {
                        return category;
                    }
                });

                if (categories.length) {
                    return Promise.resolve(categories);
                } else {
                    return this._getCategories();
                }

            } else if (this.companyFilterService.companyId === null) {
                return this._getCategories();
            } else {
                return Promise.resolve(this.categories);
            }
        } else {
            return this._getCategories();
        }
    }

    private _getCategories() {
        return this.http
            .get<Array<IDepartmentCategory>>(`${API_URL}/api/categories`)
            .toPromise()
            .then(categories => this.categories = categories);
    }

    createCategory(data: object): Promise<IDepartmentCategory> {
        return this.http
            .post<IDepartmentCategory>(`${API_URL}/api/categories`, data)
            .toPromise()
            .then(category => {
                this.categories.push(category);
                this.categories = this.orderByPipe.transform(this.categories, ['name', 'asc']);
                this.categoriesSubject.next(this.categories);
                return category;
            });
    }

    updateCategories(updatedEntities: Array<IDepartmentCategoryUpdate>): Promise<void> {
        return this.http
            .put<void>(`${API_URL}/api/categories`, updatedEntities)
            .toPromise()
            .then(() => {
                // Update cached categories
                for (const entity of updatedEntities) {
                    const deptCategory = this.categories.find(category => category.id === entity.id);
                    if (deptCategory) {
                        Object.assign(deptCategory, entity);
                    }
                }

                this.categoriesSubject.next(this.categories);
            });
    }

    deleteCategory(id: number): Promise<void> {
        return this.http
            .delete<void>(`${API_URL}/api/categories/${id}`)
            .toPromise()
            .then(() => {
                const index = this.categories.findIndex(category => category.id === id);
                this.categories.splice(index, 1);
                this.categoriesSubject.next(this.categories);
            });
    }
}
