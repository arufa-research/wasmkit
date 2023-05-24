import Headlines from "./headlines";
import './preview.css'
function Preview(msg: any) {
  const t= JSON.stringify(msg["msg"], null, 2);
  // console.log(msg["msg"]);
  // console.log(t);
  return (
    <div className="preview-box">
      <div className="prev-head">
        Preview
      </div>
      <div className="prev-content">
        <pre>{t}</pre>
      </div>
   
     
    </div>
  );
}

export default Preview;
