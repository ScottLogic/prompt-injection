import "./MainFooter.css";
import ScottLogicLogo from "./ScottLogicLogo";

function MainFooter() {
  return (
    <footer className="main-footer">
      <a href="https://www.scottlogic.com/" aria-label="Scott Logic">
        <ScottLogicLogo />
      </a>
      <div className="links">links</div>
    </footer>
  );
}

export default MainFooter;
