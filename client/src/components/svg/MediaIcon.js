import React from 'react'

export default (props) => {
  return (
    <span
      dangerouslySetInnerHTML={{__html:'<svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">'
      + '<path strokeWidth="0.2" strokeLinejoin="round" d="M 8.49939,13.4981L 10.9994,16.5041L 14.4994,11.9981L 18.9994,17.9981L 4.99939,17.9981M 20.9994,18.9981L 20.9994,4.99807C 20.9994,3.89306 20.1034,2.99807 18.9994,2.99807L 4.99939,2.99807C 3.89539,2.99807 2.99939,3.89306 2.99939,4.99807L 2.99939,18.9981C 2.99939,20.1031 3.89539,20.9981 4.99939,20.9981L 18.9994,20.9981C 20.1034,20.9981 20.9994,20.1031 20.9994,18.9981 Z "></path>'
      + '</svg>'}} />
  )
}