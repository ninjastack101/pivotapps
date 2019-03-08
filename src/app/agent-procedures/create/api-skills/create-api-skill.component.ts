import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { ApiSkillService } from '../../api-skill/api-skill.service';
import { IApiSkill } from '../../api-skill/api-skill.interface';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { AgentProceduresService } from '../../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-create-api-skill',
    templateUrl: './create-api-skill.component.html'
})

export class CreateApiSkillComponent implements OnInit {
    showLoadingSpinner = {};

    constructor(
        private router: Router,
        private apiSkillsService: ApiSkillService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private agentProceduresService: AgentProceduresService
    ) { }

    async ngOnInit() {
        try {
        } catch (error) {
            console.error(error);
        }
    }

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveApiSkill'] = true;
        try {
            const apiSkill = <IApiSkill>event.value;
            const newApiSkill = await this.apiSkillsService
                .createApiSkill(apiSkill);
            this.agentProceduresService.addSkill(newApiSkill);
            this.showLoadingSpinner['saveApiSkill'] = true;
            this.router.navigate(['skills', 'api', newApiSkill.id]);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveApiSkill'] = false;
        }
    }
}
