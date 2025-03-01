/**
 * Invoice Ninja (https://invoiceninja.com).
 *
 * @link https://github.com/invoiceninja/invoiceninja source repository
 *
 * @copyright Copyright (c) 2022. Invoice Ninja LLC (https://invoiceninja.com)
 *
 * @license https://www.elastic.co/licensing/elastic-license
 */

interface Props {
  size?: string;
  color?: string;
}

export function Gear({ size = '1.2rem', color = '#000' }: Props) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      xmlnsXlink="http://www.w3.org/1999/xlink"
      x="0px"
      y="0px"
      style={{ width: size, height: size }}
      viewBox="0 0 18 18"
    >
      <circle
        cx="9"
        cy="8.999"
        r="1.75"
        fill={color}
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
        data-color="color-2"
      ></circle>
      <path
        d="m15.175,7.278l-.929-.328c-.102-.261-.219-.52-.363-.77s-.31-.48-.485-.699l.18-.968c.125-.671-.187-1.349-.778-1.69l-.351-.203c-.592-.342-1.334-.273-1.853.171l-.745.637c-.56-.086-1.133-.086-1.703,0l-.745-.638c-.519-.444-1.262-.513-1.853-.171l-.351.203c-.592.341-.903,1.019-.778,1.69l.18.965c-.36.449-.646.946-.852,1.474l-.924.326c-.644.227-1.075.836-1.075,1.519v.405c0,.683.431,1.292,1.075,1.519l.929.328c.102.261.218.519.363.769s.31.48.485.7l-.181.968c-.125.671.187,1.349.778,1.69l.351.203c.592.342,1.334.273,1.853-.171l.745-.638c.559.086,1.132.086,1.701,0l.746.639c.519.444,1.262.513,1.853.171l.351-.203c.592-.342.903-1.019.778-1.69l-.18-.966c.359-.449.646-.945.851-1.473l.925-.326c.644-.227,1.075-.836,1.075-1.519v-.405c0-.683-.431-1.292-1.075-1.519h.002Z"
        fill="none"
        stroke={color}
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="1.5"
      ></path>
    </svg>
  );
}
