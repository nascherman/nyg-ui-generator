'use strict';
import eases from 'eases';

export default function (props) {
  return [
    {from: 'out', to: 'idle', bi: true, animation: {duration: 0.5, ease: eases.linear}},
  ];
};