import path from 'path';
import fs from 'fs/promises';
import { Faker, de, en } from '@faker-js/faker';
import { CsvColumns } from './constants';

const customFaker = new Faker({ "locale": [en, de] });

interface DataMethodOptions {
    firstName: string,
    lastName: string,
    provider: string,
}

const DataMethods = {
    [CsvColumns.email]: customFaker.internet.email,
    [CsvColumns.firstName]: (data: DataMethodOptions): string => data.firstName,
    [CsvColumns.lastName]: (data: DataMethodOptions): string => data.lastName,
    [CsvColumns.middleName]: customFaker.person.middleName,
    [CsvColumns.city]: customFaker.location.city,
    [CsvColumns.jobTitle]: customFaker.person.jobTitle,
    [CsvColumns.company]: customFaker.company.name,
    [CsvColumns.userName]: customFaker.internet.userName,
};

function _calculateDataSizeInMB(data: string[] | string[][]) {
    const jsonData = JSON.stringify(data);
    const dataSizeInBytes = Buffer.byteLength(jsonData, 'utf8');
    const dataSizeInMB = dataSizeInBytes / (1024 * 1024);

    return dataSizeInMB;
};

function _generateDataRow(columns: string[]): string[] {
    const values = [];

    // By fetching a full name we are able to base other values, like the "email"
    // or "username" off of it. (ex. "John Doe" => "john.doe@example.com")
    let fullName = customFaker.person.fullName().split(' ');

    // Ensures that we trim a title (Mr., Mrs., Dr.) if it exists.
    if (/Mister|Miss|\./i.test(fullName[0])) {
        fullName = [fullName[1], fullName[2]]
    }

    const options: DataMethodOptions = {
        firstName: fullName[0],
        lastName: fullName[1],
        provider: 'example.com'
    };

    columns.forEach((col) => {
        const mockDataFunc = DataMethods[col];
        if (mockDataFunc) {

            // Note: We are specifically enclosing the value returned from
            // mockDataFunc in double quotes in case it contains a comma, as this breaks
            // CSV formatting.
            values.push(`"${mockDataFunc(options)}"`);
        }
    });

    return values;
};

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

    for (let i = 0; i <= rows - 1; i++) {
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
