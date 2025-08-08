import React, { useEffect, useRef, useState, ElementType } from "react";

interface FadeInUpProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  threshold?: number;
  className?: string;
  style?: React.CSSProperties;
  as?: ElementType;
}

export default function FadeInUp({
  children,
  delay = 0,
  duration = 800,
  threshold = 0.1,
  className = "",
  style = {},
  as: Component = "div",
}: FadeInUpProps) {
  const elementRef = useRef<HTMLElement>(null);

  const animationStyle: React.CSSProperties = {
    opacity: 1,
    transform: "translateY(0)",
    ...style,
  };

  return React.createElement(
    Component,
    {
      ref: elementRef,
      className,
      style: animationStyle,
    },
    children
  );
}
