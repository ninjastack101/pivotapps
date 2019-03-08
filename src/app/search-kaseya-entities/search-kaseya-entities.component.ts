import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { SearchKaseyaEntitiesService } from './search-kaseya-entities.service';
import {
    ISearchKaseyaEntitiesOptions,
    KaseyaEntity
} from './search-kaseya-entities.interface';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-search-kaseya-entities',
    templateUrl: 'search-kaseya-entities.component.html'
})

export class SearchKaseyaEntitiesComponent implements OnInit {
    @Input() placeholder: string;
    @Input() tooltipText: string;
    @Input() entityType: KaseyaEntity;
    @Input() inputName: string;

    @Output() loading: EventEmitter<boolean> = new EventEmitter();
    // Use any as Angular doesn't support generic component
    @Output() searchResult: EventEmitter<Array<any>> = new EventEmitter();

    pageLength: number;
    paginationOptions = paginationOptions;
    searchEntityForm: FormGroup;

    constructor(
        private formBuilder: FormBuilder,
        private searchKaseyaEntitiesService: SearchKaseyaEntitiesService
    ) { }

    ngOnInit() {
        this.createForm();
    }

    public async searchEntities(): Promise<void> {
        try {
            const searchText = this.searchEntityForm.get('entityName').value;

            if (searchText) {
                this.loading.emit(true);
                const options: ISearchKaseyaEntitiesOptions = {
                    searchText,
                    entityType: this.entityType
                };

                const result = await this.searchKaseyaEntitiesService
                    .searchEntities<any>(options);
                this.searchResult.emit(result);
                this.loading.emit(false);
                this.searchEntityForm.reset();
            }
        } catch (error) {
            console.error(error);
            this.loading.emit(false);
        }
    }

    private createForm(): void {
        this.searchEntityForm = this.formBuilder.group({
            entityName: [
                '',
                Validators.required
            ]
        });
    }
}
