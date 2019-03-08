import { Component, OnInit, Input, Output, EventEmitter } from '@angular/core';

@Component({
    selector: 'app-search-box',
    templateUrl: 'search-box.component.html',
    styleUrls: ['./search-box.component.scss']
})

export class SearchBoxComponent implements OnInit {
    @Input() placeholder: string;
    @Input() name: string;

    @Input() initialValue = '';

    @Output() change: EventEmitter<string> = new EventEmitter();

    constructor() { }

    ngOnInit() { }

    public emitChange(value: string): void {
        this.change.emit(value);
    }
}
