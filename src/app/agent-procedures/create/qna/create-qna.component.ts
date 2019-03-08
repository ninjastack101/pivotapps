import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { FormGroup } from '@angular/forms';
import { IQnA } from '../../qna/qna.interface';
import { QnAService } from '../../qna/qna.service';
import { PivotappsAdminSnackBarService } from '../../../services/snackbar.service';
import { AgentProceduresService } from '../../agent-procedures.service';

@Component({
    selector: 'app-agent-procedures-create-qna',
    templateUrl: './create-qna.component.html'
})

export class CreateQnAComponent implements OnInit {
    showLoadingSpinner = {};

    constructor(
        private router: Router,
        private qnaService: QnAService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private agentProceduresService: AgentProceduresService
    ) { }

    ngOnInit() { }

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveQnA'] = true;
        try {
            const qna = <IQnA>event.value;
            const newQna = await this.qnaService
                .createQnA(qna);
            this.agentProceduresService.addSkill(newQna);
            this.showLoadingSpinner['saveQnA'] = true;
            this.router.navigate(['skills', 'qna', newQna.id]);
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['saveQnA'] = false;
        }
    }
}
