import "./MainFooter.css";
import ScottLogicLogo from "./ScottLogicLogo";

function MainFooter() {
  interface link {
    text: string;
    url: string;
  }

  const links: link[] = [
    {
      text: "GitHub",
      url: "https://github.com/ScottLogic/prompt-injection",
    },
  ];

  return (
    <footer className="main-footer">
      <a href="https://www.scottlogic.com/" aria-label="Scott Logic">
        <ScottLogicLogo />
      </a>
      <div className="links">
        {links.map((link) => (
          <a key={link.text} href={link.url}>
            {`[${link.text}]`}
          </a>
        ))}
      </div>
    </footer>
  );
}

export default MainFooter;
