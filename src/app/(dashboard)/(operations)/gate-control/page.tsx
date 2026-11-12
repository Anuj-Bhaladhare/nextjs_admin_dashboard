"use client";
import useGateControll from "./hook";
const [{ controlLED }] = useGateControll();


const GateControl = () => {

  const ledOnHandler = async() => {
    await controlLED("ON");
  }

  const ledOffHandler = async() => {
    await controlLED("OFF")
  }

  return (
    <div>
      <button className="" onClick={() => ledOnHandler()}>
        LED ON 
      </button>
      
      <br />

      <button className="" onClick={() => ledOffHandler()}>
        LED OFF
      </button>
    </div>
  );
}

export default GateControl;
