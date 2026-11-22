const STARTS = {
  tds: [15, 54, 238, 435, 619, 767, 834],
  dividend: [15, 51, 159, 192],
  savings: [15, 54, 243, 432, 781, 810],
  equity: [15, 40, 105, 322, 375, 414, 455, 493, 543, 639, 696, 747, 799, 843, 906],
  mfSale: [15, 39, 83, 137, 181, 225, 279, 328, 392, 436, 541, 583, 672, 748, 852, 891, 904],
  otherSale: [15, 42, 114, 300, 356, 397, 440, 482, 530, 629, 691, 739, 798, 831, 906],
  buySec: [15, 54, 238, 387, 602, 768, 834],
  buyMf: [15, 54, 208, 347, 466, 593, 744, 828],
};

export const AIS_HEADERS = {
  general: ['Field', 'Value'],
  tds: ['SR. NO.', 'Information Source (Company)', 'Quarter', 'Date of Payment/Credit', 'Amount Paid/Credited', 'TDS Deducted', 'TDS Deposited', 'Status'],
  tdsDividend: ['SR. NO.', 'Information Source (Company)', 'Quarter', 'Date of Payment/Credit', 'Amount Paid/Credited', 'TDS Deducted', 'TDS Deposited', 'Status'],
  tdsForeign: ['SR. NO.', 'Information Source (Company)', 'Quarter', 'Date of Payment/Credit', 'Amount Paid/Credited', 'TDS Deducted', 'TDS Deposited', 'Status'],
  dividend: ['SR. NO.', 'Information Source (Company)', 'Reported On', 'Dividend Amount (INR)', 'Status'],
  savings: ['SR. NO.', 'Bank Name', 'Bank PAN/Source Code', 'Account Number', 'Account Type', 'Interest Amount (INR)', 'Reported On', 'Status'],
  equity: ['SR. NO.', 'Source', 'Date of Sale/Transfer', 'Security Name', 'Security Code', 'Credit Type', 'Asset Type', 'Quantity', 'Sale Price/Unit', 'Sales Consideration', 'Cost of Acquisition', 'Unit FMV', 'Fair Market Value', 'Status'],
  mfSale: ['SR. NO.', 'AMC Name (Code)', 'Date of Sale/Transfer', 'Security Name', 'Security Code', 'Asset Type (Term)', 'Quantity', 'Sale Price/Unit', 'Sales Consideration', 'STT', 'Cost of Acquisition', 'Status'],
  otherSale: ['SR. NO.', 'Date of Sale/Transfer', 'Security Name', 'Security Code', 'Credit Type', 'Asset Type', 'Quantity', 'Sale Price/Unit', 'Sales Consideration', 'Cost of Acquisition', 'Status'],
  buySec: ['SR. NO.', 'Client ID', 'Holder Flag', 'Market Purchase (INR)', 'Market Sales (INR)', 'Status'],
  buyMf: ['SR. NO.', 'Information Source', 'Quarter', 'Client ID', 'AMC Name (Code)', 'Holder Flag', 'Total Purchase Amount (INR)', 'Total Sales Value (INR)'],
};

export const AIS_SHEETS = [
  { key: 'general', name: 'General Info', headerRow: null },
  { key: 'tds', name: 'TDS', headerRow: 0 },
  { key: 'tdsDividend', name: 'TDS - Dividend (194)', title: 'Part B1 - TDS - Dividend Received (Section 194)', headerRow: 2 },
  { key: 'tdsForeign', name: 'TDS - Foreign Remit (195)', title: 'Part B1 - TDS - Payment Received by Non-Residents (Section 195)', headerRow: 2 },
  { key: 'dividend', name: 'Dividend (SFT-015)', title: 'Part B2 - Dividend Income (SFT-015)', headerRow: 2 },
  { key: 'savings', name: 'Interest - Savings Bank', title: 'Part B2 - Interest Income from Savings Bank (SFT-016 SB)', headerRow: 2 },
  { key: 'equity', name: 'Sale of Listed Equity Shares', title: 'Part B2 - Sale of Listed Equity Share (Depository) - SFT-17-LES(M)', headerRow: 3 },
  { key: 'mfSale', name: 'Sale of MF Units', title: 'Part B2 - Sale of Unit of Equity Oriented Mutual Fund (RTA) - SFT-18-EMF(M)', headerRow: 3 },
  { key: 'otherSale', name: 'Sale of Other Units', title: 'Part B2 - Sale of Other Unit (Depository) - SFT-17-OTU(M)', headerRow: 3 },
  { key: 'buySec', name: 'Purchase of Securities', title: 'Part B2 - Purchase of Securities (SFT-17(Pur))', headerRow: 3 },
  { key: 'buyMf', name: 'Purchase of MF', title: 'Part B2 - Purchase of Mutual Funds (SFT-18(Pur))', headerRow: 2 },
];

