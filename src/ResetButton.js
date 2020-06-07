import React from 'react';
import ReactDOM from 'react-dom';

class ResetButton extends React.Component {
  render() {
    return (
      <button className="reset-btn" onClick={() => { this.props.onClick() }} >
        Reset game
      </button>
    );
  }
}

export default ResetButton;
