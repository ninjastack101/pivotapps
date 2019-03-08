export interface IMaterialTablePatch<T> {
    addedEntities: Array<T>;
    updatedEntities: Array<T>;
    removedEntities: Array<T>;
}
