import React, { useContext, useEffect, useImperativeHandle } from 'react';
import { Terminal } from 'xterm';
import css from './style.module.less';
import './xterm';
import { SettingsContext } from '@context';
import { useRef } from 'react';
import { useCallback } from 'react';
import { forwardRef } from 'react';
type Props = {};

const defaultThemeStyle = {
  foreground: '#2c3e50',
  background: '#fff',
  cursor: 'rgba(0, 0, 0, .4)',
  selection: 'rgba(0, 0, 0, 0.3)',
  black: '#000000',
  red: '#e83030',
  brightRed: '#e83030',
  green: '#42b983',
  brightGreen: '#42b983',
  brightYellow: '#ea6e00',
  yellow: '#ea6e00',
  magenta: '#e83030',
  brightMagenta: '#e83030',
  cyan: '#03c2e6',
  brightBlue: '#03c2e6',
  brightCyan: '#03c2e6',
  blue: '#03c2e6',
  white: '#d0d0d0',
  brightBlack: '#808080',
  brightWhite: '#ffffff',
};

const darkThemeStyle = {
  ...defaultThemeStyle,
  foreground: '#fff',
  background: '#1d2935',
  cursor: 'rgba(255, 255, 255, .4)',
  selection: 'rgba(255, 255, 255, 0.3)',
  magenta: '#e83030',
  brightMagenta: '#e83030',
};

const TaskTerminal = forwardRef((props, ref) => {
  const { darkTheme } = useContext(SettingsContext);
  const termRef = useRef<Terminal>();

  useImperativeHandle(ref, () => ({
    addLog,
  }));

  useEffect(() => {
    if (termRef.current) {
      if (darkTheme) {
        termRef.current.setOption('theme', darkThemeStyle);
      } else {
        termRef.current.setOption('theme', defaultThemeStyle);
      }
    }
  }, [darkTheme]);

  useEffect(() => {
    termRef.current = new Terminal({
      theme: darkTheme ? darkThemeStyle : defaultThemeStyle,
    });
    termRef.current.open(document.getElementById('xterm-container') as HTMLElement);
  }, []);

  const setContent = useCallback((value, ln = true) => {
    if (value.indexOf('\n') !== -1) {
      value.split('\n').forEach((t) => setContent(t));
      return;
    }
    if (typeof value === 'string') {
      termRef.current && termRef.current[ln ? 'writeln' : 'write'](value);
    } else {
      termRef.current && termRef.current.writeln('');
    }
  }, []);

  const addLog = useCallback((log) => {
    setContent(log.text, log.type === 'stdout');
  }, []);

  return <div id="xterm-container" className={css.xtermContainer} />;
});

export default TaskTerminal;
