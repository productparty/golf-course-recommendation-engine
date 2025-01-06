console.log('Script started');

const { Command } = require('commander');
const program = new Command();
const fs = require('fs');
const path = require('path');
const csv = require('csv-parser');
const { sequelize, GolfCourse } = require('./src/models'); // Ensure correct import

console.log('Modules loaded');

program
  .command('seed-database')
  .description('Seed the database with a CSV file')
  .option('-f, --file <file>', 'Path to the CSV file')
  .action(async (options) => {
    console.log('Seed-database command triggered');
    console.log('Options:', options);

    if (!options.file) {
      console.error('No file specified. Use -f or --file to specify a CSV file.');
      return;
    }

    const filePath = path.resolve(options.file);
    console.log('Resolved file path:', filePath);

    if (!fs.existsSync(filePath)) {
      console.error(`File not found: ${filePath}`);
      return;
    }

    console.log(`Attempting to read file: ${filePath}`);
    
    const golfCourses = [];

    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (row) => {
        console.log('Row:', row);
        golfCourses.push(row);
      })
      .on('end', async () => {
        console.log('CSV file successfully processed');
        try {
          await sequelize.sync({ force: true }); // Recreate the database for testing
          console.log('Database synchronized');
          await GolfCourse.bulkCreate(golfCourses);
          console.log('Data successfully inserted into the database');
          
          // Log the contents of the database
          const seededGolfCourses = await GolfCourse.findAll();
          console.log('Seeded golf courses:', seededGolfCourses);
        } catch (error) {
          console.error('Error inserting data into the database:', error);
        }
      })
      .on('error', (error) => {
        console.error('Error reading CSV file:', error);
      });
  });

console.log('Command defined');

program.parse(process.argv);

console.log('Script ended');
