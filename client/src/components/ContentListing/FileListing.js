import React from 'react';
import moment from 'moment';
import { getFilenameFromPath } from '../../helpers/utils';
import { parseFilenameFromYaml } from '../../helpers/markdown';

const FileListing = props => {
  const { noContent, noResults, records, selectItem } = props;

  return (
    <section className="body list">
      {noContent &&
        <section className="body empty">
          <span>You haven\'t published any content yet.</span>
        </section>}
      {noResults &&
        <section className="body empty">
          <span>No content matches your search criteria.</span>
        </section>}
      {records &&
        records
          .sort((curr, next) => {
            return (
              Date.parse(next.lastUpdatedAt) - Date.parse(curr.lastUpdatedAt)
            );
          })
          .map((c, idx) => {
            return (
              <a onClick={selectItem.bind(this, c)} key={`${c.path}-${idx}`}>
                <h2>
                  {parseFilenameFromYaml(c.content) ||
                    getFilenameFromPath(c.path)}
                </h2>
                <small className="meta">
                  <strong>{c.collectionType}</strong>&nbsp; Updated&nbsp;
                  {moment(Date.parse(c.lastUpdatedAt)).fromNow()}&nbsp; by&nbsp;
                  {c.lastUpdatedBy}
                </small>
              </a>
            );
          })}
    </section>
  );
};

export default FileListing;
