import { getDatabase } from '../lib/db';
import fs from 'fs';
import path from 'path';

interface DiseaseData {
  name: { [key: string]: string };
  symptoms: { [key: string]: string[] };
  cure: { [key: string]: string };
  medicines: string[];
}

function migrateJSONToSQL() {
  const db = getDatabase();
  
  // Read JSON file
  const jsonPath = path.join(process.cwd(), 'data', 'symptoms_cures.json');
  const jsonData = JSON.parse(fs.readFileSync(jsonPath, 'utf8'));
  const diseases: DiseaseData[] = jsonData.diseases;

  console.log(`Migrating ${diseases.length} diseases to SQL database...`);

  // Prepare statements for better performance
  const insertDisease = db.prepare('INSERT INTO diseases DEFAULT VALUES');
  const insertName = db.prepare('INSERT INTO disease_names (disease_id, locale, name) VALUES (?, ?, ?)');
  const insertSymptom = db.prepare('INSERT INTO disease_symptoms (disease_id, locale, symptom) VALUES (?, ?, ?)');
  const insertCure = db.prepare('INSERT INTO disease_cures (disease_id, locale, cure) VALUES (?, ?, ?)');
  const insertMedicine = db.prepare('INSERT INTO disease_medicines (disease_id, medicine) VALUES (?, ?)');

  // Use transaction for better performance
  const insertDiseaseTransaction = db.transaction((disease: DiseaseData) => {
    // Insert disease
    const result = insertDisease.run();
    const diseaseId = result.lastInsertRowid as number;

    // Insert names
    Object.entries(disease.name).forEach(([locale, name]) => {
      if (name) {
        insertName.run(diseaseId, locale, name);
      }
    });

    // Insert symptoms
    Object.entries(disease.symptoms).forEach(([locale, symptoms]) => {
      if (Array.isArray(symptoms)) {
        symptoms.forEach(symptom => {
          if (symptom) {
            insertSymptom.run(diseaseId, locale, symptom);
          }
        });
      }
    });

    // Insert cures
    Object.entries(disease.cure).forEach(([locale, cure]) => {
      if (cure) {
        insertCure.run(diseaseId, locale, cure);
      }
    });

    // Insert medicines
    if (Array.isArray(disease.medicines)) {
      disease.medicines.forEach(medicine => {
        if (medicine) {
          insertMedicine.run(diseaseId, medicine);
        }
      });
    }

    return diseaseId;
  });

  // Clear existing data
  db.exec(`
    DELETE FROM disease_medicines;
    DELETE FROM disease_cures;
    DELETE FROM disease_symptoms;
    DELETE FROM disease_names;
    DELETE FROM diseases;
  `);

  // Insert all diseases
  let count = 0;
  diseases.forEach((disease, index) => {
    try {
      insertDiseaseTransaction(disease);
      count++;
      if ((index + 1) % 5 === 0) {
        console.log(`Migrated ${index + 1}/${diseases.length} diseases...`);
      }
    } catch (error) {
      console.error(`Error migrating disease ${index + 1}:`, error);
    }
  });

  console.log(`✅ Successfully migrated ${count} diseases to SQL database!`);
  console.log(`Database location: ${path.join(process.cwd(), 'data', 'cura_buddy.db')}`);
}

// Run migration if this file is executed directly
if (require.main === module) {
  migrateJSONToSQL();
}

export { migrateJSONToSQL };

