import * as dayjs from 'dayjs';
import * as XLSX from 'xlsx';

export const formatDate = (date: string | Date | undefined | null) => {
    try {
        if (!date) return '';

        return dayjs(date).format('YYYY-MM-DD');
    } catch (err) {
        return '';
    }
};

export const formatExportData = ({ headers, data }: { headers: string[]; data: string[][] }) => {
    const worksheet = XLSX.utils.aoa_to_sheet([headers, ...data]);

    // Set length of columns
    worksheet['!cols'] = headers.map((header, idx) => {
        const values = data.map((rows) => rows.flat()[idx]);

        const valueLength = values.reduce((prev, curr) => {
            return curr.length > prev ? curr.length : prev;
        }, 0);

        const headerLength = header.length;

        const maxLength = Math.max(valueLength, headerLength);

        return { wch: maxLength + 1 };
    });

    XLSX.utils.sheet_add_aoa(worksheet, [headers], { origin: 'A1' });

    const workbook = XLSX.utils.book_new();

    XLSX.utils.book_append_sheet(workbook, worksheet, 'Sheet 1');

    const body = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });

    return body;
};
