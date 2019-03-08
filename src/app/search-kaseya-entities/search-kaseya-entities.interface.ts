export interface ISearchKaseyaEntitiesOptions {
    searchText: string;
    entityType: KaseyaEntity;
}

export type KaseyaEntity = 'agentProcedures' | 'machines' | 'machineGroups';

