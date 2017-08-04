import React from 'react';
import { Provider } from 'react-redux';
import createRouter from './routes';
import DevTools from './DevTools';

export default function Root(props) {
  return (
    <div>
      {createRouter(props.store)}
      <DevTools />
    </div>
  );
}
