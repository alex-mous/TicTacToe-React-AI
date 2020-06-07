import React from 'react';
import ReactDOM from 'react-dom';
import ResetButton from './ResetButton';
import Board from './Board';
import BoardSizeButton from './BoardSizeButton';
import './index.css';

//TODO: cleanup toggle, add styling to page, prevent automatic winner selection

class Game extends React.Component { //Main game component
  constructor(props) {
    super(props);
    this.state = {
      frames: [
        {
          squares: Array(9).fill(null), //Default array of size 9
          changed: -1, //Square index that was changed
        }
      ],
      index: 0,
      size: 3, //The size of the board
      current: "X",
      running: true,
      twoplayer: true //Whether the game is two player or player-AI
    }
  }

  renderResetButton() { //Return the rendered reset button
    return <ResetButton onClick={() => { this.resetGame(this.state.size) }} />;
  }

  renderBoardSize() { //Return the rendered board size incrementer/decrementer
    return <BoardSizeButton onClick={(inc) => { this.changeBoardSize(inc) }} size={this.state.size} />
  }

  renderBoard(frame) { //Return a rendered board
    return (
      <Board squares={ frame } size={ this.state.size } disabled={ !this.state.running } onClick={(i) => { if (this.state.running) this.clickHandler(i); }} />
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
      if (this.state.current === "O") { //AI's move - trigger click with null value
        this.aiMove();
      }
    }
    this.setState({ twoplayer: !this.state.twoplayer });
  }

  resetGame(size) { //Reset the game state to default, clearing all history, and set the board size
    this.setState({
      frames: [
        { squares: Array(size*size).fill(null) }
      ],
      current: "X",
      index: 0, //Current index in the frames
      size: size,
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

  changeBoardSize(inc) {
    if (this.state.frames.length <= 1) { //Check that we are at a new game before setting size
      this.resetGame( this.state.size + inc );
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
      if (score === "X") { //User won - worst outcome
        return -1;
      } else if (score === "O") { //AI won - return positive tScore
        return 1;
      } else if (score === "") { //Tie
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
        }
      }, 350);
    }
  }

  gameOverCheck(board, actual) { //Determines if the game is over and changes the state (actual is true if changing the state and returning boolean, false for returning winner)
    let sq = board;

    for (let i=0; i<this.state.size*this.state.size-1; i+=this.state.size) { //Horizontal - rows
      let curr = sq[i];
      if (curr !== null) {
        for (let j=1; j<this.state.size; j++) {
          if (sq[i+j] !== curr) {
            curr = null;
            break;
          }
        }
        if (curr !== null) {
          if (actual) {
            this.setState({ current: curr, running: false, game_won: true });
            return true;
          } else {
            return curr;
          }
        }
      }
    }

    for (let i=0; i<this.state.size; i++) { //Vertical - columns
      let curr = sq[i];
      if (curr !== null) {
        for (let j=1; j<this.state.size; j+=1) {
          if (sq[i+(j*this.state.size)] !== curr) {
            curr = null;
            break;
          }
        }
        if (curr !== null) {
          if (actual) {
            this.setState({ current: curr, running: false, game_won: true });
            return true;
          } else {
            return curr;
          }
        }
      }
    }

    //Left-slanting diagonal
    let curr = sq[0];
    if (curr !== null) {
      for (let i=0; i<this.state.size*this.state.size; i+=this.state.size+1) {
        if (sq[i] !== curr) {
          curr = null;
          break;
        }
      }
      if (curr !== null) {
        if (actual) {
          this.setState({ current: curr, running: false, game_won: true });
          return true;
        } else {
          return curr;
        }
      }
    }

    //Right-slanting diagonal
    curr = sq[this.state.size-1];
    if (curr !== null) {
      for (let i=this.state.size-1; i<this.state.size*this.state.size-1; i+=this.state.size-1) {
        if (sq[i] !== curr) {
          curr = null;
          break;
        }
      }
      if (curr !== null) {
        if (actual) {
          this.setState({ current: curr, running: false, game_won: true });
          return true;
        } else {
          return curr;
        }
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
          <h1 className="text-center">Tic Tac Toe</h1>
          <div className="text-center my-3">
            { msg }
          </div>
          <div className="row justify-content-center">
            { this.renderBoard(this.state.frames[this.state.index].squares) }
          </div>
        </div>
        <div className="col-md-3">
          <div className="pt-4 row text-center">
            <h3 className="text-center">
              { this.renderBoardSize() }
            </h3>
          </div>
          <div className="pt-4 row text-center">
            <span className="toggle-main">
              <input type="checkbox" name="toggle" id="toggle-ai" onChange={() => this.toggleAI()} />
              <span className="toggle-padding"></span>
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
