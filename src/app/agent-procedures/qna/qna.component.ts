import { Component, OnInit } from '@angular/core';
import { IQnA } from './qna.interface';
import { IMessageCategory } from '../agent-procedures.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { QnAService } from './qna.service';
import { Location } from '@angular/common';
import { messageCategories } from './message-categories';
import { FormGroup } from '@angular/forms';
import { diffObjects, trimStringPropertiesFromObject } from '../../utils/utils.service';
import { IConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { AgentProceduresService } from '../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-qna',
    templateUrl: 'qna.component.html'
})

export class QnAComponent implements OnInit {
    id: number;
    qna: IQnA;

    messageCategories: Array<IMessageCategory>;

    showLoadingSpinner = {};

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private qnaService: QnAService,
        public location: Location,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private authService: AuthService,
        private agentProceduresService: AgentProceduresService
    ) { }

    ngOnInit() {
        this.showLoadingSpinner['overlay'] = true;
        this.route.params.subscribe(async params => {
            try {
                this.id = +params['id'];
                await this.getQnaAndRelatedData();
                this.messageCategories = messageCategories;
                this.showLoadingSpinner['overlay'] = false;
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['overlay'] = false;
            }
        });
    }

    public async updateQnAForm(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveQnA'] = true;
        const eventValue = trimStringPropertiesFromObject(event.value);
        const data = diffObjects(this.qna, eventValue);

        if (Object.keys(data).length) {
            try {
                await this.qnaService.updateQnA(this.id, data);
                this.showLoadingSpinner['saveQnA'] = false;
                const updater = {
                    id: null,
                    emailAddress: null,
                    firstName: this.authService.user.first_name,
                    lastName: this.authService.user.last_name
                };

                this.qna.updater = updater;
                this.qna.updatedAt = new Date().toISOString();
                this.qna = { ...this.qna, ...data };
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveQnA'] = false;
            }
        } else {
            this.qna = { ...this.qna };
            this.showLoadingSpinner['saveQnA'] = false;
        }
    }

    public async deleteQnA(): Promise<void> {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete a QnA',
            content: `
                Deleting the QnA would also remove bot persona messages, LUIS URL and other connected entities.
                Are you sure you wish to persist the changes?
            `
        };

        this.dialog
            .open(ConfirmationDialogComponent, { data })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    try {
                        this.showLoadingSpinner['overlay'] = true;
                        await this.qnaService.deleteQnA(this.id);
                        this.agentProceduresService.deleteSkill(this.id);
                        await this.router.navigate(['skills']);
                        this.showLoadingSpinner['overlay'] = false;
                    } catch (error) {
                        this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                        this.showLoadingSpinner['overlay'] = false;
                    }
                }
            });
    }

    private async getQnaAndRelatedData(): Promise<void> {
        try {
            this.qna = await this.qnaService.getQnA(this.id);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }
}
