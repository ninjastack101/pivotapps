import { Component, OnInit, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatTableDataSource, MatDialog, MatDialogRef } from '@angular/material';
import { FormGroup, FormBuilder } from '@angular/forms';
import { AssignMachinesDialogService } from './assign-machines-dialog.service';
import { IKaseyaMachinesResult, ISharedUserCompanyMachine } from './assign-machines-dialog.interface';
import { SelectionModel } from '@angular/cdk/collections';
import { IUserCompany } from '../user-companies.interface';
import { ConfirmationDialogComponent } from '../../../../../confirmation-dialog/confirmation-dialog.component';
import { IConfirmationDialogData } from '../../../../../confirmation-dialog/confirmation-dialog.interface';

@Component({
    selector: 'app-assign-machines-dialog',
    templateUrl: './assign-machines-dialog.component.html',
    styleUrls: ['./assign-machines-dialog.component.scss']
})

export class AssignMachinesDialogComponent implements OnInit {
    showLoadingSpinner = {};
    assignMachinesForm: FormGroup;

    allowMultiSelect = true;
    selection: SelectionModel<string>;
    dataSource: MatTableDataSource<ISharedUserCompanyMachine> = new MatTableDataSource();
    searchDataSource: MatTableDataSource<IKaseyaMachinesResult> = new MatTableDataSource();

    displayedColumns = ['computerName', 'machineName', 'delete'];
    addMachineDisplayedColumns = ['ComputerName', 'AgentName', 'add'];
    sharedUserCompanyId: number;

    assignedMachines: Array<ISharedUserCompanyMachine>;

    constructor(
        @Inject(MAT_DIALOG_DATA) public dialogData: IUserCompany,
        private dialogRef: MatDialogRef<AssignMachinesDialogComponent>,
        private dialog: MatDialog,
        private formBuilder: FormBuilder,
        private machinesDialogService: AssignMachinesDialogService
    ) { }

    async ngOnInit() {
        this.sharedUserCompanyId = this.dialogData
            .assignedEnduserUserCompanies[0]
            .SharedUserCompany
            .id;
        try {
            this.showLoadingSpinner['loading'] = true;
            this.assignedMachines = await this.machinesDialogService
                .getAssignedMachines(this.sharedUserCompanyId);
            this.dataSource.data = this.assignedMachines;
            this.showLoadingSpinner['loading'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['loading'] = false;
        }
    }

    public handleLoadingEvent(result: boolean): void {
        this.showLoadingSpinner['loading'] = result;
    }

    public handleSearchResults(result: Array<IKaseyaMachinesResult>): void {
        this.searchDataSource.data = result;
    }

    public async assignMachine(machine: IKaseyaMachinesResult): Promise<void> {
        try {
            this.showLoadingSpinner['loading'] = true;
            const result = await this.machinesDialogService.assignMachineToUser(
                this.sharedUserCompanyId,
                machine
            );

            const searchDataSource = [...this.searchDataSource.data];
            const index = searchDataSource.findIndex(
                kaseyaMachine => kaseyaMachine.AgentId === machine.AgentId
            );
            searchDataSource.splice(index, 1);
            this.searchDataSource.data = searchDataSource;

            const assignedMachineIndex = this.assignedMachines.findIndex(
                assignedMachine => assignedMachine.machineId === result.machineId
            );

            if (assignedMachineIndex === -1) {
                this.assignedMachines.push(result);
                this.dataSource.data = this.assignedMachines;
            }

            this.showLoadingSpinner['loading'] = false;
        } catch (error) {
            console.error(error);
            this.showLoadingSpinner['loading'] = false;
        }
    }

    public deleteAssignedMachine(machine: ISharedUserCompanyMachine): void {
        const data: IConfirmationDialogData = {
            title: 'Confirm delete',
            content:  `
                Are you sure you wish to remove this machine assigned to ${this.dialogData.userInfo.emailAddress}?
            `
        };

        this.dialog
            .open(ConfirmationDialogComponent, {
                data
            })
            .afterClosed()
            .subscribe(async result => {
                if (result) {
                    try {
                        this.showLoadingSpinner['loading'] = true;
                        await this.machinesDialogService.deleteAssignedMachine(
                            this.sharedUserCompanyId,
                            machine.machineId
                        );
                        const index = this.assignedMachines.findIndex(
                            assignedMachine => assignedMachine.machineId === machine.machineId
                        );
                        this.assignedMachines.splice(index, 1);
                        this.dataSource.data = this.assignedMachines;
                        this.showLoadingSpinner['loading'] = false;
                    } catch (error) {
                        console.error(error);
                        this.showLoadingSpinner['loading'] = false;
                    }
                }
            });
    }

    public closeDialog(): void {
        const machinesString = this.assignedMachines
            .map(machine => machine.computerName)
            .join(', ');
        this.dialogRef.close(machinesString);
    }
}
