import { Component, OnInit } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { KaseyaSkillService } from '../../kaseya/kaseya.service';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { IKaseyaSkill } from '../../kaseya/kaseya.interface';
import { AgentProceduresService } from '../../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-create-kaseya',
    templateUrl: './create-kaseya.component.html',
    providers: [KaseyaSkillService]
})

export class CreateKaseyaComponent implements OnInit {
    showLoadingSpinner = {};

    constructor(
        private router: Router,
        private kaseyaSkillService: KaseyaSkillService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private agentProceduresService: AgentProceduresService
    ) { }

    ngOnInit() {}

    public async createKaseyaSkill(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveKaseyaSkill'] = true;
        try {
            const kaseyaSkill = <IKaseyaSkill>event.value;
            const newKaseya = await this.kaseyaSkillService
                .createKaseyaSkill(kaseyaSkill);
            this.agentProceduresService.addSkill(newKaseya);
            this.showLoadingSpinner['saveKaseyaSkill'] = false;
            this.router.navigate(['skills', 'kaseya', newKaseya.id]);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveKaseyaSkill'] = false;
        }
    }
}
