import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { IConfirmationDialogData } from './confirmation-dialog.interface';

@Component({
    selector: 'app-confirmation-dialog',
    templateUrl: 'confirmation-dialog.component.html'
})

export class ConfirmationDialogComponent implements OnInit {
    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: IConfirmationDialogData
    ) { }

    ngOnInit() { }
}
