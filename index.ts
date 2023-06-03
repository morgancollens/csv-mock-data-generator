import { CsvColumns } from "./constants";
import { generateCsvDataFile } from "./generateCsvDataFile";
const { Confirm, MultiSelect, Numeral } = require('enquirer');

async function main() {
    console.log("==================================================================");
    console.log("                     CSV USER DATA GENERATOR                      ");
    console.log("==================================================================");

    const desiredRows: number = await new Numeral({
        message: 'How many rows would you like the CSV to have?',
        initial: 20,
    }).run();

    const desiredColumns: string[] = await new MultiSelect({
        message: 'Select all of the different column types you with to include in the CSV using the arrow keys and spacebar, then press Enter',
        choices: [
            {
                name: CsvColumns.email,
                value: CsvColumns.email,
            },
            {
                name: CsvColumns.firstName,
                value: CsvColumns.firstName,
            },
            {
                name: CsvColumns.lastName,
                value: CsvColumns.lastName,
            }
        ]
    }).run();

    const sizeLimitRequested: boolean = await new Confirm({
        message: 'Would you like to include a size limit on the CSV file? (This may conflict with the desired row and column count if set too low)'
    }).run();

    let fileSizeLimit: number;
    if (sizeLimitRequested) {
        fileSizeLimit = await new Numeral({
            message: 'Enter the desired file size in megabytes (ex. 1024 equals 1GB)'
        }).run();
    }

    console.log("==================================================================");
    console.log(`Starting CSV document generation...`);
    console.log('Row Count:', desiredRows);
    console.log('Columns Selected:', desiredColumns);
    console.log('File size limited:', fileSizeLimit || 'Not Limited');
    const filepath = await generateCsvDataFile(desiredRows, desiredColumns, fileSizeLimit);
    console.log('CSV file successfully generated and stored at:', filepath);
    console.log("==================================================================");
}

main();
