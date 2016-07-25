'use strict';
import 'babel-polyfill';
import React from 'react';
import ReactDOM from 'react-dom';
import domready from 'domready';
import TestComponent from {{#if rename }} '../{{rename}}' {{else}} '../index.js' {{/if}};

const container = document.createElement('div');
document.body.style.background = '#999';
document.body.appendChild(container);

domready(function () {
  ReactDOM.render(
    <TestComponent />,
    container
  );
});