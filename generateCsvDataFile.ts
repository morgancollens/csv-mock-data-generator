import path from 'path';
import fs from 'fs/promises';
import { Faker, de, en } from '@faker-js/faker';
import { CsvColumns } from './constants';

const customFaker = new Faker({ "locale": [en, de] });

const DataMethods = {
    [CsvColumns.email]: customFaker.internet.email,
    [CsvColumns.firstName]: customFaker.person.firstName,
    [CsvColumns.lastName]: customFaker.person.lastName,
};

function _calculateDataSizeInMB(data: string[] | string[][]) {
    const jsonData = JSON.stringify(data);
    const dataSizeInBytes = Buffer.byteLength(jsonData, 'utf8');
    const dataSizeInMB = dataSizeInBytes / (1024 * 1024);

    return dataSizeInMB;
}

function _generateDataRow(columns: string[]): string[] {
    const values = [];

    columns.forEach((col) => {
        const mockDataFunc = DataMethods[col];
        if (mockDataFunc) {
            values.push(mockDataFunc());
        }
    });

    return values;
}

/**
 * When provided with a desired number of rows, a set of header columns, and optionally a file size limit,
 * generates a CSV containing fake user data and write that file to the local machine
 * @method generateCsvDataFile
 * @param rows - the number of rows desired in the CSV (excluding the header row)
 * @param columns - the selected columns/headers to use for the CSV and generation of fake data
 * @param fileSize - Optional file size limit
 * @returns a string containing the file path
 */
export async function generateCsvDataFile(rows: number, columns: string[], fileSize: number | void): Promise<string> {
    const data = [
        columns, // Header row
    ];

    for (let i = 0; i <= rows; i++) {
        data.push(_generateDataRow(columns));

        if (fileSize) {
            const currentSize = _calculateDataSizeInMB(data);

            if (currentSize >= fileSize) {
                break;
            }
        }
    }

    let filename = `${Date.now()}_mock_data.csv`

    const csvContent = data.map((row) => row.join(',')).join('\n');

    const dirpath = path.join(__dirname, '../data');
    const filepath = path.join(__dirname, '../data', filename);

    await fs.mkdir(dirpath, { recursive: true });
    await fs.writeFile(filepath, csvContent, { encoding: 'utf-8' });

    return filepath;
};
