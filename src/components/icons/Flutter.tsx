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
  width: number;
  height: number;
}

export function Flutter(props: Props) {
  return (
    <svg
      height={props.height}
      viewBox="0.29 0.22 77.26 95.75"
      width={props.width}
      xmlns="http://www.w3.org/2000/svg"
    >
      <g fill="none" fillRule="evenodd">
        <path
          d="M48.75 95.97 22.84 70.23l14.32-14.57 40.39 40.31z"
          fill="#02539a"
        />
        <g fill="#45d1fd">
          <path
            d="M22.52 70.25 48.2 44.57h28.87L37.12 84.52z"
            fillOpacity={0.85}
          />
          <path d="m.29 47.85 14.58 14.57L77.07.22H48.05z" />
        </g>
      </g>
    </svg>
  );
}
