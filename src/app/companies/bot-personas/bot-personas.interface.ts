import { IBotPersona } from 'app/services/botpersona.interface';

export interface ICompanyBotPersona {
    companyId: number;
    botPersonaId: number;
    createdAt?: Date;
    updatedAt?: Date;
    BotPersona: IBotPersona;
}
