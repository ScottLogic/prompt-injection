import "./MainFooter.css";
import ScottLogicLogo from "./ScottLogicLogo";

function MainFooter() {
  interface link {
    text: string;
    url: string;
  }

  const links: link[] = [
    {
      text: "Description & Copyright",
      url: "",
    },
    {
      text: "Find Out More",
      url: "",
    },
    {
      text: "GitHub",
      url: "",
    },
  ];

  return (
    <footer className="main-footer">
      <a href="https://www.scottlogic.com/" aria-label="Scott Logic">
        <ScottLogicLogo />
      </a>
      <div className="links">
        {links.map((link, i) => (
          <>
            <a key={link.text} href={link.url}>
              {`[${link.text}]`}
            </a>
            {i < links.length - 1 && <span className="link-separator">|</span>}
          </>
        ))}
      </div>
    </footer>
  );
}

export default MainFooter;
