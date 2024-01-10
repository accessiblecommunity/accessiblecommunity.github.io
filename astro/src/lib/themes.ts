/* Bootstrap Theme Management Functions */

export function getBackgroundAndText(
  theme: string | undefined,
  style: string | undefined,
  text: boolean = false
) {
  if ( theme === undefined )
    return `bg-body${text ? ' text-body-emphasis' : ''}`;
  else if ( style === "subtle" )
    return `bg-${theme}-subtle${text ? ` text-${theme}-emphasis` : ''}`;
  else if ( style === "body" ) {
    const textTheme = ( theme === "primary" ) ? 'body' : theme;
    return `bg-body-${theme}${text ? ` text-${textTheme}-emphasis` : ''}`;
  }
  else return `${text ? 'text-' : ''}bg-${theme}`;
}

export function getBorder(
  size: number,
  theme: string | undefined,
  subtle: boolean
) {
  if (!size)
    return ''
  const sizeCls = `border${size > 1 ? ` border-${size}` : ''}`;
  if (theme === "default")
    return sizeCls;
  else
    return `${sizeCls} border-${theme}${subtle ? '-subtle' : ''}`
}