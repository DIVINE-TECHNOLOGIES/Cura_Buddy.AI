"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import Features3D from './Features3D';

const Features: React.FC = () => {
  const t = useTranslations('features');

  return (
    <section className="features-section">
      <div className="features-header">
        <h2>{t('title')}</h2>
        <p>{t('description')}</p>
      </div>
      <div className="features-content">
        <div className="features-cards">
          <div className="feature-card">
            <div className="feature-icon">🔍</div>
            <h3>{t('symptomChecker.title')}</h3>
            <p>{t('symptomChecker.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">💊</div>
            <h3>{t('medicationGuidance.title')}</h3>
            <p>{t('medicationGuidance.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">📊</div>
            <h3>{t('healthMonitoring.title')}</h3>
            <p>{t('healthMonitoring.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🌍</div>
            <h3>{t('multiLanguage.title')}</h3>
            <p>{t('multiLanguage.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🤖</div>
            <h3>{t('aiChatbot.title')}</h3>
            <p>{t('aiChatbot.description')}</p>
          </div>
          <div className="feature-card">
            <div className="feature-icon">🚑</div>
            <h3>{t('emergencySupport.title')}</h3>
            <p>{t('emergencySupport.description')}</p>
          </div>
        </div>
        <div className="features-3d">
          <Features3D />
        </div>
      </div>
    </section>
  );
};

export default Features;
