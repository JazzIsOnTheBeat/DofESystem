import React, { memo, useCallback } from 'react';
import { Settings as SettingsIcon, Moon, Sun, Globe } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { useLanguage } from '../context/LanguageContext';
import '../styles/settings.css';

const Settings = memo(function Settings() {
  const { theme, toggleTheme } = useTheme();
  const { language, changeLanguage, t } = useLanguage();
  const isDarkMode = theme === 'dark';

  const handleToggle = useCallback(() => {
    toggleTheme();
  }, [toggleTheme]);

  const handleLanguageChange = useCallback((lang) => {
    changeLanguage(lang);
  }, [changeLanguage]);

  return (
    <div className="p-6 transition-colors duration-300 dark:bg-gray-900 min-h-screen">
      <h1 className="text-2xl font-bold mb-6 flex items-center gap-2 dark:text-white">
        <SettingsIcon /> {t('settingsTitle')}
      </h1>

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-6 max-w-md transition-colors duration-300 settings-card">
        <div className="settings-row">
          <div className="settings-item">
            <span className="flex items-center gap-2 dark:text-gray-200">
              {isDarkMode ? <Moon size={18} /> : <Sun size={18} />}
              {t('darkMode')}
            </span>
            <button
              onClick={handleToggle}
              className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${isDarkMode ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800'
                }`}
            >
              {isDarkMode ? t('on') : t('off')}
            </button>
          </div>

          <div className="settings-item">
            <span className="flex items-center gap-2 dark:text-gray-200">
              <Globe size={18} />
              {t('selectLanguage')}
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => handleLanguageChange('en')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'en' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                English
              </button>
              <button
                onClick={() => handleLanguageChange('id')}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                  language === 'id' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200'
                }`}
              >
                Indonesia
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
});

export default Settings;
