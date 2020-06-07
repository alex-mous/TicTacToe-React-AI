import React from 'react';
import ReactDOM from 'react-dom';
import ResetButton from './ResetButton';
import Board from './Board';
import './index.css';

//TODO: add board size, cleanup toggle, add styling to page

class Game extends React.Component { //Main game component
  constructor(props) {
    super(props);
    this.state = {
      frames: [
        {
          squares: Array(9).fill(null),
          changed: -1, //Square index that was changed
        }
      ],
      index: 0,
      current: "X",
      running: true,
      twoplayer: true //Whether the game is two player or player-AI
    }
  }

  renderResetButton() { //Return the rendered reset button
    return <ResetButton onClick={() => { this.resetGame() }} />;
  }

  renderBoard(frame) { //Return a rendered board
    return (
      <Board squares={frame} disabled={ !this.state.running } onClick={(i) => { if (this.state.running) this.clickHandler(i); }} />
    );
  }

  renderHistory() { //Render the history board frames into a list of buttons
    let filtered = this.state.frames.slice().filter((_,i) =>  i > 1 ); //
    return (filtered.map(
      (board, i) => {
        i = i + 1;
        return (
          <li key={i}>
            <button onClick={() => { this.changeFrame(i) }}>
              {
                "Jump to move " + (i) + " (" + (this.state.frames[i].move%3+1) +
                  "," + Math.floor(this.state.frames[i].move/3+1) + ")"
              }
            </button>
          </li>
        )
      }));
  }

  toggleAI() { //Toggle AI/two player mode\
    if (this.state.twoplayer) {
      if (this.state.current == "O") { //AI's move - trigger click with null value
        this.aiMove();
      }
    }
    this.setState({ twoplayer: !this.state.twoplayer });
  }

  resetGame() { //Reset the game state to default, clearing all history
    this.setState({
      frames: [
        { squares: Array(9).fill(null) }
      ],
      current: "X",
      index: 0, //Current index in the frames
      running: true, //Allows moves
      game_won: false //Determines whether to show game over features
    });
  }

  changeFrame(index) { //Change the current frame to go back in time
    this.setState({ index: index, current: index%2===0 ? "X" : "O" });
    if (index < this.state.frames.length-1) { //If we're not at the end yet, allow changes
      this.setState({ running: false, game_won: false });
    } else {
      this.setState({ running: false, game_won: true });
    }
  }

  getMove() {
    let board = this.state.frames[this.state.index].squares.slice(); //Get a copy of the squares array
    let slots = this.getAvailableSquares(this.state.frames[this.state.index].squares);
    let choice = -1; //Final choice (index in array)
    let best = -1000; //Arbitrary value for best move
    for (let move of slots) { //Iterate through the choices
      board[move] = "O";
      let v = this.minimax(board, true, -1000, 1000);
      if (v > best) { //If it's better, change the best
        best = v;
        choice = move;
      }
      board[move] = null;
    }
    return choice;
  }

  minimax(board, turn, alpha, beta) {
    let score = this.gameOverCheck(board, false); //Get the score
    if ((!this.isFull(board)) && (score === null)) { //Board not complete - recursive case
      let best = (turn ? 1000 : -1000);
      let a = alpha;
      let b = beta;
      let slots = this.getAvailableSquares(board);
      for (let move of slots) { //Iterate over set of possible choices
          board[move] = turn ? "X" : "O";
          let r = this.minimax(board, !turn, a, b);
          board[move] = null;
          if (turn) { //The user's turn - minimize the loss
              best = Math.min(best, r);
              b = Math.min(b, best);
              if (b <= a) {
                  board[move] = null;
                  break;
              }
          } else { //The AI's turn - maximize the win
              best = Math.max(best, r);
              a = Math.max(a, best);
              if (b <= a) {
                  board[move] = null;
                  break;
              }
          }
        }
        return best;
    } else { //Base case
      if (score == "X") { //User won - worst outcome
        return -1;
      } else if (score == "O") { //AI won - return positive tScore
        return 1;
      } else if (score == "") { //Tie
        return 0;
      }
    }
  }

  getAvailableSquares(board) { //Return the available squares
    let res = [];
    let squares = board;
    for (let i=0; i<squares.length; i++) {
      if (squares[i] == null) {
        res.push(i);
      }
    }
    return res;
  }

  isFull(board) {
    return this.getAvailableSquares(board).length === 0;
  }

