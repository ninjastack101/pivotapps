export interface ITicketIntegrationConfigMinimal {
    id?: number;
    skillId: number;
    companyId: number;
    createTicket?: boolean;
    billable?: boolean;
    timeToLog?: string;
    technicianName?: string;
}

export interface ITicketIntegrationListTable extends ITicketIntegrationConfigMinimal {
    companyName: string;
}

export interface ITicketIntegrationConfig extends ITicketIntegrationConfigMinimal {
    serviceBoardName?: string;
    includeChatInDescription?: boolean;
    logStartEndTime?: boolean;
    priority?: string;
    status?: string;
    type?: string;
    subType?: string;
    includeAssetName?: boolean;
    agreementName?: string;
    workRole?: string;
}
