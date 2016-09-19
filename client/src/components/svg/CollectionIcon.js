import React from 'react'

export default (props) => {
  return (
    <span
      dangerouslySetInnerHTML={{__html:'<svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">'
      + '<path strokeLinejoin="round" d="M 19,7L 9,7L 9,5L 19,5M 15,15L 9,15L 9,13L 15,13M 19,11L 9,11L 9,9L 19,9M 20,2L 8,2C 6.9,2 6,2.9 6,4L 6,16C 6,17.1 6.9,18 8,18L 20,18C 21.1,18 22,17.1 22,16L 22,4C 22,2.9 21.1,2 20,2 Z M 4,6L 2,6L 2,20C 2,21.1 2.9,22 4,22L 18,22L 18,20L 4,20L 4,6 Z "></path>'
      + '</svg>'}} />
  )
}