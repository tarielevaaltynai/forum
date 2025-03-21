import { useState } from "react";
import { Heart } from "lucide-react";
import cn from 'classnames';
import css from './index.module.scss';

export const LikeButton = () => {
  const [liked, setLiked] = useState(false);

  return (
    <button
      className={cn(css.button)}
      onClick={() => setLiked(!liked)}
    >
      <Heart
        size={24}
        className={liked ? "text-red-500" : "text-gray-400"}
        fill={liked ? "#ef4444" : "none"}
      />
    </button>
  );
};
