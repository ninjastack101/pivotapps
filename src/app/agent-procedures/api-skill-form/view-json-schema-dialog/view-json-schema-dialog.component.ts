import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { IViewJsonSchemaDialogData } from '../../api-skill/api-skill.interface';
import { ClipboardService } from 'ngx-clipboard';

@Component({
    selector: 'app-view-json-schema-dialog',
    templateUrl: 'view-json-schema-dialog.component.html',
    styleUrls: ['./view-json-schema-dialog.component.scss']
})

export class ViewJsonSchemaDialogComponent implements OnInit {
    schema: string;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: IViewJsonSchemaDialogData,
        private clipboardService: ClipboardService
    ) { }

    ngOnInit() {
        this.schema = JSON.stringify(this.dialogData.schema, null, 4);
    }

    public copyToClipboard(): void {
        this.clipboardService.copyFromContent(this.schema);
    }
}
