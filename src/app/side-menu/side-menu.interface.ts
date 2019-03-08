import { IConfirmationDialogData } from '../confirmation-dialog/confirmation-dialog.interface';

export interface ISideMenu {
    name: string;
    icon: string;
    needsConfirmationPrompt: boolean;
    confirmationDialogData?: IConfirmationDialogData;
    url?: any;
    action?: (input?: any) => void;
}
