import React from 'react';
import moment from 'moment';
import { getFilenameFromPath } from 'helpers/utils';
import { parseFilenameFromYaml } from 'helpers/markdown';
import CaretDownIcon from 'components/svg/CaretDownIcon';
import RemoveIcon from 'components/svg/RemoveIcon';
import CheckIcon from 'components/svg/CheckIcon';

const ContentHeader = props => {
  const {
    config,
    schemas,
    filteredLanguage,
    filteredType,
    createNewFileByType,
    selectLanguageFilter,
    selectTypeFilter,
    handleNameFilter,
    removeTypeFilter,
    removeLanguageFilter
  } = props;

  return (
    <header className="header">
      <div className="controls">
        <span className="menu">
          <button className="button primary create">
            Create
            <CaretDownIcon />
          </button>
          <div className="options">
            {schemas &&
              schemas.map((s, idx) => {
                return (
                  <a
                    key={`${s.title}-${idx}`}
                    onClick={createNewFileByType.bind(this, s.jekyll.id)}
                  >
                    {s.title}
                  </a>
                );
              })}
          </div>
        </span>
      </div>

      <span className="search">
        <span className="menu">
          <button className="button">
            Filters
            <CaretDownIcon />
          </button>
          <div className="options">
            {config && config.languages && <h2>Filter by language</h2>}
            {config &&
              config.languages &&
              config.languages.map((lang, idx) => {
                return (
                  <a
                    key={lang.code}
                    onClick={selectLanguageFilter.bind(null, lang.code)}
                    className={filteredLanguage === lang.code ? 'selected' : ''}
                  >
                    <CheckIcon />
                    {lang.name}
                  </a>
                );
              })}
            <h2>Filter by type</h2>
            {schemas &&
              schemas.map((s, idx) => {
                return (
                  <a
                    key={s.title}
                    onClick={selectTypeFilter.bind(this, s.jekyll.id)}
                    className={filteredType === s.jekyll.id ? 'selected' : ''}
                  >
                    <CheckIcon />
                    {s.title}
                  </a>
                );
              })}
          </div>
        </span>
        <input
          type="text"
          placeholder="Filter by name"
          onChange={handleNameFilter}
        />
      </span>

      <ul className="filters">
        {filteredType &&
          <li>
            <span>
              Type: {filteredType}
            </span>
            <a className="remove" onClick={removeTypeFilter}>
              <RemoveIcon />
            </a>
          </li>}
        {filteredLanguage &&
          <li>
            <span>
              Language: {filteredLanguage}
            </span>
            <a className="remove" onClick={removeLanguageFilter}>
              <RemoveIcon />
            </a>
          </li>}
      </ul>
    </header>
  );
};

export default ContentHeader;
