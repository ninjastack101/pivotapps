import { DebugElement, Directive, Input } from '@angular/core';

/** Button events to pass to `DebugElement.triggerEventHandler` for RouterLink event handler */
export const ButtonClickEvents = {
    left:  { button: 0 },
    right: { button: 2 }
};

/** Simulate element click. Defaults to mouse left-button click event. */
export function click(el: DebugElement | HTMLElement, eventObj: any = ButtonClickEvents.left): void {
    if (el instanceof HTMLElement) {
        el.click();
    } else {
        el.triggerEventHandler('click', eventObj);
    }
}

@Directive({
    // tslint:disable-next-line:directive-selector
    selector: '[routerLink]',
    // tslint:disable-next-line:use-host-property-decorator
    host: {
        '(click)': 'onClick()'
    }
})
export class RouterLinkStubDirective {
    // tslint:disable-next-line:no-input-rename
    @Input('routerLink') linkParams: any;
    navigatedTo: any = null;

    onClick() {
        this.navigatedTo = this.linkParams;
    }
}
