import { Component, OnInit, Input } from '@angular/core';

@Component({
    selector: 'app-agent-procedures-permissions',
    templateUrl: 'permissions.component.html'
})

export class PermissionsComponent implements OnInit {
    @Input() skill: string;
    constructor() { }

    ngOnInit() { }
}
