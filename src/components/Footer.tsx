"use client";

import React from 'react';
import { useTranslations } from 'next-intl';

const Footer: React.FC = () => {
  const t = useTranslations('footer');

  return (
    <footer className="footer-section">
      <p>{t('copyright')}</p>
    </footer>
  );
};

export default Footer;
