import { useEffect, useRef, useState } from 'react';
import { useMutation, useQuery } from 'convex/react';
import { makeFunctionReference } from 'convex/server';
import { HotTable, HotColumn } from '@handsontable/react-wrapper';
import { registerAllModules } from 'handsontable/registry';
import type { CellValue } from 'handsontable/common';
import 'handsontable/styles/handsontable.min.css';
import 'handsontable/styles/ht-theme-main.min.css';

registerAllModules();

interface EmailTableRow {
  companyId: string;
  company: string;
  email1: string;
  email2: string;
  email3: string;
  status: string;
  // Carried for the send flow; intentionally not shown as grid columns.
  emailTemplate: string;
  resumePdfUrl: string | null;
}

const listEmailTableRowsQuery = makeFunctionReference<
  'query',
  Record<string, never>,
  EmailTableRow[]
>('emails:listEmailTableRows');

const setEmailRowMutation = makeFunctionReference<
  'mutation',
  { companyId: string; email1?: string; email2?: string; email3?: string },
  null
>('emails:setEmailRow');

const columns = ['Company', 'Email1', 'Email2', 'Email3', 'Status'] as const;

/** Editable column index → the company email field it writes (others read-only). */
const editableField: Record<number, 'email1' | 'email2' | 'email3'> = {
  1: 'email1',
  2: 'email2',
  3: 'email3',
};

export function EmailTableScreen() {
  const rows = useQuery(listEmailTableRowsQuery, {});
  const setEmailRow = useMutation(setEmailRowMutation);

  const [grid, setGrid] = useState<CellValue[][]>([]);
  const companyIdsRef = useRef<string[]>([]);
  const companyKeyRef = useRef('');

  // Re-seed the grid only when the *set of companies* changes, so persisting an
  // edit (which updates the query) doesn't clobber the cell being typed in.
  useEffect(() => {
    if (rows === undefined) return;
    const key = rows.map((r) => r.companyId).join('|');
    if (key === companyKeyRef.current) return;
    companyKeyRef.current = key;
    companyIdsRef.current = rows.map((r) => r.companyId);
    setGrid(
      rows.map((r) => [r.company, r.email1, r.email2, r.email3, r.status]),
    );
  }, [rows]);

  const companyCount = (rows ?? []).length;

  return (
    <section className="emailTableScreen">
      <div className="emailTableHeader">
        <h1 className="emailTableTitle">Email Table</h1>
        <p className="emailTableSubtitle">
          Add up to three recipient emails per drafted company. Edits save
          automatically.
        </p>
      </div>
      <div className="emailTableCanvas">
        <section className="emailTableCard">
          <div className="emailTableToolbar">
            <span className="emailTableCount">
              {companyCount.toLocaleString()} companies
            </span>
          </div>
          <div className="emailSpreadsheetShell">
            <HotTable
              id="email-hot-table"
              data={grid}
              colHeaders={[...columns]}
              rowHeaders
              width="100%"
              height="100%"
              stretchH="all"
              className="emailHotTable ht-theme-main"
              licenseKey="non-commercial-and-evaluation"
              navigableHeaders
              manualColumnResize
              colWidths={[220, 220, 220, 220, 110]}
              rowHeights={32}
              afterChange={(changes, source) => {
                if (changes === null || source === 'loadData') return;
                for (const [row, col, , next] of changes) {
                  const companyId = companyIdsRef.current[row];
                  const field = editableField[col as number];
                  if (companyId === undefined || field === undefined) continue;
                  const patch: {
                    companyId: string;
                    email1?: string;
                    email2?: string;
                    email3?: string;
                  } = { companyId };
                  patch[field] = String(next ?? '');
                  void setEmailRow(patch);
                }
              }}
            >
              <HotColumn title="Company" data={0} width={220} readOnly />
              <HotColumn title="Email1" data={1} width={220} type="text" />
              <HotColumn title="Email2" data={2} width={220} type="text" />
              <HotColumn title="Email3" data={3} width={220} type="text" />
              <HotColumn title="Status" data={4} width={110} readOnly />
            </HotTable>
          </div>
        </section>
      </div>
    </section>
  );
}
