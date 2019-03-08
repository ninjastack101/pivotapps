import { Component, OnInit, Input } from '@angular/core';
import { ICompany, ICompanyDepartment, ICompanyDepartmentTable } from '../services/companies.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { MatTableDataSource, MatDialog } from '@angular/material';
import { CompanyService } from '../services/companies.service';
import { IDepartmentCompaniesPatch } from './company-settings.interface';
import { IConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.interface';
import { diffSets } from '../utils/utils.service';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { CompanySettingsService } from './company-settings.service';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { SkillsDialogComponent } from '../skills-dialog/skills-dialog.component';
import { ISkill } from '../agent-procedures/skills.interface';

@Component({
    selector: 'app-company-settings',
    templateUrl: 'company-settings.component.html',
    styleUrls: ['./company-settings.component.scss']
})

export class CompanySettingsComponent implements OnInit {
    @Input() apiUrl: string;
    @Input() apiUrlCompanies: string;
    @Input() confirmationDialogData: IConfirmationDialogData;
    @Input() displayedColumns: Array<string>;

    showLoadingSpinner = {};

    companies: Array<ICompany>;
    existingCompanyIds: Array<number> = [];
    companyDepartments: Array<ICompanyDepartment> = [];

    allowMultiSelect = true;
    selection: SelectionModel<number>;
    dataSource: MatTableDataSource<ICompanyDepartmentTable> = new MatTableDataSource();

    searchSubject: Subject<string> = new Subject();

    constructor(
        private companyService: CompanyService,
        private dialog: MatDialog,
        private companySettingsService: CompanySettingsService
    ) { }

    async ngOnInit() {
        this.showLoadingSpinner['init'] = true;
        try {
            if (this.apiUrlCompanies) {
                this.companies = await this.companySettingsService.getCompanySettings(this.apiUrlCompanies);
                this.initCompanyDepartments();
            } else {
                [this.companies, this.companyDepartments] = await Promise.all([
                    this.companyService.getCompanies(),
                    this.companySettingsService.getCompanies(this.apiUrl)
                ]);
            }

            this.initTableSources();

            this.searchSubject
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged()
                )
                .subscribe(searchText => {
                    this.dataSource.filter = searchText;
                });

            this.showLoadingSpinner['init'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['init'] = false;
        }
    }

    /** Whether the number of selected elements matches the total number of rows. */
    isAllSelected() {
        const numSelected = this.selection.selected.length;
        const numRows = this.dataSource.data.length;
        return numSelected === numRows;
    }

    /** Selects all rows if they are not all selected; otherwise clear selection. */
    masterToggle() {
        this.isAllSelected()
            ? this.selection.clear()
            : this.dataSource.data.forEach(row => this.selection.select(row.id));
    }

    async saveSettings(): Promise<void> {
        const { addedIds, removedIds } = this.diffCompanyDepartments();

        try {
            const update = await this.confirmUpdate(removedIds);
            if (update) {
                this.showLoadingSpinner['saveSettings'] = true;
                const data = this.getModifiedEntities(addedIds, removedIds);
                if (data.addedEntities.length || data.removedEntities.length || data.updatedEntities.length) {
                    await this.companySettingsService.updateSetting(
                        this.apiUrl,
                        data
                    );
                    await this.getUpdatedEntities();
                    this.showLoadingSpinner['saveSettings'] = false;
                } else {
                    this.showLoadingSpinner['saveSettings'] = false;
                }
            }
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['saveSettings'] = false;
        }
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public searchSkill(companyDepartment: ICompanyDepartmentTable): void {
        this.dialog
            .open(SkillsDialogComponent)
            .afterClosed()
            .subscribe((skill: ISkill) => {
                if (skill) {
                    companyDepartment.skillInfo = skill;
                    companyDepartment.skillId = skill.id;
                }
            });
    }

    private diffCompanyDepartments() {
        const selectionSet = new Set(this.selection.selected);
        const existingSet =  new Set(this.existingCompanyIds);
        const addedIds = diffSets(selectionSet, existingSet);
        const removedIds = diffSets(existingSet, selectionSet);

        return { addedIds, removedIds };
    }

    private confirmUpdate(removedIds: Set<number>): Promise<boolean> {
        if (removedIds.size) {
            const data: IConfirmationDialogData = this.confirmationDialogData;

            return this.dialog
                .open(ConfirmationDialogComponent, {
                    data,
                    width: '400px',
                    height: '250px'
                })
                .afterClosed()
                .toPromise();
        } else {
            return Promise.resolve(true);
        }
    }

    private async getUpdatedEntities(): Promise<void> {
        this.existingCompanyIds.length = 0;
        this.companyDepartments.length = 0;
        if (this.apiUrlCompanies) {
            this.companies = await this.companySettingsService.getCompanySettings(this.apiUrlCompanies);
            this.initCompanyDepartments();
        } else {
            this.companyDepartments = await this.companySettingsService.getCompanies(this.apiUrl);
        }

        this.initTableSources();
    }

    private getModifiedEntities(addedIds: Set<number>, removedIds: Set<number>): IDepartmentCompaniesPatch {
        const updatedEntities = this.dataSource.data
            .filter(data =>
                !addedIds.has(data.id)
                && !removedIds.has(data.id)
                && this.selection.isSelected(data.id)
            )
            .filter(data => {
                const filterConditions: Array<boolean> = [];

                const company = this.companyDepartments.find(
                    companyDept => companyDept.companyId === data.id
                );

                if (company) {
                    filterConditions.push(company.emailAddress !== data.emailAddress);
                    filterConditions.push(company.luisEndpoint !== data.luisEndpoint);
                    filterConditions.push(company.isDefault !== data.isDefault);
                    filterConditions.push(company.hiddenFromMenu !== data.hiddenFromMenu);
                    filterConditions.push(company.skillId !== data.skillId);

                    return filterConditions
                        .reduce((previousValue, currentValue) => previousValue || currentValue, false);
                }
            });

        const modifiedObject: IDepartmentCompaniesPatch = {
            addedEntities: this.dataSource.data.filter(data => addedIds.has(data.id)),
            updatedEntities: updatedEntities,
            removedEntities: this.dataSource.data.filter(data => removedIds.has(data.id))
        };


        return modifiedObject;
    }

    private initTableSources() {
        const result = this.updateCompanies(this.companyDepartments);
        this.dataSource.data = result.companyDepartmentsTable;
        this.existingCompanyIds = result.existingCompanyIds;
        this.selection = new SelectionModel(this.allowMultiSelect, this.existingCompanyIds);
    }

    private updateCompanies(companyDepartments: Array<ICompanyDepartment>) {
        const companyDepartmentsTable: Array<ICompanyDepartmentTable> = [];
        const existingCompanyIds = this.existingCompanyIds.slice();

        for (const company of this.companies) {
            let emailAddress = 'service-request@catalysttg.com';
            let luisEndpoint = null, isDefault, hiddenFromMenu, skillId, skillInfo;
            const compDept = companyDepartments.find(dept => dept.companyId === company.id);

            if (compDept && !existingCompanyIds.includes(compDept.companyId)) {
                existingCompanyIds.push(compDept.companyId);
                if (compDept.emailAddress) {
                    emailAddress = compDept.emailAddress;
                }

                if (compDept.luisEndpoint) {
                    luisEndpoint = compDept.luisEndpoint;
                }

                skillId = compDept.skillId;
                isDefault = compDept.isDefault || false;
                hiddenFromMenu = compDept.hiddenFromMenu || false;
                skillInfo = compDept.skillInfo || null;
            }

            companyDepartmentsTable.push({
                ...company,
                skillId,
                skillInfo,
                emailAddress,
                luisEndpoint,
                isDefault,
                hiddenFromMenu
            });
        }

        return {
            companyDepartmentsTable,
            existingCompanyIds
        };
    }

    private initCompanyDepartments() {
        for (const company of this.companies) {
            if (company.categories) {
                for (const category of company.categories) {
                    if (category.CompanyDepartmentCategory) {
                        this.companyDepartments.push({ companyId: category.CompanyDepartmentCategory.companyId });
                    }
                }
            } else if (company.subCategories) {
                for (const subCategory of company.subCategories) {
                    if (subCategory.CompanyDepartmentSubCategory) {
                        this.companyDepartments.push({ companyId: subCategory.CompanyDepartmentSubCategory.companyId });
                    }
                }
            }
        }
    }
}
