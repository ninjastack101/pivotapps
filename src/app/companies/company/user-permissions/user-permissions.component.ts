import { Component, OnInit, Input } from '@angular/core';
import { UserService } from '../../../user/user.service';
import { AuthService } from 'app/services/auth.service';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';
import { Params } from '@angular/router';

@Component({
    selector: 'app-company-user-permissions',
    templateUrl: 'user-permissions.component.html'
})

export class UserPermissionsComponent implements OnInit {
    @Input() companyId: number;
    @Input() routeParams: Params;

    showResellerAccountTab: boolean;

    tabIdIndexMap: Map<string, number> = new Map([
        ['users', 0],
        ['assign-users-to-departments', 1],
        ['kaseya-machine-group-mappings', 2],
        ['reseller-accounts', 3]
    ]);

    selectedIndex: number;

    constructor(
        private userService: UserService,
        private authService: AuthService,
        private pivotappsAdminSnackBarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() {
        try {
            if (this.routeParams.tabId) {
                this.selectedIndex = this.tabIdIndexMap.get(this.routeParams.tabId);
            }
            this.initResellerAccountsTab();
        } catch (error) {
            this.pivotappsAdminSnackBarService.showSnackBarMessage(error.error.message);
        }
    }

    private async initResellerAccountsTab() {
        try {
            const resellerAccountTabObject = await this.userService.showResellerAccountTab(this.authService.user.sub);
            this.showResellerAccountTab = resellerAccountTabObject.activateResellersAccountTab;
        } catch (error) {
            return Promise.reject(error);
        }
    }
}
