import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { API_URL } from '../utils/utils.service';
import { ISearchKaseyaEntitiesOptions } from './search-kaseya-entities.interface';

@Injectable()
export class SearchKaseyaEntitiesService {
    constructor(private http: HttpClient) { }

    public searchEntities<T>(
        options: ISearchKaseyaEntitiesOptions
    ): Promise<Array<T>> {
        const queryString = `searchText=${options.searchText}&entityType=${options.entityType}`;

        return this.http
            .get<Array<T>>(`${API_URL}/api/kaseya?${queryString}`)
            .toPromise();
    }
}
