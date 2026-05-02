import butin from "./assets/images/gen.png.png"
const Button = ({className, onClick}) => {
  return (
    <button className={`btn ${className ? className : ""}`} style = {{

        }} onClick = {onClick}>   
        <img src={butin} alt="" /></button>
        
        
  )
}

export default Button