import React from 'react'

const NoSchema = (props) => {
  return (
    <section id='content' className='empty'>
      <h2>Something went wrong...</h2>
      <p>Jekyll+ need schema files defining the content types.</p>
      <a className='button primary' href='https://github.com/Wiredcraft/jekyllplus/wiki' target='_blank'>Read more about it...</a>
    </section>
  )
}

export default NoSchema
