import { Component, OnInit, EventEmitter, Output } from '@angular/core';
import { AuthService } from '../services/auth.service';

@Component({
    selector: 'app-navbar-utils',
    templateUrl: 'navbar-utils.component.html',
    styleUrls: ['./navbar-utils.component.scss']
})

export class NavbarUtilsComponent implements OnInit {
    @Output() toggleSideNavbar: EventEmitter<void> = new EventEmitter();
    constructor(
        public authService: AuthService
    ) { }

    ngOnInit() { }

    requestSideNavbar() {
        this.toggleSideNavbar.emit();
    }
}
