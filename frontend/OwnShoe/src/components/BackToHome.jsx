import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";

function BackToHome() {
  return (
    <Link
      to="/"
      className="
        inline-flex
        items-center
        gap-2
        rounded-full
        border
        border-black/10
        bg-white/70
        px-4
        py-2
        text-sm
        font-bold
        !text-black
        backdrop-blur-xl
        shadow-sm
        transition-all
        duration-300
        hover:-translate-y-0.5
        hover:bg-black
        hover:!text-white
        hover:shadow-lg
      "
    >
      <ArrowLeft size={16} />
      Back to Home
    </Link>
  );
}

export default BackToHome;