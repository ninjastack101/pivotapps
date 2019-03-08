import { Component, AfterViewInit, ViewChildren, QueryList, OnInit, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { AgentProceduresService } from './agent-procedures.service';
import { MatPaginator, MatTableDataSource, MatSort } from '@angular/material';
import { skillTypesMap } from './intent-types';

import { FilterType } from './agent-procedures.enum';
import { IDepartmentFilterSelectionChange } from '../department-filter/department-filter.interface';
import { IDuplicateSkillOptions } from './agent-procedures.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { Subject, Subscription } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { PivotappsAdminSnackBarService } from '../services/snackbar.service';
import { ISkill } from './skills.interface';
import { SkillsFilterService } from 'app/services/skills-filter.service';
import { paginationOptions } from 'app/services/pagination-defaults';
import { CompanyFilterService } from '../services/company-filter.service';
import { MatDialog } from '@angular/material';
import { IConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';

@Component({
    selector: 'app-agent-procedures',
    templateUrl: './agent-procedures.component.html',
    styleUrls: ['./agent-procedures.component.scss']
})
export class AgentProceduresComponent implements OnInit, OnDestroy, AfterViewInit {
    skills: Array<ISkill>;

    showLoadingSpinner = {};

    paginationOptions = paginationOptions;

    subCategoryIds = new Set<number>();

    skillTypes = Array.from(skillTypesMap);
    skillTypesMap = skillTypesMap;

    displayedColumns: Array<string> = ['name', 'skillType', 'hiddenFromMenu', 'duplicate'];

    dataSource: MatTableDataSource<ISkill> = new MatTableDataSource();

    companyChangeSubscription: Subscription;

    // Use ViewChildren since *ngIf is used to toggle
    @ViewChildren(MatPaginator) paginatorList: QueryList<MatPaginator>;
    @ViewChildren(MatSort) sortList: QueryList<MatSort>;

    paginator: MatPaginator;
    sort: MatSort;

    searchSubject: Subject<string> = new Subject();

    constructor(
        private route: ActivatedRoute,
        private router: Router,
        private agentProceduresService: AgentProceduresService,
        private cdRef: ChangeDetectorRef,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private companyFilterService: CompanyFilterService,
        public skillsFilterService: SkillsFilterService,
        private dialog: MatDialog
    ) { }

    ngOnInit() {
        this.companyChangeSubscription = this.companyFilterService
            .companyChangeSubject
            .subscribe(async () => await this.init());

        this.init();
    }

    ngAfterViewInit() {
        this.paginatorList.changes
            .subscribe((components: QueryList<MatPaginator>) => {
                this.paginator = this.dataSource.paginator = components.first;
            });

        this.sortList.changes
            .subscribe((components: QueryList<MatSort>) => {
                this.sort = this.dataSource.sort = components.first;
                this.sort.sortChange.subscribe(() => this.paginator.pageIndex = 0);
            });
    }

    ngOnDestroy() {
        this.searchSubject.unsubscribe();
        this.companyChangeSubscription.unsubscribe();
    }

    async init() {
        try {
            this.skills = await this.agentProceduresService.getSkills();
            this.updatePage();
            this.cdRef.detectChanges();

            this.dataSource.sortingDataAccessor = (data, sortHeaderId) =>
                data[sortHeaderId].toString().toLowerCase();

            this.searchSubject
                .pipe(
                    debounceTime(300),
                    distinctUntilChanged()
                )
                .subscribe(searchText => {
                    this.skillsFilterService.searchText = searchText;
                    this.dataSource.filter = searchText;
                });
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }

    public updatePage(): void {
        if (this.skillsFilterService.searchText) {
            this.dataSource.filter = this.skillsFilterService.searchText;
        }

        if (this.skills) {
            this.dataSource.data = this.skills.filter(procedure => {
                const filterConditions: Array<boolean> = [];

                if (this.subCategoryIds.size) {
                    filterConditions.push(
                        this.subCategoryIds.has(procedure['departmentSubCategoryId'])
                    );
                }

                if (this.skillsFilterService.skillType) {
                    filterConditions.push(
                        procedure.skillType === this.skillsFilterService.skillType
                    );
                }

                if (this.skillsFilterService.displayHiddenSkills !== undefined) {
                    filterConditions.push(
                        procedure.hiddenFromMenu === this.skillsFilterService.displayHiddenSkills
                    );
                }

                return filterConditions
                    .reduce((previousValue, currentValue) => previousValue && currentValue, true);
            });
        }
    }

    public async applyFilter(value: any, type: FilterType): Promise<void> {
        switch (type) {
            case FilterType.IntentType:
                this.skillsFilterService.skillType = value;
                this.updatePage();
                break;
            case FilterType.DisplayHiddenIntent:
                this.skillsFilterService.displayHiddenSkills = value;
                this.updatePage();
                break;
            default:
                break;
        }
    }

    public clearAgentProcedures(): void {
        this.dataSource.data = [];
    }

    public async applyDepartmentFilter(event: IDepartmentFilterSelectionChange): Promise<void> {
        this.skillsFilterService.departmentId = event.currentDepartmentId;
        this.skillsFilterService.categoryId = event.currentCategoryId;
        this.skillsFilterService.subCategoryId = event.currentSubCategoryId;

        this.subCategoryIds = event.subCategoryIds;

        if (event.subCategoryIds.size) {
            this.updatePage();
        }
    }

    public navigateUserToEditPage(row: any): void {
        const options = { relativeTo: this.route };
        switch (this.skillTypesMap.get(row.skillType)) {
            case 'Business Skill (Share Link)':
                this.router.navigate(['url-redirects', row.id], options);
                break;
            case 'Technical Skill (Kaseya)':
                this.router.navigate(['kaseya', row.id], options);
                break;
            case 'Business Skill (QnA)':
                this.router.navigate(['qna', row.id], options);
                break;
            case 'Technical Skill (API)':
                this.router.navigate(['api', row.id], options);
                break;
            default:
                console.error('Unknown intent type');
                break;
        }
    }

    public applySearchFilter(filterValue: string): void {
        this.searchSubject.next(filterValue);
    }

    public clearFilters() {
        this.skillsFilterService.departmentId = undefined;
        this.skillsFilterService.categoryId = undefined;
        this.skillsFilterService.subCategoryId = undefined;
        this.skillsFilterService.skillType = undefined;
        this.skillsFilterService.displayHiddenSkills = undefined;
        this.skillsFilterService.searchText = undefined;

        this.subCategoryIds.clear();

        this.dataSource.filter = '';

        this.updatePage();
    }

    public duplicateSkill(row: any): void {
        const data: IConfirmationDialogData = {
            title: `You are about to duplicate ${row.name} skill.`,
            content: `
                A new skill with the name ${row.name} (Copy) would be created.
                Are you sure you wish to proceed?
            `
        };

        const duplicateSkillOptions: IDuplicateSkillOptions = {
            skillId: row.id,
            departmentSubCategoryId: row.departmentSubCategoryId,
            copySkill: true
        };

        this.dialog
            .open(ConfirmationDialogComponent, { data })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    this.showLoadingSpinner['loading'] = true;
                    try {
                        const duplicateSkill = await this.agentProceduresService.duplicateSkill(duplicateSkillOptions);
                        this.showLoadingSpinner['loading'] = false;
                        this.navigateUserToEditPage(duplicateSkill);
                    } catch (error) {
                        this.showLoadingSpinner['loading'] = false;
                        this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                    }
                }
            });

    }
}
