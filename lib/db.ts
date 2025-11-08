import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const dbPath = path.join(process.cwd(), 'data', 'cura_buddy.db');

// Ensure data directory exists
const dataDir = path.dirname(dbPath);
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true });
}

let db: Database.Database | null = null;

export function getDatabase(): Database.Database {
  if (!db) {
    db = new Database(dbPath);
    db.pragma('journal_mode = WAL');
    initializeDatabase(db);
  }
  return db;
}

function initializeDatabase(database: Database.Database) {
  // Create diseases table
  database.exec(`
    CREATE TABLE IF NOT EXISTS diseases (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );

    CREATE TABLE IF NOT EXISTS disease_names (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      locale TEXT NOT NULL,
      name TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
      UNIQUE(disease_id, locale)
    );

    CREATE TABLE IF NOT EXISTS disease_symptoms (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      locale TEXT NOT NULL,
      symptom TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS disease_cures (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      locale TEXT NOT NULL,
      cure TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE,
      UNIQUE(disease_id, locale)
    );

    CREATE TABLE IF NOT EXISTS disease_medicines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      disease_id INTEGER NOT NULL,
      medicine TEXT NOT NULL,
      FOREIGN KEY (disease_id) REFERENCES diseases(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_disease_names_locale ON disease_names(locale);
    CREATE INDEX IF NOT EXISTS idx_disease_symptoms_locale ON disease_symptoms(locale);
    CREATE INDEX IF NOT EXISTS idx_disease_symptoms_symptom ON disease_symptoms(symptom);
    CREATE INDEX IF NOT EXISTS idx_disease_cures_locale ON disease_cures(locale);
  `);
}

export interface Disease {
  id: number;
  name: { [key: string]: string };
  symptoms: { [key: string]: string[] };
  cure: { [key: string]: string };
  medicines: string[];
}

export function getAllDiseases(locale: string = 'en'): Disease[] {
  const database = getDatabase();
  
  const diseases = database.prepare(`
    SELECT DISTINCT d.id
    FROM diseases d
    ORDER BY d.id
  `).all() as Array<{ id: number }>;

  return diseases.map(({ id }) => getDiseaseById(id, locale));
}

export function getDiseaseById(id: number, locale: string = 'en'): Disease {
  const database = getDatabase();
  
  // Get names
  const names = database.prepare(`
    SELECT locale, name FROM disease_names WHERE disease_id = ?
  `).all(id) as Array<{ locale: string; name: string }>;
  
  const nameMap: { [key: string]: string } = {};
  names.forEach(n => {
    nameMap[n.locale] = n.name;
  });

  // Get symptoms
  const symptoms = database.prepare(`
    SELECT locale, symptom FROM disease_symptoms WHERE disease_id = ?
  `).all(id) as Array<{ locale: string; symptom: string }>;
  
  const symptomsMap: { [key: string]: string[] } = {};
  symptoms.forEach(s => {
    if (!symptomsMap[s.locale]) {
      symptomsMap[s.locale] = [];
    }
    symptomsMap[s.locale].push(s.symptom);
  });

  // Get cures
  const cures = database.prepare(`
    SELECT locale, cure FROM disease_cures WHERE disease_id = ?
  `).all(id) as Array<{ locale: string; cure: string }>;
  
  const cureMap: { [key: string]: string } = {};
  cures.forEach(c => {
    cureMap[c.locale] = c.cure;
  });

  // Get medicines
  const medicines = database.prepare(`
    SELECT medicine FROM disease_medicines WHERE disease_id = ?
  `).all(id) as Array<{ medicine: string }>;
  
  const medicinesList = medicines.map(m => m.medicine);

  return {
    id,
    name: nameMap,
    symptoms: symptomsMap,
    cure: cureMap,
    medicines: medicinesList
  };
}

export function searchDiseasesBySymptom(symptom: string, locale: string = 'en'): Disease[] {
  const database = getDatabase();
  
  const diseaseIds = database.prepare(`
    SELECT DISTINCT disease_id
    FROM disease_symptoms
    WHERE locale = ? AND LOWER(symptom) LIKE LOWER(?)
  `).all(locale, `%${symptom}%`) as Array<{ disease_id: number }>;

  return diseaseIds.map(({ disease_id }) => getDiseaseById(disease_id, locale));
}

export function getAllSymptoms(locale: string = 'en'): string[] {
  const database = getDatabase();
  
  const symptoms = database.prepare(`
    SELECT DISTINCT symptom
    FROM disease_symptoms
    WHERE locale = ?
    ORDER BY symptom
  `).all(locale) as Array<{ symptom: string }>;

  return symptoms.map(s => s.symptom);
}

