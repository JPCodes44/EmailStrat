import { useMemo, useRef, useState } from 'react';
import { HotTable, HotColumn } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import type { HotTableRef } from '@handsontable/react-wrapper';
import type { CellValue } from 'handsontable/common';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

registerAllModules();

const columns = ['Email', 'Company'] as const;
const initialRows = 100;

function createRows(rowCount: number) {
  return Array.from({ length: rowCount }, () => ['', '']);
}

function countEntries(data: CellValue[][]) {
  return data.filter((row) =>
    row.some((cell) => String(cell ?? '').trim().length > 0),
  ).length;
}

export function EmailTableScreen() {
  const hotTableRef = useRef<HotTableRef>(null);
  const [data] = useState<CellValue[][]>(() => createRows(initialRows));
  const filledCount = useMemo(() => countEntries(data), [data]);
  const [entryCount, setEntryCount] = useState(filledCount);

  function syncEntries() {
    const instance = hotTableRef.current?.hotInstance;
    if (instance === null || instance === undefined) {
      return;
    }
    setEntryCount(countEntries(instance.getData() as CellValue[][]));
  }

  return (
    <section className="emailTableScreen">
      <div className="emailTableHeader">
        <h1 className="emailTableTitle">Email Table</h1>
        <p className="emailTableSubtitle">
          Paste, select, resize, fill, and edit company contacts like a
          spreadsheet.
        </p>
      </div>
      <div className="emailTableCanvas">
        <section className="emailTableCard">
          <div className="emailTableToolbar">
            <span className="emailTableCount">
              {entryCount.toLocaleString()} entries
            </span>
          </div>
          <div className="emailSpreadsheetShell">
            <HotTable
              id="email-hot-table"
              ref={hotTableRef}
              data={data}
              colHeaders={[...columns]}
              rowHeaders
              width="100%"
              height="100%"
              stretchH="all"
              className="emailHotTable ht-theme-main"
              licenseKey="non-commercial-and-evaluation"
              navigableHeaders
              tabNavigation
              autoWrapRow
              autoWrapCol
              contextMenu
              manualColumnResize
              manualRowResize
              manualColumnMove
              manualRowMove
              outsideClickDeselects={false}
              selectionMode="multiple"
              fillHandle={{
                autoInsertRow: true,
              }}
              copyPaste={{
                pasteMode: 'overwrite',
              }}
              undo
              minRows={initialRows}
              minSpareRows={12}
              minCols={2}
              maxCols={2}
              colWidths={[360, 360]}
              rowHeights={32}
              columns={[
                { data: 0, type: 'text' },
                { data: 1, type: 'text' },
              ]}
              afterChange={(_changes, source) => {
                if (source === 'loadData') {
                  return;
                }
                syncEntries();
              }}
              afterCreateRow={syncEntries}
              afterRemoveRow={syncEntries}
              afterPaste={syncEntries}
            >
              <HotColumn title="Email" data={0} width={360} />
              <HotColumn title="Company" data={1} width={360} />
            </HotTable>
          </div>
        </section>
      </div>
    </section>
  );
}
