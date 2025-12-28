import * as XLSX from 'xlsx';

export const parseFile = async (file: File): Promise<string> => {
  const extension = file.name.split('.').pop()?.toLowerCase();

  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      const data = e.target?.result;
      if (!data) return reject("Read failed");

      if (extension === 'csv' || extension === 'txt') {
        // Plain text reading
        resolve(data as string);
      } else if (['xlsx', 'xls', 'ods'].includes(extension || '')) {
        try {
          // Binary string reading for Excel
          const workbook = XLSX.read(data, { type: 'binary' });
          const sheetName = workbook.SheetNames[0];
          const sheet = workbook.Sheets[sheetName];
          // Convert to CSV text for the AI to consume easily
          const csvOutput = XLSX.utils.sheet_to_csv(sheet);
          resolve(csvOutput);
        } catch (err) {
          reject(err);
        }
      } else {
        reject("Unsupported file type");
      }
    };

    reader.onerror = (err) => reject(err);

    if (extension === 'csv' || extension === 'txt') {
      reader.readAsText(file);
    } else {
      reader.readAsBinaryString(file);
    }
  });
};
