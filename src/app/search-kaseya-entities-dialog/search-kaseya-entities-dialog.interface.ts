import { KaseyaEntity } from '../search-kaseya-entities/search-kaseya-entities.interface';

export interface IKaseyaProcedure {
    AgentProcedureId: number;
    AgentProcedureName: string;
    Path: string;
    Description: string;
    Attributes: null;
    lookupKey?: string;
}

export interface IKaseyaMachine {
    ComputerName: string;
    AgentName: string;
    AgentId: string;
}

export interface ISearchKaseyaEntityDialogData {
    title: string;
    inputName: string;
    placeholder: string;
    tooltipText: string;
    entityType: KaseyaEntity;
    idKey: string;
    primaryDisplayKey: string;
    secondaryDisplayKey: string;
}
