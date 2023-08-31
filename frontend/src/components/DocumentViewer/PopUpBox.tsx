import "./PopUpBox.css";

function PopUpBox({
  show,
  setShow,
}: {
  show: boolean;
  setShow: React.Dispatch<React.SetStateAction<boolean>>;
}) {
  return show ? (
    <div className="document-popup">
      <div className="document-popup-inner">
        <span className="close-button" onClick={() => setShow(false)}>
          x
        </span>
        <div className="content">
          <div className="view-documents-header">
            <h3>view documents</h3>
          </div>
          <div className="view-documents-body">
            <div className="document">
          </div>
        </div>
      </div>
    </div>
  ) : (
    ""
  );
}

export default PopUpBox;
