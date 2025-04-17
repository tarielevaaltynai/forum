import { useState } from "react";
import { Heart } from "lucide-react";
import cn from "classnames";
import css from "./index.module.scss";

export const LikeButton = ({
  initialLiked = false,
  onLikeChange,
}: {
  initialLiked?: boolean;
  onLikeChange?: (liked: boolean) => void;
}) => {
  const [liked, setLiked] = useState(initialLiked);
  const [isAnimating, setIsAnimating] = useState(false);

  const handleClick = () => {
    if (isAnimating) return;

    setIsAnimating(true);
    setLiked(!liked);
    onLikeChange?.(!liked);

    setTimeout(() => setIsAnimating(false), 600);
  };

  return (
    <button
      className={cn(css.button, {
        [css.liked]: liked,
        [css.notLiked]: !liked,
        [css.animate]: isAnimating,
      })}
      onClick={handleClick}
      aria-label={liked ? "Убрать лайк" : "Поставить лайк"}
    >
      <Heart size={26} className={css.heartIcon} />
      {liked && <span className={css.pulseEffect}></span>}
    </button>
  );
};
