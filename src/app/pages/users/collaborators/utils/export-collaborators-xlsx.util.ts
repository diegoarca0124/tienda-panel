import * as XLSX from 'xlsx-js-style';
import { saveAs } from 'file-saver';

export interface ExportExcelOptions {
  fileName?: string;
  sheetName?: string;
}

export const ExportCollaboratorsXlsxUtil = (
  data: any[],
  options?: ExportExcelOptions
) => {

  if (!data?.length) {
    return;
  }

  const {
    fileName = 'EXPORT',
    sheetName = 'DATA'
  } = options || {};

  const formattedData = data.map((item) => {

    const formattedItem = {
      ...item
    };

    if ('status' in item) {

      formattedItem.status =
        item.status === true
          ? 'ACTIVO'
          : item.status === false
            ? 'INACTIVO'
            : item.status;

    }

    return formattedItem;

  });

  const worksheet: XLSX.WorkSheet = XLSX.utils.json_to_sheet(formattedData);

  const columnWidths = Object.keys(formattedData[0] || {}).map((key) => {

    const maxLength = Math.max(
      key.length,
      ...formattedData.map((row: any) =>
        row[key]
          ? row[key].toString().length
          : 0
      )
    );

    return {
      wch: maxLength + 5
    };

  });

  worksheet['!cols'] = columnWidths;

  // =====================================
  // ALTURA FILAS
  // =====================================

  worksheet['!rows'] = [
    { hpx: 24 },
    ...formattedData.map(() => ({ hpx: 20 }))
  ];

  // =====================================
  // AUTOFILTER
  // =====================================

  worksheet['!autofilter'] = {
    ref: worksheet['!ref'] || 'A1'
  };

  // =====================================
  // FREEZE HEADER
  // =====================================

  worksheet['!freeze'] = {
    xSplit: 0,
    ySplit: 1
  };

  // =====================================
  // STYLES
  // =====================================

  const range = XLSX.utils.decode_range(
    worksheet['!ref'] || 'A1'
  );

  for (let row = range.s.r; row <= range.e.r; row++) {

    for (let col = range.s.c; col <= range.e.c; col++) {

      const cellAddress = XLSX.utils.encode_cell({
        r: row,
        c: col
      });

      const cell = worksheet[cellAddress];

      if (!cell) continue;

      // =====================================
      // HEADER
      // =====================================

      if (row === 0) {

        cell.v = String(cell.v).toUpperCase();

        cell.s = {

          font: {
            bold: true,
            color: {
              rgb: 'FFFFFF'
            },
            sz: 11
          },

          fill: {
            fgColor: {
              rgb: '000000'
            }
          },

          alignment: {
            horizontal: 'center',
            vertical: 'center'
          },

          border: {
            top: {
              style: 'thin',
              color: { rgb: '444444' }
            },
            bottom: {
              style: 'thin',
              color: { rgb: '444444' }
            },
            left: {
              style: 'thin',
              color: { rgb: '444444' }
            },
            right: {
              style: 'thin',
              color: { rgb: '444444' }
            }
          }

        };

      }

      // =====================================
      // BODY
      // =====================================

      else {

        const isEvenRow = row % 2 === 0;

        cell.s = {

          font: {
            sz: 11,
            color: {
              rgb: '222222'
            }
          },

          fill: {
            fgColor: {
              rgb: isEvenRow
                ? 'F7F7F7'
                : 'FFFFFF'
            }
          },

          alignment: {
            vertical: 'center',
            horizontal: 'left',
            wrapText: true
          },

          border: {
            top: {
              style: 'thin',
              color: { rgb: 'DDDDDD' }
            },
            bottom: {
              style: 'thin',
              color: { rgb: 'DDDDDD' }
            },
            left: {
              style: 'thin',
              color: { rgb: 'DDDDDD' }
            },
            right: {
              style: 'thin',
              color: { rgb: 'DDDDDD' }
            }
          }

        };

        // =====================================
        // STATUS COLORS
        // =====================================

        if (String(cell.v).toUpperCase() === 'ACTIVO') {

          cell.s.fill = {
            fgColor: {
              rgb: 'DCFCE7'
            }
          };

          cell.s.font = {
            bold: true,
            color: {
              rgb: '166534'
            }
          };

          cell.s.alignment = {
            horizontal: 'center',
            vertical: 'center'
          };

        }

        if (String(cell.v).toUpperCase() === 'INACTIVO') {

          cell.s.fill = {
            fgColor: {
              rgb: 'FEE2E2'
            }
          };

          cell.s.font = {
            bold: true,
            color: {
              rgb: '991B1B'
            }
          };

          cell.s.alignment = {
            horizontal: 'center',
            vertical: 'center'
          };

        }

      }

    }

  }

  // =====================================
  // WORKBOOK
  // =====================================

  const workbook: XLSX.WorkBook = {
    Sheets: {
      [sheetName]: worksheet
    },
    SheetNames: [sheetName]
  };

  // =====================================
  // EXPORTAR
  // =====================================

  const excelBuffer = XLSX.write(workbook, {
    bookType: 'xlsx',
    type: 'array'
  });

  const blob = new Blob(
    [excelBuffer],
    {
      type:
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet;charset=UTF-8'
    }
  );

  saveAs(
    blob,
    `${fileName}-${Date.now()}.xlsx`
  );

};