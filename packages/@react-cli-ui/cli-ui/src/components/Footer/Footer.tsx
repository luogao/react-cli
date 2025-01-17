import React, { useState, useContext, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import cn from 'classnames';

import { Routes } from 'router';
import { CurrentPath, Logs } from '@components';
import { SettingsContext } from '@context';
import TranlateIcon from '@icons/translate.svg';
import RefreshIcon from '@icons/refresh.svg';
import DarkIcon from '@icons/dark-mode.svg';
import LightIcon from '@icons/light-mode.svg';
import HomeIcon from '@icons/home-filled.svg';
import ComputerIcon from '@icons/computer.svg';

import css from './style.module.less';

export default function Footer() {
  const location = useLocation();
  const [toggle, setToggle] = useState('');
  const [toggleLog, setToggleLog] = useState<boolean>(false);
  const { darkTheme, changeTheme, changeLocale, selectedPath, refreshProject } =
    useContext(SettingsContext);
  // theme
  const styles = cn(css.footer, {
    [css.dark]: darkTheme,
  });

  useEffect(() => {
    setToggle(location.pathname.replace('/', ''));
  }, [location]);

  function renderThemeIcon() {
    return darkTheme ? <LightIcon /> : <DarkIcon />;
  }

  function handleClick() {
    const value = toggle === 'project' ? 'dashboard' : 'project';
    setToggle(value);
  }

  function handleToggleLog() {
    setToggleLog(!toggleLog);
  }

  const isProjectPath = toggle === 'project';

  return (
    <div className={styles}>
      {toggleLog && <Logs />}
      <div className={css.content}>
        <Link
          to={isProjectPath ? Routes.DASHBOARD : Routes.PROJECT}
          onClick={handleClick}
          className={css.icon}
        >
          <HomeIcon />
        </Link>
        {selectedPath && <CurrentPath theme={darkTheme} url={selectedPath} />}
        <div className={css.log} onClick={handleToggleLog}>
          <div className={css.iconLog}>
            <ComputerIcon />
          </div>
          <span>🌠 {`Ready on http://localhost: ${process.env.DEV_CLIENT_PORT ?? 8080}`}</span>
        </div>
        <div className={css.rightGroup}>
          {!isProjectPath && (
            <div onClick={refreshProject} className={css.icon}>
              <RefreshIcon />
            </div>
          )}
          <div onClick={changeTheme} className={css.icon}>
            {renderThemeIcon()}
          </div>
          <div className={css.icon} onClick={changeLocale}>
            <TranlateIcon />
          </div>
        </div>
      </div>
    </div>
  );
}
