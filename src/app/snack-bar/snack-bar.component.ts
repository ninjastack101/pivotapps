import { Component, OnInit, OnDestroy } from '@angular/core';
import { MatSnackBar } from '@angular/material';
import { PivotappsAdminSnackBarService } from '../services/snackbar.service';
import { Subscription } from 'rxjs';

@Component({
    selector: 'app-snackbar',
    template: '<div></div>'
})

export class PivotappsAdminSnackBarComponent implements OnInit, OnDestroy {
    snackBarSubscription: Subscription;

    constructor(
        private snackBar: MatSnackBar,
        private snackBarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() {
        this.snackBarSubscription = this.snackBarService
            .snackBarSubject
            .subscribe(message => this.snackBar.open(message, 'close'));
    }

    ngOnDestroy() {
        this.snackBarSubscription.unsubscribe();
    }
}
