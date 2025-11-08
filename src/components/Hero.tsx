"use client";

import React from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '../../navigation';
import ThreeDScene from './ThreeDScene';

const Hero: React.FC = () => {
  const t = useTranslations('hero');

  return (
    <section className="hero-section" id="home">
      <div className="hero-content">
        <h2>{t('title')}</h2>
        <p>{t('description')}</p>
        <Link href="/symptom-checker" className="btn-primary">{t('button')}</Link>
      </div>
      <div className="hero-3d-scene">
        <ThreeDScene />
      </div>
    </section>
  );
};

export default Hero;
