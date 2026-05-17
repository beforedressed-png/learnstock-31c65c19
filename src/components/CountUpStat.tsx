import { useCountUp } from "@/hooks/use-count-up";

interface Props {
  target: number;
  suffix?: string;
  prefix?: string;
}

export function CountUpStat({ target, suffix = "", prefix = "" }: Props) {
  const { ref, value } = useCountUp(target);
  return (
    <span ref={ref as React.RefObject<HTMLSpanElement>}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}
