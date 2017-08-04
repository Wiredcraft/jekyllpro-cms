import React from 'react';
import { Provider } from 'react-redux';
import createRouter from './routes';

export default function Root(props) {
  return (
    <div>
      {createRouter(props.store)}
    </div>
  );
}
