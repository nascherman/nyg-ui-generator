'use strict';
import React, {PropTypes} from 'react';
import ReactF1 from 'react-f1';
import states from './states';
import transitions from './transitions';

const STATES = {
  OUT: 'out',
  IDLE: 'idle'
};

class {{component}} extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      state: STATES.OUT
    }
  }

  componentWillMount() {
    // component has not been rendered to DOM yet
    // process any data here if needed
  }

  componentDidMount() {
    // component has been rendered to DOM
    this.setState({state: STATES.IDLE});
  }

  componentWillReceiveProps(nextProps) {
    // component has already rendered but will re-render when receives new props
  }

  componentWillUnmout() {
    // component is about to be removed from DOM
    // clean up any event listeners ect. here
  }

  render() {
    const style = Object.assign({}, {}, this.props.style);
    const className = '';

    return (
      <ReactF1
        className={`${className} ${this.props.className}`}
        style={style}
        go={this.state.state}
        onComplete={this.state.onComplete}
        states={states(this.props)}
        transitions={transitions(this.props)}
      >
        <div data-f1="container">
          This is {{component}} (React-F1 component)
        </div>
      </ReactF1>
    );
  }
}

{{component}}.propTypes = {
  style: PropTypes.object,
  className: PropTypes.string
};

{{component}}.defaultProps = {
  style: {},
  className: ''
};

export default {{component}};