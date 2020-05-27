import {buildUpdateResultsQueries, findFlowListEntryResultSet, FlowListEntry, FlowResultSet, FlowResultSetState, FlowState, updateFlowListEntryResultSet} from '@app/lib/models/flow';
import {newFlowListEntry} from '@app/lib/models/model_test_util';
import {initTestEnvironment} from '../../testing';



initTestEnvironment();

describe('updateFlowListEntryResultSet()', () => {
  it('adds a result set to an empty list', () => {
    const fle: FlowListEntry = {
      ...newFlowListEntry(),
      resultSets: [],
    };

    const resultSet: FlowResultSet = {
      sourceQuery: {
        flowId: '1',
        offset: 0,
        count: 0,
      },
      state: FlowResultSetState.FETCHED,
      items: [],
    };

    const updatedFle = updateFlowListEntryResultSet(fle, resultSet);
    expect(updatedFle).toEqual({
      ...fle,
      resultSets: [resultSet],
    });
  });

  it('updates a result with no withType and no withTag', () => {
    const fle: FlowListEntry = {
      ...newFlowListEntry(),
      resultSets: [],
    };

    const resultSet1: FlowResultSet = {
      sourceQuery: {
        flowId: '1',
        offset: 0,
        count: 100,
      },
      state: FlowResultSetState.FETCHED,
      items: [],
    };
    const resultSet2: FlowResultSet = {
      ...resultSet1,
      sourceQuery: {
        flowId: '1',
        offset: 100,
        count: 100,
      },
    };

    let updatedFle = updateFlowListEntryResultSet(fle, resultSet1);
    updatedFle = updateFlowListEntryResultSet(updatedFle, resultSet2);
    expect(updatedFle).toEqual({
      ...fle,
      resultSets: [resultSet2],
    });
  });

  it('adds result set with a different withTag', () => {
    const fle: FlowListEntry = {
      ...newFlowListEntry(),
      resultSets: [],
    };

    const resultSet1: FlowResultSet = {
      sourceQuery: {
        flowId: '1',
        offset: 0,
        count: 100,
      },
      state: FlowResultSetState.FETCHED,
      items: [],
    };
    const resultSet2: FlowResultSet = {
      ...resultSet1,
      sourceQuery: {
        ...resultSet1.sourceQuery,
        withTag: 'someTag',
      },
    };

    let updatedFle = updateFlowListEntryResultSet(fle, resultSet1);
    updatedFle = updateFlowListEntryResultSet(updatedFle, resultSet2);
    expect(updatedFle).toEqual({
      ...fle,
      resultSets: [resultSet1, resultSet2],
    });
  });

  it('adds result set with a different withType', () => {
    const fle: FlowListEntry = {
      ...newFlowListEntry(),
      resultSets: [],
    };

    const resultSet1: FlowResultSet = {
      sourceQuery: {
        flowId: '1',
        offset: 0,
        count: 100,
      },
      state: FlowResultSetState.FETCHED,
      items: [],
    };
    const resultSet2: FlowResultSet = {
      ...resultSet1,
      sourceQuery: {
        ...resultSet1.sourceQuery,
        withType: 'someType',
      },
    };

    let updatedFle = updateFlowListEntryResultSet(fle, resultSet1);
    updatedFle = updateFlowListEntryResultSet(updatedFle, resultSet2);
    expect(updatedFle).toEqual({
      ...fle,
      resultSets: [resultSet1, resultSet2],
    });
  });

  it('updates result set with set withTag and withType', () => {
    const fle: FlowListEntry = {
      ...newFlowListEntry(),
      resultSets: [],
    };

    const resultSet1: FlowResultSet = {
      sourceQuery: {
        flowId: '1',
        withTag: 'someTag',
        withType: 'someType',
        offset: 0,
        count: 100,
      },
      state: FlowResultSetState.FETCHED,
      items: [],
    };
    const resultSet2: FlowResultSet = {
      ...resultSet1,
      sourceQuery: {
        ...resultSet1.sourceQuery,
        offset: 100,
        count: 100,
      },
    };

    let updatedFle = updateFlowListEntryResultSet(fle, resultSet1);
    updatedFle = updateFlowListEntryResultSet(updatedFle, resultSet2);
    expect(updatedFle).toEqual({
      ...fle,
      resultSets: [resultSet2],
    });
  });
});