const CATEGORY_MAP = [
  { key: 'tdsDividend', pattern: /^TDS-194/ },
  { key: 'tdsForeign', pattern: /^TDS-195/ },
  { key: 'tdsOther', pattern: /^TDS-/ },
  { key: 'dividend', pattern: /SFT-015/ },
  { key: 'savings', pattern: /SFT-016/ },
  { key: 'equity', pattern: /SFT-17-LES/ },
  { key: 'mfSale', pattern: /SFT-18-EMF/ },
  { key: 'otherSale', pattern: /SFT-17-OTU/ },
  { key: 'buySec', pattern: /SFT-17\(PUR\)/ },
  { key: 'buyMf', pattern: /SFT-18\(PUR\)/ },
];

const blankRecords = () => ({
  tds: [], tdsDividend: [], tdsForeign: [], dividend: [], savings: [],
  equity: [], mfSale: [], otherSale: [], buySec: [], buyMf: [],
});

const clean = value => String(value ?? '').replace(/\s+/g, ' ').trim();
const normalized = value => clean(value).toUpperCase().replace(/[^A-Z0-9]/g, '');

function getPageRows(content) {
  const rows = [];
  for (const item of content.items || []) {
    const text = clean(item.str);
    if (!text) continue;
    const x = Number(item.transform?.[4] || 0);
    const y = Number(item.transform?.[5] || 0);
    let row = rows.find(candidate => Math.abs(candidate.y - y) < 2.5);
    if (!row) {
      row = { y, items: [] };
      rows.push(row);
    }
    row.items.push({ x, text });
  }
  rows.sort((a, b) => b.y - a.y);
  return rows;
}

function textOfRow(row) {
  return row.items.slice().sort((a, b) => a.x - b.x).map(item => item.text).join(' ').replace(/\s+/g, ' ').trim();
}

function textBetween(row, minX, maxX) {
  return row.items.filter(item => item.x >= minX && item.x < maxX).sort((a, b) => a.x - b.x).map(item => item.text).join(' ').replace(/\s+/g, ' ').trim();
}

function cellsFromRow(row, starts) {
  const cells = Array(starts.length).fill('');
  for (const item of row.items) {
    let col = starts.length - 1;
    for (let i = 0; i < starts.length - 1; i++) {
      if (item.x < (starts[i] + starts[i + 1]) / 2) {
        col = i;
        break;
      }
    }
    cells[col] = clean(`${cells[col]} ${item.text}`);
  }
  return cells;
}

function appendCells(target, next) {
  for (let i = 0; i < target.length; i++) {
    if (!next[i]) continue;
    if (!target[i]) target[i] = next[i];
    else if (!target[i].endsWith(next[i])) target[i] = clean(`${target[i]} ${next[i]}`);
  }
}

function classifyCode(code) {
  const value = clean(code).replace(/\s+/g, '').toUpperCase();
  return CATEGORY_MAP.find(entry => entry.pattern.test(value))?.key || '';
}

function reportType(key) {
  if (key === 'tdsDividend' || key === 'tdsForeign' || key === 'tdsOther') return 'tds';
  return key;
}

function detectDetailHeader(text, key, headerWindow = text) {
  const value = normalized(text);
  if (key.startsWith('tds') && value.includes('QUARTER') && value.includes('TDSDEDUCTED')) return 'tds';
  if (key === 'dividend' && value.includes('REPORTEDON') && value.includes('DIVIDENDAMOUNT')) return 'dividend';
  if (key === 'savings' && value.includes('ACCOUNTNUMBER') && value.includes('INTERESTAMOUNT')) return 'savings';
  if (['equity', 'mfSale', 'otherSale'].includes(key) && value.includes('DATEOFSALE') && value.includes('SECURITYNAME')) return key;
  if (key === 'mfSale') {
    const window = normalized(headerWindow);
    if (window.includes('AMC') && window.includes('NAME') && window.includes('DATEOF') && window.includes('SALE') && window.includes('SECURITY') && window.includes('QUANTITY') && window.includes('COST') && window.includes('ACQUIS')) return 'mfSale';
  }
  if (key === 'buySec' && value.includes('CLIENTID') && value.includes('MARKETPURCHASE')) return 'buySec';
  if (key === 'buyMf' && value.includes('AMCNAME') && value.includes('TOTALPURCHASEAMOUNT')) return 'buyMf';
  return '';
}

