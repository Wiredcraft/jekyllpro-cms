import React from 'react'

export default (props) => {
  return (
    <span
      dangerouslySetInnerHTML={{__html:'<svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">'
      + '<path strokeWidth="0.2" strokeLinejoin="round" d="M 12.9994,8.99807L 12.9994,3.49807L 18.4994,8.99807M 5.99939,1.99807C 4.89438,1.99807 4.0094,2.89406 4.0094,3.99807L 3.99939,19.9981C 3.99939,21.1021 4.88538,21.9981 5.98938,21.9981L 17.9994,21.9981C 19.1034,21.9981 19.9994,21.1021 19.9994,19.9981L 19.9994,7.99807L 13.9994,1.99807L 5.99939,1.99807 Z "></path>'
      + '</svg>'}} />
  )
}