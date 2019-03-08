import { Component, OnInit, Inject } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { PageEvent, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material';
import {
    ISearchKaseyaEntityDialogData
} from './search-kaseya-entities-dialog.interface';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-search-kaseya-kaseya-entities-dialog',
    templateUrl: './search-kaseya-entities-dialog.component.html',
    styleUrls: ['./search-kaseya-entities-dialog.component.scss']
})

export class SearchKaseyaEntitiesDialogComponent implements OnInit {
    searchEntitiesForm: FormGroup;
    showLoadingSpinner = {};

    pageLength: number;
    paginationOptions = paginationOptions;
    kaseyaEntities: Array<object> = [];
    entities = new Map<string, any>();
    message: string;
    pagedEntities: Array<object> = [];

    constructor(
        private formBuilder: FormBuilder,
        private dialogRef: MatDialogRef<SearchKaseyaEntitiesDialogComponent>,
        @Inject(MAT_DIALOG_DATA) public dialogData: ISearchKaseyaEntityDialogData
    ) { }

    ngOnInit() {
        this.createForm();
    }

    public handleLoadingEvent(result: boolean): void {
        this.showLoadingSpinner['searchEntities'] = result;
    }

    public handleSearchResults(result: Array<any>): void {
        this.updateAgentProcedures(result);
        this.pagedEntities = this.kaseyaEntities.slice(0, this.paginationOptions.pageSize);
    }

    public async updatePage(event: PageEvent): Promise<void> {
        const start = event.pageIndex * event.pageSize;
        this.pagedEntities = this.kaseyaEntities.slice(start, start + event.pageSize);
    }

    public closeDialogWithResult(): void {
        const lookupKey = this.searchEntitiesForm.get('lookupKey').value;
        const entity = this.entities.get(lookupKey);

        if (entity) {
            this.dialogRef.close(entity);
        }
    }

    private createForm(): void {
        this.searchEntitiesForm = this.formBuilder.group({
            lookupKey: [
                '',
                Validators.required
            ]
        });
    }

    private updateAgentProcedures(results: Array<any>): void {
        this.entities.clear();
        this.message = '';
        this.kaseyaEntities.length = 0;
        this.pageLength = 0;

        if (results.length === 0) {
            this.message = `We could not find any records matching the search text.
                Please try again using different search text and/or verify you have sufficient privileges in Kaseya.
            `;
        } else {
            for (const entity of results) {
                const lookupKey = entity[this.dialogData.idKey] + '-' + entity[this.dialogData.secondaryDisplayKey];
                if (!this.entities.has(lookupKey)) {
                    const entityExtended: any = { ...entity, lookupKey };
                    this.entities.set(lookupKey, entityExtended);
                }
            }
            this.pageLength = this.entities.size;
            this.kaseyaEntities = Array.from(this.entities.values());
        }
    }
}
