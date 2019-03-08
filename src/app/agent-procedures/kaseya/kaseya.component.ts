import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Location } from '@angular/common';
import { diffObjects, trimStringPropertiesFromObject } from '../../utils/utils.service';
import { FormGroup } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from '../../confirmation-dialog/confirmation-dialog.component';
import { KaseyaSkillService } from './kaseya.service';
import { messageCategories } from './message-categories';
import { IConfirmationDialogData } from '../../confirmation-dialog/confirmation-dialog.interface';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { IKaseyaSkill } from './kaseya.interface';
import { AuthService } from '../../services/auth.service';
import { AgentProceduresService } from '../agent-procedures.service';

@Component({
    selector: 'app-skills-kaseya',
    templateUrl: './kaseya.component.html',
    styleUrls: ['./kaseya.component.scss']
})

export class KaseyaSkillComponent implements OnInit {
    id: number;
    kaseyaSkill: IKaseyaSkill;

    showLoadingSpinner = {};
    messageCategories = messageCategories;

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        private location: Location,
        private dialog: MatDialog,
        private kaseyaSkillService: KaseyaSkillService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private authService: AuthService,
        private agentProceduresService: AgentProceduresService
    ) { }

    ngOnInit() {
        this.showLoadingSpinner['overlay'] = true;
        this.route.params.subscribe(async params => {
            try {
                this.id = params['id'];
                await this.getKaseyaSkillAndRelatedData();
                this.showLoadingSpinner['overlay'] = false;
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['overlay'] = false;
            }
        });
    }

    public navigateBack(): void {
        this.location.back();
    }

    public async updateKaseyaSkillForm(event: FormGroup) {
        this.showLoadingSpinner['saveKaseyaSkill'] = true;
        const eventValue = trimStringPropertiesFromObject(event.value);
        const data = diffObjects(this.kaseyaSkill, eventValue);

        if (Object.keys(data).length) {
            try {
                await this.kaseyaSkillService.updateKaseyaSkill(this.id, data);
                this.showLoadingSpinner['saveKaseyaSkill'] = false;
                const updater = {
                    id: null,
                    emailAddress: null,
                    firstName: this.authService.user.first_name,
                    lastName: this.authService.user.last_name
                };

                this.kaseyaSkill.updater = updater;
                this.kaseyaSkill.updatedAt = new Date().toISOString();
                this.kaseyaSkill = { ...this.kaseyaSkill, ...data };
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveKaseyaSkill'] = false;
            }
        } else {
            this.kaseyaSkill = { ...this.kaseyaSkill };
            this.showLoadingSpinner['saveKaseyaSkill'] = false;
        }
    }

    public async deleteKaseyaSkill(): Promise<void> {
        const data: IConfirmationDialogData = {
            title: 'You are about to delete a Kaseya Skill',
            content: `
                Deleting a kaseya skill would also delete all the entities connected to a kaseya skill
                such as bot persona messages, questions etc.
                Are you sure you wish to proceed?
            `
        };

        const dialogRef = this.dialog.open(ConfirmationDialogComponent, { data });

        try {
            const result = await dialogRef.afterClosed().toPromise();
            if (result) {
                this.showLoadingSpinner['overlay'] = true;
                await this.kaseyaSkillService.deleteKaseyaSkill(this.id);
                this.agentProceduresService.deleteSkill(this.id);
                await this.router.navigate(['skills']);
                this.showLoadingSpinner['overlay'] = false;
            }
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['overlay'] = false;
        }
    }

    private async getKaseyaSkillAndRelatedData() {
        try {
            this.kaseyaSkill = await this.kaseyaSkillService.getKaseyaSkill(this.id);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
        }
    }
}
