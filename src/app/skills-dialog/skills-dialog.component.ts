import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { AgentProceduresService } from '../agent-procedures/agent-procedures.service';
import { PivotappsAdminSnackBarService } from '../services/snackbar.service';
import { ISkill } from '../agent-procedures/skills.interface';
import { PageEvent, MatDialogRef } from '@angular/material';
import { OrderByPipe } from '../pipes/orderby.pipe';
import { skillTypesMap } from '../agent-procedures/intent-types';
import { IGetSkillsOptions } from '../agent-procedures/agent-procedures.interface';
import { paginationOptions } from 'app/services/pagination-defaults';

@Component({
    selector: 'app-skills-dialog',
    templateUrl: 'skills-dialog.component.html',
    styleUrls: ['./skills-dialog.component.scss']
})

export class SkillsDialogComponent implements OnInit {
    showLoadingSpinner = {};

    pageLength: number;
    paginationOptions = paginationOptions;

    skillsSelectionForm: FormGroup;
    skills: Array<ISkill>;
    pagedSkills: Array<ISkill>;

    skillTypesMap = skillTypesMap;

    constructor(
        private formBuilder: FormBuilder,
        private agentProceduresService: AgentProceduresService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService,
        private dialogRef: MatDialogRef<SkillsDialogComponent>,
        private orderByPipe: OrderByPipe
    ) { }

    async ngOnInit() {
        try {
            this.showLoadingSpinner['overlay'] = true;

            const options: IGetSkillsOptions = {
                skillTypes: ['kaseya', 'apiSkill']
            };

            const skills = await this.agentProceduresService.getSkills(options);

            this.skills = this.orderByPipe.transform(skills, ['name', 'asc']);
            this.pagedSkills = this.skills.slice(0, this.paginationOptions.pageSize);
            this.pageLength = this.skills.length;
            this.createForm();
            this.showLoadingSpinner['overlay'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['overlay'] = false;
        }
    }

    public updatePage(event: PageEvent): void {
        const start = event.pageIndex * event.pageSize;
        this.pagedSkills = this.skills.slice(start, start + event.pageSize);
    }

    public closeDialogWithResult(): void {
        const skillId = this.skillsSelectionForm.get('skillId').value;
        const entity = this.pagedSkills.find(skill => skill.id === skillId);

        if (entity) {
            this.dialogRef.close(entity);
        }
    }

    private createForm() {
        this.skillsSelectionForm = this.formBuilder.group({
            skillId: [
                '',
                Validators.required
            ]
        });
    }
}
