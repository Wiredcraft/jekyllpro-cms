import React from 'react'

const Media = (props) => {
  return (
    <section id='content'>
      <section className="empty">
        <div className="box">
          <h2>Set up media upload</h2>
          <p>You havent configured media file uploads yet (e.g. S3). Get set up in a few minutes:</p>
          <button className="button primary">Configure media upload</button>
        </div>
      </section>
    </section>
  )
}

export default Media