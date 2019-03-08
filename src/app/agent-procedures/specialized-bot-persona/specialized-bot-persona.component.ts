import { Component, OnInit, Output, EventEmitter, Input, OnDestroy } from '@angular/core';
import { IBotPersona } from '../../services/botpersona.interface';
import { BotPersonaService } from '../../services/botpersona.service';
import { MatSelectChange } from '@angular/material';
import { Subscription } from 'rxjs';
import { SkillsFilterService } from '../../services/skills-filter.service';

@Component({
    selector: 'app-ap-specialized-bot-persona-filter',
    templateUrl: 'specialized-bot-persona.component.html',
    styleUrls: ['./specialized-bot-persona.component.scss']
})

export class SpecializedBotPersonaFilterComponent implements OnInit, OnDestroy {
    @Input() currentSpecializedBotPersonaId: number;
    @Input() specializedBotPersonas: Array<IBotPersona>;

    @Output() selectionChange: EventEmitter<MatSelectChange> = new EventEmitter();

    specializedBotPersonaChangeSubscription: Subscription;

    constructor(
        private skillsFilterService: SkillsFilterService
    ) { }

    ngOnInit() {
        this.specializedBotPersonaChangeSubscription = this.skillsFilterService
            .specializedBotPersonaChangeSubject
            .subscribe(specializedBotPersonaId => this.revertChanges(specializedBotPersonaId));
    }

    revertChanges(specializedBotPersonaId: number): void {
        this.currentSpecializedBotPersonaId = specializedBotPersonaId;
    }

    ngOnDestroy() {
        this.specializedBotPersonaChangeSubscription.unsubscribe();
    }
}
