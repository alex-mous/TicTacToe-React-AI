import React from 'react';

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
