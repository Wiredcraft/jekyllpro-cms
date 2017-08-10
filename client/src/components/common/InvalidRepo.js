import React from 'react';

const InvalidRepo = props => {
  return (
    <section id="content" className="empty">
      <h2>Uh-oh! Something's wrong...</h2>
      <p>
        This doesn't look like a Jekyll site (we couldn't find a{' '}
        <code>_config.yml</code> file). Double check you have the right
        repository & branch.
      </p>
    </section>
  );
};

export default InvalidRepo;
