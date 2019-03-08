import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { IRole } from './roles.interface';
import { API_URL } from '../utils/utils.service';

@Injectable()
export class RoleService {
    roles: Array<IRole> = [];
    rolesMap: Map<number, IRole> = new Map();

    constructor(private http: HttpClient) { }

    getRoles(): Promise<Array<IRole>> {
        if (this.roles.length) {
            return Promise.resolve(this.roles);
        } else {
            return this.http
                .get<Array<IRole>>(`${API_URL}/api/roles`)
                .toPromise()
                .then(roles => {
                    for (const role of roles) {
                        this.rolesMap.set(role.id, role);
                    }

                    this.roles = roles;
                    return this.roles;
                });
        }
    }

    getRoleById(roleId: number): Promise<IRole> {
        if (this.rolesMap.size) {
            const role = this.rolesMap.get(roleId);
            return Promise.resolve(role);
        } else {
            return this
                .getRoles()
                .then(() => this.rolesMap.get(roleId));
        }
    }
}
