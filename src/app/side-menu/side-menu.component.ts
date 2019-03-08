import { Component, OnInit, Output, EventEmitter, OnDestroy } from '@angular/core';
import { ISideMenu } from './side-menu.interface';
import { MatDialog } from '@angular/material';
import { IConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.interface';
import { ConfirmationDialogComponent } from '../confirmation-dialog/confirmation-dialog.component';
import { Observable } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { Router } from '@angular/router';
import { PublishService } from '../services/publish.service';
import { PivotappsAdminSnackBarService } from '../services/snackbar.service';

@Component({
    selector: 'app-side-menu',
    templateUrl: 'side-menu.component.html',
    styleUrls: ['./side-menu.component.scss']
})

export class SideMenuComponent implements OnInit {
    @Output() close: EventEmitter<void> = new EventEmitter();
    @Output() toggle: EventEmitter<void> = new EventEmitter();

    entities: Array<ISideMenu> = [];

    constructor(
        private dialog: MatDialog,
        private authService: AuthService,
        private router: Router,
        private publishService: PublishService,
        private snackBarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() {
        this.entities.push({
            name: 'Logout',
            icon: 'exit_to_app',
            action: this.logout.bind(this),
            needsConfirmationPrompt: true,
            confirmationDialogData: {
                title: 'Logout',
                content: 'Are you sure you wish to logout?'
            }
        }, {
            name: 'Publish',
            icon: 'cloud_upload',
            action: this.updateBlobStorageCache.bind(this),
            needsConfirmationPrompt: true,
            confirmationDialogData: {
                title: 'Publish',
                content: 'Are you sure you wish to publish admin portal changes to bot users?'
            }
        });
    }

    handleEntity(entity: ISideMenu): void {
        if (entity.action) {
            if (entity.needsConfirmationPrompt) {
                this.confirmationPrompt(entity)
                    .subscribe(result => {
                        if (result) {
                            entity.action();
                        }
                    });
            } else {
                entity.action();
            }
        } else if (entity.url) {
            //
        }
        this.close.emit();
    }

    confirmationPrompt(entity: ISideMenu): Observable<boolean> {
        const dialogData: IConfirmationDialogData = entity.confirmationDialogData;

        return this.dialog
            .open(ConfirmationDialogComponent, { data: dialogData })
            .afterClosed();
    }
    public logout() {
        this.authService.logout();
    }

    public async updateBlobStorageCache(): Promise<void> {
        try {
            this.snackBarService.showSnackBarMessage('Publishing Changes....');
            const result = await this.publishService.updateBlobStorageCache();
            if (result && result.message) {
                this.snackBarService.showSnackBarMessage(result.message);
            }
        } catch (error) {
            this.snackBarService.showSnackBarMessage(error.error.message);
        }
    }
}
