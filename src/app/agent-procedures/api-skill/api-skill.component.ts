import { Component, OnInit } from '@angular/core';
import { IMessageCategory } from '../agent-procedures.interface';
import { Router, ActivatedRoute } from '@angular/router';
import { MatDialog } from '@angular/material';
import { Location } from '@angular/common';
import { messageCategories } from './message-categories';
import { FormGroup } from '@angular/forms';
import { diffObjects, trimStringPropertiesFromObject } from '../../utils/utils.service';
import { IConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { IApiSkill } from './api-skill.interface';
import { ApiSkillService } from './api-skill.service';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { AuthService } from '../../services/auth.service';
import { AgentProceduresService } from '../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-api-skill',
    templateUrl: 'api-skill.component.html'
})

export class ApiSkillComponent implements OnInit {
    id: number;
    apiSkill: IApiSkill;
    filterKey: string;

    messageCategories: Array<IMessageCategory>;

    showLoadingSpinner = {};

    existingQuestions = [];

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private dialog: MatDialog,
        private apiSkillService: ApiSkillService,
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
                await this.getApiSkillAndRelatedData();
                this.messageCategories = messageCategories;
                this.showLoadingSpinner['overlay'] = false;
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['overlay'] = false;
            }
        });
    }

    public async updateApiSkillForm(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveApiSkill'] = true;
        const eventValue = trimStringPropertiesFromObject(event.value);
        const data = diffObjects(this.apiSkill, eventValue);

        if (Object.keys(data).length) {
            try {
                await this.apiSkillService.updateApiSkill(this.id, data);
                this.showLoadingSpinner['saveApiSkill'] = false;
                const updater = {
                    id: null,
                    emailAddress: null,
                    firstName: this.authService.user.first_name,
                    lastName: this.authService.user.last_name
                };

                this.apiSkill.updater = updater;
                this.apiSkill.updatedAt = new Date().toISOString();
                this.apiSkill = { ...this.apiSkill, ...data };
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveApiSkill'] = false;
            }
        } else {
            this.apiSkill = { ...this.apiSkill };
            this.showLoadingSpinner['saveApiSkill'] = false;
        }
    }

    public async deleteApiSkill(): Promise<void> {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete an API Skill',
            content: `
                Deleting the API Skill would also remove bot persona messages, LUIS URL and other connected entities.
                Are you sure you wish to persist the changes?
            `
        };

        this.dialog
            .open(ConfirmationDialogComponent, { data })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    this.showLoadingSpinner['overlay'] = true;
                    try {
                        await this.apiSkillService.deleteApiSkill(this.id);
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

    private async getApiSkillAndRelatedData(): Promise<void> {
        try {
            this.apiSkill = await this.apiSkillService.getApiSkill(this.id);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }
}