describe('findFlowListEntryResultSet()', () => {
  let resultSet1: FlowResultSet;
  let resultSet2: FlowResultSet;
  let resultSet3: FlowResultSet;
  let resultSet4: FlowResultSet;
  let fle: FlowListEntry;

  beforeEach(() => {
    resultSet1 = {
      sourceQuery: {
        flowId: '1',
        offset: 0,
        count: 100,
      },
      state: FlowResultSetState.FETCHED,
      items: [],
    };
    resultSet2 = {
      ...resultSet1,
      sourceQuery: {
        ...resultSet1.sourceQuery,
        withTag: 'someTag',
        withType: 'someType',
      },
    };
    resultSet3 = {
      ...resultSet1,
      sourceQuery: {
        ...resultSet1.sourceQuery,
        withTag: 'someTag',
      },
    };
    resultSet4 = {
      ...resultSet1,
      sourceQuery: {
        ...resultSet1.sourceQuery,
        withType: 'someType',
      },
    };

    fle = {
      ...newFlowListEntry(),
      resultSets: [resultSet1, resultSet2, resultSet3, resultSet4],
    };
  });

  it('correctly finds non-tagged non-typed result set', () => {
    expect(findFlowListEntryResultSet(fle)).toBe(resultSet1);
  });

  it('correctly finds tagged non-typed result set', () => {
    expect(findFlowListEntryResultSet(fle, undefined, 'someTag'))
        .toBe(resultSet3);
  });

  it('correctly finds non-tagged typed result set', () => {
    expect(findFlowListEntryResultSet(fle, 'someType', undefined))
        .toBe(resultSet4);
  });

  it('correctly finds tagged typed result set', () => {
    expect(findFlowListEntryResultSet(fle, 'someType', 'someTag'))
        .toBe(resultSet2);
  });
});

describe('buildUpdateResultsQueries()', () => {
  const sampleFlowId = '42';

  function sampleFlowListEntry(
      flowState: FlowState, resultSetPartial: Partial<FlowResultSet> = {}) {
    const fle = newFlowListEntry({
      flowId: sampleFlowId,
      state: flowState,
    });

    // Make sure there is a result set present in the FlowListEntry.
    // Otherwise there won't be anything to update.
    return updateFlowListEntryResultSet(fle, {
      sourceQuery: {
        flowId: fle.flow.flowId,
        offset: 0,
        count: 10,
      },
      items: [],
      state: FlowResultSetState.FETCHED,
      ...resultSetPartial,
    });
  }

  it('does not include completed flows', () => {
    const fle = sampleFlowListEntry(FlowState.FINISHED);
    const fleMap = {
      [fle.flow.flowId]: fle,
    };

    const queries = buildUpdateResultsQueries({}, fleMap);
    expect(queries.length).toBe(0);
  });

  it('includes running flows', () => {
    const fle = sampleFlowListEntry(FlowState.RUNNING);
    const fleMap = {
      [fle.flow.flowId]: fle,
    };

    const queries = buildUpdateResultsQueries({}, fleMap);
    expect(queries.length).toBe(1);
  });

  it('includes completed flows that were running in previous update', () => {
    const fle = sampleFlowListEntry(FlowState.FINISHED);
    const fleMap = {
      [fle.flow.flowId]: fle,
    };
    const prevFleMap = {
      [fle.flow.flowId]: sampleFlowListEntry(FlowState.RUNNING),
    };

    const queries = buildUpdateResultsQueries(prevFleMap, fleMap);
    expect(queries.length).toBe(1);
  });

  it('does not include queries for result sets that are full', () => {
    const fle = sampleFlowListEntry(FlowState.RUNNING, {
      items: new Array(10),
    });
    const fleMap = {
      [fle.flow.flowId]: fle,
    };

    const queries = buildUpdateResultsQueries({}, fleMap);
    expect(queries.length).toBe(0);
  });

  it('includes queries for result sets that are not full', () => {
    const fle = sampleFlowListEntry(FlowState.RUNNING, {
      items: new Array(9),
    });
    const fleMap = {
      [fle.flow.flowId]: fle,
    };

    const queries = buildUpdateResultsQueries({}, fleMap);
    expect(queries.length).toBe(1);
  });

  it('does not include queries for results sets in IN_PROGRESS state', () => {
    const fle = sampleFlowListEntry(FlowState.RUNNING, {
      state: FlowResultSetState.IN_PROGRESS,
    });
    const fleMap = {
      [fle.flow.flowId]: fle,
    };

    const queries = buildUpdateResultsQueries({}, fleMap);
    expect(queries.length).toBe(0);
  });
});
