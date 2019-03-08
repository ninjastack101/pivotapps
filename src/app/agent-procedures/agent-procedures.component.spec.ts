import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { AgentProceduresComponent } from './agent-procedures.component';
import { PivotappsMaterialModule } from 'vendor/material/pivotapps-material.module';

xdescribe('AgentProceduresComponent', () => {
    let component: AgentProceduresComponent;
    let fixture: ComponentFixture<AgentProceduresComponent>;

    beforeEach(async(() => {
        TestBed.configureTestingModule({
            imports: [PivotappsMaterialModule],
            declarations: [ AgentProceduresComponent ]
        })
        .compileComponents();
    }));

    beforeEach(() => {
        fixture = TestBed.createComponent(AgentProceduresComponent);
        component = fixture.componentInstance;
        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });
});
