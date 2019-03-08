export interface IDepartmentFilterSelectionChange {
    currentDepartmentId: number;
    currentCategoryId: number;
    currentSubCategoryId: number;
    subCategoryIds: Set<number>;
}
