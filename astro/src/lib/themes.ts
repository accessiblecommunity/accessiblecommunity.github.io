/* Bootstrap Theme Management Functions */

export function getBackgroundAndText(
  theme: string | undefined,
  style: string | undefined,
  text: boolean = false
) {
  const classes: Array<string> = [];

  if ( theme === undefined ) {
    classes.push(`bg-body${style ? `-${style}` : ''}`);
    if (text) {
      const textStyle = (style === 'primary') ? 'emphasis' : style;
      classes.push(`text-body-${textStyle}`);
    }
  } else if (style === 'subtle') {
    classes.push(`bg-${theme}-subtle`);
    if (text)
      classes.push(`text-${theme}-emphasis`);
  } else {
    classes.push(`${text ? 'text-' : ''}bg-${theme}`);
  }

  return classes.join(' ');
}

export function getBorder(
  size: number,
  theme: string | undefined,
  subtle: boolean
) {
  const classes: Array<string> = [];

  if (size > 0)
    classes.push('border');
  if (size > 1)
    classes.push(`border-${size}`);
  if (theme)
    classes.push(`border-${theme}${subtle ? '-subtle' : ''}`);

  return classes.join(' ');
}