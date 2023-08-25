import "./App.css";
import "./Theme.css";
import DemoHeader from "./components/MainComponent/DemoHeader";
import DemoBody from "./components/MainComponent/DemoBody";

function App() {
  return (
    <div id="app-content">
      <div id="app-content-header"><DemoHeader /></div>
      <div id="app-content-body"><DemoBody /></div>
    </div>
  );
}

export default App;
