"use client";

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [statusMessage, setStatusMessage] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Clear status when user starts typing
    if (submitStatus !== 'idle') {
      setSubmitStatus('idle');
      setStatusMessage('');
    }
  };

  const t = useTranslations('contact');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate form
    if (!formData.name || !formData.email || !formData.subject || !formData.message) {
      setSubmitStatus('error');
      setStatusMessage(t('form.error'));
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setSubmitStatus('error');
      setStatusMessage('Please enter a valid email address.');
      return;
    }

    setIsSubmitting(true);
    setSubmitStatus('idle');
    setStatusMessage('');

    try {
      // Get recipient email from translations
      const recipientEmail = t('info.email');
      
      // Create mailto link with pre-filled information
      const subject = encodeURIComponent(`${formData.subject} - From: ${formData.name}`);
      const body = encodeURIComponent(
        `Hello,\n\n` +
        `Name: ${formData.name}\n` +
        `Email: ${formData.email}\n\n` +
        `Message:\n${formData.message}\n\n` +
        `---\n` +
        `This message was sent from Cura Buddy AI contact form.`
      );
      
      const mailtoLink = `mailto:${recipientEmail}?subject=${subject}&body=${body}`;
      
      // Open email client
      window.location.href = mailtoLink;
      
      // Show success message
      setTimeout(() => {
        setSubmitStatus('success');
        setStatusMessage(t('form.success'));
        setFormData({ name: '', email: '', subject: '', message: '' });
        setIsSubmitting(false);
        
        // Clear success message after 5 seconds
        setTimeout(() => {
          setSubmitStatus('idle');
          setStatusMessage('');
        }, 5000);
      }, 500);
      
    } catch (error) {
      console.error('Error submitting form:', error);
      setSubmitStatus('error');
      setStatusMessage('An error occurred. Please try again or contact us directly.');
      setIsSubmitting(false);
    }
  };

  return (
    <section className="contact-section">
      <div className="contact-container">
        <div className="contact-header">
          <h2>{t('title')}</h2>
          <p>{t('description')}</p>
        </div>

        <div className="contact-content">
          <div className="contact-info">
            <div className="info-item">
              <div className="info-icon">📧</div>
              <div className="info-text">
                <h3>{t('info.emailTitle')}</h3>
                <p>
                  <a 
                    href={`mailto:${t('info.email')}?subject=Contact from Cura Buddy AI`}
                    className="contact-link"
                  >
                    {t('info.email')}
                  </a>
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📞</div>
              <div className="info-text">
                <h3>{t('info.phoneTitle')}</h3>
                <p>
                  <a 
                    href={`tel:${t('info.phone')}`}
                    className="contact-link"
                  >
                    {t('info.phone')}
                  </a>
                </p>
              </div>
            </div>
            <div className="info-item">
              <div className="info-icon">📍</div>
              <div className="info-text">
                <h3>{t('info.hoursTitle')}</h3>
                <p>{t('info.hours')}</p>
              </div>
            </div>
          </div>

          <div className="contact-form">
            <form onSubmit={handleSubmit}>
              <div className="form-row">
                <div className="form-group">
                  <label htmlFor="name">{t('form.name')} *</label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder={t('form.namePlaceholder')}
                    required
                  />
                </div>
                <div className="form-group">
                  <label htmlFor="email">{t('form.email')} *</label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    placeholder={t('form.emailPlaceholder')}
                    required
                  />
                </div>
              </div>

              <div className="form-group">
                <label htmlFor="subject">{t('form.subject')} *</label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  value={formData.subject}
                  onChange={handleChange}
                  placeholder={t('form.subjectPlaceholder')}
                  required
                />
              </div>

              <div className="form-group">
                <label htmlFor="message">{t('form.message')} *</label>
                <textarea
                  id="message"
                  name="message"
                  value={formData.message}
                  onChange={handleChange}
                  placeholder={t('form.messagePlaceholder')}
                  rows={5}
                  required
                ></textarea>
              </div>

              <button type="submit" className="submit-btn" disabled={isSubmitting}>
                {isSubmitting ? t('form.sending') : t('form.send')}
              </button>
              
              {submitStatus !== 'idle' && (
                <div className={`form-status ${submitStatus === 'success' ? 'success-message' : 'error-message'}`}>
                  {statusMessage}
                </div>
              )}
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Contact;
