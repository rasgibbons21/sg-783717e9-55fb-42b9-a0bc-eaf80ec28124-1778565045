import { motion } from "framer-motion";

export function CheckButton({ onClick, disabled, children = "Check my answer" }: { onClick: () => void; disabled?: boolean; children?: React.ReactNode }) {
  return (
    <motion.button
      whileTap={disabled ? undefined : { scale: 0.97 }}
      type="button"
      onClick={onClick}
      disabled={disabled}
      className="mt-4 h-11 rounded-full border border-foreground px-5 text-sm font-semibold text-foreground disabled:opacity-40"
    >
      {children}
    </motion.button>
  );
}
