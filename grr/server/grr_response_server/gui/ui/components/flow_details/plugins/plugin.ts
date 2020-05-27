import {EventEmitter, Input, Output} from '@angular/core';
import {FlowListEntry, FlowResultsQuery} from '@app/lib/models/flow';
import {ReplaySubject} from 'rxjs';

/**
 * Flow results query without the flowId field.
 *
 * Flow results queries issues by details plugins are equivalent to the
 * FlowResultsQuery interface, but there should be no need for the user to
 * provide the flowId field, since it can/should be filled in automatically.
 */
export type FlowResultsQueryWithoutFlowId = Omit<FlowResultsQuery, 'flowId'>;

/**
 * Base class for all flow details plugins.
 */
export abstract class Plugin {
  private flowListEntryValue?: FlowListEntry;

  /**
   * Subject emitting new FlowListEntry values on every "flowListEntry"
   * binding change.
   */
  flowListEntry$ = new ReplaySubject<FlowListEntry>(1);

  /**
   * Event that is triggered when additional flow results data is needed to
   * be present in the flowListEntry.
   */
  @Output()
  flowResultsQuery = new EventEmitter<FlowResultsQueryWithoutFlowId>();

  /**
   * Flow input binding containing flow data information to display.
   */
  @Input()
  set flowListEntry(value: FlowListEntry) {
    this.flowListEntryValue = value;
    this.flowListEntry$.next(value);
  }

  get flowListEntry(): FlowListEntry {
    return this.flowListEntryValue!;
  }

  /**
   * Emits an event indicating that the flow list entry should be updated with
   * results of a gvein query.
   */
  queryFlowResults(query: FlowResultsQueryWithoutFlowId) {
    this.flowResultsQuery.emit(query);
  }
}
