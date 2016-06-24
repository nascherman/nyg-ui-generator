'use strict';
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import domready from 'domready';
import TestComponent from '../index.js';

const container = document.createElement('div');
document.body.style.background = '#212121';
document.body.appendChild(container);

domready(function () {
  ReactDOM.render(
    <TestComponent />,
    container
  );
});