  clickHandler(i) { //Handle clicks on the board squares and update game state
    if (this.state.frames[this.state.index].squares[i] == null) { //Only allow clicks if running and the square isn't set (or -1 for special cases)
      if (this.state.twoplayer) { //Two player mode
        this.setSquare(i);
        this.setState({ current: (this.state.current === "X") ? "O" : "X" }); //Prevent other player from making a move
      } else { //AI mode
        this.setSquare(i);
        this.aiMove();
      }
    }
  }

  async setSquare(i) { //Set the square at i to the current player
    if (this.state.running !== false) {
      const boards = this.state.frames.slice(0, this.state.index+1); //Get a copy of the array (up to index+1 so that can alter history)
      const squares = boards[this.state.index].squares.slice();
      if (squares[i] == null) { //Prevent altering already set squares
        squares[i] = this.state.current;
        boards.push({ squares: squares, move: i });
        await this.setState({ frames: boards, index: this.state.index+1 }, () => {
           this.gameOverCheck(this.state.frames[this.state.index].squares, true);
         });
      }
    }
  }

  aiMove() {
    if (this.state.running) { //Only run if the game isn't over
      this.setState({ current: "O", running: undefined }); //Prevent other player from making a move
      window.setTimeout(() => { //Delay to give a sense of thinking
        if (this.state.running !== false) {
          let move = this.getMove();
          this.setSquare(move);
          if (!this.gameOverCheck(this.state.frames[this.state.index].squares, true)) {
            this.setState({ running: true, current: "X" });
          }
        } else {
          this.setState({ running: false, current: "X" });
        }
      }, 350);
    }
  }

  gameOverCheck(board, actual) { //Determines if the game is over and changes the state (actual is true if changing the state and returning boolean, false for returning winner)
    let sq = board;

    for (var i=0; i<8; i+=3) { //Horizontal
      if (sq[i] != null && sq[i] === sq[i+1] && sq[i] === sq[i+2]) {
        if (actual) {
          this.setState({ current: sq[i], running: false, game_won: true });
          return true;
        } else {
          return sq[i];
        }
      }
    }

    for (var j=0; j<=3; j++) { //Vertical
      if (sq[j] != null && sq[j] === sq[j+3] && sq[j] === sq[j+6]) {
        if (actual) {
          this.setState({ current: sq[j], running: false, game_won: true });
          return true;
        } else {
          return sq[j];
        }
      }
    }

    if ((sq[0] != null && sq[0] === sq[4]
          && sq[0] === sq[8]) || (sq[2] != null
          && sq[2] === sq[4] && sq[2] === sq[6])) { //Diagonal
        if (actual) {
          this.setState({ current: sq[4], running: false, game_won: true });
          return true;
        } else {
          return sq[4];
        }
    }

    let tie = true; //If there is no winner yet, check for a tie
    for (var k=0; k<=8; k++) {
      if (sq[k] == null) {
        tie = false;
        break;
      }
    }
    if (tie) {
      if (actual) {
        this.setState({ current: "", running: false, game_won: true });
        return true;
      } else {
        return "";
      }
    }

    if (actual) {
      return false;
    } else {
      return null;
    }
  }

  render() { //Main render function
    let msg = "";
    if (this.state.running === false && this.state.game_won === true) {
      if (this.state.current !== "") {
        msg = <h2>Winner: { this.state.current }</h2>;
      } else {
        msg = <h2>Game tied!</h2>;
      }
    } else {
      msg = <h4>Next player: { this.state.current }</h4>;
    }

    return (
      <div className="row mt-5">
        <div className="col-md-9">
          <h1 className="text-center">Noughts and Crosses</h1>
          <div className="text-center my-3">
            { msg }
          </div>
          <div className="row justify-content-center">
            { this.renderBoard(this.state.frames[this.state.index].squares) }
          </div>
        </div>
        <div className="col-md-3">
          <div className="pt-4 row text-center">
            <span class="toggle-main">
              <input type="checkbox" name="toggle" id="toggle-ai" onChange={() => this.toggleAI()} />
              <span class="toggle-padding"></span>
            </span>
            <h3 className="text-center">
              <label htmlFor="toggle-ai">Enable AI</label>
            </h3>
          </div>
          <div className="row text-center">
            <h3 className="text-center">History</h3>
            <ul>
              <li key="-1">
                { this.renderResetButton() }
              </li>
              { this.renderHistory() }
            </ul>
          </div>
        </div>
      </div>
    );
  }
}

ReactDOM.render(<Game />, document.getElementById("root"));
