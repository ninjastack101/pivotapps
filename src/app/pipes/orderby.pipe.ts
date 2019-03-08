import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'orderBy'
})
export class OrderByPipe implements PipeTransform {
    transform(input: any, args: any[]): any {
        const sortFields = args[0].split(', ');
        const sortOrders = args[1].split(', ');
        input.sort((previousValue: any, currentValue: any) => this.recursiveSort(previousValue, currentValue, sortFields, sortOrders));

        return input;
    }

    private recursiveSort(previousValue, currentValue, sortFields, sortOrders): number {
        const primarySortField = sortFields[0];
        const primarySortFieldOrder = sortOrders[0];
        if (previousValue[primarySortField] < currentValue[primarySortField]) {
            return primarySortFieldOrder === 'desc' ? 1 : -1;
        } else if (previousValue[primarySortField] > currentValue[primarySortField]) {
            return primarySortFieldOrder === 'desc' ? -1 : 1;
        } else {
            const secondarySortField = sortFields[1];
            const secondarySortFieldOrder = sortOrders[1];
            if (secondarySortField) {
                return this.recursiveSort(previousValue, currentValue, [secondarySortField], [secondarySortFieldOrder]);
            } else {
                return 0;
            }
        }
    }
}