function dateLike(value) {
  return /\b\d{1,2}[/.\-]\d{1,2}[/.\-]\d{2,4}\b/.test(value || '');
}

function isDataRow(type, values) {
  if (!/^\d{1,4}$/.test(clean(values[0]))) return false;
  if (type === 'tds') return Boolean(values[1] && dateLike(values[2]));
  if (type === 'dividend') return Boolean(dateLike(values[1]) && values[2]);
  if (type === 'savings') return Boolean(dateLike(values[1]) && values[2]);
  if (type === 'equity' || type === 'otherSale') return Boolean(dateLike(values[1]) && values[2]);
  if (type === 'mfSale') return Boolean(dateLike(values[2]) && values[4]);
  if (type === 'buySec' || type === 'buyMf') return Boolean(values[1] && values[2]);
  return false;
}

function parseCount(value) {
  const match = clean(value).replace(/,/g, '').match(/\d+/);
  return match ? Number(match[0]) : null;
}

function parseAmount(value) {
  const text = clean(value);
  if (!text || text === '-' || text === '--') return null;
  const normalizedValue = text.replace(/[₹,\s]/g, '').replace(/^\((.*)\)$/, '-$1');
  const number = Number(normalizedValue);
  return Number.isFinite(number) ? number : text;
}

function splitSecurity(value) {
  const text = clean(value);
  const match = text.match(/^(.*?)(?:\s*\(([^()]*)\))\s*$/);
  if (!match) return [text, ''];
  return [clean(match[1]), clean(match[2])];
}

function splitBankSource(value) {
  const text = clean(value);
  const match = text.match(/^(.*)\s+\(([^()]*)\)\s*$/);
  return match ? [clean(match[1]), clean(match[2])] : [text, ''];
}

function getFieldValue(rows, pageWidth, labelTerms) {
  const labelRowIndex = rows.findIndex(row => {
    const text = normalized(textOfRow(row));
    return labelTerms.some(term => {
      const token = normalized(term);
      if (token === 'ADDRESS' && text.includes('EMAILADDRESS')) return false;
      return text.includes(token);
    });
  });
  if (labelRowIndex < 0) return '';
  const labelRow = rows[labelRowIndex];
  const labelText = normalized(textOfRow(labelRow));
  const term = labelTerms.find(candidate => labelText.includes(normalized(candidate))) || labelTerms[0];
  const termNorm = normalized(term);
  const labelItem = labelRow.items.find(item => normalized(item.text).includes(termNorm.slice(0, Math.min(termNorm.length, 6))));
  const x = labelItem?.x ?? labelRow.items[0]?.x ?? 0;
  const sameRowLabels = labelRow.items.filter(item => item.x > x && /^(Aadhaar|Name|Date|Mobile|E-mail|Address)/i.test(item.text));
  const endX = sameRowLabels.length ? Math.min(...sameRowLabels.map(item => item.x)) - 2 : pageWidth;
  for (let i = labelRowIndex + 1; i < rows.length; i++) {
    const candidate = rows[i];
    const drop = labelRow.y - candidate.y;
    if (drop > 65) break;
    const parts = candidate.items.filter(item => item.x >= x - 8 && item.x < endX).sort((a, b) => a.x - b.x);
    if (parts.length) {
      const value = clean(parts.map(item => item.text).join(' '));
      const knownLabels = ['Permanent Account Number (PAN)', 'PAN', 'Aadhaar Number', 'Name of Assessee', 'Date of Birth', 'Mobile Number', 'E-mail Address', 'Email Address', 'Address', 'Download ID', 'Generation Date'];
      if (value && !knownLabels.some(label => normalized(value) === normalized(label))) return value;
    }
  }
  return '';
}

function getGeneralInfo(firstPage) {
  const rows = firstPage.rows;
  const pageWidth = firstPage.width;
  const fields = [
    ['PAN', ['Permanent Account Number (PAN)', 'PAN']],
    ['Aadhaar Number', ['Aadhaar Number']],
    ['Name of Assessee', ['Name of Assessee']],
    ['Date of Birth', ['Date of Birth']],
    ['Mobile Number', ['Mobile Number']],
    ['E-mail Address', ['E-mail Address', 'Email Address']],
    ['Address', ['Address']],
  ].map(([label, terms]) => [label, getFieldValue(rows, pageWidth, terms)]);
  const allText = rows.map(textOfRow).join('\n');
  const download = allText.match(/Download\s*ID\s*[:：]?\s*([A-Z0-9-]+)/i);
  const generation = allText.match(/Generation\s*Date\s*[:：]?\s*([0-9/.,: -]+)/i);
  fields.push(['Download ID', download?.[1] || ''], ['Generation Date', clean(generation?.[1] || '')]);
  return fields;
}

