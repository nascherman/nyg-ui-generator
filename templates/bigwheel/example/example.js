'use strict';
import domready from 'domready';
import bigwheel from 'bigwheel';
import TestComponent from '../index.js';

document.body.style.background = '#999';

const routes = {
  '/': TestComponent
};

const framework = bigwheel((done) => {
  done({
    routes
  });
});

domready(function () {
  framework.init();
});