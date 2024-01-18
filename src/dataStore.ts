import { DataStoreInterface } from './types';
import fs from 'fs';

const databaseFile = './src/data.json';
let database: DataStoreInterface;

// YOU SHOULDNT NEED TO MODIFY THE FUNCTIONS BELOW IN ITERATION 1

/*
Example usage
    let store = getData()
    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Rando'] }

    names = store.names

    names.pop()
    names.push('Jake')

    console.log(store) # Prints { 'names': ['Hayden', 'Tam', 'Rani', 'Giuliana', 'Jake'] }
    setData(store)
*/

// Use get() to access the data
function getData(): DataStoreInterface {
  const rawData = fs.readFileSync(databaseFile, { flag: 'r', encoding: 'utf8' }).toString();
  database = JSON.parse(rawData);
  return database;
}

// Use set(newData) to pass in the entire data object, with modifications made
function setData(newData: DataStoreInterface): void {
  fs.writeFileSync(databaseFile, JSON.stringify(newData, null, 2));
}

export { getData, setData };