function mapRawRecord(key, rec) {
  const v = rec.raw.map(clean);
  const serial = parseCount(v[0]) ?? v[0];
  if (key === 'tdsDividend' || key === 'tdsForeign' || key === 'tdsOther') {
    return [serial, rec.source, v[1], v[2], parseAmount(v[3]), parseAmount(v[4]), parseAmount(v[5]), v[6]];
  }
  if (key === 'dividend') {
    return [serial, rec.source, v[1], parseAmount(v[2]), v[3]];
  }
  if (key === 'savings') {
    const [bankName, sourceCode] = splitBankSource(rec.source);
    return [serial, bankName, sourceCode, v[2], v[3], parseAmount(v[4]), v[1], v[5]];
  }
  if (key === 'equity') {
    const [name, code] = splitSecurity(v[2]);
    return [serial, rec.source, v[1], name, code, v[5], v[6], parseAmount(v[7]), parseAmount(v[8]), parseAmount(v[9]), parseAmount(v[10]), parseAmount(v[11]), parseAmount(v[12]), v[14]];
  }
  if (key === 'mfSale') {
    const [name, code] = splitSecurity(v[4]);
    return [serial, v[1], v[2], name, code, v[7], parseAmount(v[8]), parseAmount(v[9]), parseAmount(v[10]), parseAmount(v[11]), parseAmount(v[12]), v[16]];
  }
  if (key === 'otherSale') {
    const [name, code] = splitSecurity(v[2]);
    return [serial, v[1], name, code, v[5], v[6], parseAmount(v[7]), parseAmount(v[8]), parseAmount(v[9]), parseAmount(v[10]), v[14]];
  }
  if (key === 'buySec') {
    return [serial, v[2], v[3], parseAmount(v[4]), parseAmount(v[5]), v[6]];
  }
  if (key === 'buyMf') {
    const provider = rec.source.split(/\s+-\s+/)[0] || rec.source;
    return [serial, clean(provider), v[1], v[2], v[3], v[4], parseAmount(v[5]), parseAmount(v[6])];
  }
  return v;
}

function rowLooksLikeHeading(text) {
  const value = normalized(text);
  return value.startsWith('PARTB') || value.includes('DOWNLOADID') || value.includes('GENERATIONDATE') || value.includes('ANNUALINFORMATIONSTATEMENT') || value.includes('INFORMATIONCODE') || value.includes('INFORMATIONSOURCE') || value.includes('REPORTEDON') || value.includes('DIVIDENDAMOUNT') || value.includes('ACCOUNTNUMBER') || value.includes('CLIENTID') || value.includes('MARKETPURCHASE') || value.includes('TOTALPURCHASEAMOUNT') || value.includes('DATEOFSALE') || value.includes('SECURITYNAME') || value.includes('QUARTER') || value.startsWith('SRNO');
}

