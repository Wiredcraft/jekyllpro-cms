import React from 'react';
import moment from 'moment';
import cx from 'classnames';
import { getFilenameFromPath } from '../../helpers/utils';
import { parseFilenameFromYaml } from '../../helpers/markdown';
import CaretDownIcon from '../svg/CaretDownIcon';
import RemoveIcon from '../svg/RemoveIcon';
import CheckIcon from '../svg/CheckIcon';

const AltContentHeader = props => {
  const {
    creatable,
    config,
    schemas,
    filteredLanguage,
    createNewFileWithFilter,
    selectLanguageFilter,
    handleNameFilter,
    removeLanguageFilter
  } = props;
  let creatBtn = cx('button primary create', { disabled: !creatable });

  return (
    <header className="header">
      <div className="controls">
        <span className="menu">
          <button className={creatBtn} onClick={createNewFileWithFilter}>
            Create
          </button>
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
          </div>
        </span>
        <input
          type="text"
          placeholder="Filter by name"
          onChange={handleNameFilter}
        />
      </span>

      <ul className="filters">
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

export default AltContentHeader;
