import "../css/Loader.css";
import plane from "../assets/plane.svg";
import clouds from "../assets/cloud.svg";

export default function Loader() {
  return (
    <div className="loader">
      <img src={clouds} className="clouds clouds--back" alt="clouds" />
      <img src={clouds} className="clouds clouds--front" alt="clouds" />

      <img src={clouds} class="clouds clouds--front delay2" />
      <img src={clouds} class="clouds clouds--front delay3" />
      <img src={plane} className="plane" alt="plane" />
    </div>
  );
}
