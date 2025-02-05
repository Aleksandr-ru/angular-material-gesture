
import { Directive, Input, OnInit } from '@angular/core';
import {MatTabGroup, MatTabNav} from '@angular/material/tabs';
import { fromEvent } from 'rxjs';
import { pairwise, switchMap, takeUntil, tap } from 'rxjs/operators';

@Directive({
  // tslint:disable-next-line:directive-selector
  selector: 'nav[mat-tab-nav-bar][matTabNavBarGesture]'
})
export class MatTabNavBarGestureDirective implements OnInit {

  private headers: any;
  private headersList: any;
  private originalHeadersListTransition?: string;
  private headersMaxScroll?: number;

  // private body: any;
  // private skipBodySwipe = false;
  // private bodyCurrentScroll?: { x: number; y: number };

  private prevButton: any;
  private nextButton: any;

  @Input() swipeLimitWidth = 80;
  // @Input() connectEdges = true;
  // @Input() bodySwipe = true;

  constructor(
    private tabGroup: MatTabNav,
  ) {
  }

  ngOnInit(): void {
    // this.skipBodySwipe = !this.bodySwipe;

    this.headers = this.tabGroup._tabListContainer.nativeElement;
    if (!this.headers) { throw new Error('No headers found in DOM! Aborting...'); }

    this.headersList = this.tabGroup._tabList.nativeElement;
    if (!this.headersList) { throw new Error('No headers list found in DOM! Aborting...'); }

    // todo: get body via this.tabGroup.tabPanel...

    // we're unable to get it from this.tabGroup._nextPaginator
    this.prevButton = this.headers.parentElement.querySelector('.mat-mdc-tab-header-pagination-before');
    this.nextButton = this.headers.parentElement.querySelector('.mat-mdc-tab-header-pagination-after');

    this._handleHeadersEvents();
    // this._handleBodyEvents();
  }

  private _handleHeadersEvents(): void {
    // this will capture all touchstart events from the headers element
    fromEvent(this.headers, 'touchstart')
      .pipe(
        tap(() => {
          this.originalHeadersListTransition = this.headersList.style.transition;
          this.headersList.style.transition = 'none';
          this.headersMaxScroll =
            this.headersList.offsetWidth - this.headers.offsetWidth
            + this.prevButton.offsetWidth + this.nextButton.offsetWidth;
        }),
        switchMap((e) => {
          // after a mouse down, we'll record all mouse moves
          return fromEvent(this.headers, 'touchmove')
            .pipe(
              // we'll stop (and unsubscribe) once the user releases the mouse
              // this will trigger a 'mouseup' event
              takeUntil(fromEvent(this.headers, 'touchend').pipe(
                tap(() => this.headersList.style.transition = this.originalHeadersListTransition),
              )),
              // pairwise lets us get the previous value to draw a line from
              // the previous point to the current point
              pairwise()
            );
        })
      )
      .subscribe((res: [any, any]) => {
        const rect = this.headers.getBoundingClientRect();
        // previous and current position with the offset
        const prevX = res[0].touches[0].clientX - rect.left;

        const currentX = res[1].touches[0].clientX - rect.left;

        this._scrollHeaders(currentX - prevX);
      });
  }

  private _scrollHeaders(scrollX: number): void {
    if (!this.headersList || !this.headersMaxScroll) { return; }
    let newScroll = this.tabGroup.scrollDistance + scrollX * -1;
    if (newScroll < 0) { newScroll = 0; }
    if (newScroll > this.headersMaxScroll) { newScroll = this.headersMaxScroll; }
    this.tabGroup.scrollDistance = newScroll;
  }

  // private _handleBodyEvents(): void {
  //   // this will capture all touchstart events from the headers element
  //   fromEvent(this.body, 'touchstart')
  //     .pipe(
  //       switchMap((e: any) => {
  //         // need to test classname to string otherwise can throw error
  //         const path = e.composed ? e.composedPath() : e.path;
  //         if (path.findIndex((p: any) => p.className
  //           && typeof p.className === 'string'
  //           && p.className.indexOf('mat-mdc-slider') > -1) > -1) {
  //           this.skipBodySwipe = true;
  //         }
  //         // after a mouse down, we'll record all mouse moves
  //         return fromEvent(this.body, 'touchmove')
  //           .pipe(
  //             // we'll stop (and unsubscribe) once the user releases the mouse
  //             // this will trigger a 'mouseup' event
  //             takeUntil(fromEvent(this.body, 'touchend').pipe(
  //               tap(() => {
  //                 // this.skipBodySwipe = false;
  //                 this.skipBodySwipe = !this.bodySwipe;
  //                 if (!this.bodyCurrentScroll) { return; }
  //                 if (Math.abs(this.bodyCurrentScroll.y) > Math.abs(this.bodyCurrentScroll.x)) { return; }
  //                 const limitPrev = this.swipeLimitWidth;
  //                 const limitNext = -1 * this.swipeLimitWidth;
  //
  //                 if (this.bodyCurrentScroll.x > limitPrev && this.bodyCurrentScroll.x < limitNext) { return; }
  //                 if (this.bodyCurrentScroll.x > limitPrev) { this._prevTab(); }
  //                 else if (this.bodyCurrentScroll.x < limitNext) { this._nextTab(); }
  //                 this.bodyCurrentScroll = {x: 0, y: 0};
  //               })
  //             )),
  //             // pairwise lets us get the previous value to draw a line from
  //             // the previous point to the current point
  //             pairwise()
  //           );
  //       })
  //     )
  //     .subscribe((res: [any, any]) => {
  //       if (this.skipBodySwipe) { return; }
  //       const rect = this.body.getBoundingClientRect();
  //       // previous and current position with the offset
  //
  //       const prevPos = {
  //         x: res[0].touches[0].clientX - rect.left,
  //         y: res[0].touches[0].clientY - rect.top
  //       };
  //
  //       const currentPos = {
  //         x: res[1].touches[0].clientX - rect.left,
  //         y: res[1].touches[0].clientY - rect.top
  //       };
  //
  //       if (!this.bodyCurrentScroll) { this.bodyCurrentScroll = {x: 0, y: 0}; }
  //       this.bodyCurrentScroll = {
  //         x: this.bodyCurrentScroll.x + currentPos.x - prevPos.x,
  //         y: this.bodyCurrentScroll.y + currentPos.y - prevPos.y,
  //       };
  //     });
  // }

  // private _prevTab(): void {
  //   if (this.tabGroup.selectedIndex === 0 || this.tabGroup.selectedIndex === null) {
  //     this.tabGroup.selectedIndex = this.connectEdges ? this.tabGroup._tabs.length - 1 : this.tabGroup.selectedIndex;
  //   }
  //   else { this.tabGroup.selectedIndex = this.tabGroup.selectedIndex - 1; }
  //   this.tabGroup.updatePagination();
  // }

  // private _nextTab(): void {
  //   if (this.tabGroup.selectedIndex === this.tabGroup._tabs.length - 1) {
  //     this.tabGroup.selectedIndex = this.connectEdges ? 0 : this.tabGroup.selectedIndex;
  //   }
  //   else if (this.tabGroup.selectedIndex === null) { this.tabGroup.selectedIndex = 0; }
  //   else { this.tabGroup.selectedIndex = this.tabGroup.selectedIndex + 1; }
  //   this.tabGroup.updatePagination();
  // }

}
