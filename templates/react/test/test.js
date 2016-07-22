import React from 'react';
import {createRenderer} from 'react-addons-test-utils';
import createComponent from 'react-unit';
import tape from 'tape';
import addAssertions from 'extend-tape';
import jsxEquals from 'tape-jsx-equals';
const test = addAssertions(tape, {jsxEquals});

import TestComponent from '../index';

const defaultClass = '';
const defaultStyle = {};

test('----- {{component}} Test -----', (t) => {

  // test component props and content
  const component = createComponent.shallow(<TestComponent />);
  t.equal(component.props.className.trim(), defaultClass, `"className" prop should be equal to ${defaultClass}`);
  t.deepEqual(component.props.style, defaultStyle, `"style" prop should be equal to ${defaultStyle}`);

  // test rendered JSX output
  const renderer = createRenderer();
  renderer.render(<TestComponent />);
  const result = renderer.getRenderOutput();
  t.jsxEquals(result, <div className=" " style={ {} }>This is {{component}} (React component)</div>);

  t.end();
});