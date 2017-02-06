import React from 'react'

const InvalidRepo = (props) => {
  return (
    <section id='content' className='empty'>
      <h2>Something went wrong...</h2>
      <p>This does not seem like a Jekyll site.<br /> Please check if you are on correct repository or branch.</p>
      <a className='button primary' href='http://jekyllpro.com/' target='_blank'>Read more about it...</a>
    </section>
  )
}

export default InvalidRepo
