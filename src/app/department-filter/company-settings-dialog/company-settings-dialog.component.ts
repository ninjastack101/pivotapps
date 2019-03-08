import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA } from '@angular/material';
import { ICompanySettingDialogData } from '../../company-settings/company-settings.interface';
@Component({
    selector: 'app-company-settings-dialog',
    templateUrl: './company-settings-dialog.component.html',
    styleUrls: ['./company-settings-dialog.component.scss']
})

export class CompanySettingsDialogComponent implements OnInit {
    showLoadingSpinner = {};

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: ICompanySettingDialogData
    ) { }

    ngOnInit() { }

}
