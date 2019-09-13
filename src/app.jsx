import React from 'react';
import { ipcRenderer} from 'electron';
// Because this is not main, we need to use electron remote for dialog
const { dialog } = require('electron').remote;

// variable that will contain all the different Row (annotation) information
var dic = {}

// Each row is a component containing the relevent forms for annotations
// (start, end, action, justification)
class Row extends React.Component{
    constructor(props){
        super(props);
        this.id = props.name;
        this.state = {
            start: '0',
            end: '1',
            action: 'Action',
            justification: 'Justification'
        };
        // bind the event listener functions to the component
        this.handleChangeStart = this.handleChangeStart.bind(this);
        this.handleChangeEnd = this.handleChangeEnd.bind(this);
        this.handleChangeAction = this.handleChangeAction.bind(this);
        this.handleChangeJustification = this.handleChangeJustification.bind(this);
        dic[this.id] = this.state;
    }

    // Sets the start annotation to state
    handleChangeStart(event) {
        this.setState({start: event.target.value});
        dic[this.id] = this.state;
    }

    // Sets the end annotation to state
    handleChangeEnd(event) {
        this.setState({end: event.target.value});
        dic[this.id] = this.state;
    }

    // Sets the action annotation to state
    handleChangeAction(event) {
        this.setState({action: event.target.value});
        dic[this.id] = this.state;
    }

    // Sets the justification annotation to state
    handleChangeJustification(event) {
        this.setState({justification: event.target.value});
        dic[this.id] = this.state;
    }

    // Returns an array of [start, end, action, justification]
    returnState(){
        return [this.state.start, this.state.end, this.state.action, this.state.justification]
    }

    render(){
        // Row CSS styling
        const rowstyle={
            width: '100%',
            backgroundColor: 'blue',
            marginTop: '10px'
        };
        const startstyle={
            height: '50px',
            width: '50px',
            marginRight: '50px'
        }
        const endstyle={
            height: '50px',
            width: '50px',
            marginRight: '50px'                    
        }
        const actionstyle={
            height: '50px',
            width: '40%',
            marginRight: '50px'                    
        }
        const juststyle={
            height: '50px',
            width: '40%',
            marginRight: '50px'                    
        }
        // Rendering of the form for annotations
        return(
            <div style={rowstyle}>
                <input style={startstyle} type="text" value={this.state.start} onChange={this.handleChangeStart}/>
                <input style={endstyle} type="text" value={this.state.end} onChange={this.handleChangeEnd}/>
                <input style={actionstyle} type="text" value={this.state.action} onChange={this.handleChangeAction}/>
                <input style={juststyle} type="text" value={this.state.justification} onChange={this.handleChangeJustification}/>
            </div>
        )
    }
}

// The component that will render synchronized videos
class Sync extends React.Component {
    constructor(props) {
      super(props);
      // if playing is true, the videos will run
      // value is the 'value' of the slider between 0 and 1 (used to seek the video)
      // sentinel is the boolean value to determine if we want to see the slider hidden or not
      // cTime is the time in seconds that we want the videos to be in sync at
      this.state = {
        playing: true,
        value: 0,
        sentinel: false,
        cTime: 0
      }
      // Bind the event listening functions to component
      this.seek = this.seek.bind(this);
      this.play = this.play.bind(this);
      this.stop = this.stop.bind(this);
      this.handleTimeUpdate = this.handleTimeUpdate.bind(this);
    }
    
    // Once rendering is done, get the html5 video tags id'ed to the component state
    componentDidMount() {
      this.setState({ video: document.getElementById('v1') })
      this.setState({ video2: document.getElementById('v2') })
    }
    
    // Once a video has played, we can show the slider (if not, the slider would give an error at 0)
    // We play both video1 and video2
    // We set the duration of the main video (used for future reference)
    play(){
      this.setState({sentinel : true});
      this.state.video.play();
      this.state.video2.play();
      this.setState({ duration: document.getElementById('v1').duration });
    }
  
    // Once we stop, we would pause both video1 and video2
    stop(){
      this.state.video.pause();
      this.state.video2.pause();
    }
  
    // When seeking, we take the value from the slider with e.target.value and 
    // multiply it with the duration to get the currentTime (cTime) that will be used
    // to sync all videos during seeking
    seek(e){
      this.setState({sentinel : true});
      console.log(e.target.value, parseFloat(this.state.duration));
      this.state.video.currentTime = parseFloat(e.target.value)*parseFloat(this.state.duration);
      this.state.video2.currentTime = parseFloat(e.target.value)*parseFloat(this.state.duration);
    }
    
