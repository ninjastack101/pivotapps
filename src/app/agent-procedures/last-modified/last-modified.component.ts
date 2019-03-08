import { Component, OnInit, Input } from '@angular/core';
import { ISkill } from '../skills.interface';

@Component({
    selector: 'app-last-modified',
    templateUrl: './last-modified.component.html',
    styleUrls: ['./last-modified.component.scss']
})
export class LastModifiedComponent implements OnInit {
    @Input() skill: ISkill;

    constructor() { }

    ngOnInit() { }

}
