import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { catchError } from 'rxjs/operators';
import { API_URL } from '../../../../../utils/utils.service';
import { IKaseyaMachinesResult, ISharedUserCompanyMachine } from './assign-machines-dialog.interface';

@Injectable()
export class AssignMachinesDialogService {
    constructor(private http: HttpClient) { }

    getAssignedMachines(
        sharedUserCompanyId: number
    ): Promise<Array<ISharedUserCompanyMachine>> {
        return this.http
            .get<Array<ISharedUserCompanyMachine>>(
                `${API_URL}/api/shared-usercompanies/${sharedUserCompanyId}/machines`
            )
            .toPromise();
    }

    assignMachineToUser(
        sharedUserCompanyId: number,
        machine: IKaseyaMachinesResult
    ): Promise<ISharedUserCompanyMachine> {
        return this.http
            .post<ISharedUserCompanyMachine>(
                `${API_URL}/api/shared-usercompanies/${sharedUserCompanyId}/machines`, machine
            )
            .toPromise();
    }

    deleteAssignedMachine(sharedUserCompanyId: number, machineId: string): Promise<void> {
        return this.http
            .delete<void>(
                `${API_URL}/api/shared-usercompanies/${sharedUserCompanyId}/machines/${machineId}`
            )
            .toPromise();
    }

}
