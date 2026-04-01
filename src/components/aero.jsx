import { Plane } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function Aero({ className }) {
  const navigate = useNavigate();

  const handleClick = () => {
    navigate('/t');
  };

  return (
    <div 
      className={`w-20 h-20 rounded-full bg-gray-200 hover:bg-gray-300 flex items-center justify-center transition-all duration-300 ease-in-out hover:-translate-y-2 hover:translate-x-1 hover:shadow-md cursor-pointer ${className}`}
      onClick={handleClick}
    >
      
      <Plane className="w-12 h-12"/>
    </div>
  )
}

export default Aero;