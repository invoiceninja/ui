import { useColorScheme } from '$app/common/colors';
import { useAccentColor } from '$app/common/hooks/useAccentColor';
import {
  hexToRGB,
  isColorLight,
  useAdjustColorDarkness,
} from '$app/common/hooks/useAdjustColorDarkness';
import { useAtom } from 'jotai';
import CommonProps from '../../common/interfaces/common-props.interface';
import React, { useEffect } from 'react';
import { currentWidthAtom } from '$app/common/hooks/useResizeColumn';

interface Props extends CommonProps {
  colSpan?: number;
  rowSpan?: number;
  width?: string;
  customizeTextColor?: boolean;
  resizable?: string;
}

export function Td$(props: Props) {
  const { customizeTextColor } = props;

  const adjustColorDarkness = useAdjustColorDarkness();

  const colors = useColorScheme();
  const accentColor = useAccentColor();
  const { red, green, blue, hex } = hexToRGB(accentColor);

  const darknessAmount = isColorLight(red, green, blue) ? -220 : 220;

  const color = customizeTextColor
    ? adjustColorDarkness(hex, darknessAmount)
    : colors.$3;

  return <HtmlTd {...props} color={color} />;
}

interface HtmlTdProps extends Props {
  color: string;
}

function HtmlTd(props: HtmlTdProps) {
  const [currentWidths] = useAtom(currentWidthAtom);

  const tdRef = React.useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (tdRef.current) {
      const cw = currentWidths[props.resizable as unknown as number] ?? -1;

      tdRef.current.style.maxWidth = `${cw}px`;
    }
  }, [currentWidths]);

  return (
    <td
      width={props.width}
      colSpan={props.colSpan}
      rowSpan={props.rowSpan}
      onClick={props.onClick}
      className={`px-2 lg:px-2.5 xl:px-4 py-2 text-sm break-words ${props.className} overflow-hidden whitespace-nowrap text-ellipsis`}
      style={{
        color: props.color,
      }}
      ref={tdRef}
    >
      {props.children}
    </td>
  );
}

export const Td = React.memo(Td$);
