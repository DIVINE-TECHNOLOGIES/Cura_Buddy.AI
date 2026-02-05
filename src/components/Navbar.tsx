
"use client";

import React from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useRouter, usePathname, Link } from '../../navigation';

const Navbar: React.FC = () => {
  const t = useTranslations('navbar');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  const handleLanguageChange = (newLocale: string) => {
    router.push(pathname, { locale: newLocale });
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link href="/" className="nav-logo">
          <div className="logo-initials">CB</div>
          <div className="logo-text">
            <span className="logo-main">Cura Buddy AI</span>
            <span className="logo-subtitle">Healthcare</span>
          </div>
        </Link>
        <ul className="nav-menu">
          <li><Link href="/">{t('home')}</Link></li>
          <li><Link href="/features">{t('features')}</Link></li>
          <li><Link href="/symptom-checker">{t('symptomChecker')}</Link></li>
          <li><Link href="/chatbot">{t('chatbot')}</Link></li>
          <li><Link href="/contact">{t('contact')}</Link></li>
          <li>
            <select
              value={locale}
              onChange={(e) => handleLanguageChange(e.target.value)}
              className="language-selector"
            >
              <option value="en">English</option>
              <option value="hi">हिंदी</option>
              <option value="ta">தமிழ்</option>
              <option value="te">తెలుగు</option>
              <option value="es">Español</option>
            </select>
          </li>
        </ul>
      </div>
    </nav>
  );
};

export default Navbar;
