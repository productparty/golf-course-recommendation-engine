const fs = require('fs');
const path = require('path');

const data = `club_name,city,state,country,address,timestamp_updated,distance,course_id,course_name,num_holes,has_gps,zip_code,lat,lng
Augusta National Golf Club,Augusta,GA,USA,2604 Washington Rd,2023-01-01T00:00:00Z,0,augusta-national,Augusta National,18,true,30904,33.5021,-82.0215
Pebble Beach Golf Links,Pebble Beach,CA,USA,1700 17-Mile Drive,2023-01-01T00:00:00Z,0,pebble-beach,Pebble Beach,18,true,93953,36.5681,-121.9500
St Andrews Links,St Andrews,Fife,Scotland,Pilmour House,2023-01-01T00:00:00Z,0,st-andrews,St Andrews,18,true,KY16 9SF,56.3429,-2.8035
Royal Melbourne Golf Club,Black Rock,VIC,Australia,Cheltenham Rd,2023-01-01T00:00:00Z,0,royal-melbourne,Royal Melbourne,18,true,3193,-37.9627,145.0150`;

const filePath = path.resolve(__dirname, 'data.csv');

fs.writeFileSync(filePath, data, 'utf8');
console.log(`data.csv has been created at ${filePath}`);