export async function extractAISDocument(doc, fileName = '') {
  const pages = [];
  const records = blankRecords();
  const reviews = [];
  let activeCode = '';
  let activeKey = '';
  let activeSource = '';
  let activeReview = null;
  let activePart = '';
  let activeTable = '';
  let activeRecord = null;
  let totalSelectableChars = 0;

  for (let pageNumber = 1; pageNumber <= doc.numPages; pageNumber++) {
    const page = await doc.getPage(pageNumber);
    const content = await page.getTextContent();
    const rows = getPageRows(content);
    const width = page.getViewport({ scale: 1 }).width;
    const text = rows.map(textOfRow).join('\n');
    const characters = text.replace(/\s/g, '').length;
    totalSelectableChars += characters;
    pages.push({ File: fileName, Page: pageNumber, Characters: characters, Extracted_Text: text, Extraction_Warning: characters < 20 ? 'No selectable text found. This page needs OCR and was not structurally extracted.' : '' });

    for (let i = 0; i < rows.length; i++) {
      const row = rows[i];
      const textLine = textOfRow(row);
      const norm = normalized(textLine);

      if (/^PART\s+B\d/i.test(textLine)) {
        activePart = norm.match(/^PARTB\d/)?.[0] || '';
        activeTable = '';
        activeRecord = null;
      } else if (/^(Sale of|Interest from|Purchase of|Dividend$|Refund$)/i.test(textLine)) {
        activeTable = '';
        activeRecord = null;
      }

      if (norm.includes('INFORMATIONCODE') && norm.includes('INFORMATIONSOURCE')) {
        const dataRow = rows[i + 1];
        activeRecord = null;
        activeTable = '';
        if (!dataRow) continue;
        const code = textBetween(dataRow, 54, 253).replace(/\s+/g, '').toUpperCase();
        const key = classifyCode(code);
        const source = textBetween(dataRow, 462, 795);
        const declared = parseCount(textBetween(dataRow, 795, 901));
        activeCode = code;
        activeKey = key;
        activeSource = source;
        const noTransactionSection = !code && activePart === 'PARTB7' && declared == null;
        activeReview = { Page: pageNumber, File: fileName, Code: code, Source: source, PDF_Count: declared, Extracted_Rows: 0, Status: key ? 'Checking' : noTransactionSection ? 'No transaction rows' : 'Not mapped', Note: key ? '' : noTransactionSection ? 'The AIS includes this section heading but reports no transaction row to extract.' : 'This section is preserved in Extracted Pages but does not have a structured output tab yet.' };
        reviews.push(activeReview);
        i++;
        continue;
      }

      const headerWindow = rows.slice(i, i + 4).map(textOfRow).join(' ');
      const header = detectDetailHeader(textLine, activeKey, headerWindow);
      if (header) {
        activeTable = header;
        activeRecord = null;
        continue;
      }

      if (!activeTable || !STARTS[activeTable]) continue;
      const rawCells = cellsFromRow(row, STARTS[activeTable]);

      if (isDataRow(activeTable, rawCells)) {
        const record = { raw: rawCells, source: activeSource, page: pageNumber, file: fileName };
        const recordKey = activeKey || activeTable;
        const tabKey = recordKey === 'tdsDividend' ? 'tdsDividend' : recordKey === 'tdsForeign' ? 'tdsForeign' : recordKey === 'tdsOther' ? 'tds' : recordKey;
        if (activeTable === 'tds') {
          records.tds.push(record);
          if (recordKey === 'tdsDividend') records.tdsDividend.push(record);
          else if (recordKey === 'tdsForeign') records.tdsForeign.push(record);
        } else if (records[tabKey]) records[tabKey].push(record);
        activeRecord = record;
        if (activeReview) activeReview.Extracted_Rows++;
        continue;
      }

      if (activeRecord && !rowLooksLikeHeading(textLine) && row.items.some(item => item.x > 30)) {
        appendCells(activeRecord.raw, rawCells);
      }
    }
    page.cleanup();
  }

  const generalInfo = getGeneralInfo(pages.length ? { rows: getPageRows(await (await doc.getPage(1)).getTextContent()), width: (await doc.getPage(1)).getViewport({ scale: 1 }).width } : { rows: [], width: 0 });

  for (const review of reviews) {
    if (!review.Status || ['Not mapped', 'No transaction rows'].includes(review.Status)) continue;
    if (review.PDF_Count == null) {
      review.Status = 'Review needed';
      review.Note = 'The PDF does not show a readable record count for this section.';
    } else if (review.PDF_Count !== review.Extracted_Rows) {
      review.Status = 'Review needed';
      review.Note = `The PDF lists ${review.PDF_Count} record(s), but ${review.Extracted_Rows} were read. Check this section before using it.`;
    } else {
      review.Status = 'Count matches';
      review.Note = 'Extracted row count matches the count shown in the PDF.';
    }
  }

  const output = {};
  output.tds = records.tds.map(record => ({ ...record, values: mapRawRecord('tdsOther', record) }));
  output.tdsDividend = records.tdsDividend.map(record => ({ ...record, values: mapRawRecord('tdsDividend', record) }));
  output.tdsForeign = records.tdsForeign.map(record => ({ ...record, values: mapRawRecord('tdsForeign', record) }));
  for (const key of ['dividend', 'savings', 'equity', 'mfSale', 'otherSale', 'buySec', 'buyMf']) output[key] = records[key].map(record => ({ ...record, values: mapRawRecord(key, record) }));
  const sourceText = pages.map(page => page.Extracted_Text).join('\n');
  const year = sourceText.match(/(?:Financial\s+Year|\bFY)\s*:?[ \u00a0]*(\d{4}\s*-\s*\d{2,4})/i)?.[1]?.replace(/\s+/g, '') || '';
  return { fileName, financialYear: year ? 'FY ' + year : '', pages, generalInfo, records: output, reviews, totalSelectableChars };
}
