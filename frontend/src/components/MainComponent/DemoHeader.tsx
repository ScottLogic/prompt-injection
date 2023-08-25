import "./DemoHeader.css";

function DemoHeader() {
  return (
    <div id="demo-header">
      <span id="demo-header-left">
        <span id="demo-header-title">Prompt Injection Demo</span>
        <span id="demo-header-icon">ICON</span>
      </span>
      <span id="demo-header-middle">
        <span id="demo-header-current-phase">Phase name</span>
      </span>
      <span id="demo-header-right">
        <span id="demo-header-phase-switcher">Choose phase</span>
      </span>
    </div>
  );
}

export default DemoHeader;
