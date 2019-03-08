import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material';
import { ITicketIntegrationListTable, ITicketIntegrationConfig } from '../ticket-integration.interface';
import { TicketConfigurationService } from '../ticket-integration.service';
import { FormGroup } from '@angular/forms';
import { diffObjects, setEmptyStringsToNull } from 'app/utils/utils.service';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';

@Component({
    selector: 'app-ticket-integration-dialog',
    templateUrl: 'ticket-integration-dialog.component.html',
    styleUrls: ['./ticket-integration-dialog.component.scss']
})

export class TicketIntegrationDialogComponent implements OnInit {
    showLoadingSpinner = {};
    ticketConfiguration: ITicketIntegrationConfig;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: ITicketIntegrationListTable,
        private dialogRef: MatDialogRef<TicketIntegrationDialogComponent>,
        private ticketConfigurationService: TicketConfigurationService,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService
    ) { }

    async ngOnInit() {
        if (this.dialogData.id) {
            this.showLoadingSpinner['init'] = true;
            try {
                this.ticketConfiguration = await this.ticketConfigurationService.getTicketConfigurationById(this.dialogData.id);
                this.showLoadingSpinner['init'] = false;
            } catch (error) {
                this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message);
                this.showLoadingSpinner['init'] = false;
            }
        }
    }

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveTicketConfiguration'] = true;
        const data = <ITicketIntegrationConfig>setEmptyStringsToNull(diffObjects(this.ticketConfiguration || {}, event.value));

        if (Object.keys(data).length) {
            try {
                if (this.ticketConfiguration) {
                    await this.ticketConfigurationService.updateTicketConfiguration(this.ticketConfiguration.id, data);
                    this.showLoadingSpinner['saveTicketConfiguration'] = false;
                    this.dialogRef.close(data);
                } else {
                    const updatedTicketConfig = <ITicketIntegrationConfig>{
                        ...data,
                        skillId: this.dialogData.skillId,
                        companyId: this.dialogData.companyId
                    };

                    const ticketConfig = await this.ticketConfigurationService.createTicketConfiguration(updatedTicketConfig);
                    this.showLoadingSpinner['saveTicketConfiguration'] = false;
                    this.dialogRef.close(ticketConfig);
                }
            } catch (error) {
                this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message);
                this.showLoadingSpinner['saveTicketConfiguration'] = false;
            }
        } else {
            this.showLoadingSpinner['saveTicketConfiguration'] = false;
        }
    }
}
