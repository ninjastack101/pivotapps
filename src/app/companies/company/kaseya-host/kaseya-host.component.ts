import { Component, OnInit, Input } from '@angular/core';
import { FormGroup } from '@angular/forms';
import { KaseyaHostService } from './kaseya-host.service';
import { IKaseyaHost } from './kaseya-host.interface';
import { PivotappsAdminSnackBarService } from 'app/services/snackbar.service';
import { diffObjects } from 'app/utils/utils.service';
import { Params } from '@angular/router';

@Component({
    selector: 'app-company-kaseya-host',
    templateUrl: 'kaseya-host.component.html',
    styleUrls: ['./kaseya-host.component.scss']
})

export class KaseyaHostComponent implements OnInit {
    @Input() companyId: number;
    @Input() routeParams: Params;

    showLoadingSpinner = {};

    kaseyaHost: IKaseyaHost;

    clientSecretMasked = '****************************************************************';

    constructor(
        private kaseyaHostService: KaseyaHostService,
        private snackBarService: PivotappsAdminSnackBarService
    ) { }

    ngOnInit() {}

    async initKaseyaHostExpansionPanel() {
        this.showLoadingSpinner['init'] = true;
        try {
            this.kaseyaHost = await this.kaseyaHostService.getKaseyaHost(this.companyId);
            this.showLoadingSpinner['init'] = false;
        } catch (error) {
            this.showLoadingSpinner['init'] = false;
            this.snackBarService.showSnackBarMessage(error.error.message || error.message);
        }
    }

    public async handleSave(event: FormGroup): Promise<void> {
        this.showLoadingSpinner['saveKaseyaHost'] = true;
        const data = <IKaseyaHost>diffObjects(this.kaseyaHost, event.value);

        if (Object.keys(data).length) {
            try {
                await this.kaseyaHostService.updateKaseyaHost(this.companyId, data);
                this.showLoadingSpinner['saveKaseyaHost'] = false;
                Object.assign(this.kaseyaHost, data, { clientSecret: this.clientSecretMasked });
            } catch (error) {
                this.snackBarService.showSnackBarMessage(error.error.message || error.message);
                this.showLoadingSpinner['saveKaseyaHost'] = false;
            }
        } else {
            this.showLoadingSpinner['saveKaseyaHost'] = false;
        }
    }
}
