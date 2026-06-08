"use client";

import { motion } from "motion/react";

type BunnyCardProps = {
  className?: string;
  animated?: boolean;
};

export function BunnyCard({ className = "", animated = false }: BunnyCardProps) {
  const cardClassName = `bunny-card ${className}`.trim();

  const content = (
    <>
      <div className="bunny-ears" />
      <div className="bunny-face">
        <span className="eye left" />
        <span className="eye right" />
        <span className="nose" />
        <span className="smile" />
      </div>

      {animated ? (
        <motion.div
          className="food-bowl"
          animate={{ rotate: [-2, 2, -2] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: "easeInOut" }}
        >
          🥬
        </motion.div>
      ) : (
        <div className="food-bowl">🥬</div>
      )}
    </>
  );

  if (animated) {
    return (
      <motion.div
        className={cardClassName}
        aria-hidden="true"
        animate={{ y: [0, -5, 0] }}
        transition={{ duration: 3.2, repeat: Infinity, ease: "easeInOut" }}
      >
        {content}
      </motion.div>
    );
  }

  return (
    <div className={cardClassName} aria-hidden="true">
      {content}
    </div>
  );
}