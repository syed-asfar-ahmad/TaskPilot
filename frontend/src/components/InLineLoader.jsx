import { Loader2 } from "lucide-react";

const InLineLoader = ({ message = "Loading..." }) => {
  return (
    <div className="flex justify-center items-center py-20 animate-fade-in">
      <div className="flex flex-col items-center space-y-4">
        <Loader2 className="h-10 w-10 text-green-600 animate-spin" />
        <p className="text-lg text-gray-600 font-medium tracking-wide">{message}</p>
      </div>
    </div>
  );
};

export default InLineLoader;
