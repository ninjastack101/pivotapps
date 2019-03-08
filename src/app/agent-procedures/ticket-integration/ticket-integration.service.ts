import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from 'app/utils/utils.service';
import { ITicketIntegrationConfig, ITicketIntegrationConfigMinimal } from './ticket-integration.interface';

@Injectable()
export class TicketConfigurationService {
    constructor(
        private http: HttpClient
    ) { }

    createTicketConfiguration(data: ITicketIntegrationConfig): Promise<ITicketIntegrationConfig> {
        return this.http
            .post<ITicketIntegrationConfig>(`${API_URL}/api/ticket-configurations`, data)
            .toPromise();
    }

    getTicketConfigurationById(id: number): Promise<ITicketIntegrationConfig> {
        return this.http
            .get<ITicketIntegrationConfig>(`${API_URL}/api/ticket-configurations/${id}`)
            .toPromise();
    }

    updateTicketConfiguration(id: number, data: ITicketIntegrationConfig): Promise<void> {
        return this.http
            .patch<void>(`${API_URL}/api/ticket-configurations/${id}`, data)
            .toPromise();
    }

    getTicketConfigurations(
        skillId: number
    ): Promise<Array<ITicketIntegrationConfigMinimal>> {
        let url = `${API_URL}/api/ticket-configurations`;
        url += `?skillId=${skillId}`;

        return this.http
            .get<Array<ITicketIntegrationConfigMinimal>>(url)
            .toPromise();
    }
}
