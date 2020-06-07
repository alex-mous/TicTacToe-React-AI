import React from 'react';

class BoardSizeButton extends React.Component {
  render() {
    return (
      <div>
        <p>
            Size: {this.props.size}
          <button className="size-btn" onClick={() => { this.props.onClick(1) }} >
              +
          </button>
          <button className="size-btn" onClick={() => { this.props.onClick(-1) }} >
              -
          </button>
        </p>
    </div>
    );
  }
}

export default BoardSizeButton;
