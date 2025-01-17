import React, { useContext } from 'react';
import cn from 'classnames';

import { SettingsContext } from '@context';

import css from './style.module.less';

interface DashboardProps {
  title?: string;
  children: React.PropsWithChildren<React.ReactNode>;
  btn?: JSX.Element;
  cssStyle?: React.CSSProperties;
  fullContent?: boolean;
}

export default function DashboardWrap({
  children,
  title,
  btn,
  cssStyle,
  fullContent,
}: DashboardProps) {
  const { darkTheme, notify } = useContext(SettingsContext);
  const styles = cn(css.wrapper, {
    [css.dark]: darkTheme,
  });

  return (
    <div className={styles} style={cssStyle}>
      <div className={css.top}>
        <div className={css.title}>{title}</div>
        <div className={css.rightGroup}>{btn}</div>
      </div>
      {notify && <div className={css.noticeWrapper}>{notify.message}</div>}
      <div className={css.content} style={{ padding: fullContent ? 0 : 35 }}>
        {children}
      </div>
    </div>
  );
}
