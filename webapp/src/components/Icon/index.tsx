<<<<<<< HEAD
import { createElement } from 'react'
import { type IconBaseProps } from 'react-icons'
import { AiFillHeart, AiOutlineHeart } from 'react-icons/ai'

const icons = {
  likeEmpty: AiOutlineHeart,
  likeFilled: AiFillHeart,
}

export const Icon = ({ name, ...restProps }: { name: keyof typeof icons } & IconBaseProps) => {
  return createElement(icons[name], restProps)
}
=======
import { createElement } from "react";
import { type IconBaseProps } from "react-icons";
import { AiFillHeart, AiOutlineHeart } from "react-icons/ai";

const icons = {
  likeEmpty: AiOutlineHeart,
  likeFilled: AiFillHeart,
};

export const Icon = ({
  name,
  ...restProps
}: { name: keyof typeof icons } & IconBaseProps) => {
  return createElement(icons[name], restProps);
};
>>>>>>> d7d1fffabf09f567df420b0e3df5ed632c29940c
