import React from 'react'

const WaitingIndexUpdate = ({ status }) => {
  if (status === 'WAITING') {
    return (
      <section className='waitingIndexUpdate processing'>
        <h3>We are working on it...</h3>
        <p>
          It's taking longer than usual to generating a new index, please be
          patient.
        </p>
      </section>
    )
  } else if (status === 'FAILED') {
    return (
      <section className='waitingIndexUpdate'>
        <h3>Uh-oh! Something's wrong...</h3>
        <p>
          Unable to fetch latest index, please try to refresh the page later.
        </p>
      </section>
    )
  }
}

export default WaitingIndexUpdate
