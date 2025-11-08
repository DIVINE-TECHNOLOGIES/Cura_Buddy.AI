"use client";

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';

interface Disease {
  name: { [key: string]: string };
  symptoms: { [key: string]: string[] };
  cure: { [key: string]: string };
  medicines: string[];
}

const SymptomChecker: React.FC = () => {
  const [symptoms, setSymptoms] = useState('');
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [result, setResult] = useState('');
  const [diseases, setDiseases] = useState<Disease[]>([]);

  useEffect(() => {
    fetch('/api/diseases')
      .then(response => response.json())
      .then(data => setDiseases(data.diseases || []))
      .catch(error => {
        console.error('Error loading diseases:', error);
        // Fallback to JSON if API fails
        fetch('/symptoms_cures.json')
          .then(response => response.json())
          .then(jsonData => setDiseases(jsonData.diseases || []))
          .catch(err => console.error('Error loading from JSON fallback:', err));
      });
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSymptoms(value);

    if (value.length > 1) {
      const allSymptoms = diseases.flatMap(disease =>
        disease.symptoms['en'] || disease.symptoms['hi'] || disease.symptoms['ta'] || disease.symptoms['te']
      );
      const filtered = allSymptoms.filter(symptom =>
        symptom.toLowerCase().includes(value.toLowerCase())
      ).slice(0, 5);
      setSuggestions(filtered);
    } else {
      setSuggestions([]);
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    setSymptoms(suggestion);
    setSuggestions([]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!symptoms.trim()) {
      alert('Please enter your symptoms.');
      return;
    }

    const matchedDisease = diseases.find(disease => {
      const diseaseSymptoms = disease.symptoms['en'] || disease.symptoms['hi'] || disease.symptoms['ta'] || disease.symptoms['te'];
      return diseaseSymptoms.some(symptom =>
        symptom.toLowerCase().includes(symptoms.toLowerCase())
      );
    });

    if (matchedDisease) {
      const name = matchedDisease.name['en'] || matchedDisease.name['hi'] || matchedDisease.name['ta'] || matchedDisease.name['te'];
      const cure = matchedDisease.cure['en'] || matchedDisease.cure['hi'] || matchedDisease.cure['ta'] || matchedDisease.cure['te'];
      const medicines = matchedDisease.medicines.join(', ');
      setResult(`
        <strong>Possible Disease:</strong> ${name}<br>
        <strong>Cure:</strong> ${cure}<br>
        <strong>Medicines:</strong> ${medicines}
      `);
    } else {
      setResult('No matching disease found for the given symptoms.');
    }
  };

  const t = useTranslations('symptomChecker');

  return (
    <section className="input-section">
      <h2>{t('title')}</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          value={symptoms}
          onChange={handleInputChange}
          placeholder={t('placeholder')}
        />
        <button type="submit">{t('button')}</button>
        {suggestions.length > 0 && (
          <div className="suggestions">
            {suggestions.map((suggestion, index) => (
              <div key={index} onClick={() => handleSuggestionClick(suggestion)}>
                {suggestion}
              </div>
            ))}
          </div>
        )}
      </form>
      {result && (
        <div className="result" dangerouslySetInnerHTML={{ __html: result }}></div>
      )}
    </section>
  );
};

export default SymptomChecker;
