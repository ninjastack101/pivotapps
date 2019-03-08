import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';
import { FormGroup, FormBuilder, FormArray, Validators } from '@angular/forms';
import { MatDialog } from '@angular/material';
import { ConfirmationDialogComponent } from 'app/confirmation-dialog/confirmation-dialog.component';
import { diffObjects } from 'app/utils/utils.service';
import { QuestionsService } from './questions.service';
import { ISkillQuestion, IQuestionsDiff } from './questions.interface';
import { PivotappsAdminSnackBarService } from '../../services/snackbar.service';
import { CdkDragDrop, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
    selector: 'app-agent-procedure-questions',
    templateUrl: 'questions.component.html',
    styleUrls: ['./questions.component.scss']
})

export class QuestionsComponent implements OnInit {
    @Input() skillId: number;

    @Output() save: EventEmitter<FormGroup> = new EventEmitter();
    @Output() remove: EventEmitter<FormGroup> = new EventEmitter();

    existingQuestions: Array<ISkillQuestion> = [];
    questionsForm: FormGroup;
    showLoadingSpinner = {};
    showDeleteQuestionLoadingSpinner = {};

    constructor(
        private formBuilder: FormBuilder,
        private dialog: MatDialog,
        private questionsService: QuestionsService,
        private pivotappsAdminSnackbarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() { }

    public async buildQuestionsForm(): Promise<void> {
        this.showLoadingSpinner['initQuestionsSection'] = true;
        try {
            this.existingQuestions = await this.questionsService.getQuestions(this.skillId);
            this.createQuestionsForm();
            this.showLoadingSpinner['initQuestionsSection'] = false;
        } catch (error) {
            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
            this.showLoadingSpinner['initQuestionsSection'] = false;
        }
    }

    public addNewQuestionsInput(): void {
        const questions = <FormArray>this.questionsForm.get('questions');
        questions.push(this.createQuestion());
    }

    public removeQuestionsInput(index: number): void {
        const dialogRef = this.dialog.open(ConfirmationDialogComponent);

        dialogRef
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    const questions = <FormArray>this.questionsForm.get('questions');
                    const questionToRemove = questions.at(index).value;

                    this.showDeleteQuestionLoadingSpinner[index] = true;

                    if (questionToRemove.id) {
                        try {
                            await this.questionsService.deleteQuestion(this.skillId, questionToRemove.id);
                            questions.removeAt(index);
                            this.showDeleteQuestionLoadingSpinner[index] = false;
                        } catch (error) {
                            this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                            this.showDeleteQuestionLoadingSpinner[index] = false;
                        }
                    } else {
                        questions.removeAt(index);
                        this.showDeleteQuestionLoadingSpinner[index] = false;
                    }
                }
            });
    }

    public async saveQuestionsForm(): Promise<void> {
        this.showLoadingSpinner['saveQuestions'] = true;
        const formData = <FormArray>this.questionsForm.controls.questions;
        const questions = this.validateFormData(formData);
        const changedQuestions: IQuestionsDiff = this.getNewAndUpdatedQuestions(questions);

        if (changedQuestions.newQuestions.length || changedQuestions.updatedQuestions.length) {
            try {
                const newQuestions = await this.questionsService.saveQuestions(
                    this.skillId,
                    changedQuestions
                );
                this.updateLocalData(formData, newQuestions, changedQuestions.updatedQuestions);
                this.showLoadingSpinner['saveQuestions'] = false;
            } catch (error) {
                this.pivotappsAdminSnackbarService.showSnackBarMessage(error.error.message || error.error);
                this.showLoadingSpinner['saveQuestions'] = false;
            }
        } else {
            this.showLoadingSpinner['saveQuestions'] = false;
        }
    }

    public updateQuestionsOrder(event: CdkDragDrop<FormArray>) {
        const { questions } = this.questionsForm.getRawValue();
        moveItemInArray(questions, event.previousIndex, event.currentIndex);
        this.questionsForm.setValue({ questions });
    }

    private updateLocalData(
        formData: FormArray,
        newQuestions: Array<ISkillQuestion>,
        updatedQuestions: Array<ISkillQuestion>
    ): void {
        for (const question of formData.controls) {
            for (const newQuestion of newQuestions) {
                if (newQuestion.questionOrder === question.value.questionOrder) {
                    question.patchValue({ id: newQuestion.id });
                    this.existingQuestions.push(newQuestion);
                    break;
                }
            }
        }

        for (const question of updatedQuestions) {
            for (const existingQuestion of this.existingQuestions) {
                if (existingQuestion.id === question.id) {
                    Object.assign(existingQuestion, question);
                    break;
                }
            }
        }
    }

    private getNewAndUpdatedQuestions(questions: Array<ISkillQuestion>): IQuestionsDiff {
        const newQuestions: Array<ISkillQuestion> = [];
        const updatedQuestions: Array<ISkillQuestion> = [];

        for (const question of questions) {
            const index = this.existingQuestions.findIndex(existingQuestion =>
                existingQuestion.id === question.id
            );

            if (index === -1) {
                const questionSnapshot = Object.assign({}, question);
                delete questionSnapshot.id;
                newQuestions.push(questionSnapshot);
            } else {
                const data = diffObjects(this.existingQuestions[index], question);

                if (Object.keys(data).length) {
                    updatedQuestions.push(
                        <ISkillQuestion>Object.assign(
                            data,
                            {
                                id: question.id
                            }
                        )
                    );
                }
            }
        }

        return {
            newQuestions,
            updatedQuestions
        };

    }

    private validateFormData(formData: FormArray): Array<ISkillQuestion> {
        const questions: Array<ISkillQuestion> = [];

        for (let i = 0; i < formData.controls.length; i++) {
            const question = <ISkillQuestion>formData.controls[i].value;
            questions.push(
                Object.assign(
                    question,
                    { questionOrder: i + 1 }
                )
            );

            formData.controls[i].patchValue({ questionOrder: i + 1 });
        }

       return questions;
    }

    private createQuestionsForm(): void {
        const existingQuestionsForm: Array<FormGroup> = [];

        for (const question of this.existingQuestions) {
            existingQuestionsForm.push(
                this.createQuestion(question)
            );
        }

        if (!existingQuestionsForm.length) {
            existingQuestionsForm.push(this.createQuestion());
        }

        this.questionsForm = this.formBuilder.group({
            questions: this.formBuilder.array([
                ...existingQuestionsForm
            ])
        });
    }

    private createQuestion(existingQuestion?: ISkillQuestion): FormGroup {
        let question: ISkillQuestion;

        if (existingQuestion) {
            question = existingQuestion;
        } else {
            question = {
                id: null,
                skillId: this.skillId,
                question: '',
                questionAdaptiveCard: null,
                questionOrder: null,
                questionVariableName: ''
            };
        }

        return this.formBuilder.group({
            id: question.id,
            skillId: question.skillId,
            question: [question.question, Validators.required],
            questionAdaptiveCard: [question.questionAdaptiveCard],
            questionOrder: question.questionOrder,
            questionVariableName: [question.questionVariableName, Validators.required]
        });
    }
}