    // cTime used for syncing the videos when any update changes
    handleTimeUpdate(){
      this.setState({value: this.state.video.currentTime/this.state.video.duration});
      this.state.cTime = this.state.video.currentTime;
    }
  
    // Rendering the Sync component
    // this.props.direc is the directory for all videos (in this case, directory with 2 videos)
    // A play button, a pause butoon, and the slider (from 0 to 1)
    // Current time is also displayed in seconds
    render() {
      return (
      <div>
        <video id='v1' preload="metadata" onTimeUpdate={this.handleTimeUpdate}>
          <source src={this.props.direc+"/vidA.mp4"}/>
        </video>
        <video id='v2' preload="metadata">
          <source src={this.props.direc+"/vidA.mp4"}/>
        </video>
        <br/>
        <button onClick={this.play}>Play</button>
        <button onClick={this.stop}>Stop</button>
        <input
            hidden={!this.state.sentinel} type='range' min={0} max={1} step='any'
            value={this.state.value}
            onChange={this.seek}
          />
        <br />
        <h1>Current Time: {this.state.cTime.toFixed(2)}s</h1>
      </div>);
    }
}


// Entire application component that utilizes <Row /> and <Sync />
class App extends React.Component {
    constructor(props){
        super(props);
        // number that tracks the number of rows
        this.num = 0;
        this.state = {
            rows: [],
            direc: ''
        }
        // bind the event listener functions to component
        this.onAddClick = this.onAddClick.bind(this)
        this.onSubstractClick = this.onSubstractClick.bind(this)
        this.onSubmit = this.onSubmit.bind(this)
        this.addDirectory = this.addDirectory.bind(this)
    }

    // Add a row when the add button has been clicked
    onAddClick() {
        var newRow = this.state.rows
        this.num = this.num + 1
        newRow = newRow.concat(<Row name={this.num}/>)
        this.setState(
            {
                rows: newRow
            }
        )
    }

    // Subtract a row when the remove button has been clicked
    onSubstractClick() {
        var newRow = this.state.rows
        delete dic[this.num]
        this.num = this.num - 1 
        newRow.pop()
        this.setState(
            {
                rows: newRow
            }
        )
    }

    // Once submited, take all the annotations from Rows, and send it
    // to ipcMain with ipcRender in order to be written to the directory
    // that the videos were originally in. Then delete the rows, for a new annotation.
    onSubmit(){
        var content = '';
        for (var key in dic){
            content += dic[key].start + ',' + dic[key].end + ', ' + dic[key].action + ', ' + dic[key].justification + '\n';
        }
       ipcRenderer.send('submit',content)
       this.setState(
        {
            rows: []
        }
        )
    }

    // Adds directory to the state later used to load the videos
    // In addition ipcRenderer sends to ipcMain used later in saving the
    // output annotations in ipcMain
    addDirectory(){
        let dir = dialog.showOpenDialog({properties : ['openDirectory']});
        this.setState({
            direc: dir
        });
        ipcRenderer.send('directory', dir)
    }

    render(){
        // CSS styling
        const data = this.state.rows;
        const liststyle={
            listStyleType: 'none'
        }
        const buttonstyle={
            backgroundColor: 'green',
            color: 'white',
            textAlign: 'center',
            margin: '4px 2px'
        }
        // If there is no directory, then display Rows regardless
        if (this.state.direc == ''){
            return(
                <div>
                    <button style={buttonstyle} onClick={this.addDirectory}> Add Directory </button>
                    <h1>Start End Action Justifiation </h1>
                    <button style={buttonstyle} onClick={this.onAddClick}> Add </button>
                    <button style={buttonstyle} onClick={this.onSubstractClick}> Remove </button>
                    <button style={buttonstyle} onClick={this.onSubmit}> Submit </button>
                    {data.map(d => <li style={liststyle}>{d}</li>)}
                </div>
            )
        }
        // Otherwise, if a directory has been specified, display with <Sync direc={DIRECTORY}>
        // Along with the Rows (annotations)
        return(
            <div>
                <div id="videos">
                    <Sync direc={this.state.direc}/>
                </div>
                
                <button style={buttonstyle} onClick={this.addDirectory}> Add Directory </button>
                <h1>Start End Action Justifiation </h1>
                <button style={buttonstyle} onClick={this.onAddClick}> Add </button>
                <button style={buttonstyle} onClick={this.onSubstractClick}> Remove </button>
                <button style={buttonstyle} onClick={this.onSubmit}> Submit </button>
                {data.map(d => <li style={liststyle}>{d}</li>)}
            </div>
        )
    }
}

export default App;

