import React from 'react'

export default (props) => {
  return (
    <span
      dangerouslySetInnerHTML={{__html:'<svg baseProfile="full" width="24" height="24" viewBox="0 0 24.00 24.00" enableBackground="new 0 0 24.00 24.00">'
      + '<path strokeWidth="0.2" strokeLinejoin="round" d="M 5,2.9978C 3.89125,2.9978 2.9975,3.89136 2.9975,5L 2.9975,18.9988C 2.9975,20.1075 3.89125,21.0012 5,21.0012L 11.0013,21.0012L 11.0013,2.9978M 12.9975,2.9978L 12.9975,11.0012L 21.0013,11.0012L 21.0013,5C 21.0013,3.89136 20.1075,2.9978 18.9988,2.9978M 12.9975,12.9975L 12.9975,21.0012L 18.9988,21.0012C 20.1075,21.0012 21.0013,20.1075 21.0013,18.9988L 21.0013,12.9975"></path>'
      + '</svg>'}} />
  )
}