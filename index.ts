const { Confirm, Input, MultiSelect } = require('enquirer');

async function main() {
    console.log("==================================================================")
    console.log("                     CSV USER DATA GENERATOR                      ")
    console.log("==================================================================")

    const desiredRows: number = await new Input({
        message: 'How many rows would you like the CSV to have?',
        initial: '20',
    }).run();

    const desiredColumns: string[] = await new MultiSelect({
        message: 'Select all of the different column types you with to include in the CSV',
        choices: [
            {
                name: 'Email',
                value: 'Email',
            },
            {
                name: 'First Name',
                value: 'First Name',
            },
            {
                name: 'Last Name',
                value: 'Last Name',
            }
        ]
    }).run();

    const sizeLimitRequested: boolean = await new Confirm({
        message: 'Would you like to include a size limit on the CSV file? (This may conflict with the desired row and column count if set too low)'
    }).run();

    let fileSizeLimit: number;
    if (sizeLimitRequested) {
        fileSizeLimit = await new Input({
            message: 'Enter the desired file size in megabytes (ex. 1024 equals 1GB)'
        }).run();
    }

    console.log("==================================================================");
    console.log(`Starting CSV document generation...`);
    console.log('Row Count:', desiredRows);
    console.log('Columns Selected:', desiredColumns);
    console.log(`File size limited:`, fileSizeLimit || 'Not Limited');
    console.log("==================================================================");
}

main();
